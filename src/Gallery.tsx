import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

interface GalleryItem {
  id: string;
  imageUrl: string;
  journalId: string;
  pageId: string;
  createdAt: Date;
  restaurant?: any;
  pageItems?: any[]; // Live page items for rendering
}

const Gallery: React.FC = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  useEffect(() => {
    const loadGallery = async () => {
      try {
        const galleryRef = collection(db, 'gallery');
        const q = query(galleryRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        const items: GalleryItem[] = [];
        querySnapshot.forEach((galleryDoc) => {
          const data = galleryDoc.data();

          items.push({
            id: galleryDoc.id,
            imageUrl: data.imageUrl,
            journalId: data.journalId,
            pageId: data.pageId,
            createdAt: data.createdAt?.toDate() || new Date(),
            restaurant: data.restaurant,
            pageItems: data.pageItems || [] // Use stored page items
          });
        });

        setGalleryItems(items);
      } catch (error) {
        console.error('Error loading gallery:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGallery();
  }, []);

  const openItem = (item: GalleryItem) => {
    setSelectedItem(item);
  };

  const closeModal = () => {
    setSelectedItem(null);
  };

  // Render a live preview of the gallery item
  const renderGalleryPreview = (item: GalleryItem) => {
    if (!item.pageItems || item.pageItems.length === 0) {
      return (
        <div className="gallery-preview-empty">
          <p>No content</p>
        </div>
      );
    }

    // Scale down the canvas for preview to fit container height
    const scale = 0.45;

    return (
      <div
        className="gallery-preview-canvas"
        style={{
          width: '800px',
          height: '600px',
          transform: `scale(${scale}) translateX(30px)`,
          transformOrigin: 'top left',
          position: 'relative',
          backgroundColor: 'white',
          border: '1px solid #e0e0e0'
        }}
      >
        {item.pageItems.map((pageItem: any) => (
          <div
            key={pageItem.id}
            className={`gallery-preview-item ${pageItem.type}-item`}
            style={{
              left: pageItem.x,
              top: pageItem.y,
              width: pageItem.width || (pageItem.type === 'text' ? 200 : 150),
              height: pageItem.height || (pageItem.type === 'text' ? 50 : 150),
              transform: pageItem.rotation ? `rotate(${pageItem.rotation}deg)` : undefined,
              transformOrigin: 'center center',
              position: 'absolute'
            }}
          >
            {pageItem.type === 'text' ? (
              <div
                className="gallery-preview-text"
                style={{
                  fontSize: '14px',
                  color: '#333',
                  lineHeight: '1.2',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {pageItem.content}
              </div>
            ) : (
              <img
                src={pageItem.content}
                alt="Preview image"
                className="gallery-preview-image"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  border: 'none'
                }}
                onError={(e) => {
                  // Handle CORS errors for DALL-E images by showing placeholder
                  const target = e.target as HTMLImageElement;
                  if (target.src.includes('oaidalleapiprodscus.blob.core.windows.net')) {
                    target.src = `data:image/svg+xml;base64,${btoa(`
                      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                        <rect width="100" height="100" fill="#e3f2fd"/>
                        <text x="50" y="45" text-anchor="middle" font-family="Arial" font-size="10" fill="#1976d2">
                          AI Image
                        </text>
                        <text x="50" y="60" text-anchor="middle" font-family="Arial" font-size="8" fill="#666">
                          (CORS blocked)
                        </text>
                      </svg>
                    `)}`;
                  }
                }}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="gallery-loading">
        <div className="gallery-header">
          <h1>Journal Gallery</h1>
          <p>Showcasing shared journal pages from our community</p>
        </div>
        <div className="loading-spinner"></div>
        <p>Loading gallery...</p>
      </div>
    );
  }

  return (
    <div className="gallery">
      <div className="gallery-branding">
        <h1 className="gallery-brand">footprints</h1>
      </div>
      <div className="gallery-header">
        <h1>Journal Gallery</h1>
        <p>Showcasing shared journal pages from our community</p>
      </div>

      {galleryItems.length === 0 ? (
        <div className="gallery-empty">
          <h2>No shared journals yet</h2>
          <p>Be the first to share your journal page and see it here!</p>
        </div>
      ) : (
        <div className="gallery-grid">
          {galleryItems.map((item) => (
            <div
              key={item.id}
              className="gallery-item"
              onClick={() => openItem(item)}
            >
              <div className="gallery-preview-container">
                {renderGalleryPreview(item)}
              </div>
              {item.restaurant && (
                <div className="gallery-item-info">
                  <div className="gallery-restaurant-name">
                    📍 {item.restaurant.name}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedItem && (
        <div className="gallery-modal-overlay" onClick={closeModal}>
          <div className="gallery-modal" onClick={(e) => e.stopPropagation()}>
            <button className="gallery-close-btn" onClick={closeModal}>×</button>
            <div className="gallery-modal-preview-container">
              {renderGalleryPreview(selectedItem)}
            </div>
            <div className="gallery-modal-info">
              {selectedItem.restaurant && (
                <div className="modal-restaurant">
                  <h3>{selectedItem.restaurant.name}</h3>
                  <p>{selectedItem.restaurant.location?.address1}, {selectedItem.restaurant.location?.city}</p>
                  {selectedItem.restaurant.categories && (
                    <p className="modal-categories">
                      {selectedItem.restaurant.categories.map((c: any) => c.title).join(', ')}
                    </p>
                  )}
                </div>
              )}
              <div className="modal-meta">
                <p>Shared on {selectedItem.createdAt.toLocaleDateString()}</p>
                <button
                  className="view-original-btn"
                  onClick={() => window.open(`/shared/journal/${selectedItem.journalId}/page/${selectedItem.pageId}`, '_blank')}
                >
                  View Original Journal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
