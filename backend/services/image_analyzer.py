import os
import cv2
import numpy as np
from PIL import Image
import torch
from transformers import AutoImageProcessor, AutoModel
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import DBSCAN
import requests
from typing import List, Dict, Tuple, Optional
import json
from datetime import datetime
import hashlib
import tempfile
from urllib.parse import urlparse

class ImageAnalyzer:
    def __init__(self):
        """Initialize the AI-powered image analyzer"""
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # Load pre-trained model for feature extraction (using a lightweight model)
        self.model_name = "microsoft/resnet-50"  # Free to use, good for feature extraction
        self.processor = AutoImageProcessor.from_pretrained(self.model_name)
        self.model = AutoModel.from_pretrained(self.model_name).to(self.device)
        self.model.eval()
        
        # Image quality assessment parameters
        self.quality_weights = {
            'resolution': 0.3,
            'sharpness': 0.25,
            'brightness': 0.2,
            'contrast': 0.15,
            'noise': 0.1
        }
    
    def download_image_from_url(self, url: str) -> str:
        """Download image from URL and save to temporary file"""
        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            
            # Create temporary file
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.jpg')
            temp_file.write(response.content)
            temp_file.close()
            
            return temp_file.name
        except Exception as e:
            print(f"Error downloading image from {url}: {e}")
            raise
    
    def extract_features(self, image_path: str) -> np.ndarray:
        """Extract deep features from an image using AI model"""
        try:
            # Load and preprocess image
            image = Image.open(image_path).convert('RGB')
            inputs = self.processor(images=image, return_tensors="pt").to(self.device)
            
            # Extract features
            with torch.no_grad():
                outputs = self.model(**inputs)
                # Use the last hidden state as features
                features = outputs.last_hidden_state.mean(dim=1).cpu().numpy()
            
            return features.flatten()
        except Exception as e:
            print(f"Error extracting features from {image_path}: {e}")
            return np.zeros(2048)  # Default feature vector for ResNet-50
    
    def calculate_similarity(self, features1: np.ndarray, features2: np.ndarray) -> float:
        """Calculate cosine similarity between two feature vectors"""
        return cosine_similarity([features1], [features2])[0][0]
    
    def assess_image_quality(self, image_path: str) -> Dict[str, float]:
        """Assess image quality using multiple metrics"""
        try:
            # Load image
            image = cv2.imread(image_path)
            if image is None:
                return {'overall_score': 0.0}
            
            # Convert to grayscale for some calculations
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # 1. Resolution score (normalized by typical photo resolution)
            height, width = image.shape[:2]
            resolution_score = min(1.0, (height * width) / (1920 * 1080))
            
            # 2. Sharpness score (using Laplacian variance)
            sharpness = cv2.Laplacian(gray, cv2.CV_64F).var()
            sharpness_score = min(1.0, sharpness / 500)  # Normalize
            
            # 3. Brightness score
            mean_brightness = np.mean(gray)
            brightness_score = 1.0 - abs(mean_brightness - 127) / 127
            
            # 4. Contrast score
            contrast = np.std(gray)
            contrast_score = min(1.0, contrast / 50)
            
            # 5. Noise assessment (using variance of differences)
            kernel = np.array([[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]])
            noise = cv2.filter2D(gray, -1, kernel)
            noise_score = max(0.0, 1.0 - np.var(noise) / 1000)
            
            # Calculate weighted overall score
            overall_score = (
                self.quality_weights['resolution'] * resolution_score +
                self.quality_weights['sharpness'] * sharpness_score +
                self.quality_weights['brightness'] * brightness_score +
                self.quality_weights['contrast'] * contrast_score +
                self.quality_weights['noise'] * noise_score
            )
            
            return {
                'overall_score': overall_score,
                'resolution_score': resolution_score,
                'sharpness_score': sharpness_score,
                'brightness_score': brightness_score,
                'contrast_score': contrast_score,
                'noise_score': noise_score,
                'width': width,
                'height': height
            }
            
        except Exception as e:
            print(f"Error assessing quality for {image_path}: {e}")
            return {'overall_score': 0.0}
    
    def group_similar_images_from_urls(self, image_urls: List[str], similarity_threshold: float = 0.85) -> List[List[int]]:
        """Group similar images using AI features and clustering from URLs"""
        try:
            # Download and extract features for all images
            print("Downloading and extracting features from images...")
            features = []
            valid_indices = []
            temp_files = []
            
            for i, url in enumerate(image_urls):
                try:
                    temp_file = self.download_image_from_url(url)
                    temp_files.append(temp_file)
                    
                    feature = self.extract_features(temp_file)
                    features.append(feature)
                    valid_indices.append(i)
                except Exception as e:
                    print(f"Warning: Could not process image {url}: {e}")
                    continue
            
            if not features:
                return []
            
            features = np.array(features)
            
            # Use DBSCAN clustering to group similar images
            # Convert similarity threshold to distance threshold
            distance_threshold = 1 - similarity_threshold
            
            clustering = DBSCAN(
                eps=distance_threshold,
                min_samples=2,  # At least 2 images to form a group
                metric='cosine'
            ).fit(features)
            
            # Group images by cluster
            labels = clustering.labels_
            groups = {}
            
            for i, label in enumerate(labels):
                if label >= 0:  # Skip noise points (label = -1)
                    if label not in groups:
                        groups[label] = []
                    groups[label].append(valid_indices[i])
            
            # Clean up temporary files
            for temp_file in temp_files:
                try:
                    os.unlink(temp_file)
                except:
                    pass
            
            return list(groups.values())
            
        except Exception as e:
            print(f"Error grouping images: {e}")
            return []
    
    def analyze_images_from_urls(self, image_urls: List[str], files_data: List[Dict]) -> Dict:
        """Complete image analysis pipeline from URLs"""
        try:
            print(f"Starting analysis of {len(image_urls)} images from URLs...")
            
            if not image_urls:
                return {
                    'error': 'No valid image URLs found',
                    'groups': [],
                    'statistics': {}
                }
            
            # Group similar images
            groups = self.group_similar_images_from_urls(image_urls)
            
            # Analyze each group
            analyzed_groups = []
            total_duplicates = 0
            total_similar = 0
            estimated_space_saved = 0
            
            for group_idx, group_indices in enumerate(groups):
                group_urls = [image_urls[i] for i in group_indices]
                group_files = [files_data[i] for i in group_indices]
                
                # Assess quality of each image in the group
                quality_scores = []
                for i, url in enumerate(group_urls):
                    try:
                        temp_file = self.download_image_from_url(url)
                        quality = self.assess_image_quality(temp_file)
                        
                        # Clean up temp file
                        try:
                            os.unlink(temp_file)
                        except:
                            pass
                        
                        quality_scores.append({
                            'path': group_files[i]['path'],
                            'url': url,
                            'filename': group_files[i]['filename'],
                            'quality': quality,
                            'file_size': group_files[i]['size']
                        })
                    except Exception as e:
                        print(f"Error processing image {url}: {e}")
                        continue
                
                if not quality_scores:
                    continue
                
                # Sort by quality score
                quality_scores.sort(key=lambda x: x['quality']['overall_score'], reverse=True)
                
                # Determine group type
                if len(quality_scores) == 2 and quality_scores[0]['quality']['overall_score'] - quality_scores[1]['quality']['overall_score'] < 0.1:
                    group_type = 'duplicate'
                    total_duplicates += len(quality_scores) - 1
                else:
                    group_type = 'similar'
                    total_similar += len(quality_scores) - 1
                
                # Calculate space that could be saved
                best_image = quality_scores[0]
                for other_image in quality_scores[1:]:
                    estimated_space_saved += other_image['file_size']
                
                analyzed_group = {
                    'id': f'group_{group_idx}',
                    'type': group_type,
                    'images': quality_scores,
                    'best_image': best_image,
                    'count': len(quality_scores),
                    'similarity_score': 0.9  # Placeholder, could be calculated from features
                }
                
                analyzed_groups.append(analyzed_group)
            
            # Calculate statistics
            statistics = {
                'total_images': len(image_urls),
                'total_groups': len(analyzed_groups),
                'duplicate_count': total_duplicates,
                'similar_count': total_similar,
                'estimated_space_saved_bytes': estimated_space_saved,
                'estimated_space_saved_mb': estimated_space_saved / (1024 * 1024)
            }
            
            return {
                'groups': analyzed_groups,
                'statistics': statistics,
                'success': True
            }
            
        except Exception as e:
            print(f"Error in image analysis: {e}")
            return {
                'error': str(e),
                'groups': [],
                'statistics': {}
            }
    
    def analyze_images(self, image_paths: List[str]) -> Dict:
        """Legacy method for local file analysis (kept for compatibility)"""
        # This method can be removed if you're fully migrating to URL-based analysis
        return self.analyze_images_from_urls(image_paths, [{'path': path, 'filename': os.path.basename(path), 'size': 0} for path in image_paths]) 