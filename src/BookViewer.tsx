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
  onPageClick: (pageId: number) => void;
}

const BookViewer: React.FC<BookViewerProps> = ({ journal, onClose, onPageClick }) => {
  const [pageContentStatus, setPageContentStatus] = useState<Record<number, boolean>>({});

  // Create 5 pages by default
  const pages = Array.from({ length: 5 }, (_, index) => ({
    id: index + 1,
    title: index === 0 ? journal.title : `Page ${index}`,
    content: index === 0 ? (journal.description || "Welcome to your journal!") : "Blank page - ready for your memories",
    type: index === 0 ? "cover" : "content"
  }));

  // Load page content status
  useEffect(() => {
    const loadPageStatuses = async () => {
      try {
        const pagesRef = collection(db, 'journals', journal.id, 'pages');
        const querySnapshot = await getDocs(pagesRef);

        const status: Record<number, boolean> = {};
        querySnapshot.forEach((doc) => {
          const pageId = parseInt(doc.id.replace('page-', ''));
          const data = doc.data();
          status[pageId] = (data.items && data.items.length > 0) || false;
        });
        setPageContentStatus(status);
      } catch (error) {
        console.error('Error loading page statuses:', error);
      }
    };

    loadPageStatuses();
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
              onClick={() => page.type === 'content' && onPageClick(page.id)}
            >
              <div className="page-image-placeholder">
                <div className="page-number">{page.id}</div>
                {pageContentStatus[page.id] && (
                  <div className="content-indicator">✏️</div>
                )}
                <div className="page-content-preview">
                  {page.content.length > 50 ? `${page.content.substring(0, 50)}...` : page.content}
                </div>
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
