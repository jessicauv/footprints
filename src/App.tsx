import './App.css'
import { useAuth } from './AuthContext';
import AuthForm from './AuthForm';
import Bookshelf from './Bookshelf';
import BookViewer from './BookViewer';
import PageEditor from './PageEditor';
import RestaurantSelector from './RestaurantSelector';
import { useState } from 'react';

interface Journal {
  id: string;
  title: string;
  createdAt: Date;
  description?: string;
  color?: string;
}

function App() {
  const { user, loading, logout } = useAuth();
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [selectedPage, setSelectedPage] = useState<number | null>(null);
  const [pageVibes, setPageVibes] = useState<string | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);
  const [showRestaurantSelector, setShowRestaurantSelector] = useState(false);

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
    return (
      <div className="app">
        <h1>Footprints</h1>
        <p className="subtitle">Add footprints everywhere you go!</p>
        <AuthForm />
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Footprints</h1>
        <button onClick={logout} className="logout-btn">Logout</button>
      </header>
      <main>
        <p className="subtitle">Welcome, {user.email}! Add footprints everywhere you go!</p>
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

export default App
