import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { X, Menu, Home, Info, BarChart3 } from 'lucide-react';
import '../styles/Navbar.css';
import logo from '../assets/logo.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);

  return (
    <>
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
          <NavLink 
            to="/" 
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <Home className="nav-icon" size={20} />
            {isOpen && <span>Inicio</span>}
          </NavLink>
          <NavLink 
            to="/sobre" 
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <Info className="nav-icon" size={20} />
            {isOpen && <span>Sobre</span>}
          </NavLink>
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <BarChart3 className="nav-icon" size={20} />
            {isOpen && <span>Dashboard</span>}
          </NavLink>
        </div>
      </nav>
      
      {!isOpen && (
        <button 
          className="navbar-open-btn"
          onClick={() => setIsOpen(true)}
        >
          <Menu size={24} />
        </button>
      )}
    </>
  );
};

export default Navbar;
