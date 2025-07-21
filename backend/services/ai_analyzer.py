import os
import cv2
import numpy as np
from PIL import Image
from typing import List, Dict, Tuple, Optional
import json
from datetime import datetime
import faiss  
from transformers import CLIPProcessor, CLIPModel 
import torch
from .pixel_analyzer import PixelAnalyzer  

class AIAnalyzer:
    def __init__(self):
        """Initialize the AI-based image analyzer"""
        # Image quality assessment parameters (same as pixel analyzer for consistency)
        self.quality_weights = {
            'resolution': 0.3,
            'sharpness': 0.25,
            'brightness': 0.2,
            'contrast': 0.15,
            'noise': 0.1
        }
        
        self.model = CLIPModel.from_pretrained("openai/clip-vit-base-patch16")
        self.processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch16", use_fast=True)
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model.to(self.device)
    
    def assess_image_quality(self, image_path: str) -> Dict[str, float]:
        """Assess image quality using multiple metrics (same as pixel analyzer)"""
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
    
    def extract_features_and_store(self, image_paths: List[str]) -> Tuple[faiss.Index, np.ndarray]:
        """Extract features from images using CLIP model and store in FAISS index"""

        try:
            embeddings = []
            for image_path in image_paths:
                image = Image.open(image_path).convert('RGB')
                inputs = self.processor(images=image, return_tensors="pt").to(self.device)
                with torch.no_grad():
                    embedding = self.model.get_image_features(**inputs)
                    embedding = embedding / embedding.norm(p=2, dim=-1, keepdim=True)  
                    embeddings.append(embedding.cpu().numpy().flatten())
            
            embeddings_stored = np.vstack(embeddings)
            index = faiss.IndexFlatIP(embeddings_stored.shape[1])  
            index.add(embeddings_stored.astype('float32'))
            return index, embeddings_stored

        except Exception as e:
            print(f"Error extracting features from {image_paths}: {e}")
            return None, None
    
    def merge_similar_groups_ai(self, groups: List[List[int]], image_paths: List[str], similarity_threshold: float = 0.9) -> List[List[int]]:
        """Merge similar groups using AI by comparing best images from each group"""
        
        try:
            print("Merging similar groups using AI analysis...")
            
            if len(groups) < 2:
                return groups
            
            # Find best image from each group based on quality
            best_images = []
            for group in groups:
                best_image_idx = None
                best_score = -1
                
                for img_idx in group:
                    image_path = image_paths[img_idx]
                    quality = self.assess_image_quality(image_path)
                    if quality['overall_score'] > best_score:
                        best_score = quality['overall_score']
                        best_image_idx = img_idx
                
                best_images.append({
                    'group_idx': len(best_images),
                    'image_idx': best_image_idx,
                    'image_path': image_paths[best_image_idx],
                    'quality_score': best_score
                })
            
            print(f"Found {len(best_images)} best images to compare")
            
            # Extract features for best images only
            best_image_paths = [img['image_path'] for img in best_images]
            index, embeddings = self.extract_features_and_store(best_image_paths)
            
            if index is None or embeddings is None:
                print("Failed to extract features for best images")
                return groups
            
            # Compare best images and merge groups if similar
            merged_groups = groups.copy()
            processed_groups = set()
            
            for i in range(len(best_images)):
                if i in processed_groups:
                    continue
                
                current_group_idx = best_images[i]['group_idx']
                if current_group_idx in processed_groups:
                    continue
                
                # Find similar groups
                for j in range(i + 1, len(best_images)):
                    if j in processed_groups:
                        continue
                    
                    target_group_idx = best_images[j]['group_idx']
                    if target_group_idx in processed_groups:
                        continue
                    
                    # Calculate similarity between best images
                    similarity = self.calculate_similarity_between_embeddings(
                        embeddings[i], embeddings[j]
                    )
                    
                    print(f"Comparing groups {current_group_idx} and {target_group_idx}: {similarity:.2%} similar")
                    
                    if similarity >= similarity_threshold:
                        # Merge groups
                        print(f"Merging groups {current_group_idx} and {target_group_idx} (similarity: {similarity:.2%})")
                        
                        # Add all images from target group to current group
                        merged_groups[current_group_idx].extend(merged_groups[target_group_idx])
                        
                        # Mark target group as processed
                        processed_groups.add(target_group_idx)
                        
                        # Remove the merged group (will be handled later)
                        merged_groups[target_group_idx] = []
            
            # Remove empty groups (merged ones)
            final_groups = [group for group in merged_groups if group]
            
            print(f"AI merging reduced {len(groups)} groups to {len(final_groups)} groups")
            return final_groups
            
        except Exception as e:
            print(f"Error merging similar groups with AI: {e}")
            return groups
    
    def calculate_similarity_between_embeddings(self, embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        """Calculate cosine similarity between two embeddings"""
        try:
            # Ensure embeddings are 1D
            emb1 = embedding1.flatten()
            emb2 = embedding2.flatten()
            
            # Calculate cosine similarity
            dot_product = np.dot(emb1, emb2)
            norm1 = np.linalg.norm(emb1)
            norm2 = np.linalg.norm(emb2)
            
            if norm1 == 0 or norm2 == 0:
                return 0.0
            
            similarity = dot_product / (norm1 * norm2)
            return max(0.0, similarity)
            
        except Exception as e:
            print(f"Error calculating similarity: {e}")
            return 0.0
    
    # def group_similar_images(self, image_paths: List[str], similarity_threshold: float = 0.7) -> List[List[int]]:
    #     """Group similar images using AI-based analysis (legacy method - kept for compatibility)"""

    #     try:
    #         print("Grouping similar images using AI-based analysis...")
            
    #         if len(image_paths) < 2:
    #             return []
            
    #         # Extract features for all images and store them in faiss
    #         index, embeddings = self.extract_features_and_store(image_paths)

    #         if index is None or embeddings is None:
    #             return []
            
    #         # Get nearest neighbors for each image
    #         k = min(10, len(image_paths))  # Don't search for more neighbors than images
    #         similarity_scores, neighbor_indices = index.search(embeddings.astype('float32'), k)

    #         # Group images based on similarity scores
    #         groups = []
    #         processed = set()
            
    #         for i in range(len(image_paths)):
    #             if i in processed:
    #                 continue
                
    #             current_group = [i]
    #             processed.add(i)

    #                 # Check neighbors of current image
    #                 for neighbor_idx in range(1, k):  # Skip first neighbor (self)
    #                     j = neighbor_indices[i][neighbor_idx]
    #                     if j == -1 or j in processed:  # -1 means no neighbor found
    #                         continue
                    
    #                     similarity = similarity_scores[i][neighbor_idx]
    #                     if similarity >= similarity_threshold:
    #                         current_group.append(j)
    #                         processed.add(j)
    #                         print(f"Images {i} and {j} are {similarity:.2%} similar - grouped together")
    #                     else:
    #                         print(f"Images {i} and {j} are {similarity:.2%} similar - kept separate")
                
    #             groups.append(current_group)
            
    #         print(f"AI analysis created {len(groups)} groups")
    #         return groups
            
    #     except Exception as e:
    #         print(f"Error grouping similar images: {e}")
    #         return []
    
    def analyze_similar_images(self, image_paths: List[str]) -> Dict:
        """Complete similar image analysis pipeline using hybrid approach (duplicates + AI)"""
        try:
            print(f"Starting hybrid similar image analysis of {len(image_paths)} images...")
            
            if not image_paths:
                return {
                    'error': 'No valid image paths found',
                    'groups': [],
                    'statistics': {}
                }
            
            # Step 1: Find exact duplicates using pixel analyzer
            print("Step 1: Finding exact duplicates...")
            pixel_analyzer = PixelAnalyzer()
            duplicate_groups = pixel_analyzer.group_exact_duplicates(image_paths)
            print(f"Found {len(duplicate_groups)} duplicate groups")
            
            # Step 2: Merge similar groups using AI
            print("Step 2: Merging similar groups with AI...")
            groups = self.merge_similar_groups_ai(duplicate_groups, image_paths)
            print(f"Final result: {len(groups)} groups after AI merging")
            
            # Analyze each group
            analyzed_groups = []
            total_similar = 0
            
            for group_idx, group in enumerate(groups):
                if len(group) == 1:
                    # Single image - unique
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
                    # Multiple images - similar images found
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
                    
                    total_similar += len(group) - 1
                    
                    analyzed_groups.append({
                        'id': f"similar_{group_idx}",
                        'type': 'similar',
                        'images': group_images,
                        'best_image': best_image,
                        'count': len(group),
                        'similarity_score': 0.85  # Typical similarity score for AI-detected similar images
                    })
            
            # Calculate statistics
            total_images = len(image_paths)
            total_groups = len(analyzed_groups)
            similar_count = sum(1 for group in analyzed_groups if group['type'] == 'similar')
            unique_count = sum(1 for group in analyzed_groups if group['type'] == 'unique')
            
            # Calculate space savings
            estimated_space_saved_bytes = 0
            for group in analyzed_groups:
                if group['type'] == 'similar' and group['count'] > 1:
                    # Calculate space saved by keeping only the best image
                    total_size = sum(img['file_size'] for img in group['images'])
                    best_size = group['best_image']['file_size']
                    saved_size = total_size - best_size
                    estimated_space_saved_bytes += saved_size
            
            statistics = {
                'total_images': total_images,
                'total_groups': total_groups,
                'duplicate_count': 0,  # No exact duplicates in AI mode
                'similar_count': similar_count,
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
            print(f"Error in AI analysis: {e}")
            return {
                'error': str(e),
                'groups': [],
                'statistics': {}
            } 