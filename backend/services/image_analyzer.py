import os
import cv2
import numpy as np
from PIL import Image
import requests
from typing import List, Dict, Tuple, Optional
import json
from datetime import datetime
import hashlib
import tempfile
from urllib.parse import urlparse

class ImageAnalyzer:
    def __init__(self):
        """Initialize the image analyzer"""
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
    

    

    

    
    def calculate_pixel_similarity(self, image_path1: str, image_path2: str, resize_to: tuple = (64, 64)) -> float:
        """Calculate pixel-by-pixel similarity between two images"""
        try:
            # Load images
            img1 = cv2.imread(image_path1)
            img2 = cv2.imread(image_path2)
            
            if img1 is None or img2 is None:
                return 0.0
            
            # Resize images to same size for comparison
            img1_resized = cv2.resize(img1, resize_to)
            img2_resized = cv2.resize(img2, resize_to)
            
            # Convert to grayscale for better comparison
            gray1 = cv2.cvtColor(img1_resized, cv2.COLOR_BGR2GRAY)
            gray2 = cv2.cvtColor(img2_resized, cv2.COLOR_BGR2GRAY)
            
            # Calculate Mean Squared Error (MSE)
            mse = np.mean((gray1.astype(float) - gray2.astype(float)) ** 2)
            
            # Convert MSE to similarity score (0-1)
            # Lower MSE = higher similarity
            max_mse = 255 ** 2  # Maximum possible MSE
            similarity = 1.0 - (mse / max_mse)
            
            return max(0.0, similarity)
            
        except Exception as e:
            print(f"Error calculating pixel similarity: {e}")
            return 0.0
    
    def group_similar_images_local(self, image_paths: List[str], similarity_threshold: float = 0.96) -> List[List[int]]:
        """Group similar images using pixel-by-pixel comparison"""
        try:
            print("Grouping images using pixel-by-pixel comparison...")
            
            if len(image_paths) < 2:
                return []
            
            # Initialize groups
            groups = []
            processed = set()
            
            # Compare each image with every other image
            for i in range(len(image_paths)):
                if i in processed:
                    continue
                
                # Start a new group with current image
                current_group = [i]
                processed.add(i)
                
                # Compare with all remaining images
                for j in range(i + 1, len(image_paths)):
                    if j in processed:
                        continue
                    
                    try:
                        # Calculate pixel similarity
                        similarity = self.calculate_pixel_similarity(image_paths[i], image_paths[j])
                        
                        if similarity >= similarity_threshold:
                            current_group.append(j)
                            processed.add(j)
                            print(f"Images {i} and {j} are {similarity:.2%} similar - grouped together")
                        else:
                            print(f"Images {i} and {j} are {similarity:.2%} similar - kept separate")
                            
                    except Exception as e:
                        print(f"Error comparing images {i} and {j}: {e}")
                        continue
                
                # Add the group (even if it's just one image)
                groups.append(current_group)
            
            print(f"Pixel comparison created {len(groups)} groups")
            return groups
            
        except Exception as e:
            print(f"Error grouping local images: {e}")
            return []
    
    def analyze_images_local(self, image_paths: List[str]) -> Dict:
        """Complete image analysis pipeline for local files"""
        try:
            print(f"Starting analysis of {len(image_paths)} local images...")
            
            if not image_paths:
                return {
                    'error': 'No valid image paths found',
                    'groups': [],
                    'statistics': {}
                }
            
            # Group similar images
            groups = self.group_similar_images_local(image_paths)
            
            # Track which images have been processed
            processed_indices = set()
            
            # Analyze each group
            analyzed_groups = []
            total_duplicates = 0
            total_similar = 0
            estimated_space_saved = 0
            
            for group_idx, group_indices in enumerate(groups):
                group_paths = [image_paths[i] for i in group_indices]
                
                # Mark these indices as processed
                processed_indices.update(group_indices)
                
                # Assess quality of each image in the group
                quality_scores = []
                for i, image_path in enumerate(group_paths):
                    try:
                        quality = self.assess_image_quality(image_path)
                        file_size = os.path.getsize(image_path)
                        
                        quality_scores.append({
                            'path': image_path,
                            'filename': os.path.basename(image_path),
                            'quality': quality,
                            'file_size': file_size
                        })
                    except Exception as e:
                        print(f"Error processing image {image_path}: {e}")
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
                    'similarity_score': 0.90  # Placeholder, could be calculated from features
                }
                
                analyzed_groups.append(analyzed_group)
            
            # Add individual images that weren't grouped (unique images)
            for i, image_path in enumerate(image_paths):
                if i not in processed_indices:
                    try:
                        quality = self.assess_image_quality(image_path)
                        file_size = os.path.getsize(image_path)
                        
                        quality_score = {
                            'path': image_path,
                            'filename': os.path.basename(image_path),
                            'quality': quality,
                            'file_size': file_size
                        }
                        
                        analyzed_group = {
                            'id': f'group_{len(analyzed_groups)}',
                            'type': 'unique',
                            'images': [quality_score],
                            'best_image': quality_score,
                            'count': 1,
                            'similarity_score': 1.0  # Unique image
                        }
                        
                        analyzed_groups.append(analyzed_group)
                        
                    except Exception as e:
                        print(f"Error processing unique image {image_path}: {e}")
                        continue
            
            # Sort groups by number of images in descending order (largest groups first)
            analyzed_groups.sort(key=lambda x: x['count'], reverse=True)
            
            # Reassign group IDs to maintain order
            for i, group in enumerate(analyzed_groups):
                group['id'] = f'group_{i}'
            
            # Calculate statistics
            statistics = {
                'total_images': len(image_paths),
                'total_groups': len(analyzed_groups),
                'duplicate_count': total_duplicates,
                'similar_count': total_similar,
                'unique_count': len(analyzed_groups) - total_duplicates - total_similar,
                'estimated_space_saved_bytes': estimated_space_saved,
                'estimated_space_saved_mb': estimated_space_saved / (1024 * 1024)
            }
            
            return {
                'groups': analyzed_groups,
                'statistics': statistics,
                'success': True
            }
            
        except Exception as e:
            print(f"Error in local image analysis: {e}")
            return {
                'error': str(e),
                'groups': [],
                'statistics': {}
            }
    
    def analyze_images(self, image_paths: List[str]) -> Dict:
        """Main entry point for image analysis"""
        return self.analyze_images_local(image_paths)