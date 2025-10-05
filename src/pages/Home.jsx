import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, ScaleControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/Home.css';
import api from '../services/apiService';

const Home = () => {
  const cearaPosition = [-5.20, -39.50];
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [satelliteLayerUrl, setSatelliteLayerUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLayerUrl = async () => {
      setIsLoading(true);
      console.log('Buscando dados para a data:', selectedDate);
      try {
        const response = await api.get(`/gibs-layer-url?date=${selectedDate}`);
        console.log('Resposta da API:', response.data);
        setSatelliteLayerUrl(response.data.templateUrl);
      } catch (error) {
        console.error("Erro ao buscar a camada de satélite:", error);
        setSatelliteLayerUrl('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLayerUrl();
  }, [selectedDate]);

  return (
    <div className="home-container">
      <header className="home-header">
        <h2>BloomWatch Ceará: O Pulso Verde do Sertão</h2>
        <p>Selecione uma data e viaje no tempo com imagens de satélite MODIS da NASA.</p>
      </header>

      <div className="controls-container">
        <label htmlFor="date-picker">Selecione a Data:</label>
        <input
          type="date"
          id="date-picker"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      <div className="map-wrapper">
        {isLoading ? (
          <div className="loading-overlay">Carregando Imagens da NASA...</div>
        ) : (
          <MapContainer 
            center={cearaPosition} 
            zoom={8} 
            scrollWheelZoom={true} 
            className="map-container"
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a>'
              url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
            />
            
            {satelliteLayerUrl && (
              <TileLayer
                key={`${satelliteLayerUrl}-${selectedDate}`}
                url={satelliteLayerUrl}
                attribution='&copy; <a href="https://earthdata.nasa.gov/eosdis/daacs/gibs">NASA GIBS</a>'
                opacity={0.8}
              />
            )}
            <ScaleControl imperial={false} />
          </MapContainer>
        )}
      </div>
      
      <div className="info-section">
        <h3>Análise Temporal e Interatividade</h3>
        <p>
          <strong>Séries Temporais:</strong> Altere a data no seletor para comparar a cobertura vegetal em diferentes épocas. Observe as mudanças entre a estação seca e a chuvosa.
        </p>
        <p>
          <strong>Análise de Dados (Próximo Passo):</strong> Para uma análise automática de floração, o ideal seria usar camadas de dados que já representam a saúde da vegetação, como o <a href="https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_NDVI_8Day/default/2023-10-05/GoogleMapsCompatible_Level6/6/35/25.png" target="_blank" rel="noopener noreferrer">NDVI (Índice de Vegetação por Diferença Normalizada)</a>, que a NASA também fornece via GIBS.
        </p>
      </div>
    </div>
  );
};

export default Home;