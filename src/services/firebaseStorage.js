import { 
  ref, 
  uploadBytes, 
  uploadBytesResumable,
  getDownloadURL, 
  deleteObject,
  listAll
} from 'firebase/storage';
import { storage } from '../config/firebase';

// Storage paths
export const STORAGE_PATHS = {
  GALLERY: 'gallery',
  POSTERS: 'posters',
  ANNOUNCEMENTS: 'announcements',
  PROFILES: 'profiles'
};

export class FirebaseStorage {
  constructor(basePath) {
    this.basePath = basePath;
  }

  // Upload file with progress tracking
  async uploadFile(file, fileName = null, onProgress = null) {
    try {
      // Generate unique filename if not provided
      const finalFileName = fileName || `${Date.now()}_${file.name}`;
      const fileRef = ref(storage, `${this.basePath}/${finalFileName}`);
      
      console.log(`📤 Uploading file to ${this.basePath}/${finalFileName}`);
      
      if (onProgress) {
        // Upload with progress tracking
        const uploadTask = uploadBytesResumable(fileRef, file);
        
        return new Promise((resolve, reject) => {
          uploadTask.on('state_changed',
            (snapshot) => {
              // Progress tracking
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log(`Upload progress: ${progress}%`);
              onProgress(progress);
            },
            (error) => {
              console.error('Upload error:', error);
              reject(error);
            },
            async () => {
              // Upload completed successfully
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                console.log(`✅ File uploaded successfully: ${downloadURL}`);
                resolve({
                  url: downloadURL,
                  fileName: finalFileName,
                  path: `${this.basePath}/${finalFileName}`,
                  size: file.size,
                  type: file.type
                });
              } catch (error) {
                reject(error);
              }
            }
          );
        });
      } else {
        // Simple upload without progress tracking
        const snapshot = await uploadBytes(fileRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        console.log(`✅ File uploaded successfully: ${downloadURL}`);
        return {
          url: downloadURL,
          fileName: finalFileName,
          path: `${this.basePath}/${finalFileName}`,
          size: file.size,
          type: file.type
        };
      }
    } catch (error) {
      console.error(`❌ Error uploading file to ${this.basePath}:`, error);
      throw error;
    }
  }

  // Upload multiple files
  async uploadFiles(files, onProgress = null) {
    try {
      const uploadPromises = files.map((file, index) => {
        const fileName = `${Date.now()}_${index}_${file.name}`;
        return this.uploadFile(file, fileName, onProgress ? 
          (progress) => onProgress(index, progress) : null
        );
      });
      
      const results = await Promise.all(uploadPromises);
      console.log(`✅ Uploaded ${results.length} files to ${this.basePath}`);
      return results;
    } catch (error) {
      console.error(`❌ Error uploading multiple files to ${this.basePath}:`, error);
      throw error;
    }
  }

  // Delete file
  async deleteFile(filePath) {
    try {
      const fileRef = ref(storage, filePath);
      await deleteObject(fileRef);
      console.log(`✅ File deleted: ${filePath}`);
    } catch (error) {
      console.error(`❌ Error deleting file ${filePath}:`, error);
      throw error;
    }
  }

  // List all files in the storage path
  async listFiles() {
    try {
      const listRef = ref(storage, this.basePath);
      const result = await listAll(listRef);
      
      const files = await Promise.all(
        result.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          return {
            name: itemRef.name,
            fullPath: itemRef.fullPath,
            url: url
          };
        })
      );
      
      console.log(`📁 Listed ${files.length} files from ${this.basePath}`);
      return files;
    } catch (error) {
      console.error(`❌ Error listing files from ${this.basePath}:`, error);
      throw error;
    }
  }

  // Get download URL for existing file
  async getDownloadURL(fileName) {
    try {
      const fileRef = ref(storage, `${this.basePath}/${fileName}`);
      const url = await getDownloadURL(fileRef);
      console.log(`🔗 Got download URL for ${fileName}: ${url}`);
      return url;
    } catch (error) {
      console.error(`❌ Error getting download URL for ${fileName}:`, error);
      throw error;
    }
  }
}

// Initialize storage services for different paths
export const galleryStorage = new FirebaseStorage(STORAGE_PATHS.GALLERY);
export const postersStorage = new FirebaseStorage(STORAGE_PATHS.POSTERS);
export const announcementsStorage = new FirebaseStorage(STORAGE_PATHS.ANNOUNCEMENTS);
export const profilesStorage = new FirebaseStorage(STORAGE_PATHS.PROFILES);

// Utility functions
export const validateImageFile = (file) => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload an image (JPEG, PNG, GIF, WebP).');
  }
  
  if (file.size > maxSize) {
    throw new Error('File size too large. Please upload an image smaller than 5MB.');
  }
  
  return true;
};

export const compressImage = (file, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions (max width/height: 1920px)
      const maxDimension = 1920;
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        }
      } else {
        if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

export default {
  gallery: galleryStorage,
  posters: postersStorage,
  announcements: announcementsStorage,
  profiles: profilesStorage,
  validateImageFile,
  compressImage
};
