import './App.css'
import { useAuth } from './AuthContext';
import AuthForm from './AuthForm';
import Bookshelf from './Bookshelf';
import BookViewer from './BookViewer';
import PageEditor from './PageEditor';
import RestaurantSelector from './RestaurantSelector';
import SharedPageViewer from './SharedPageViewer';
import Homepage from './Homepage';
import { useState } from 'react';
import { Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';

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
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);
  const [showRestaurantSelector, setShowRestaurantSelector] = useState(false);
  const [showHomepage, setShowHomepage] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  const handleRestaurantSelect = (restaurant: any, vibes: string) => {
    setSelectedRestaurant(restaurant);
    setPageVibes(vibes);
    setShowRestaurantSelector(false);
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
    setSelectedRestaurant(null);
    setShowRestaurantSelector(false);
  };

  const handleRestartPage = () => {
    // Clear restaurant data and go back to restaurant selection
    setSelectedRestaurant(null);
    setPageVibes(null);
    setShowRestaurantSelector(true);
  };

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
          <h1>footprints</h1>
          <p className="subtitle">Add footprints everywhere you go!</p>
          <AuthForm />
        </div>
      );
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>footprints</h1>
        <button onClick={logout} className="logout-btn">Logout</button>
      </header>
      <main>
        <p className="subtitle">Welcome, {user?.email}! Add footprints everywhere you go!</p>
        {showRestaurantSelector && selectedJournal && selectedPage ? (
          <RestaurantSelector
            onRestaurantSelect={handleRestaurantSelect}
            onClose={handleClosePage}
          />
        ) : selectedPage && selectedJournal && pageVibes ? (
          <PageEditor
            journal={selectedJournal}
            pageId={selectedPage}
            vibes={pageVibes}
            restaurant={selectedRestaurant}
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
