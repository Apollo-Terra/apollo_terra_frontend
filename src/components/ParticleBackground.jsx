
import  { useCallback } from 'react';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';
import particlesConfig from '../config/particles-config';

const ParticleBackground = () => {
  // A função init é chamada uma vez para carregar o motor tsparticles
  const particlesInit = useCallback(async (engine) => {
    // Você pode carregar a versão 'slim' ou a completa 'tsparticles'
    await loadSlim(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={particlesConfig}
    />
  );
};

export default ParticleBackground;