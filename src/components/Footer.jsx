import { Satellite, Github, Mail, MapPin } from 'lucide-react';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <div className="footer-logo">
            <Satellite size={32} />
            <h3>Apollo Terra</h3>
          </div>
          <p>Combatendo a fome no Ceará com tecnologia NASA</p>
        </div>
        
        <div className="footer-section">
          <h4>Contato</h4>
          <div className="footer-links">
            <a href="mailto:contato@apolloterra.com">
              <Mail size={16} />
              contato@apolloterra.com
            </a>
            <div className="footer-location">
              <MapPin size={16} />
              Ceará, Brasil
            </div>
          </div>
        </div>
        
        <div className="footer-section">
          <h4>Tecnologia</h4>
          <div className="footer-links">
            <span>NASA MODIS</span>
            <span>React + Vite</span>
            <span>Leaflet Maps</span>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2024 Apollo Terra. Todos os direitos reservados.</p>
        <div className="footer-social">
          <a href="#" aria-label="GitHub">
            <Github size={20} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;