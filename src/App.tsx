import './App.css'
import { useAuth } from './AuthContext';
import AuthForm from './AuthForm';
import Bookshelf from './Bookshelf';
import BookViewer from './BookViewer';
import PageEditor from './PageEditor';
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
        {selectedPage && selectedJournal ? (
          <PageEditor
            journal={selectedJournal}
            pageId={selectedPage}
            onClose={() => setSelectedPage(null)}
          />
        ) : selectedJournal ? (
          <BookViewer
            journal={selectedJournal}
            onClose={() => setSelectedJournal(null)}
            onPageClick={setSelectedPage}
          />
        ) : (
          <Bookshelf onJournalClick={setSelectedJournal} />
        )}
      </main>
    </div>
  );
}

export default App
