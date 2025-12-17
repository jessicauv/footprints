import React from 'react';

interface HomepageProps {
  onGoToLogin: () => void;
}

const Homepage: React.FC<HomepageProps> = ({ onGoToLogin }) => {
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
      </div>
    </div>
  );
};

export default Homepage;
