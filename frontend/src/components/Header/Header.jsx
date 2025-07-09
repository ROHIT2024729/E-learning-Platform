import React, { useState, useEffect, useRef, useCallback } from 'react';
import "./Header.css";
import { Link, useNavigate } from "react-router-dom";
import { UserData } from '../../context/UserContext';
import { CourseData } from '../../context/CourseContext';
import { FaSun, FaMoon, FaSearch, FaBars, FaTimes } from 'react-icons/fa';

const Header = ({ isAuth }) => {
  const { user } = UserData();
  const { courses } = CourseData();
  const navigate = useNavigate();

  // Dark mode
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  // Hamburger menu
  const [menuOpen, setMenuOpen] = useState(false);

  // Search
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  const handleSearch = useCallback((q) => {
    if (!q.trim()) { setResults([]); return; }
    const lower = q.toLowerCase();
    const matched = (courses || []).filter(c =>
      c.title.toLowerCase().includes(lower) ||
      (c.category && c.category.toLowerCase().includes(lower)) ||
      (c.createdBy && c.createdBy.toLowerCase().includes(lower))
    ).slice(0, 6);
    setResults(matched);
  }, [courses]);

  const onQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleSearch(val), 300);
  };

  // Close search on click outside
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
        setQuery('');
        setResults([]);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="main-header">
      <div className="header-container">
        <div className="logo" onClick={() => navigate('/')}>
          <span className="logo-icon">📚</span>
          <span className="logo-text">EduPlatform</span>
        </div>

        {/* Desktop Nav */}
        <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <Link to={'/'} onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to={'/courses'} onClick={() => setMenuOpen(false)}>Courses</Link>
          <Link to={'/testseries'} onClick={() => setMenuOpen(false)}>Test Series</Link>
          {isAuth && <Link to={'/battle'} onClick={() => setMenuOpen(false)}>Battle ⚔️</Link>}
          {isAuth && <Link to={'/leaderboard'} onClick={() => setMenuOpen(false)}>Leaderboard</Link>}
          <Link to={'/about'} onClick={() => setMenuOpen(false)}>About</Link>
          {isAuth && user && user.role === 'admin' && (
             <Link to={'/admin/dashboard'} className="admin-badge" onClick={() => setMenuOpen(false)}>Admin</Link>
          )}
          {/* Mobile auth button */}
          <div className="mobile-auth">
            {isAuth ? (
              <button onClick={() => { navigate('/account'); setMenuOpen(false); }} className="common-btn outline-btn">My Account</button>
            ) : (
              <button onClick={() => { navigate('/login'); setMenuOpen(false); }} className="common-btn">Login</button>
            )}
          </div>
        </nav>

        <div className="header-actions">
          {/* Search */}
          <div className="search-wrapper" ref={searchRef}>
            <button className="icon-btn" onClick={() => setSearchOpen(!searchOpen)} aria-label="Search">
              <FaSearch />
            </button>
            {searchOpen && (
              <div className="search-dropdown">
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={query}
                  onChange={onQueryChange}
                  autoFocus
                />
                {query.trim() && (
                  <div className="search-results">
                    {results.length > 0 ? results.map(c => (
                      <div
                        key={c._id}
                        className="search-result-item"
                        onClick={() => {
                          navigate(`/course/${c._id}`);
                          setSearchOpen(false);
                          setQuery('');
                          setResults([]);
                        }}
                      >
                        <span className="sr-title">{c.title}</span>
                        <span className="sr-cat">{c.category}</span>
                      </div>
                    )) : (
                      <div className="search-no-result">No results found</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button className="icon-btn theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'light' ? <FaMoon /> : <FaSun />}
          </button>

          {/* Desktop Auth */}
          <div className="desktop-auth">
            {isAuth ? (
              <button onClick={() => navigate('/account')} className="common-btn outline-btn">My Account</button>
            ) : (
              <button onClick={() => navigate('/login')} className="common-btn">Login</button>
            )}
          </div>

          {/* Hamburger */}
          <button className="hamburger icon-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {menuOpen && <div className="mobile-overlay" onClick={() => setMenuOpen(false)}></div>}
    </header>
  )
};

export default Header;
