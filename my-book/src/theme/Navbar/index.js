import React from 'react';
import OriginalNavbar from '@theme-original/Navbar';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import './styles.css';

function BackButton() {
  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <button
      className="navbar-back-button"
      onClick={handleBack}
      aria-label="Go back"
    >
      ←
    </button>
  );
}

function AuthButtons() {
  const [user, setUser] = React.useState(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const homeUrl = useBaseUrl('/');

  React.useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (e) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = homeUrl;
  };

  return (
    <div className="navbar__auth">
      {isAuthenticated ? (
        <>
          <Link to="/profile" className="navbar__auth-user">
            👤 {user?.first_name} {user?.last_name}
          </Link>
          <button onClick={handleLogout} className="navbar__auth-logout">
            Logout
          </button>
        </>
      ) : (
        <>
          <Link to="/login" className="navbar__auth-login">Sign In</Link>
          <Link to="/signup" className="navbar__auth-signup">Sign Up</Link>
        </>
      )}
    </div>
  );
}

function MobileToggleMenu() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [user, setUser] = React.useState(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const homeUrl = useBaseUrl('/');

  React.useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (e) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    setIsOpen(false);
    window.location.href = homeUrl;
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <div className="mobile-toggle-menu">
      <button
        className="mobile-toggle-button"
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="mobile-menu-overlay" onClick={closeMenu}></div>
          <div className="mobile-menu-sidebar">
            <div className="mobile-menu-header">
              <h3>Menu</h3>
              <button className="mobile-menu-close" onClick={closeMenu}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="mobile-menu-content">
              {/* Navigation Section */}
              <div className="mobile-menu-section">
                <div className="mobile-menu-section-title">Navigation</div>
                <Link to="/" className="mobile-menu-item" onClick={closeMenu}>
                  <span className="mobile-menu-icon">🏠</span>
                  <span>Home</span>
                </Link>
                <Link to="/docs/intro" className="mobile-menu-item" onClick={closeMenu}>
                  <span className="mobile-menu-icon">📚</span>
                  <span>Chapters</span>
                </Link>
                <Link to="/docs/chapter1/summary" className="mobile-menu-item" onClick={closeMenu}>
                  <span className="mobile-menu-icon">📖</span>
                  <span>Topics</span>
                </Link>
                <Link to="/docs/chapter1/key_concepts" className="mobile-menu-item" onClick={closeMenu}>
                  <span className="mobile-menu-icon">🤖</span>
                  <span>Key Concepts</span>
                </Link>
                <Link to="/docs/chapter3/practical_examples" className="mobile-menu-item" onClick={closeMenu}>
                  <span className="mobile-menu-icon">💡</span>
                  <span>Examples</span>
                </Link>
                <a href="https://github.com/itishakeem/physical-ai-humanoid-robotics-textbook" className="mobile-menu-item" target="_blank" rel="noopener noreferrer" onClick={closeMenu}>
                  <span className="mobile-menu-icon">🔗</span>
                  <span>GitHub</span>
                </a>
              </div>

              {/* Auth Section */}
              <div className="mobile-menu-section">
                <div className="mobile-menu-section-title">Account</div>
                {isAuthenticated ? (
                  <>
                    <Link to="/profile" className="mobile-menu-item mobile-menu-item-profile" onClick={closeMenu}>
                      <span className="mobile-menu-icon">👤</span>
                      <span>{user?.first_name} {user?.last_name}</span>
                    </Link>
                    <button onClick={handleLogout} className="mobile-menu-item mobile-menu-item-logout">
                      <span className="mobile-menu-icon">🚪</span>
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="mobile-menu-item mobile-menu-item-signin" onClick={closeMenu}>
                      <span className="mobile-menu-icon">🔐</span>
                      <span>Sign In</span>
                    </Link>
                    <Link to="/signup" className="mobile-menu-item mobile-menu-item-signup" onClick={closeMenu}>
                      <span className="mobile-menu-icon">✨</span>
                      <span>Sign Up</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function Navbar(props) {
  return (
    <>
      <OriginalNavbar {...props} />
      <BackButton />
      <div className="navbar__auth-container">
        <AuthButtons />
      </div>
      <MobileToggleMenu />
    </>
  );
}