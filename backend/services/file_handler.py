import os
import uuid
import shutil
from typing import List, Dict, Optional
from werkzeug.utils import secure_filename
from datetime import datetime
import mimetypes

class FileHandler:
    def __init__(self, upload_folder: str = "uploads", max_file_size: int = 50 * 1024 * 1024):
        """Initialize file handler"""
        self.upload_folder = upload_folder
        self.max_file_size = max_file_size  # 50MB default
        self.allowed_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff'}
        
        # Create upload directory if it doesn't exist
        os.makedirs(upload_folder, exist_ok=True)
    
    def is_valid_image(self, filename: str) -> bool:
        """Check if file is a valid image"""
        if not filename:
            return False
        
        # Check file extension
        file_ext = os.path.splitext(filename.lower())[1]
        if file_ext not in self.allowed_extensions:
            return False
        
        return True
    
    def save_uploaded_file(self, file, session_id: str) -> Optional[str]:
        """Save uploaded file and return the file path"""
        try:
            if not file or not file.filename:
                return None
            
            # Validate file
            if not self.is_valid_image(file.filename):
                return None
            
            # Check file size
            file.seek(0, os.SEEK_END)
            file_size = file.tell()
            file.seek(0)
            
            if file_size > self.max_file_size:
                return None
            
            # Generate unique filename
            file_ext = os.path.splitext(file.filename)[1]
            unique_filename = f"{uuid.uuid4()}{file_ext}"
            
            # Create session directory
            session_dir = os.path.join(self.upload_folder, session_id)
            os.makedirs(session_dir, exist_ok=True)
            
            # Save file
            file_path = os.path.join(session_dir, unique_filename)
            file.save(file_path)
            
            return file_path
            
        except Exception as e:
            print(f"Error saving file: {e}")
            return None
    
    def save_multiple_files(self, files, session_id: str) -> List[str]:
        """Save multiple uploaded files"""
        saved_paths = []
        
        for file in files:
            if file and file.filename:
                file_path = self.save_uploaded_file(file, session_id)
                if file_path:
                    saved_paths.append(file_path)
        
        return saved_paths
    
    def get_file_info(self, file_path: str) -> Dict:
        """Get information about a file"""
        try:
            if not os.path.exists(file_path):
                return {}
            
            stat = os.stat(file_path)
            file_size = stat.st_size
            
            return {
                'path': file_path,
                'filename': os.path.basename(file_path),
                'size': file_size,
                'size_mb': file_size / (1024 * 1024),
                'created_time': datetime.fromtimestamp(stat.st_ctime).isoformat(),
                'modified_time': datetime.fromtimestamp(stat.st_mtime).isoformat()
            }
        except Exception as e:
            print(f"Error getting file info: {e}")
            return {}
    
    def cleanup_session(self, session_id: str) -> bool:
        """Clean up all files for a session"""
        try:
            session_dir = os.path.join(self.upload_folder, session_id)
            if os.path.exists(session_dir):
                shutil.rmtree(session_dir)
                return True
            return False
        except Exception as e:
            print(f"Error cleaning up session {session_id}: {e}")
            return False
    
    def cleanup_old_sessions(self, max_age_hours: int = 24) -> int:
        """Clean up old session directories"""
        try:
            cleaned_count = 0
            current_time = datetime.now()
            
            for session_dir in os.listdir(self.upload_folder):
                session_path = os.path.join(self.upload_folder, session_dir)
                
                if os.path.isdir(session_path):
                    # Check if directory is old enough to delete
                    dir_time = datetime.fromtimestamp(os.path.getctime(session_path))
                    age_hours = (current_time - dir_time).total_seconds() / 3600
                    
                    if age_hours > max_age_hours:
                        shutil.rmtree(session_path)
                        cleaned_count += 1
            
            return cleaned_count
        except Exception as e:
            print(f"Error cleaning up old sessions: {e}")
            return 0
    
    def get_session_files(self, session_id: str) -> List[Dict]:
        """Get all files for a session"""
        try:
            session_dir = os.path.join(self.upload_folder, session_id)
            if not os.path.exists(session_dir):
                return []
            
            files = []
            for filename in os.listdir(session_dir):
                file_path = os.path.join(session_dir, filename)
                if os.path.isfile(file_path):
                    file_info = self.get_file_info(file_path)
                    if file_info:
                        files.append(file_info)
            
            return files
        except Exception as e:
            print(f"Error getting session files: {e}")
            return [] 