import './App.css'
import { useAuth } from './AuthContext';
import AuthForm from './AuthForm';
import Bookshelf from './Bookshelf';
import BookViewer from './BookViewer';
import PageEditor from './PageEditor';
import RestaurantSelector from './RestaurantSelector';
import SharedPageViewer from './SharedPageViewer';
import Homepage from './Homepage';
import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { imageService, type GeneratedImage } from './imageService';

interface Journal {
  id: string;
  title: string;
  createdAt: Date;
  description?: string;
  color?: string;
}

// Main App Content Component
function MainApp() {
  const { user, loading, logout } = useAuth();
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [selectedPage, setSelectedPage] = useState<number | null>(null);
  const [pageVibes, setPageVibes] = useState<string | null>(null);
  const [pageReview, setPageReview] = useState<string | null>(null);
  const [pageDetailedInfo, setPageDetailedInfo] = useState<string | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);
  const [showRestaurantSelector, setShowRestaurantSelector] = useState(false);
  const [showHomepage, setShowHomepage] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);

  // Yelp AI API call to generate vibes
  const generateVibes = async (restaurant: any) => {
    try {
      const YELP_API_KEY = import.meta.env.VITE_YELP_API_KEY;
      if (!YELP_API_KEY) {
        throw new Error('Yelp API key not found. Please set VITE_YELP_API_KEY as an environment variable.');
      }

      // Use Yelp AI API to generate vibes description
      const address = `${restaurant.location?.address1 || ''}, ${restaurant.location?.city || ''}, ${restaurant.location?.state || ''} ${restaurant.location?.zip_code || ''}`.trim();
      const query = `${restaurant.name} restaurant at ${address}: give me exactly 3 adjectives that describe its atmosphere and vibe. Reply with only the 3 words separated by periods.`;

      const response = await fetch('https://api.yelp.com/ai/chat/v2', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${YELP_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          user_context: {
            locale: 'en_US',
            latitude: restaurant.coordinates?.latitude || 40.7128, // Default to NYC if no coordinates
            longitude: restaurant.coordinates?.longitude || -74.0060
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Yelp AI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      // Extract the vibes from the AI response
      // The response might be an object with {text, tags} structure
      let vibesText = 'Cozy, Authentic, Welcoming'; // Default fallback

      if (data.response) {
        if (typeof data.response === 'string') {
          vibesText = data.response;
        } else if (typeof data.response === 'object' && data.response.text) {
          vibesText = data.response.text;
        }
      }

      return vibesText;
    } catch (error) {
      console.error('Error generating vibes:', error);
      // Fallback to generic vibes if API fails
      return 'Cozy, Authentic, Welcoming';
    }
  };

  // Yelp AI API call to generate restaurant review
  const generateReview = async (restaurant: any) => {
    try {
      const YELP_API_KEY = import.meta.env.VITE_YELP_API_KEY;
      if (!YELP_API_KEY) {
        throw new Error('Yelp API key not found. Please set VITE_YELP_API_KEY as an environment variable.');
      }

      // Use Yelp AI API to generate restaurant review
      const address = `${restaurant.location?.address1 || ''}, ${restaurant.location?.city || ''}, ${restaurant.location?.state || ''} ${restaurant.location?.zip_code || ''}`.trim();
      const query = `${restaurant.name} restaurant at ${address}: give me a short review of the restaurant that I can add to my journal on the place`;

      const response = await fetch('https://api.yelp.com/ai/chat/v2', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${YELP_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          user_context: {
            locale: 'en_US',
            latitude: restaurant.coordinates?.latitude || 40.7128, // Default to NYC if no coordinates
            longitude: restaurant.coordinates?.longitude || -74.0060
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Yelp AI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      // Extract the review from the AI response
      let reviewText = 'This restaurant offers a wonderful dining experience with great food and atmosphere.'; // Default fallback

      if (data.response) {
        if (typeof data.response === 'string') {
          reviewText = data.response;
        } else if (typeof data.response === 'object' && data.response.text) {
          reviewText = data.response.text;
        }
      }

      return reviewText;
    } catch (error) {
      console.error('Error generating review:', error);
      // Fallback to generic review if API fails
      return 'This restaurant offers a wonderful dining experience with great food and atmosphere.';
    }
  };

  // Yelp AI API call to generate detailed restaurant information
  const generateDetailedInfo = async (restaurant: any) => {
    try {
      const YELP_API_KEY = import.meta.env.VITE_YELP_API_KEY;
      if (!YELP_API_KEY) {
        throw new Error('Yelp API key not found. Please set VITE_YELP_API_KEY as an environment variable.');
      }

      // Use Yelp AI API to generate detailed restaurant information
      const address = `${restaurant.location?.address1 || ''}, ${restaurant.location?.city || ''}, ${restaurant.location?.state || ''} ${restaurant.location?.zip_code || ''}`.trim();
      const query = `Tell me everything about ${restaurant.name} restaurant at ${address} that I would need to know if I wanted to write a journal to document my visit there. What colors does it give off? What patterns? What are some popular services or menu items? How much does a reservation or ticket cost? What cuisine is it? What are common reviews?`;

      const response = await fetch('https://api.yelp.com/ai/chat/v2', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${YELP_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          user_context: {
            locale: 'en_US',
            latitude: restaurant.coordinates?.latitude || 40.7128, // Default to NYC if no coordinates
            longitude: restaurant.coordinates?.longitude || -74.0060
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Yelp AI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      // Extract the detailed info from the AI response
      let detailedInfoText = 'Detailed information not available.'; // Default fallback

      if (data.response) {
        if (typeof data.response === 'string') {
          detailedInfoText = data.response;
        } else if (typeof data.response === 'object' && data.response.text) {
          detailedInfoText = data.response.text;
        }
      }

      return detailedInfoText;
    } catch (error) {
      console.error('Error generating detailed info:', error);
      // Fallback to generic info if API fails
      return 'Detailed information not available.';
    }
  };

  const handleRestaurantSelect = async (restaurant: any) => {
    setSelectedRestaurant(restaurant);
    setShowRestaurantSelector(false);

    // Start generating Yelp AI content and images immediately
    try {
      const [vibesText, reviewText, detailedInfoText] = await Promise.all([
        generateVibes(restaurant),
        generateReview(restaurant),
        generateDetailedInfo(restaurant)
      ]);

      setPageVibes(vibesText);
      setPageReview(reviewText);
      setPageDetailedInfo(detailedInfoText);
    } catch (error) {
      // Fallback to default content if API fails
      setPageVibes('Cozy, Authentic, Welcoming');
      setPageReview('This restaurant offers a wonderful dining experience with great food and atmosphere.');
      setPageDetailedInfo('Detailed information not available.');
    }
  };

  const handlePageClick = (pageId: number, existingVibes?: string, existingRestaurant?: any) => {
    setSelectedPage(pageId);
    if (existingVibes && existingRestaurant) {
      // Page already has restaurant data, go directly to editor
      setPageVibes(existingVibes);
      setSelectedRestaurant(existingRestaurant);
    } else {
      // Need to select restaurant first
      setShowRestaurantSelector(true);
    }
  };

  const handleClosePage = () => {
    setSelectedPage(null);
    setPageVibes(null);
    setPageReview(null);
    setPageDetailedInfo(null);
    setSelectedRestaurant(null);
    setShowRestaurantSelector(false);
  };

  const handleRestartPage = () => {
    // Clear restaurant data and go back to restaurant selection
    setSelectedRestaurant(null);
    setPageVibes(null);
    setPageReview(null);
    setPageDetailedInfo(null);
    setGeneratedImages([]);
    setIsGeneratingImages(false);
    setShowRestaurantSelector(true);
  };

  // Generate images when detailedInfo is available
  useEffect(() => {
    const generateImages = async () => {
      if (pageDetailedInfo && generatedImages.length === 0 && !isGeneratingImages) {
        console.log('🚀 Starting image generation process for restaurant page');
        setIsGeneratingImages(true);
        try {
          console.log('📝 Detailed info received:', pageDetailedInfo.substring(0, 100) + '...');
          const images = await imageService.generateRestaurantImages(pageDetailedInfo);
          setGeneratedImages(images);
          console.log('💾 Images saved to state:', images.length, 'images generated');
        } catch (error) {
          console.error('💥 Failed to generate images:', error);
        } finally {
          setIsGeneratingImages(false);
          console.log('🏁 Image generation process completed');
        }
      }
    };

    generateImages();
  }, [pageDetailedInfo, generatedImages.length, isGeneratingImages]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    if (showHomepage) {
      return <Homepage onGoToLogin={() => {
        setShowHomepage(false);
        setShowLogin(true);
      }} />;
    } else if (showLogin) {
      return (
        <div className="app">
          <h1 className="login-title" onClick={() => {
            setShowHomepage(true);
            setShowLogin(false);
          }}>footprints</h1>
          <div className="login-container">
            <img src="/login-card.png" alt="Login Card" className="login-card" />
            <div className="login-form-overlay">
              <AuthForm />
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="login-title">footprints</h1>
        <button onClick={logout} className="logout-btn">Logout</button>
      </header>
      <main>
        {showRestaurantSelector && selectedJournal && selectedPage ? (
          <RestaurantSelector
            onRestaurantSelect={handleRestaurantSelect}
            onClose={handleClosePage}
          />
        ) : selectedPage && selectedJournal && selectedRestaurant && (!pageVibes || isGeneratingImages) ? (
          <div className="loading-overlay">
            <div className="loading-content">
              <div className="loading-spinner"></div>
              <h2>{!pageVibes ? 'Generating Content...' : 'Generating...'}</h2>
              <p>Please wait while we {!pageVibes ? 'create personalized content' : 'create beautiful images'} for your journal page.</p>
            </div>
          </div>
        ) : selectedPage && selectedJournal && pageVibes && !isGeneratingImages ? (
          <PageEditor
            journal={selectedJournal}
            pageId={selectedPage}
            vibes={pageVibes}
            review={pageReview || undefined}
            detailedInfo={pageDetailedInfo || undefined}
            restaurant={selectedRestaurant}
            generatedImages={generatedImages}
            onClose={handleClosePage}
            onRestart={handleRestartPage}
          />
        ) : selectedJournal ? (
          <BookViewer
            journal={selectedJournal}
            onClose={() => setSelectedJournal(null)}
            onPageClick={handlePageClick}
          />
        ) : (
          <Bookshelf onJournalClick={setSelectedJournal} />
        )}
      </main>
    </div>
  );
}

// Shared Page Component (no authentication required)
function SharedPage() {
  const { id, pageId } = useParams<{ id: string; pageId: string }>();
  const navigate = useNavigate();

  if (!id || !pageId) {
    return <Navigate to="/" replace />;
  }

  const pageNumber = parseInt(pageId);
  if (isNaN(pageNumber)) {
    return <Navigate to="/" replace />;
  }

  return <SharedPageViewer journalId={id} pageId={pageNumber} onClose={() => navigate('/')} />;
}

function App() {
  return (
    <Routes>
      <Route path="/shared/journal/:id/page/:pageId" element={<SharedPage />} />
      <Route path="/" element={<MainApp />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App
