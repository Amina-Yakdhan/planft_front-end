import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const token = localStorage.getItem('token');
  const coachName = localStorage.getItem('coachName');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('coachName');
    navigate('/login', { replace: true });
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-custom shadow-sm mb-4">
      <div className="container">
        <Link className="navbar-brand fw-bold fs-3" to="/" onClick={() => setMenuOpen(false)}>
          <span className="brand-accent">PLAN</span>FIT
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          aria-controls="navbarNav"
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen(open => !open)}
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className={`collapse navbar-collapse${menuOpen ? ' show' : ''}`} id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-lg-center">
            {token ? (
              <>
                <li className="nav-item"><Link className={`nav-link nav-link-custom me-2 ${isActive('/')}`} to="/" onClick={() => setMenuOpen(false)}>Dashboard</Link></li>
                <li className="nav-item"><Link className={`nav-link nav-link-custom me-2 ${isActive('/clients')}`} to="/clients" onClick={() => setMenuOpen(false)}>Clients</Link></li>
                <li className="nav-item"><Link className={`nav-link nav-link-custom me-2 ${isActive('/library')}`} to="/library" onClick={() => setMenuOpen(false)}>Exercices</Link></li>
                <li className="nav-item"><Link className={`nav-link nav-link-custom me-2 ${isActive('/nutrition')}`} to="/nutrition" onClick={() => setMenuOpen(false)}>Nutrition</Link></li>
                <li className="nav-item"><Link className="btn btn-success-custom ms-lg-2 me-lg-3" to="/program-builder" onClick={() => setMenuOpen(false)}>+ New Program</Link></li>
                <li className="nav-item text-white-50 me-2 small">👋 Coach {coachName}</li>
                <li className="nav-item">
                  <button className="btn btn-sm btn-outline-danger" onClick={handleLogout}>Logout</button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item"><Link className="nav-link nav-link-custom me-2" to="/login" onClick={() => setMenuOpen(false)}>Login</Link></li>
                <li className="nav-item"><Link className="btn btn-success-custom" to="/register" onClick={() => setMenuOpen(false)}>Register</Link></li>
              </>
            )}
            <li className="nav-item">
              <button
                className="theme-toggle"
                type="button"
                onClick={toggleTheme}
                role="switch"
                aria-checked={theme === 'dark'}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                <span className="theme-toggle__track" aria-hidden="true">
                  <i className="bi bi-sun-fill theme-toggle__sun" />
                  <i className="bi bi-moon-stars-fill theme-toggle__moon" />
                  <span className="theme-toggle__thumb" />
                </span>
                <span className="theme-toggle__label">{theme === 'dark' ? 'Dark' : 'Light'}</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
