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
          return;
        }

        const journalData = journalSnap.data();
        if (!journalData.isPublic) {
          setError('This journal is not publicly shared.');
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
        const pageSnap = await getDoc(pageRef);

        if (pageSnap.exists()) {
          const data = pageSnap.data() as PageData;
          setPageData(data);
        } else {
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
        <div className="shared-header">
          <h1>Shared Page</h1>
          {onClose && (
            <button onClick={onClose} className="close-shared-btn">×</button>
          )}
        </div>

        <div className="shared-page-info">
          <h2>{journal.title} - Page {pageId}</h2>
          <p className="shared-notice">This page has been shared publicly for viewing.</p>
        </div>

        <div className="shared-page-content">
          {pageData?.canvasImage ? (
            <div className="canvas-screenshot">
              <img
                src={pageData.canvasImage}
                alt={`Page ${pageId} canvas`}
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                }}
              />
            </div>
          ) : (
            <div className="empty-page">
              <p>This page doesn't have any content yet.</p>
            </div>
          )}
        </div>

        <div className="shared-footer">
          <p>Shared from Footprints</p>
        </div>
      </div>
    </div>
  );
};

export default SharedPageViewer;
