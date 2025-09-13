import React, { useState, useEffect } from 'react';
import { getGallery, addGalleryImage, deleteGalleryImage } from '../../utils/localStorage';

const GalleryManager = () => {
  const [images, setImages] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    category: 'Events',
    description: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = () => {
    const galleryImages = getGallery();
    setImages(galleryImages);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    console.log('File selected:', file);
    
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    } else if (file) {
      alert('Please select a valid image file.');
      e.target.value = '';
    }
  };

  const handleUpload = (e) => {
    e.preventDefault();
    console.log('Upload attempt - selectedFile:', selectedFile, 'title:', uploadData.title);
    
    if (!selectedFile) {
      alert('Please select a file.');
      return;
    }
    
    if (!uploadData.title.trim()) {
      alert('Please enter a title.');
      return;
    }

    // Convert file to base64 for storage
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = {
        title: uploadData.title,
        category: uploadData.category,
        description: uploadData.description,
        src: e.target.result, // base64 data URL
        fileName: selectedFile.name,
        fileSize: selectedFile.size
      };

      addGalleryImage(imageData);
      
      // Reset form
      setUploadData({ title: '', category: 'Events', description: '' });
      setSelectedFile(null);
      setPreviewUrl('');
      setShowUploadModal(false);
      loadImages();
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      deleteGalleryImage(id);
      loadImages();
    }
  };

  const categories = ['Events', 'Technical', 'Cultural', 'Creative', 'Academic', 'Activities'];
  
  const UploadModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleUpload} className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Upload New Image</h3>
            <button
              type="button"
              onClick={() => {
                setShowUploadModal(false);
                setSelectedFile(null);
                setPreviewUrl('');
                setUploadData({ title: '', category: 'Events', description: '' });
              }}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-4">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="input"
                required
              />
              {previewUrl && (
                <div className="mt-4">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                required
                className="input"
                value={uploadData.title}
                onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
                placeholder="e.g., Opening Ceremony"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                className="input"
                value={uploadData.category}
                onChange={(e) => setUploadData({...uploadData, category: e.target.value})}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                className="input"
                rows={3}
                value={uploadData.description}
                onChange={(e) => setUploadData({...uploadData, description: e.target.value})}
                placeholder="Brief description of the image"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => {
                setShowUploadModal(false);
                setSelectedFile(null);
                setPreviewUrl('');
                setUploadData({ title: '', category: 'Events', description: '' });
              }}
              className="btn-outline"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={!selectedFile || !uploadData.title.trim()}
            >
              Upload Image
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gallery Management</h1>
            <p className="text-gray-600">Upload and manage festival photos</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-primary"
          >
            📸 Upload Photo
          </button>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {images.map((image) => (
            <div key={image.id} className="card group relative overflow-hidden">
              <div className="aspect-w-16 aspect-h-12 mb-4">
                <img
                  src={image.src}
                  alt={image.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 truncate">{image.title}</h3>
                  <button
                    onClick={() => handleDelete(image.id)}
                    className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    🗑️
                  </button>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="badge badge-primary">{image.category}</span>
                  <span className="text-gray-500">
                    {new Date(image.uploadedAt).toLocaleDateString()}
                  </span>
                </div>
                
                {image.description && (
                  <p className="text-sm text-gray-600 truncate">{image.description}</p>
                )}
                
                <div className="text-xs text-gray-400">
                  {(image.fileSize / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            </div>
          ))}
        </div>

        {images.length === 0 && (
          <div className="text-center py-12">
            <span className="text-4xl mb-4 block">📸</span>
            <p className="text-gray-500 mb-4">No images uploaded yet.</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn-primary"
            >
              Upload Your First Photo
            </button>
          </div>
        )}

        {showUploadModal && <UploadModal />}
      </div>
    </div>
  );
};

export default GalleryManager;
