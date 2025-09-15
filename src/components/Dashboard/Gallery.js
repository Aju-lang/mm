import React, { useState, useEffect } from 'react';
import hybridStorage from '../../utils/hybridStorage';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    loadImages();
    
    // Set up real-time listener for gallery updates
    const unsubscribeGallery = hybridStorage.onGalleryChange((data) => {
      console.log('🖼️ Gallery: Images updated via Firebase real-time', data.length);
      loadImages();
    });

    return () => {
      unsubscribeGallery();
    };
  }, []);

  const loadImages = async () => {
    const galleryImages = await hybridStorage.getGallery();
    
    // If no uploaded images, show some default placeholder images
    if (galleryImages.length === 0) {
      const defaultImages = [
        {
          id: 1,
          title: 'Opening Ceremony',
          category: 'Events',
          src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop',
          description: 'Grand opening of RENDEZVOUS 2025'
        },
        {
          id: 2,
          title: 'Coding Challenge',
          category: 'Technical',
          src: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=300&fit=crop',
          description: 'Students competing in the coding challenge'
        },
        {
          id: 3,
          title: 'Cultural Performance',
          category: 'Cultural',
          src: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=300&fit=crop',
          description: 'Amazing cultural performances by students'
        }
      ];
      setImages(defaultImages);
    } else {
      setImages(galleryImages);
    }
  };

  const categories = ['All', ...new Set(images.map(img => img.category))];
  
  const filteredImages = selectedCategory === 'All' 
    ? images 
    : images.filter(img => img.category === selectedCategory);

  const getCategoryIcon = (category) => {
    const icons = {
      Events: '🎉',
      Technical: '💻',
      Cultural: '🎭',
      Creative: '🎨',
      Academic: '📚',
      Activities: '🤝'
    };
    return icons[category] || '📷';
  };

  const ImageModal = ({ image, onClose }) => {
    if (!image) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden mx-4">
          <div className="relative">
            <img
              src={image.src}
              alt={image.title}
              className="w-full h-64 sm:h-80 lg:h-96 object-cover"
            />
            <button
              onClick={onClose}
              className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-opacity-75 transition-colors text-sm sm:text-base"
            >
              ×
            </button>
          </div>
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{image.title}</h3>
              <span className="badge badge-primary self-start">
                {getCategoryIcon(image.category)} {image.category}
              </span>
            </div>
            <p className="text-gray-700 text-sm sm:text-base">{image.description}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="card-responsive">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">📸 Festival Gallery</h2>
        <div className="text-xs sm:text-sm text-gray-500">
          {filteredImages.length} {filteredImages.length === 1 ? 'photo' : 'photos'}
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category === 'All' ? '📷 All' : `${getCategoryIcon(category)} ${category}`}
          </button>
        ))}
      </div>

      {/* Images Grid */}
      <div className="grid-responsive">
        {filteredImages.map((image) => (
          <div
            key={image.id}
            className="group relative overflow-hidden rounded-lg cursor-pointer transform transition-transform duration-300 hover:scale-105"
            onClick={() => setSelectedImage(image)}
          >
            <div className="aspect-w-16 aspect-h-12">
              <img
                src={image.src}
                alt={image.title}
                className="w-full h-36 sm:h-48 object-cover group-hover:brightness-75 transition-all duration-300"
              />
            </div>
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 text-white">
                <h3 className="font-semibold text-sm sm:text-lg mb-1">{image.title}</h3>
                <p className="text-xs sm:text-sm text-gray-200 line-clamp-2">{image.description}</p>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-white bg-opacity-20 text-white">
                    {getCategoryIcon(image.category)} {image.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Hover Icon */}
            <div className="absolute top-4 right-4 bg-white bg-opacity-20 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {filteredImages.length === 0 && (
        <div className="text-center py-12">
          <span className="text-4xl mb-4 block">📸</span>
          <p className="text-gray-500">No photos found for the selected category.</p>
        </div>
      )}

      {/* Image Modal */}
      <ImageModal 
        image={selectedImage} 
        onClose={() => setSelectedImage(null)} 
      />
    </div>
  );
};

export default Gallery;
