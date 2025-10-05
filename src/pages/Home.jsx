import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, useMapEvents, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/Home.css';
import api from '../services/apiService';
import NasaTileLayer from '../components/NasaTileLayer';

// Fix para ícones do Leaflet no build
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Componente para capturar cliques no mapa
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });
  return null;
};

// Base de dados de frutas do semiárido
const FRUIT_DATABASE = [
  {
    name: 'Cajueiro',
    minNdvi: 0.2,
    idealSoils: ['Latossolo', 'Argissolo', 'Neossolo'],
    minRainfall: 400,
    benefits: 'Extremamente resistente à seca, adapta-se a solos pobres',
    spacing: '8x8m',
    production: '2-3 anos'
  },
  {
    name: 'Mangueira',
    minNdvi: 0.35,
    idealSoils: ['Latossolo', 'Argissolo'],
    minRainfall: 600,
    benefits: 'Alta rentabilidade, resistente após estabelecida',
    spacing: '10x10m',
    production: '3-4 anos'
  },
  {
    name: 'Goiabeira',
    minNdvi: 0.3,
    idealSoils: ['Latossolo', 'Argissolo', 'Cambissolo'],
    minRainfall: 500,
    benefits: 'Tolerante a solos pobres, produção rápida',
    spacing: '6x6m',
    production: '2 anos'
  },
  {
    name: 'Coqueiro',
    minNdvi: 0.45,
    idealSoils: ['Latossolo', 'Neossolo'],
    minRainfall: 800,
    benefits: 'Alto valor comercial, múltiplos produtos',
    spacing: '8x8m',
    production: '4-5 anos'
  },
  {
    name: 'Aceroleira',
    minNdvi: 0.28,
    idealSoils: ['Latossolo', 'Argissolo'],
    minRainfall: 500,
    benefits: 'Rústica, alta concentração de vitamina C',
    spacing: '5x5m',
    production: '2 anos'
  },
  {
    name: 'Gravioleira',
    minNdvi: 0.4,
    idealSoils: ['Latossolo', 'Argissolo'],
    minRainfall: 700,
    benefits: 'Mercado crescente, fruto nobre',
    spacing: '6x6m',
    production: '3 anos'
  },
  {
    name: 'Maracujazeiro',
    minNdvi: 0.38,
    idealSoils: ['Latossolo', 'Argissolo'],
    minRainfall: 650,
    benefits: 'Ciclo curto, alta produtividade',
    spacing: '3x3m',
    production: '8-10 meses'
  },
  {
    name: 'Bananeira',
    minNdvi: 0.55,
    idealSoils: ['Latossolo'],
    minRainfall: 900,
    benefits: 'Produção contínua, alta demanda',
    spacing: '3x3m',
    production: '12-15 meses'
  }
];

// Regiões pré-cadastradas com frutas
const INITIAL_REGIONS = [
  { id: 1, lat: -5.15, lng: -39.40, fruit: 'Cajueiro', ndvi: 0.65, radius: 2000 },
  { id: 2, lat: -5.25, lng: -39.55, fruit: 'Mangueira', ndvi: 0.72, radius: 1500 },
  { id: 3, lat: -5.10, lng: -39.30, fruit: 'Goiabeira', ndvi: 0.58, radius: 1800 },
  { id: 4, lat: -5.30, lng: -39.45, fruit: 'Coqueiro', ndvi: 0.68, radius: 2500 },
  { id: 5, lat: -5.08, lng: -39.60, fruit: 'Aceroleira', ndvi: 0.61, radius: 1200 },
  { id: 6, lat: -5.18, lng: -39.25, fruit: 'Maracujazeiro', ndvi: 0.54, radius: 1000 },
];

