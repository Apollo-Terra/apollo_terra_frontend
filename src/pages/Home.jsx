import { useState, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/Home.css';
import api from '../services/apiService';
import NasaTileLayer from '../components/NasaTileLayer';

const Home = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [satelliteLayerUrl, setSatelliteLayerUrl] = useState('');

  useEffect(() => {
    const fetchLayerUrl = async () => {
      try {
        const response = await api.get(`/gibs-layer-url?date=${selectedDate}`);
        setSatelliteLayerUrl(response.data.templateUrl);
      } catch (error) {
        console.error('Erro ao buscar camada:', error);
      }
    };

    fetchLayerUrl();
  }, [selectedDate]);

  return (
    <div className="home-container">
      <header className="home-header">
        <h2>Apollo Terra</h2>
        <p>Monitoramento Inteligente da Terra com Tecnologia NASA</p>
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

      
        <MapContainer 
          center={[-5.20, -39.50]} 
          zoom={8} 
          scrollWheelZoom={true}
          className="map-container"
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; CartoDB'
          />
          
          {satelliteLayerUrl && (
            <NasaTileLayer
              key={`nasa-${selectedDate}`}
              url={satelliteLayerUrl}
              opacity={0.7}
              selectedDate={selectedDate}
            />
          )}
        </MapContainer>
    
      
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