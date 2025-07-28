from flask import Flask, jsonify, request, send_file, redirect
from flask_cors import CORS
import os
import uuid
import json
import zipfile
import io
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
from werkzeug.exceptions import RequestEntityTooLarge
import threading
import time
import requests
from urllib.parse import urlparse
import tempfile

# Import our services
from services.pixel_analyzer import PixelAnalyzer
from services.ai_analyzer import AIAnalyzer
from services.file_handler import FileHandler
from services.supabase_storage import SupabaseStorageService

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure Flask
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max file size
app.config['UPLOAD_FOLDER'] = 'uploads'

# Enable CORS for all routes
CORS(app, origins=["http://localhost:3000"], supports_credentials=True)

# Initialize services
pixel_analyzer = PixelAnalyzer()
ai_analyzer = AIAnalyzer()
file_handler = FileHandler()
supabase_storage = SupabaseStorageService()

# Store analysis results in memory (in production, use a database)
analysis_results = {}

@app.errorhandler(RequestEntityTooLarge)
def handle_file_too_large(e):
    return jsonify({'error': 'File too large. Maximum size is 100MB.'}), 413

@app.errorhandler(Exception)
def handle_exception(e):
    return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'PickPerfect AI Backend is running',
        'timestamp': time.time()
    })

@app.route('/api/upload', methods=['POST'])
def upload_images():
    """Upload multiple images directly to backend"""
    try:
        # Check if files are in the request
        if 'files' not in request.files:
            return jsonify({'error': 'No files provided'}), 400
        
        files = request.files.getlist('files')
        user_id = request.form.get('user_id')
        
        if not files or all(file.filename == '' for file in files):
            return jsonify({'error': 'No files selected'}), 400
        
        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400
        
        # Generate session ID
        session_id = str(uuid.uuid4())
        
        # Save files using file handler
        saved_paths = file_handler.save_multiple_files(files, session_id)
        
        if not saved_paths:
            return jsonify({'error': 'No valid images were uploaded'}), 400
        
        # Get file information
        uploaded_files = []
        for file_path in saved_paths:
            file_info = file_handler.get_file_info(file_path)
            if file_info:
                uploaded_files.append(file_info)
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'uploaded_files': uploaded_files,
            'count': len(uploaded_files),
            'message': f'Successfully uploaded {len(uploaded_files)} images'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analyze', methods=['POST'])
def analyze_images():
    """Analyze uploaded images using AI"""
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        user_id = data.get('user_id')
        
        if not session_id:
            return jsonify({'error': 'Session ID is required'}), 400
        
        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400
        
        # Get session files from Supabase Storage
        session_files = supabase_storage.get_session_files(user_id, session_id)
        if not session_files:
            return jsonify({'error': 'No files found for this session'}), 404
        
        # Filter valid image files
        valid_files = [f for f in session_files if supabase_storage.is_valid_image_file(f)]
        if not valid_files:
            return jsonify({'error': 'No valid images found in session'}), 400
        
        # Get analysis type from request (default to pixel-based for backward compatibility)
        analysis_type = data.get('analysis_type', 'pixel')
        

        
        # Start analysis in a separate thread to avoid blocking
        def run_analysis():
            try:
                # Download files to temporary locations for analysis
                temp_file_paths = supabase_storage.download_session_files(user_id, session_id)
                
                if not temp_file_paths:
                    analysis_results[session_id] = {'error': 'Failed to download files for analysis'}
                    return
                
                # Create mappings for file serving
                temp_to_supabase_mapping = {}
                temp_to_original_mapping = {}
                
                # Create a mapping by index since temp files and valid files should be in the same order
                for i, temp_path in enumerate(temp_file_paths):
                    if i < len(valid_files):
                        supabase_path = valid_files[i]['name']  # Full path like "user_id/session_id_filename.png"
                        temp_to_supabase_mapping[temp_path] = supabase_path
                        
                        # Extract original filename from Supabase path
                        supabase_filename = os.path.basename(supabase_path)  # "session_id_filename.png"
                        if supabase_filename.startswith(f"{session_id}_"):
                            original_filename = supabase_filename[len(f"{session_id}_"):]  # "filename.png"
                        else:
                            original_filename = supabase_filename
                        
                        temp_to_original_mapping[original_filename] = temp_path
                
                # Run analysis on the downloaded files
                if analysis_type == 'ai':
                    result = ai_analyzer.analyze_similar_images(temp_file_paths)
                else:
                    result = pixel_analyzer.analyze_exact_duplicates(temp_file_paths)
                
                # Convert temporary file paths back to Supabase Storage paths for frontend display
                if result.get('success') and len(result.get('groups')) > 0:
                    for group in result['groups']:
                        for image in group.get('images', []):
                            # Convert temp path back to Supabase Storage path using mapping
                            temp_path = image['path']
                            if temp_path in temp_to_supabase_mapping:
                                old_path = image['path']
                                image['path'] = temp_to_supabase_mapping[temp_path]
                            else:
                                print(f"Warning: No mapping found for temp path {temp_path}")
                        
                        # Update best image path
                        if 'best_image' in group:
                            temp_path = group['best_image']['path']
                            if temp_path in temp_to_supabase_mapping:
                                old_path = group['best_image']['path']
                                group['best_image']['path'] = temp_to_supabase_mapping[temp_path]
                            else:
                                print(f"Warning: No mapping found for best image temp path {temp_path}")
                
                analysis_results[session_id] = result
                
                supabase_storage.cleanup_temp_files(temp_file_paths)
                
            except Exception as e:
                print(f"Error in analysis thread: {e}")
                analysis_results[session_id] = {'error': str(e)}
        
        # Start analysis thread
        analysis_thread = threading.Thread(target=run_analysis)
        analysis_thread.start()
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'message': 'Analysis started',
            'total_images': len(valid_files),
            'status': 'processing'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analysis-status/<session_id>', methods=['GET'])
