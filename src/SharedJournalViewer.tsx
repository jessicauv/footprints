import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

interface Journal {
  id: string;
  title: string;
  createdAt: Date;
  description?: string;
  color?: string;
  isPublic?: boolean;
}

interface SharedJournalViewerProps {
  journalId: string;
  onClose?: () => void;
}

interface PageData {
  items?: any[];
  restaurant?: any;
  vibes?: string;
}

const SharedJournalViewer: React.FC<SharedJournalViewerProps> = ({ journalId, onClose }) => {
  const [journal, setJournal] = useState<Journal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageContentStatus, setPageContentStatus] = useState<Record<number, boolean>>({});
  const [pageVibes, setPageVibes] = useState<Record<number, string>>({});
  const [pageRestaurants, setPageRestaurants] = useState<Record<number, any>>({});

  // Load journal data
  useEffect(() => {
    const loadJournal = async () => {
      try {
        const journalRef = doc(db, 'journals', journalId);
        const journalSnap = await getDoc(journalRef);

        if (journalSnap.exists()) {
          const data = journalSnap.data();
          if (data.isPublic) {
            setJournal({
              id: journalSnap.id,
              title: data.title || 'Untitled Journal',
              createdAt: data.createdAt?.toDate() || new Date(),
              description: data.description,
              color: data.color,
              isPublic: data.isPublic
            });
          } else {
            setError('This journal is not publicly shared.');
          }
        } else {
          setError('Journal not found.');
        }
      } catch (error) {
        console.error('Error loading journal:', error);
        setError('Failed to load journal.');
      } finally {
        setLoading(false);
      }
    };

    loadJournal();
  }, [journalId]);

  // Load page data
  useEffect(() => {
    if (!journal) return;

    const loadPageData = async () => {
      try {
        const pagesRef = collection(db, 'journals', journal.id, 'pages');
        const querySnapshot = await getDocs(pagesRef);

        const status: Record<number, boolean> = {};
        const vibes: Record<number, string> = {};
        const restaurants: Record<number, any> = {};

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
        });

        setPageContentStatus(status);
        setPageVibes(vibes);
        setPageRestaurants(restaurants);
      } catch (error) {
        console.error('Error loading page data:', error);
      }
    };

    loadPageData();
  }, [journal]);

  if (loading) {
    return (
      <div className="shared-viewer-overlay">
        <div className="shared-viewer">
          <div className="loading">Loading shared journal...</div>
        </div>
      </div>
    );
  }

  if (error || !journal) {
    return (
      <div className="shared-viewer-overlay">
        <div className="shared-viewer">
          <div className="error-message">
            <h2>Unable to Load Journal</h2>
            <p>{error || 'Journal not found.'}</p>
            {onClose && (
              <button onClick={onClose} className="close-btn">Close</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Create 5 pages by default (same structure as BookViewer)
  const pages = Array.from({ length: 5 }, (_, index) => ({
    id: index + 1,
    title: index === 0 ? journal.title : `Page ${index}`,
    content: index === 0 ? (journal.description || "Welcome to this shared journal!") : "Blank page",
    type: index === 0 ? "cover" : "content"
  }));

  return (
    <div className="shared-viewer-overlay">
      <div className="shared-viewer">
        <div className="shared-header">
          <h1>Shared Journal</h1>
          {onClose && (
            <button onClick={onClose} className="close-shared-btn">×</button>
          )}
        </div>

        <div className="shared-journal-info">
          <h2>{journal.title}</h2>
          {journal.description && (
            <p className="journal-description">{journal.description}</p>
          )}
          <p className="shared-notice">This journal has been shared publicly for viewing.</p>
        </div>

        <div className="pages-grid">
          {pages.map((page) => (
            <div
              key={page.id}
              className={`page-thumbnail shared-page ${pageContentStatus[page.id] ? 'has-content' : ''}`}
            >
              <div className="page-image-placeholder">
                <div className="page-number">{page.id}</div>
                {pageContentStatus[page.id] && (
                  <div className="content-indicator">✏️</div>
                )}
                <div className="page-content-preview">
                  {page.content.length > 50 ? `${page.content.substring(0, 50)}...` : page.content}
                </div>
                {pageVibes[page.id] && (
                  <div className="page-vibes-preview">
                    <small>"{pageVibes[page.id]}"</small>
                  </div>
                )}
                {pageRestaurants[page.id] && (
                  <div className="page-restaurant-preview">
                    <small>📍 {pageRestaurants[page.id].name}</small>
                  </div>
                )}
              </div>
              <div className="page-label">{page.title}</div>
            </div>
          ))}
        </div>

        <div className="shared-footer">
          <p>View this journal on Footprints</p>
        </div>
      </div>
    </div>
  );
};

export default SharedJournalViewer;
