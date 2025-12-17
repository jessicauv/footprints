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
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          items.push({
            id: doc.id,
            imageUrl: data.imageUrl,
            journalId: data.journalId,
            pageId: data.pageId,
            createdAt: data.createdAt?.toDate() || new Date(),
            restaurant: data.restaurant
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
              <img
                src={item.imageUrl}
                alt={`Shared journal page from ${item.restaurant?.name || 'Unknown'}`}
                className="gallery-image"
              />
              <div className="gallery-overlay">
                <div className="gallery-info">
                  {item.restaurant && (
                    <div className="restaurant-badge">
                      📍 {item.restaurant.name}
                    </div>
                  )}
                  <div className="date-badge">
                    {item.createdAt.toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedItem && (
        <div className="gallery-modal-overlay" onClick={closeModal}>
          <div className="gallery-modal" onClick={(e) => e.stopPropagation()}>
            <button className="gallery-close-btn" onClick={closeModal}>×</button>
            <img
              src={selectedItem.imageUrl}
              alt="Shared journal page"
              className="gallery-modal-image"
            />
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