def get_analysis_status(session_id):
    """Get the status of image analysis"""
    try:
        if session_id not in analysis_results:
            # Check if session exists in Supabase Storage (analysis might be starting)
            # We need user_id to check, but we don't have it in the URL
            # For now, we'll assume the session exists if it's not in results yet
            return jsonify({
                'status': 'processing',
                'message': 'Analysis starting up...'
            })
        
        result = analysis_results[session_id]
        
        if 'error' in result:
            return jsonify({
                'status': 'error',
                'error': result['error']
            }), 500
        
        if result.get('success'):
            return jsonify({
                'status': 'completed',
                'result': result
            })
        else:
            return jsonify({
                'status': 'processing',
                'message': 'Analysis in progress'
            })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/results/<session_id>', methods=['GET'])
def get_analysis_results(session_id):
    """Get analysis results for a session"""
    try:
        if session_id not in analysis_results:
            return jsonify({'error': 'Results not found'}), 404
        
        result = analysis_results[session_id]
        
        if 'error' in result:
            return jsonify({'error': result['error']}), 500
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'result': result
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/image/<session_id>/<filename>', methods=['GET'])
def serve_image(session_id, filename):
    """Serve uploaded images from temporary files or Supabase Storage"""
    try:
        # Get user_id from query parameter (fallback method)
        user_id = request.args.get('user_id')
        
        if not user_id:
            # Try to extract user_id from filename if it contains the full path
            # This handles cases where the frontend passes the full path as filename
            if '/' in filename:
                parts = filename.split('/')
                if len(parts) >= 2:
                    user_id = parts[0]
                    # Extract the actual filename (remove session prefix)
                    actual_filename = parts[1]
                    if actual_filename.startswith(f"{session_id}_"):
                        filename = actual_filename[len(f"{session_id}_"):]
        
        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400
        
        # Serve images directly from Supabase Storage
        # Construct the Supabase Storage path
        file_path = f"{user_id}/{session_id}_{filename}"
        
        # Get the public URL from Supabase Storage
        public_url = supabase_storage.get_file_url(file_path)
        if not public_url:
            return jsonify({'error': 'Image not found'}), 404
        
        # Redirect to the Supabase Storage URL
        return redirect(public_url)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/cleanup/<session_id>', methods=['DELETE'])
def cleanup_session(session_id):
    """Clean up session files and results"""
    try:
        # Get user_id from query parameter
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400
        
        # Clean up files from Supabase Storage
        success = supabase_storage.delete_session_files(user_id, session_id)
        
        # Clean up analysis results
        if session_id in analysis_results:
            del analysis_results[session_id]
        
        if success:
            return jsonify({
                'success': True,
                'message': f'Session {session_id} cleaned up successfully'
            })
        else:
            return jsonify({
                'success': False,
                'message': f'Failed to cleanup session {session_id}'
            })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/statistics', methods=['GET'])
def get_statistics():
    """Get system statistics"""
    try:
        # Count total sessions
        total_sessions = len(analysis_results)
        
        # Count completed analyses
        completed_analyses = sum(1 for result in analysis_results.values() 
                               if result.get('success') and 'error' not in result)
        
        # Count total images analyzed
        total_images = 0
        for result in analysis_results.values():
            if result.get('success') and 'error' not in result:
                total_images += result.get('result', {}).get('statistics', {}).get('total_images', 0)
        
        return jsonify({
            'total_sessions': total_sessions,
            'completed_analyses': completed_analyses,
            'total_images_analyzed': total_images,
            'active_sessions': total_sessions
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/download', methods=['POST'])
def download_selected_photos():
    """Download selected photos as a ZIP file"""
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        photo_paths = data.get('photo_paths', [])
        
        if not session_id:
            return jsonify({'error': 'Session ID is required'}), 400
        
        if not photo_paths:
            return jsonify({'error': 'No photos selected for download'}), 400
        
        # Create a ZIP file in memory
        zip_buffer = io.BytesIO()
        
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            for photo_path in photo_paths:
                try:
                    # Check if file exists and is within the session directory
                    if not os.path.exists(photo_path):
                        print(f"Warning: File not found: {photo_path}")
                        continue
                    
                    # Verify the file is within the session directory for security
                    session_dir = os.path.join(file_handler.upload_folder, session_id)
                    if not photo_path.startswith(session_dir):
                        print(f"Warning: File path outside session directory: {photo_path}")
                        continue
                    
                    # Get the filename for the ZIP
                    filename = os.path.basename(photo_path)
                    
                    # Add file to ZIP
                    zip_file.write(photo_path, filename)
                    
                except Exception as e:
                    print(f"Error adding file {photo_path} to ZIP: {e}")
                    continue
        
        # Reset buffer position
        zip_buffer.seek(0)
        
        # Return the ZIP file
        return send_file(
            zip_buffer,
            mimetype='application/zip',
            as_attachment=True,
            download_name=f'selected_photos_{session_id}.zip'
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 