import React, { useState, useEffect } from 'react';

interface HomepageProps {
  onGoToLogin: () => void;
}

const Homepage: React.FC<HomepageProps> = ({ onGoToLogin }) => {
  const [showApiWarning, setShowApiWarning] = useState(false);

  useEffect(() => {
    // Show the API warning popup when the component mounts
    const timer = setTimeout(() => {
      setShowApiWarning(true);
    }, 500); // Small delay to let the page load

    return () => clearTimeout(timer);
  }, []);

  const closeApiWarning = () => {
    setShowApiWarning(false);
  };

  return (
    <div className="homepage">
      <div className="homepage-content">
        <div className="title-image-container" onClick={onGoToLogin}>
          <img
            src="/title-card.png"
            alt="Title Card"
            className="title-card-image"
          />
          <h1 className="title-text-overlay">footprints</h1>
          <img
            src="/subtitle-card.png"
            alt="Subtitle Card"
            className="subtitle-card-image"
          />
          <h2 className="subtitle-card-overlay">Document Your Adventures</h2>
        </div>

        <div className="gallery-link-container">
          <a href="/gallery" className="gallery-link">
          View Journal Gallery
          </a>
        </div>
      </div>

      {/* {showApiWarning && (
        <div className="api-warning-overlay">
          <div className="api-warning-modal">
            <div className="api-warning-header">
              <h3>⚠️ Little Yelp AI API Queries Left</h3>
              <button onClick={closeApiWarning} className="close-warning-btn">×</button>
            </div>
            <div className="api-warning-content">
              <p>
                Hi tester, I'm low on Yelp AI API queries so please only edit 1 or 2 journal pages. Or if you can increase the query limit on my Client ID <code>LUM--dvywdeSdllF_1p1Pw</code>, that would be greatly appreciated and you can test as much as you want!
              </p>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default Homepage;
