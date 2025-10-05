import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { X, Menu } from 'lucide-react';
import '../styles/Navbar.css';
import logo from '../assets/logo.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(true);

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
          <img src={logo} alt="BloomWatch Logo" />
          <h1>APOLLO TERRA</h1>
        </div>
        
        <div className="navbar-links">
          <NavLink 
            to="/" 
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Inicio
          </NavLink>
          <NavLink 
            to="/sobre" 
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Sobre
          </NavLink>
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Dashboard
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
