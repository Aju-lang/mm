import React, { useState, useEffect } from 'react';
import { useGallery } from '../../hooks/useFirestore';
import firebaseCollections from '../../services/firebaseCollections';
import imageService from '../../services/imageService';

const FirebaseGalleryManager = () => {
  const { gallery, loading, error } = useGallery();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    category: 'Events',
    description: ''
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const categories = ['Events', 'Technical', 'Cultural', 'Creative', 'Academic', 'Activities'];

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    try {
      // Validate all files
      files.forEach(file => imageService.validateImage(file));
      
      setSelectedFiles(files);
      
      // Generate preview URLs
      const previews = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(previews);
      
      console.log(`✅ Selected ${files.length} files for upload`);
    } catch (error) {
      alert(`❌ ${error.message}`);
      setSelectedFiles([]);
      setPreviewUrls([]);
    }
  };

  // Handle upload
  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (selectedFiles.length === 0) {
      alert('Please select at least one file.');
      return;
    }
    
    if (!uploadData.title.trim()) {
      alert('Please enter a title.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      console.log('📤 Starting upload process...');
      
      // Process images to Base64
      const processedImages = await imageService.batchProcessImages(
        selectedFiles,
        true, // Enable compression
        (progress) => {
          setUploadProgress((progress.current / progress.total) * 50); // First 50% for processing
          console.log(`Processing: ${progress.percentage}% - ${progress.currentFile}`);
        }
      );

      console.log(`✅ Processed ${processedImages.length} images`);

      // Upload to Firestore
      const uploadPromises = processedImages.map(async (processedImage, index) => {
        if (processedImage.error) {
          console.error(`❌ Skipping ${processedImage.fileName}: ${processedImage.error}`);
          return null;
        }

        const imageData = {
          ...processedImage,
          title: selectedFiles.length === 1 ? uploadData.title : `${uploadData.title} (${index + 1})`,
          category: uploadData.category,
          description: uploadData.description,
          uploadedBy: 'admin'
        };

        return await firebaseCollections.gallery.addBase64Image(imageData);
      });

      const uploadResults = await Promise.all(uploadPromises);
      const successfulUploads = uploadResults.filter(result => result !== null);

      setUploadProgress(100);
      
      console.log(`✅ Upload complete: ${successfulUploads.length}/${selectedFiles.length} images uploaded`);
      
      // Show success message
      const message = successfulUploads.length === selectedFiles.length 
        ? `✅ Successfully uploaded ${successfulUploads.length} images!`
        : `⚠️ Uploaded ${successfulUploads.length} out of ${selectedFiles.length} images. Check console for errors.`;
      
      alert(message);

      // Reset form
      resetForm();
      setShowUploadModal(false);

    } catch (error) {
      console.error('❌ Upload failed:', error);
      alert(`❌ Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Reset form
  const resetForm = () => {
    setUploadData({
      title: '',
      category: 'Events',
      description: ''
    });
    setSelectedFiles([]);
    setPreviewUrls([]);
    
    // Clean up preview URLs
    previewUrls.forEach(url => URL.revokeObjectURL(url));
  };

  // Handle delete
  const handleDelete = async (imageId, fileName) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    try {
      await firebaseCollections.gallery.delete(imageId);
      console.log(`✅ Deleted image: ${fileName}`);
      alert('✅ Image deleted successfully!');
    } catch (error) {
      console.error('❌ Delete failed:', error);
      alert(`❌ Failed to delete image: ${error.message}`);
    }
  };

  // Get storage info for an image
  const getStorageInfo = (image) => {
    if (image.base64Image) {
      const size = imageService.estimateStorageSize(image.base64Image);
      return {
        size: size.readable,
        compressed: image.compressed ? 'Yes' : 'No',
        type: image.fileType || 'Unknown'
      };
    }
    return { size: 'Unknown', compressed: 'No', type: 'Unknown' };
  };

  if (loading) {
    return (
      <div className="card-responsive">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mr-3"></div>
          <span>Loading gallery...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-responsive">
        <div className="text-center py-12">
          <div className="text-red-600 text-4xl mb-4">❌</div>
          <p className="text-red-600">Error loading gallery: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-responsive">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-responsive-md text-gray-900">🖼️ Gallery Management</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage festival photos stored in Firestore as Base64 images
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-mobile bg-green-600 hover:bg-green-700"
          >
            📤 Upload Photos
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{gallery.length}</div>
            <div className="text-sm text-gray-600">Total Images</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary-600">
              {new Set(gallery.map(img => img.category)).size}
            </div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {gallery.filter(img => img.compressed).length}
            </div>
            <div className="text-sm text-gray-600">Compressed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">Base64</div>
            <div className="text-sm text-gray-600">Storage Type</div>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="card-responsive">
        <h3 className="text-lg font-semibold mb-4">Gallery Images</h3>
        
        {gallery.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📸</div>
            <p className="text-gray-500 mb-4">No images uploaded yet</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn-primary"
            >
              Upload First Photo
            </button>
          </div>
        ) : (
          <div className="grid-responsive">
            {gallery.map((image) => {
              const storageInfo = getStorageInfo(image);
              return (
                <div key={image.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="aspect-w-16 aspect-h-12">
                    <img
                      src={image.src || image.base64Image}
                      alt={image.title}
                      className="w-full h-48 object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 truncate">{image.title}</h4>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {image.description || 'No description'}
                    </p>
                    
                    {/* Image Info */}
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Category:</span>
                        <span className="badge badge-primary text-xs">{image.category}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Size:</span>
                        <span>{storageInfo.size}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Compressed:</span>
                        <span>{storageInfo.compressed}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Type:</span>
                        <span>{storageInfo.type}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => handleDelete(image.id, image.title)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-sm"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">📤 Upload Photos</h3>
                <button
                  onClick={() => {
                    resetForm();
                    setShowUploadModal(false);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                  disabled={uploading}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpload} className="space-y-4">
                {/* File Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Images (Max 2MB each)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    disabled={uploading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Supported: JPEG, PNG, GIF, WebP • Images will be compressed automatically
                  </p>
                </div>

                {/* Preview */}
                {previewUrls.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preview ({selectedFiles.length} files)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="relative">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded border"
                          />
                          <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                            {selectedFiles[index].name.substring(0, 10)}...
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadData.title}
                    onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
                    className="input-mobile"
                    placeholder="Enter photo title"
                    disabled={uploading}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={uploadData.category}
                    onChange={(e) => setUploadData({...uploadData, category: e.target.value})}
                    className="input-mobile"
                    disabled={uploading}
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={uploadData.description}
                    onChange={(e) => setUploadData({...uploadData, description: e.target.value})}
                    className="input-mobile"
                    rows="3"
                    placeholder="Enter photo description (optional)"
                    disabled={uploading}
                  />
                </div>

                {/* Progress */}
                {uploading && (
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Uploading...</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setShowUploadModal(false);
                    }}
                    className="flex-1 btn-outline-mobile"
                    disabled={uploading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || selectedFiles.length === 0}
                    className="flex-1 btn-mobile bg-green-600 hover:bg-green-700"
                  >
                    {uploading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </div>
                    ) : (
                      '📤 Upload'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FirebaseGalleryManager;
