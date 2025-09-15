// Image utility service for Base64 conversion and validation
// Replaces Firebase Storage with Firestore Base64 storage

export class ImageService {
  constructor() {
    this.maxFileSize = 2 * 1024 * 1024; // 2MB limit for Base64 storage
    this.allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  }

  // Validate image file
  validateImage(file) {
    if (!file) {
      throw new Error('No file provided');
    }

    if (!this.allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload JPEG, PNG, GIF, or WebP images only.');
    }

    if (file.size > this.maxFileSize) {
      throw new Error('File size too large. Please upload images smaller than 2MB.');
    }

    return true;
  }

  // Convert file to Base64 string
  async convertToBase64(file) {
    try {
      this.validateImage(file);

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = () => {
          const base64String = reader.result;
          console.log(`✅ Image converted to Base64: ${file.name} (${file.size} bytes)`);
          resolve({
            base64: base64String,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            uploadedAt: new Date().toISOString()
          });
        };
        
        reader.onerror = () => {
          console.error('❌ Error converting image to Base64');
          reject(new Error('Failed to convert image to Base64'));
        };
        
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('❌ Image validation failed:', error);
      throw error;
    }
  }

  // Convert multiple files to Base64
  async convertMultipleToBase64(files) {
    try {
      const conversions = Array.from(files).map(file => this.convertToBase64(file));
      const results = await Promise.all(conversions);
      
      console.log(`✅ Converted ${results.length} images to Base64`);
      return results;
    } catch (error) {
      console.error('❌ Error converting multiple images:', error);
      throw error;
    }
  }

  // Compress image before Base64 conversion
  async compressImage(file, quality = 0.8, maxWidth = 1200, maxHeight = 1200) {
    try {
      this.validateImage(file);

      return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
          // Calculate new dimensions
          let { width, height } = img;
          
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((compressedBlob) => {
            console.log(`✅ Image compressed: ${file.name} (${file.size} → ${compressedBlob.size} bytes)`);
            
            // Create new file from compressed blob
            const compressedFile = new File([compressedBlob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            
            resolve(compressedFile);
          }, 'image/jpeg', quality);
        };
        
        img.src = URL.createObjectURL(file);
      });
    } catch (error) {
      console.error('❌ Error compressing image:', error);
      throw error;
    }
  }

  // Convert and compress image to Base64
  async processImageForFirestore(file, compress = true) {
    try {
      console.log(`📤 Processing image for Firestore: ${file.name}`);
      
      let processedFile = file;
      
      // Compress if requested and file is large
      if (compress && file.size > 500 * 1024) { // Compress files larger than 500KB
        processedFile = await this.compressImage(file, 0.7);
      }
      
      // Convert to Base64
      const result = await this.convertToBase64(processedFile);
      
      return {
        ...result,
        originalFileName: file.name,
        originalFileSize: file.size,
        compressed: compress && file.size > 500 * 1024
      };
    } catch (error) {
      console.error('❌ Error processing image for Firestore:', error);
      throw error;
    }
  }

  // Get image dimensions from Base64
  getImageDimensions(base64String) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height
        });
      };
      img.src = base64String;
    });
  }

  // Create thumbnail from Base64
  async createThumbnail(base64String, maxWidth = 300, maxHeight = 300) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        let { width, height } = img;
        
        // Calculate thumbnail dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw thumbnail
        ctx.drawImage(img, 0, 0, width, height);
        
        const thumbnailBase64 = canvas.toDataURL('image/jpeg', 0.8);
        console.log('✅ Thumbnail created');
        resolve(thumbnailBase64);
      };
      
      img.src = base64String;
    });
  }

  // Estimate storage size for Base64 string
  estimateStorageSize(base64String) {
    // Base64 encoding increases size by ~33%
    const sizeInBytes = (base64String.length * 3) / 4;
    const sizeInKB = Math.round(sizeInBytes / 1024);
    const sizeInMB = Math.round(sizeInKB / 1024 * 100) / 100;
    
    return {
      bytes: sizeInBytes,
      kb: sizeInKB,
      mb: sizeInMB,
      readable: sizeInMB > 1 ? `${sizeInMB}MB` : `${sizeInKB}KB`
    };
  }

  // Batch process multiple images
  async batchProcessImages(files, compress = true, onProgress = null) {
    try {
      const results = [];
      const total = files.length;
      
      for (let i = 0; i < total; i++) {
        const file = files[i];
        
        try {
          const result = await this.processImageForFirestore(file, compress);
          results.push(result);
          
          if (onProgress) {
            onProgress({
              current: i + 1,
              total,
              percentage: Math.round(((i + 1) / total) * 100),
              currentFile: file.name,
              result
            });
          }
          
          console.log(`✅ Processed ${i + 1}/${total}: ${file.name}`);
        } catch (error) {
          console.error(`❌ Failed to process ${file.name}:`, error);
          results.push({
            error: error.message,
            fileName: file.name,
            fileSize: file.size
          });
        }
      }
      
      console.log(`✅ Batch processing complete: ${results.length} files processed`);
      return results;
    } catch (error) {
      console.error('❌ Batch processing failed:', error);
      throw error;
    }
  }
}

// Create singleton instance
const imageService = new ImageService();

export default imageService;
