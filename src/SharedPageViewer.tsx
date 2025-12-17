import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

interface Journal {
  id: string;
  title: string;
  createdAt: Date;
  description?: string;
  color?: string;
  isPublic?: boolean;
}

interface PageData {
  items?: any[];
  restaurant?: any;
  vibes?: string;
  canvasImage?: string;
  generatedImages?: any[];
}

interface SharedPageViewerProps {
  journalId: string;
  pageId: number;
  onClose?: () => void;
}

const SharedPageViewer: React.FC<SharedPageViewerProps> = ({ journalId, pageId, onClose }) => {
  const [journal, setJournal] = useState<Journal | null>(null);
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load journal and page data
  useEffect(() => {
    const loadSharedPage = async () => {
      try {
        // Load journal data
        const journalRef = doc(db, 'journals', journalId);
        const journalSnap = await getDoc(journalRef);

        if (!journalSnap.exists()) {
          setError('Journal not found.');
          alert('DEBUG: Journal not found - check if journal exists');
          return;
        }

        const journalData = journalSnap.data();
        if (!journalData.isPublic) {
          setError('This journal is not publicly shared.');
          alert('DEBUG: Journal exists but is not public - check share button functionality');
          return;
        }

        setJournal({
          id: journalSnap.id,
          title: journalData.title || 'Untitled Journal',
          createdAt: journalData.createdAt?.toDate() || new Date(),
          description: journalData.description,
          color: journalData.color,
          isPublic: journalData.isPublic
        });

        // Load page data
        const pageRef = doc(db, 'journals', journalId, 'pages', `page-${pageId}`);
        console.log('Loading page from:', pageRef.path);
        const pageSnap = await getDoc(pageRef);

        console.log('Page exists:', pageSnap.exists());
        if (pageSnap.exists()) {
          const data = pageSnap.data() as PageData;
          console.log('Page data:', data);
          console.log('Canvas image exists:', !!data.canvasImage);
          setPageData(data);
        } else {
          console.log('Page document does not exist');
          setError('Page not found.');
        }
      } catch (error) {
        console.error('Error loading shared page:', error);
        setError('Failed to load page.');
      } finally {
        setLoading(false);
      }
    };

    loadSharedPage();
  }, [journalId, pageId]);

  if (loading) {
    return (
      <div className="shared-viewer-overlay">
        <div className="shared-viewer">
          <div className="loading">Loading shared page...</div>
        </div>
      </div>
    );
  }

  if (error || !journal) {
    return (
      <div className="shared-viewer-overlay">
        <div className="shared-viewer">
          <div className="error-message">
            <h2>Unable to Load Page</h2>
            <p>{error || 'Page not found.'}</p>
            {onClose && (
              <button onClick={onClose} className="close-btn">Close</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shared-viewer-overlay">
      <div className="shared-viewer">
        <div className="shared-branding">
          <a href="/" className="shared-brand-link">
            <h1 className="shared-brand">footprints</h1>
          </a>
        </div>
        <div className="shared-attribution">
          <p>Shared from Footprints</p>
        </div>
        <div className="shared-page-content">
          {pageData?.items && pageData.items.length > 0 ? (
            <div className="shared-canvas-container">
              <div className="shared-canvas-paper">
                {pageData.items.map((item: any) => (
                  <div
                    key={item.id}
                    className={`shared-canvas-item ${item.type}-item`}
                    style={{
                      left: item.x,
                      top: item.y,
                      position: 'absolute'
                    }}
                  >
                    {item.type === 'text' ? (
                      <div
                        className="shared-canvas-text"
                        style={{
                          fontSize: '1.5rem',
                          color: '#333',
                          lineHeight: '1.4'
                        }}
                      >
                        {item.content}
                      </div>
                    ) : (
                      <img
                        src={item.content}
                        alt="Canvas image"
                        className="shared-canvas-image"
                        style={{
                          maxWidth: '200px',
                          maxHeight: '200px',
                          objectFit: 'contain',
                          border: 'none'
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-page">
              <p>This page doesn't have any content yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SharedPageViewer;