const Home = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [satelliteLayerUrl, setSatelliteLayerUrl] = useState('');
  
  // Estados para análise de frutas e regiões
  const [fruitRegions] = useState(INITIAL_REGIONS);
  const [clickedPoint, setClickedPoint] = useState(null);
  const [pointAnalysis, setPointAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFruit, setSelectedFruit] = useState('todas');
  const [showRegions, setShowRegions] = useState(true);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  // Busca camada de satélite
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

  // Simula análise de NDVI baseada na localização
  const simulateNdvi = (lat, lng) => {
    // Áreas próximas a rios têm NDVI mais alto
    const distanceToRiver = Math.abs(lat + 5.2) + Math.abs(lng + 39.5);
    let baseNdvi = 0.5 - distanceToRiver * 0.05;
    
    // Adiciona variação aleatória
    baseNdvi += (Math.random() - 0.5) * 0.2;
    
    // Limita entre 0.15 e 0.85
    return Math.max(0.15, Math.min(0.85, baseNdvi)).toFixed(3);
  };

  // Determina tipo de solo baseado na localização
  const getSoilType = (lat, lng) => {
    const soilTypes = ['Latossolo', 'Argissolo', 'Neossolo', 'Cambissolo'];
    const index = Math.floor(Math.abs(lat * lng * 100) % soilTypes.length);
    return soilTypes[index];
  };

  // Calcula pluviometria estimada
  const getRainfall = (lat) => {
    // Litoral tem mais chuva que interior
    const distanceToCoast = Math.abs(lat + 5.0);
    return Math.floor(900 - distanceToCoast * 80 + Math.random() * 100);
  };

  // Gera sugestões de plantio
  const generateSuggestions = (ndvi, soilType, rainfall) => {
    const ndviValue = parseFloat(ndvi);
    
    return FRUIT_DATABASE
      .filter(fruit => ndviValue >= fruit.minNdvi)
      .filter(fruit => rainfall >= fruit.minRainfall)
      .filter(fruit => fruit.idealSoils.includes(soilType))
      .map(fruit => {
        let viability = 'Baixa';
        let viabilityScore = 0;
        
        // Calcula viabilidade baseada em múltiplos fatores
        if (ndviValue >= fruit.minNdvi + 0.15) viabilityScore += 30;
        else if (ndviValue >= fruit.minNdvi + 0.05) viabilityScore += 20;
        else viabilityScore += 10;
        
        if (rainfall >= fruit.minRainfall + 200) viabilityScore += 30;
        else if (rainfall >= fruit.minRainfall + 100) viabilityScore += 20;
        else viabilityScore += 10;
        
        if (fruit.idealSoils.includes(soilType)) viabilityScore += 40;
        
        if (viabilityScore >= 70) viability = 'Alta';
        else if (viabilityScore >= 50) viability = 'Média';
        
        return {
          name: fruit.name,
          viability,
          viabilityScore,
          benefits: fruit.benefits,
          spacing: fruit.spacing,
          production: fruit.production
        };
      })
      .sort((a, b) => b.viabilityScore - a.viabilityScore)
      .slice(0, 5);
  };

  // Analisa ponto clicado
  const handleMapClick = useCallback((latlng) => {
    setIsAnalyzing(true);
    setClickedPoint(latlng);
    setPointAnalysis(null);
    setShowAnalysisModal(true);

    // Simula delay de processamento
    setTimeout(() => {
      const ndvi = simulateNdvi(latlng.lat, latlng.lng);
      const soilType = getSoilType(latlng.lat, latlng.lng);
      const rainfall = getRainfall(latlng.lat);
      const suggestions = generateSuggestions(ndvi, soilType, rainfall);

      setPointAnalysis({
        ndvi,
        soilType,
        rainfall,
        temperature: Math.floor(26 + Math.random() * 6),
        suggestions,
        waterAvailability: parseFloat(ndvi) > 0.5 ? 'Boa' : parseFloat(ndvi) > 0.3 ? 'Moderada' : 'Baixa'
      });
      
      setIsAnalyzing(false);
    }, 800);
  }, []);

  // Filtra regiões por fruta selecionada
  const filteredRegions = selectedFruit === 'todas' 
    ? fruitRegions 
    : fruitRegions.filter(r => r.fruit.toLowerCase().includes(selectedFruit.toLowerCase()));

  // Cor do círculo baseada no NDVI
  const getCircleColor = (ndvi) => {
    if (ndvi > 0.6) return '#2ecc71';
    if (ndvi > 0.4) return '#f39c12';
    return '#e74c3c';
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <h2>Apollo Terra</h2>
        <p>Explore regiões do semiárido e encontre a vegetação que desejar.</p>
        <p className="subtitle">Clique no mapa para análise de solo e sugestões de plantio</p>
      </header>

      <div className="controls-container">
        <div className="control-group">
          <label htmlFor="date-picker">Data:</label>
          <input
            type="date"
            id="date-picker"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <div className="control-group">
          <label htmlFor="fruit-filter">Filtrar Frutas:</label>
          <select 
            id="fruit-filter"
            value={selectedFruit}
            onChange={(e) => setSelectedFruit(e.target.value)}
          >
            <option value="todas">Todas</option>
            <option value="cajueiro">Cajueiro</option>
            <option value="mangueira">Mangueira</option>
            <option value="goiabeira">Goiabeira</option>
            <option value="coqueiro">Coqueiro</option>
            <option value="aceroleira">Aceroleira</option>
            <option value="maracujazeiro">Maracujazeiro</option>
          </select>
        </div>

        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={showRegions}
              onChange={(e) => setShowRegions(e.target.checked)}
            />
            Mostrar Regiões Frutíferas
          </label>
        </div>
      </div>

      <MapContainer 
        center={[-5.20, -39.50]} 
        zoom={8} 
        minZoom={8}
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

        <MapClickHandler onMapClick={handleMapClick} />

        {/* Regiões com frutas existentes */}
        {showRegions && filteredRegions.map(region => (
          <Circle
            key={region.id}
            center={[region.lat, region.lng]}
            radius={region.radius}
            pathOptions={{
              color: getCircleColor(region.ndvi),
              fillColor: getCircleColor(region.ndvi),
              fillOpacity: 0.2
            }}
          >
            <Popup>
              <div className="region-popup">
                <h4>🌳 {region.fruit}</h4>
                <p><strong>NDVI:</strong> {region.ndvi}</p>
                <p><strong>Status:</strong> {region.ndvi > 0.6 ? 'Saudável' : 'Moderado'}</p>
                <p><strong>Área:</strong> ~{(region.radius / 1000).toFixed(1)} km de raio</p>
              </div>
            </Popup>
          </Circle>
        ))}

        {/* Marcador do ponto clicado */}
        {clickedPoint && (
          <Marker position={clickedPoint}>
            <Popup>
              <div className="simple-popup">
                <p>📍 Ponto analisado</p>
                <p>Coordenadas: {clickedPoint.lat.toFixed(4)}, {clickedPoint.lng.toFixed(4)}</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Modal de Análise */}
      {showAnalysisModal && (
        <div className="analysis-modal-overlay" onClick={() => setShowAnalysisModal(false)}>
          <div className="analysis-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={() => setShowAnalysisModal(false)}
            >
              ×
            </button>
            
            {isAnalyzing ? (
              <div className="analyzing">
                <h3>🔍 Analisando região...</h3>
                <div className="loading-spinner"></div>
              </div>
            ) : pointAnalysis && clickedPoint ? (
              <div className="analysis-content">
                <h3>📍 Análise do Ponto</h3>
                
                <div className="analysis-grid">
                  <div className="analysis-item">
                    <span className="label">Coordenadas:</span>
                    <span className="value">{clickedPoint.lat.toFixed(4)}, {clickedPoint.lng.toFixed(4)}</span>
                  </div>
                  <div className="analysis-item">
                    <span className="label">NDVI:</span>
                    <span className="value">{pointAnalysis.ndvi}</span>
                  </div>
                  <div className="analysis-item">
                    <span className="label">Solo:</span>
                    <span className="value">{pointAnalysis.soilType}</span>
                  </div>
                  <div className="analysis-item">
                    <span className="label">Pluviometria:</span>
                    <span className="value">{pointAnalysis.rainfall} mm/ano</span>
                  </div>
                  <div className="analysis-item">
                    <span className="label">Temp. Média:</span>
                    <span className="value">{pointAnalysis.temperature}°C</span>
                  </div>
                  <div className="analysis-item">
                    <span className="label">Água:</span>
                    <span className="value">{pointAnalysis.waterAvailability}</span>
                  </div>
                </div>
                
                {pointAnalysis.suggestions.length > 0 ? (
                  <div className="suggestions-section">
                    <h4>🌱 Sugestões de Plantio</h4>
                    <div className="suggestions-grid">
                      {pointAnalysis.suggestions.map((fruit, idx) => (
                        <div key={idx} className="suggestion-card">
                          <div className="suggestion-header">
                            <h5>{fruit.name}</h5>
                            <span className={`viability viability-${fruit.viability.toLowerCase()}`}>
                              {fruit.viability}
                            </span>
                          </div>
                          <p className="benefits">{fruit.benefits}</p>
                          <div className="fruit-specs">
                            <span>📏 {fruit.spacing}</span>
                            <span>⏱️ {fruit.production}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="no-suggestions">
                    <h4>⚠️ Condições Inadequadas</h4>
                    <p>Esta região não apresenta condições ideais para fruticultura. Considere irrigação ou culturas mais resistentes.</p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    
      <div className="info-section">
        <h3>🗺️ Mapeamento de Frutas no Semiárido</h3>
        
        <div className="info-grid">
          <div className="info-card">
            <h4>🔍 Como Usar</h4>
            <p><strong>Clique no mapa</strong> para obter análise detalhada do solo, NDVI e sugestões personalizadas de frutas adequadas para aquela região.</p>
          </div>

          <div className="info-card">
            <h4>🌳 Regiões Mapeadas</h4>
            <p>Os <strong>círculos coloridos</strong> representam áreas onde já existem cultivos de frutas. Verde indica vegetação saudável (NDVI alto).</p>
          </div>

          <div className="info-card">
            <h4>📊 Análise NDVI</h4>
            <p>O <strong>NDVI</strong> mede a saúde da vegetação (0 a 1). Valores altos indicam melhor capacidade de suporte para fruticultura.</p>
          </div>

          <div className="info-card">
            <h4>🌱 Sugestões Inteligentes</h4>
            <p>Baseadas em NDVI, tipo de solo e pluviometria, o sistema sugere as <strong>frutas mais adequadas</strong> para cada ponto.</p>
          </div>
        </div>

        <div className="legend">
          <h4>Legenda de Cores (NDVI):</h4>
          <div className="legend-items">
            <span className="legend-item">
              <span className="color-box" style={{backgroundColor: '#2ecc71'}}></span> 
              Alto (0.6-1.0) - Vegetação Saudável
            </span>
            <span className="legend-item">
              <span className="color-box" style={{backgroundColor: '#f39c12'}}></span> 
              Médio (0.4-0.6) - Vegetação Moderada
            </span>
            <span className="legend-item">
              <span className="color-box" style={{backgroundColor: '#e74c3c'}}></span> 
              Baixo (0.0-0.4) - Solo Exposto/Vegetação Escassa
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;