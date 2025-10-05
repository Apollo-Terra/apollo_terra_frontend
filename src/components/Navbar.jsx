import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { X, Menu, Home, Info, BarChart3 } from 'lucide-react';
import '../styles/Navbar.css';
import logo from '../assets/logo.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setIsOpen(!mobile);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { path: '/', icon: Home, label: 'Inicio' },
    { path: '/sobre', icon: Info, label: 'Sobre' },
    { path: '/dashboard', icon: BarChart3, label: 'Dashboard' }
  ];

  return (
    <>
      {/* Barra lateral com ícones para mobile */}
      {isMobile && (
        <div className="mobile-sidebar">
          <button 
            className="mobile-sidebar-btn"
            onClick={() => setIsOpen(true)}
          >
            <Menu size={20} />
          </button>
          {navItems.map(({ path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => 
                `mobile-sidebar-btn ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={20} />
            </NavLink>
          ))}
        </div>
      )}

      {/* Navbar principal */}
      <nav className={`navbar ${isOpen ? 'open' : 'closed'}`}>
        {isOpen && (
          <button 
            className="navbar-toggle"
            onClick={() => setIsOpen(false)}
          >
            <X size={24} />
          </button>
        )}
        
        <div className="navbar-logo">
          {isOpen && <img src={logo} alt="BloomWatch Logo" />}
          {isOpen && <h1>APOLLO TERRA</h1>}
        </div>
        
        <div className="navbar-links">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink 
              key={path}
              to={path}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <Icon className="nav-icon" size={20} />
              {isOpen && <span>{label}</span>}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
