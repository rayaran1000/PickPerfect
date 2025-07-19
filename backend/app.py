from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import os
import uuid
import json
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
from werkzeug.exceptions import RequestEntityTooLarge
import threading
import time
import requests
from urllib.parse import urlparse
import tempfile

# Import our services
from services.image_analyzer import ImageAnalyzer
from services.file_handler import FileHandler

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure Flask
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max file size
app.config['UPLOAD_FOLDER'] = 'uploads'

# Enable CORS for all routes
CORS(app, origins=["http://localhost:3000"], supports_credentials=True)

# Initialize services
image_analyzer = ImageAnalyzer()
file_handler = FileHandler()

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
        
        # Get session directory
        session_dir = os.path.join(file_handler.upload_folder, session_id)
        if not os.path.exists(session_dir):
            return jsonify({'error': 'Session not found'}), 404
        
        # Get all image files in the session
        image_files = []
        for filename in os.listdir(session_dir):
            if file_handler.is_valid_image(filename):
                file_path = os.path.join(session_dir, filename)
                image_files.append(file_path)
        
        if not image_files:
            return jsonify({'error': 'No valid images found in session'}), 400
        
        # Start analysis in a separate thread to avoid blocking
        def run_analysis():
            try:
                result = image_analyzer.analyze_images_local(image_files)
                analysis_results[session_id] = result
            except Exception as e:
                analysis_results[session_id] = {'error': str(e)}
        
        # Start analysis thread
        analysis_thread = threading.Thread(target=run_analysis)
        analysis_thread.start()
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'message': 'Analysis started',
            'total_images': len(image_files),
            'status': 'processing'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analysis-status/<session_id>', methods=['GET'])
def get_analysis_status(session_id):
    """Get the status of image analysis"""
    try:
        if session_id not in analysis_results:
            return jsonify({
                'status': 'not_found',
                'message': 'Analysis not found for this session'
            }), 404
        
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
    """Serve uploaded images"""
    try:
        file_path = os.path.join(file_handler.upload_folder, session_id, filename)
        if not os.path.exists(file_path):
            return jsonify({'error': 'Image not found'}), 404
        
        return send_file(file_path)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/cleanup/<session_id>', methods=['DELETE'])
def cleanup_session(session_id):
    """Clean up session files and results"""
    try:
        # Clean up files
        success = file_handler.cleanup_session(session_id)
        
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

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 