import './App.css'
import { useAuth } from './AuthContext';
import AuthForm from './AuthForm';

function App() {
  const { user, loading, logout } = useAuth();

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
        {/* Main app content will go here */}
        <div className="main-content">
          <p>Your app content here...</p>
        </div>
      </main>
    </div>
  );
}

export default App
