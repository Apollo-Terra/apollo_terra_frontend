

import { Satellite, Brain, MapPin, Users, Leaf, Target, ArrowRight, CheckCircle } from 'lucide-react';
import '../styles/About.css';

const About = () => {
  const features = [
    { icon: Satellite, title: 'Dados de Satélite', desc: 'Mapeamento via NASA MODIS' },
    { icon: Brain, title: 'Inteligência Artificial', desc: 'Análise preditiva de culturas' },
    { icon: MapPin, title: 'Geolocalização', desc: 'Identificação precisa de áreas' },
    { icon: Users, title: 'Parcerias Locais', desc: 'Integração com prefeituras e ONGs' }
  ];

  const steps = [
    { title: 'Mapeamento', desc: 'Identificação de solos férteis não aproveitados' },
    { title: 'Análise IA', desc: 'Determinação das culturas mais adequadas' },
    { title: 'Alerta', desc: 'Notificação às autoridades locais' },
    { title: 'Ação', desc: 'Mobilização de recursos e insumos' }
  ];

  return (
    <div className="about-container">
      <header className="about-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            <Leaf className="hero-icon" />
            Apollo Terra
          </h1>
          <p className="hero-subtitle">Inovação no Combate à Fome no Ceará</p>
          <div className="hero-description">
            Plataforma de agricultura de precisão e inteligência social para combater a insegurança alimentar
          </div>
        </div>
        <div className="hero-visual">
          <div className="floating-card">
            <Satellite size={48} className="card-icon" />
            <span>Monitoramento 24/7</span>
          </div>
        </div>
      </header>

      <section className="features-section">
        <h2 className="section-title">Como Funciona</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <feature.icon size={32} className="feature-icon" />
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="process-section">
        <h2 className="section-title">Processo de Atuação</h2>
        <div className="process-flow">
          {steps.map((step, index) => (
            <div key={index} className="process-step">
              <div className="step-number">{index + 1}</div>
              <div className="step-content">
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
              </div>
              {index < steps.length - 1 && <ArrowRight className="step-arrow" />}
            </div>
          ))}
        </div>
      </section>

      <section className="mission-section">
        <div className="mission-card">
          <Target size={40} className="mission-icon" />
          <div className="mission-content">
            <h2 className="mission-title">Nossa Missão</h2>
            <p className="mission-text">
              Garantir o aproveitamento rápido de terras férteis, direcionando a produção para o programa 
              <strong> Ceará Fome Zero</strong>, privilegiando a segurança alimentar local.
            </p>
            <div className="mission-stats">
              <div className="stat-item">
                <CheckCircle size={20} />
                <span>100% Focado no Ceará</span>
              </div>
              <div className="stat-item">
                <CheckCircle size={20} />
                <span>Tecnologia NASA</span>
              </div>
              <div className="stat-item">
                <CheckCircle size={20} />
                <span>Impacto Social</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;