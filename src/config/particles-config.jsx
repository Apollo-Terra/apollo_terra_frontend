
const particlesConfig = {
  
  fpsLimit: 120, // Limita o FPS para economizar recursos
  interactivity: {
    events: {
      onHover: {
        enable: true,
        mode: 'repulse', // Afasta as partículas ao passar o mouse
      },
      resize: true,
    },
    modes: {
      repulse: {
        distance: 60,
        duration: 0.4,
      },
    },
  },
  particles: {
    color: {
      value: '#ffffff', // Cor das partículas (estrelas)
    },
    links: {
      color: '#ffffff',
      distance: 150,
      enable: false, // Desabilitamos as linhas entre as partículas
      opacity: 0.5,
      width: 1,
    },
    move: {
      direction: 'none',
      enable: true,
      outModes: {
        default: 'out', // As partículas saem da tela
      },
      random: true,
      speed: 0.5, // Velocidade de movimento lenta
      straight: false,
    },
    number: {
      density: {
        enable: true,
        area: 800,
      },
      value: 100, // Número de partículas
    },
    opacity: {
      value: { min: 0.1, max: 0.5 }, // Opacidade variável para efeito de brilho
    },
    shape: {
      type: 'circle',
    },
    size: {
      value: { min: 1, max: 3 }, // Tamanho variável das partículas
    },
  },
  detectRetina: true,
};

export default particlesConfig;