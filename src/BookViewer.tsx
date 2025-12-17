import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

interface Journal {
  id: string;
  title: string;
  createdAt: Date;
  description?: string;
  color?: string;
}

interface BookViewerProps {
  journal: Journal;
  onClose: () => void;
  onPageClick: (pageId: number, vibes?: string, restaurant?: any) => void;
}

interface PageData {
  items?: any[];
  restaurant?: any;
  vibes?: string;
  canvasImage?: string;
}

const BookViewer: React.FC<BookViewerProps> = ({ journal, onClose, onPageClick }) => {
  const [pageContentStatus, setPageContentStatus] = useState<Record<number, boolean>>({});
  const [pageVibes, setPageVibes] = useState<Record<number, string>>({});
  const [pageRestaurants, setPageRestaurants] = useState<Record<number, any>>({});
  const [pageCanvasImages, setPageCanvasImages] = useState<Record<number, string>>({});

  // Create 6 pages by default
  const pages = Array.from({ length: 6 }, (_, index) => ({
    id: index + 1,
    title: `Page ${index + 1}`,
    content: "",
    type: "content"
  }));

  // Load page content status and vibes
  useEffect(() => {
    const loadPageData = async () => {
      try {
        const pagesRef = collection(db, 'journals', journal.id, 'pages');
        const querySnapshot = await getDocs(pagesRef);

        const status: Record<number, boolean> = {};
        const vibes: Record<number, string> = {};
        const restaurants: Record<number, any> = {};
        const canvasImages: Record<number, string> = {};

        querySnapshot.forEach((doc) => {
          const pageId = parseInt(doc.id.replace('page-', ''));
          const data = doc.data() as PageData;
          status[pageId] = (data.items && data.items.length > 0) || false;
          if (data.vibes) {
            vibes[pageId] = data.vibes;
          }
          if (data.restaurant) {
            restaurants[pageId] = data.restaurant;
          }
          if (data.canvasImage) {
            canvasImages[pageId] = data.canvasImage;
          }
        });

        setPageContentStatus(status);
        setPageVibes(vibes);
        setPageRestaurants(restaurants);
        setPageCanvasImages(canvasImages);
      } catch (error) {
        console.error('Error loading page data:', error);
      }
    };

    loadPageData();
  }, [journal.id]);

  return (
    <div className="book-viewer-overlay">
      <div className="book-viewer">
        <button onClick={onClose} className="close-book-btn">×</button>
        <h2>{journal.title}</h2>
        <div className="pages-grid">
          {pages.map((page) => (
            <div
              key={page.id}
              className={`page-thumbnail ${page.type === 'content' ? 'clickable' : ''} ${pageContentStatus[page.id] ? 'has-content' : ''}`}
              onClick={() => page.type === 'content' && onPageClick(page.id, pageVibes[page.id], pageRestaurants[page.id])}
            >
              <div className="page-image-placeholder">
                <div className="page-number">{page.id}</div>
                {pageCanvasImages[page.id] ? (
                  <img
                    src={pageCanvasImages[page.id]}
                    alt={`Page ${page.id} content`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '4px'
                    }}
                  />
                ) : (
                  <>
                    {pageContentStatus[page.id] && (
                      <div className="content-indicator">✏️</div>
                    )}
                    <div className="page-content-preview">
                      {page.content.length > 50 ? `${page.content.substring(0, 50)}...` : page.content}
                    </div>
                  </>
                )}
              </div>
              <div className="page-label">{page.title}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookViewer;
