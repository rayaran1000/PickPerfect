# PickPerfect - AI-Powered Photo Organization

<img width="825" height="547" alt="Image" src="https://github.com/user-attachments/assets/a8fc5389-2b5c-4171-bfd2-953f2b8baad9" />

A web-based application that uses AI to help you organize and clean up your photo library by finding duplicates and similar images.

## Features

- **AI-Powered Duplicate Detection**: Uses deep learning models to find exact duplicates and similar images
- **Smart Quality Assessment**: Automatically identifies the best quality photo in each group
- **Similar Image Grouping**: Groups photos with similar content, lighting, and composition
- **Space Optimization**: Calculates potential storage space savings
- **User-Friendly Interface**: Clean, modern UI with real-time progress tracking

## Tech Stack

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Supabase** - Authentication
- **Lucide React** - Icons

### Backend
- **Flask** - Python web framework
- **PyTorch** - Deep learning framework
- **Transformers** - Hugging Face models
- **OpenCV** - Image processing
- **scikit-learn** - Machine learning utilities

## AI Models Used

- **ResNet-50** - Feature extraction for image similarity
- **DBSCAN Clustering** - Grouping similar images
- **Custom Quality Metrics** - Resolution, sharpness, brightness, contrast, noise assessment

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 18+
- Git

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**:
   Create a `.env` file in the backend directory:
   ```env
   FLASK_ENV=development
   FLASK_DEBUG=1
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_KEY=your_supabase_service_role_key
   ```
   
   See `backend/SETUP.md` for detailed setup instructions.

5. **Run the backend server**:
   ```bash
   python app.py
   ```
   The backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file in the frontend directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:3000`

## Usage

1. **Sign in** with your Google account
2. **Upload photos** from your device (up to 50 photos)
3. **Start AI analysis** - the system will process your photos
4. **Review results** - see grouped similar photos with quality scores
5. **Select photos to keep** - choose which photos to retain

## API Endpoints

### Backend API

- `GET /api/health` - Health check
- `POST /api/upload` - Upload images
- `POST /api/analyze` - Start AI analysis
- `GET /api/analysis-status/<session_id>` - Check analysis status
- `GET /api/results/<session_id>` - Get analysis results
- `GET /api/image/<session_id>/<filename>` - Serve uploaded images
- `DELETE /api/cleanup/<session_id>` - Clean up session
- `GET /api/statistics` - Get system statistics

## How It Works

### 1. Image Upload
- Files are validated and saved to session-specific directories
- File information is extracted (size, dimensions, etc.)

### 2. AI Analysis
- **Feature Extraction**: ResNet-50 extracts deep features from each image
- **Similarity Detection**: Cosine similarity compares feature vectors
- **Clustering**: DBSCAN groups similar images together
- **Quality Assessment**: Multiple metrics evaluate image quality

### 3. Results Processing
- Groups are analyzed for duplicates vs. similar images
- Best quality photo is identified in each group
- Statistics are calculated (space savings, counts, etc.)

## File Structure

```
PickPerfect/
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── requirements.txt       # Python dependencies
│   ├── services/
│   │   ├── image_analyzer.py  # AI analysis service
│   │   └── file_handler.py    # File management service
│   └── uploads/               # Uploaded files (created automatically)
├── frontend/
│   ├── app/                   # Next.js app directory
│   ├── components/            # React components
│   ├── lib/
│   │   ├── api.ts            # API service
│   │   └── supabase.ts       # Supabase configuration
│   └── package.json
└── README.md
```

## Performance Considerations

- **Model Loading**: ResNet-50 is loaded once at startup
- **Batch Processing**: Images are processed in batches for efficiency
- **Async Processing**: Analysis runs in background threads
- **Memory Management**: Files are cleaned up after sessions

## Limitations

- **File Size**: Maximum 50MB per file, 100MB total
- **Image Count**: Maximum 50 images per session
- **Supported Formats**: JPG, PNG, GIF, WebP, BMP, TIFF
- **Processing Time**: Depends on image count and size

## Future Enhancements

- [ ] Google Drive integration
- [ ] Batch download of selected photos
- [ ] Advanced filtering options
- [ ] Cloud deployment
- [ ] User preferences and settings
- [ ] Export analysis reports

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
