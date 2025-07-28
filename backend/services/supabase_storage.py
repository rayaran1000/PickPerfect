import os
import tempfile
import requests
from typing import List, Dict, Optional
import json
from urllib.parse import urlparse
import mimetypes
from supabase import create_client, Client

class SupabaseStorageService:
    def __init__(self, supabase_url: str = None, supabase_key: str = None):
        """Initialize Supabase Storage service"""
        self.supabase_url = supabase_url or os.getenv('SUPABASE_URL')
        self.supabase_key = supabase_key or os.getenv('SUPABASE_SERVICE_KEY')
        self.bucket_name = 'pickperfect-photos'
        
        # Initialize Supabase client
        if self.supabase_url and self.supabase_key:
            self.supabase: Optional[Client] = create_client(self.supabase_url, self.supabase_key)
        else:
            self.supabase = None
        
        print(f"Supabase Storage Service initialized:")
        print(f"  URL: {self.supabase_url[:30]}..." if self.supabase_url else "  URL: NOT SET")
        print(f"  Key: {'SET' if self.supabase_key else 'NOT SET'}")
        print(f"  Bucket: {self.bucket_name}")
        print(f"  Client: {'INITIALIZED' if self.supabase else 'NOT INITIALIZED'}")
        
        if not self.supabase_url or not self.supabase_key:
            print("Warning: Supabase credentials not configured. Using fallback mode.")
    
    def upload_file(self, file_path: str, file_data: bytes) -> bool:
        """Upload a file to Supabase Storage"""
        try:
            if not self.supabase:
                print("Supabase client not initialized")
                return False
            
            print(f"Uploading file: {file_path}")
            
            # Upload file using Supabase client
            try:
                self.supabase.storage.from_(self.bucket_name).upload(
                    path=file_path,
                    file=file_data,
                    file_options={"content-type": "image/jpeg"}
                )
                
                print(f"Successfully uploaded {file_path}")
                return True
                
            except Exception as upload_error:
                print(f"Error uploading file: {upload_error}")
                return False
            
        except Exception as e:
            print(f"Error uploading file {file_path}: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def get_session_files(self, user_id: str, session_id: str) -> List[Dict]:
        """Get all files for a session from Supabase Storage"""
        try:
            if not self.supabase:
                print("Supabase client not initialized")
                return []
            
            print(f"Looking for files in bucket '{self.bucket_name}' for user '{user_id}' and session '{session_id}'")
            
            # List files in the user's directory using Supabase client
            try:
                files_data = self.supabase.storage.from_(self.bucket_name).list(user_id)
                
                if not files_data:
                    print(f"No files found in user directory '{user_id}'")
                    return []
                    
            except Exception as list_error:
                print(f"Error listing files: {list_error}")
                return []
            
            print(f"Found {len(files_data)} total files in user directory")
            
            # Print all files for debugging
            for file_info in files_data:
                print(f"File: {file_info.get('name', 'unknown')}")
            
            session_files = []
            
            # Filter files that belong to this session (start with sessionId_)
            for file_info in files_data:
                file_name = file_info.get('name', '')
                if file_name.startswith(f"{session_id}_"):
                    session_files.append({
                        'name': f"{user_id}/{file_name}",
                        'size': file_info.get('metadata', {}).get('size', 0),
                        'mime_type': file_info.get('metadata', {}).get('mimetype', 'image/jpeg'),
                        'created_at': file_info.get('created_at', ''),
                        'updated_at': file_info.get('updated_at', '')
                    })
                    print(f"Found session file: {file_name}")
            
            print(f"Found {len(session_files)} files for session {session_id}")
            return session_files
            
        except Exception as e:
            print(f"Error getting session files from Supabase: {e}")
            import traceback
            traceback.print_exc()
            return []
    
    def download_file_to_temp(self, file_path: str) -> Optional[str]:
        """Download a file from Supabase Storage to a temporary location"""
        try:
            if not self.supabase:
                print("Supabase client not initialized")
                return None
            
            print(f"Downloading file: {file_path}")
            
            # Download file using Supabase client
            try:
                file_data = self.supabase.storage.from_(self.bucket_name).download(file_path)
                
                # Save to temporary location
                temp_dir = tempfile.mkdtemp(prefix='pickperfect_')
                file_name = os.path.basename(file_path)
                temp_file_path = os.path.join(temp_dir, file_name)
                
                with open(temp_file_path, 'wb') as f:
                    f.write(file_data)
                    
            except Exception as download_error:
                print(f"Error downloading file: {download_error}")
                return None
            
            print(f"Downloaded {file_path} to {temp_file_path}")
            return temp_file_path
            
        except Exception as e:
            print(f"Error downloading file {file_path}: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def download_session_files(self, user_id: str, session_id: str) -> List[str]:
        """Download all files for a session to temporary locations"""
        try:
            session_files = self.get_session_files(user_id, session_id)
            if not session_files:
                print(f"No files found for session {session_id}")
                return []
            
            temp_file_paths = []
            for file_info in session_files:
                file_path = file_info['name']
                temp_path = self.download_file_to_temp(file_path)
                if temp_path:
                    temp_file_paths.append(temp_path)
            
            print(f"Downloaded {len(temp_file_paths)} files for session {session_id}")
            return temp_file_paths
            
        except Exception as e:
            print(f"Error downloading session files: {e}")
            return []
    
    def cleanup_temp_files(self, temp_paths: List[str]):
        """Clean up temporary downloaded files"""
        for temp_path in temp_paths:
            try:
                if os.path.exists(temp_path):
                    os.remove(temp_path)
                    # Also remove the temp directory if it's empty
                    temp_dir = os.path.dirname(temp_path)
                    if os.path.exists(temp_dir) and not os.listdir(temp_dir):
                        os.rmdir(temp_dir)
            except Exception as e:
                print(f"Error cleaning up temp file {temp_path}: {e}")
    
    def get_file_url(self, file_path: str) -> Optional[str]:
        """Get the public URL for a file"""
        try:
            if not self.supabase:
                print("Supabase client not initialized")
                return None
            
            response = self.supabase.storage.from_(self.bucket_name).get_public_url(file_path)
            return response.publicUrl
        except Exception as e:
            print(f"Error getting file URL: {e}")
            return None
    
    def is_valid_image_file(self, file_info: Dict) -> bool:
        """Check if a file is a valid image based on its metadata"""
        mime_type = file_info.get('mime_type', '').lower()
        valid_types = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 
            'image/webp', 'image/bmp', 'image/tiff'
        ]
        return mime_type in valid_types
    
    def delete_session_files(self, user_id: str, session_id: str) -> bool:
        """Delete all files for a session from Supabase Storage"""
        try:
            if not self.supabase:
                print("Supabase client not initialized")
                return False
            
            # Get session files
            session_files = self.get_session_files(user_id, session_id)
            if not session_files:
                return True  # No files to delete
            
            # Delete files using Supabase client
            file_paths = [file_info['name'] for file_info in session_files]
            
            try:
                self.supabase.storage.from_(self.bucket_name).remove(file_paths)
            except Exception as delete_error:
                print(f"Error deleting files: {delete_error}")
                return False
            
            print(f"Deleted {len(file_paths)} files for session {session_id}")
            return True
            
        except Exception as e:
            print(f"Error deleting session files: {e}")
            import traceback
            traceback.print_exc()
            return False 