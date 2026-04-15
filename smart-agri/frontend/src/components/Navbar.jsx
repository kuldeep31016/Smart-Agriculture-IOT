import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/',           label: 'Home'           },
  { to: '/dashboard',  label: 'Dashboard'      },
  { to: '/predict',    label: 'Crop Prediction' },
];

function Navbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-agri-primary shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <span className="text-2xl group-hover:scale-110 transition-transform duration-200">🌾</span>
            <span className="text-white font-extrabold text-xl tracking-wide">AgriSense</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden sm:flex space-x-1">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                  location.pathname === to
                    ? 'bg-agri-light text-white shadow-inner'
                    : 'text-agri-snow hover:bg-agri-medium hover:text-white'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden text-white p-2 rounded-md hover:bg-agri-medium"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="sm:hidden pb-3 space-y-1">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                  location.pathname === to
                    ? 'bg-agri-light text-white'
                    : 'text-agri-snow hover:bg-agri-medium'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
