import './App.css'
import { useAuth } from './AuthContext';
import AuthForm from './AuthForm';
import Bookshelf from './Bookshelf';
import BookViewer from './BookViewer';
import PageEditor from './PageEditor';
import RestaurantSelector from './RestaurantSelector';
import SharedPageViewer from './SharedPageViewer';
import Homepage from './Homepage';
import Gallery from './Gallery';
import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { imageService, type GeneratedImage } from './imageService';
import { db } from './firebase';
import { doc, deleteDoc } from 'firebase/firestore';

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

  const [pageDetailedInfo, setPageDetailedInfo] = useState<string | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);
  const [showRestaurantSelector, setShowRestaurantSelector] = useState(false);
  const [showHomepage, setShowHomepage] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);

  const handleImagesLoaded = (images: GeneratedImage[]) => {
    setGeneratedImages(images);
  };

  // Yelp AI API call to generate vibes
  // COMMENTED OUT TO SAVE API CREDITS - USING DEFAULT VALUES
  const generateVibes = async (_restaurant: any) => {
    // return default values to save API credits
    return 'Familiar, Casual, Fast-paced';

    /*
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
      let vibesText = 'Familiar, Casual, Fast-paced'; // Default fallback

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
      return 'Familiar, Casual, Fast-paced';
    }
    */
  };



  // Yelp AI API call to generate detailed restaurant information
  // COMMENTED OUT TO SAVE API CREDITS - USING DEFAULT VALUES
  const generateDetailedInfo = async (_restaurant: any) => {
    // return default values to save API credits
    return 'Detailed information not available.';

    /*
    try {
      const YELP_API_KEY = import.meta.env.VITE_YELP_API_KEY;
      if (!YELP_API_KEY) {
        throw new Error('Yelp API key not found. Please set VITE_YELP_API_KEY as an environment variable.');
      }

      // Use Yelp AI API to generate detailed restaurant information
      const address = `${restaurant.location?.address1 || ''}, ${restaurant.location?.city || ''}, ${restaurant.location?.state || ''} ${restaurant.location?.zip_code || ''}`.trim();
      const query = `Describe ${restaurant.name} using the following format only:
Menu Items:

Item 1

Item 2

Item 3
Location: Generalized location description (e.g., downtown, city center, suburbs, waterfront).

Do not include a full address or any visual description.`;

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
    */
  };

  // Yelp AI API call to generate menu/service items
  // COMMENTED OUT TO SAVE API CREDITS - USING DEFAULT VALUES
  const generateMenuItems = async (_restaurant: any) => {
    // return default values to save API credits
    return 'McDonald\'s fries\nMcDonald\'s burger\nvanilla milkshake';

    /*
    try {
      const YELP_API_KEY = import.meta.env.VITE_YELP_API_KEY;
      if (!YELP_API_KEY) {
        throw new Error('Yelp API key not found. Please set VITE_YELP_API_KEY as an environment variable.');
      }

      // Use Yelp AI API to generate exactly 2 menu items
      const query = `List exactly 2 popular menu items from ${restaurant.name} restaurant. Output only the items, one per line, in format: Item Name - $Price. No other text or explanation.`;

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
            latitude: restaurant.coordinates?.latitude || 40.7128,
            longitude: restaurant.coordinates?.longitude || -74.0060
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Yelp AI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      let menuItemsText = 'Sample Item - $15.99\nAnother Dish - $12.50\nSpecial Item - $18.75'; // Default fallback

      if (data.response) {
        if (typeof data.response === 'string') {
          menuItemsText = data.response;
        } else if (typeof data.response === 'object' && data.response.text) {
          menuItemsText = data.response.text;
        }
      }

      return menuItemsText;
    } catch (error) {
      console.error('Error generating menu items:', error);
      // Fallback to generic items if API fails
      return 'Sample Item - $15.99\nAnother Dish - $12.50\nSpecial Item - $18.75';
    }
    */
  };

  const handleRestaurantSelect = async (restaurant: any) => {
    setSelectedRestaurant(restaurant);
    setShowRestaurantSelector(false);

    // Clear any existing generated images for the new restaurant
    setGeneratedImages([]);

    // Start content generation
    setIsGeneratingContent(true);

    try {
      const [vibesText, detailedInfoText, menuItemsText] = await Promise.all([
        generateVibes(restaurant),
        generateDetailedInfo(restaurant),
        generateMenuItems(restaurant)
      ]);

      // Add menu items to restaurant object
      const restaurantWithMenu = {
        ...restaurant,
        menuItems: menuItemsText
      };

      setSelectedRestaurant(restaurantWithMenu);
      setPageVibes(vibesText);
      setPageDetailedInfo(detailedInfoText);
    } catch (error) {
      // Fallback to default content if API fails
      setPageVibes('Familiar, Casual, Fast-paced');
      setPageDetailedInfo('Detailed information not available.');
    } finally {
      setIsGeneratingContent(false);
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
    setPageDetailedInfo(null);
    setSelectedRestaurant(null);
    setShowRestaurantSelector(false);
  };

  const handleRestartPage = async () => {
    // Clear the current page data from Firestore first
    if (selectedJournal && selectedPage) {
      try {
        const pageRef = doc(db, 'journals', selectedJournal.id, 'pages', `page-${selectedPage}`);
        await deleteDoc(pageRef);
        console.log('Page data cleared from Firestore for restart');
      } catch (error) {
        console.error('Error clearing page data:', error);
      }
    }

    // Clear all page and restaurant data to go back to page selection
    setSelectedPage(null);
    setSelectedRestaurant(null);
    setPageVibes(null);
    setPageDetailedInfo(null);
    setGeneratedImages([]);
    setIsGeneratingImages(false);
    setIsGeneratingContent(false);
    setShowRestaurantSelector(false);
  };

  // Generate images when detailedInfo is available
  useEffect(() => {
    const generateImages = async () => {
      if (pageDetailedInfo && generatedImages.length === 0 && !isGeneratingImages) {
        console.log('🚀 Starting DALL-E image generation process for restaurant page');
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
          console.log('🏁 DALL-E image generation process completed');
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
        ) : selectedPage && selectedJournal && selectedRestaurant && (isGeneratingContent || isGeneratingImages) ? (
          <div className="loading-overlay">
            <div className="loading-content">
              <div className="loading-spinner"></div>
              <h2>{isGeneratingContent ? 'Generating Content...' : 'Generating Images...'}</h2>
              <p>Please wait while we {isGeneratingContent ? 'create personalized content' : 'create beautiful images'} for your journal page.</p>
            </div>
          </div>
        ) : selectedPage && selectedJournal && pageVibes && !isGeneratingImages ? (
          <PageEditor
            journal={selectedJournal}
            pageId={selectedPage}
            vibes={pageVibes}
            detailedInfo={pageDetailedInfo || undefined}
            restaurant={selectedRestaurant}
            generatedImages={generatedImages}
            onImagesLoaded={handleImagesLoaded}
            onClose={handleClosePage}
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
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/shared/journal/:id/page/:pageId" element={<SharedPage />} />
      <Route path="/" element={<MainApp />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App
