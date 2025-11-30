import React, { useState } from 'react';
import HTMLFlipBook from 'react-pageflip';

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
}

const BookViewer: React.FC<BookViewerProps> = ({ journal, onClose }) => {
  const [currentPage, setCurrentPage] = useState(0);

  const pages = [
    {
      title: journal.title,
      content: journal.description || "Welcome to your journal! Start writing your thoughts and memories here.",
      type: "cover"
    },
    {
      title: "Page 1",
      content: "This is the first page of your journal. You can add your entries here.",
      type: "content"
    },
    {
      title: "Page 2",
      content: "Another blank page waiting for your stories...",
      type: "content"
    }
  ];

  return (
    <div className="book-viewer-overlay">
      <div className="book-viewer">
        <button onClick={onClose} className="close-book-btn">×</button>
        <HTMLFlipBook
          width={400}
          height={600}
          size="stretch"
          minWidth={300}
          maxWidth={500}
          minHeight={400}
          maxHeight={700}
          showCover={true}
          flippingTime={1000}
          className="book"
          startPage={0}
          drawShadow={true}
          usePortrait={false}
          startZIndex={0}
          autoSize={true}
          maxShadowOpacity={0.5}
          showPageCorners={true}
          disableFlipByClick={false}
          useMouseEvents={true}
          swipeDistance={30}
          clickEventForward={true}
          mobileScrollSupport={true}
          style={{}}
          onFlip={(e) => setCurrentPage(e.data)}
          onChangeOrientation={() => {}}
          onChangeState={() => {}}
        >
          {pages.map((page, index) => (
            <div key={index} className={`page ${page.type}`}>
              <div className="page-content">
                {page.type === 'cover' ? (
                  <div className="cover-page">
                    <h1>{page.title}</h1>
                    <p className="cover-description">{page.content}</p>
                    <div className="cover-meta">
                      Created: {journal.createdAt.toLocaleDateString()}
                    </div>
                  </div>
                ) : (
                  <div className="content-page">
                    <h2>{page.title}</h2>
                    <div className="page-text">
                      {page.content}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </HTMLFlipBook>
        <div className="page-indicator">
          Page {currentPage + 1} of {pages.length}
        </div>
      </div>
    </div>
  );
};

export default BookViewer;
