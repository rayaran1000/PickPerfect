import os
import cv2
import numpy as np
from PIL import Image
from typing import List, Dict, Tuple, Optional
import json
from datetime import datetime
import hashlib

class PixelAnalyzer:
    def __init__(self):
        """Initialize the pixel-based image analyzer"""
        # Image quality assessment parameters
        self.quality_weights = {
            'resolution': 0.3,
            'sharpness': 0.25,
            'brightness': 0.2,
            'contrast': 0.15,
            'noise': 0.1
        }
    
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
    
    def group_exact_duplicates(self, image_paths: List[str], similarity_threshold: float = 0.96) -> List[List[int]]:
        """Group exact duplicate images using pixel-by-pixel comparison"""
        try:
            print("Grouping exact duplicates using pixel-by-pixel comparison...")
            
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
                            print(f"Images {i} and {j} are {similarity:.2%} similar - grouped as exact duplicates")
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
            print(f"Error grouping exact duplicates: {e}")
            return []
    
    def analyze_exact_duplicates(self, image_paths: List[str]) -> Dict:
        """Complete exact duplicate analysis pipeline"""
        try:
            print(f"Starting exact duplicate analysis of {len(image_paths)} images...")
            
            if not image_paths:
                return {
                    'error': 'No valid image paths found',
                    'groups': [],
                    'statistics': {}
                }
            
            # Group exact duplicates
            groups = self.group_exact_duplicates(image_paths)
            
            # Track which images have been processed
            processed_indices = set()
            
            # Analyze each group
            analyzed_groups = []
            total_duplicates = 0
            
            for group_idx, group in enumerate(groups):
                if len(group) == 1:
                    # Single image - no duplicates
                    image_path = image_paths[group[0]]
                    quality = self.assess_image_quality(image_path)
                    
                    analyzed_groups.append({
                        'id': f"unique_{group_idx}",
                        'type': 'unique',
                        'images': [{
                            'path': image_path,
                            'quality': quality,
                            'file_size': os.path.getsize(image_path)
                        }],
                        'best_image': {
                            'path': image_path,
                            'quality': quality,
                            'file_size': os.path.getsize(image_path)
                        },
                        'count': 1,
                        'similarity_score': 1.0
                    })
                else:
                    # Multiple images - duplicates found
                    group_images = []
                    best_image = None
                    best_score = -1
                    
                    for img_idx in group:
                        image_path = image_paths[img_idx]
                        quality = self.assess_image_quality(image_path)
                        file_size = os.path.getsize(image_path)
                        
                        group_images.append({
                            'path': image_path,
                            'quality': quality,
                            'file_size': file_size
                        })
                        
                        # Track best image
                        if quality['overall_score'] > best_score:
                            best_score = quality['overall_score']
                            best_image = {
                                'path': image_path,
                                'quality': quality,
                                'file_size': file_size
                            }
                        
                        processed_indices.add(img_idx)
                    
                    total_duplicates += len(group) - 1
                    
                    analyzed_groups.append({
                        'id': f"duplicate_{group_idx}",
                        'type': 'duplicate',
                        'images': group_images,
                        'best_image': best_image,
                        'count': len(group),
                        'similarity_score': 0.98  # High similarity for exact duplicates
                    })
            
            # Calculate statistics
            total_images = len(image_paths)
            total_groups = len(analyzed_groups)
            duplicate_count = sum(1 for group in analyzed_groups if group['type'] == 'duplicate')
            unique_count = sum(1 for group in analyzed_groups if group['type'] == 'unique')
            
            # Calculate space savings
            estimated_space_saved_bytes = 0
            for group in analyzed_groups:
                if group['type'] == 'duplicate' and group['count'] > 1:
                    # Calculate space saved by keeping only the best image
                    total_size = sum(img['file_size'] for img in group['images'])
                    best_size = group['best_image']['file_size']
                    saved_size = total_size - best_size
                    estimated_space_saved_bytes += saved_size
            
            statistics = {
                'total_images': total_images,
                'total_groups': total_groups,
                'duplicate_count': duplicate_count,
                'similar_count': 0,  # No similar images in exact duplicate mode
                'unique_count': unique_count,
                'estimated_space_saved_bytes': estimated_space_saved_bytes,
                'estimated_space_saved_mb': estimated_space_saved_bytes / (1024 * 1024)
            }
            
            return {
                'success': True,
                'groups': analyzed_groups,
                'statistics': statistics
            }
            
        except Exception as e:
            print(f"Error in exact duplicate analysis: {e}")
            return {
                'error': str(e),
                'groups': [],
                'statistics': {}
            } 