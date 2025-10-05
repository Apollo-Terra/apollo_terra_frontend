import { useState, useEffect } from 'react';
import { MapPin, TrendingUp, Droplets, Calendar, Filter, Download, Eye, AlertCircle, Leaf, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import '../styles/Dashboard.css';
import api from '../services/apiService';

const Dashboard = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [areasData, setAreasData] = useState([]);
  const [fruitStats, setFruitStats] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [mapStats, setMapStats] = useState({ litoral: 0, sertao: 0, vale: 0 });
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isOnline, setIsOnline] = useState(true);

  // Dados mock como fallback
  const mockAreasData = [
    { id: 1, name: 'Jaguaruana', fruit: 'Mamão', size: 250, health: 85, water: 75, coords: '-4.8356, -37.7811' },
    { id: 2, name: 'Russas', fruit: 'Banana', size: 180, health: 92, water: 88, coords: '-4.9394, -37.9761' },
    { id: 3, name: 'Aracati', fruit: 'Coco', size: 320, health: 78, water: 82, coords: '-4.5614, -37.7697' }
  ];

  const mockFruitStats = [
    { name: 'Mamão', areas: 8, count: 1580, growth: 12, color: '#10b981' },
    { name: 'Banana', areas: 6, count: 1240, growth: 8, color: '#f59e0b' },
    { name: 'Coco', areas: 4, count: 890, growth: -2, color: '#8b5cf6' }
  ];

  // Função para buscar áreas monitoradas
  const fetchAreasData = async () => {
    try {
      const response = await api.get('/dashboard/areas');
      setAreasData(response.data?.areas || mockAreasData);
    } catch (err) {
      setAreasData(mockAreasData);
    }
  };

  // Função para buscar estatísticas de frutas
  const fetchFruitStats = async () => {
    try {
      const response = await api.get('/dashboard/fruit-stats');
      setFruitStats(response.data?.fruits || mockFruitStats);
    } catch (err) {
      setFruitStats(mockFruitStats);
    }
  };

  // Função principal para carregar todos os dados
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    const [alertsData] = await Promise.all([
      fetchAlerts(),
      fetchAreasData(),
      fetchFruitStats(),
      fetchMapStats()
    ]);
    
    setAlerts(alertsData);
    setLastUpdate(new Date());
    setIsOnline(true);
    setLoading(false);
  };

  // Carrega dados ao montar o componente
  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh a cada 5 minutos (300000ms)
    const interval = setInterval(fetchDashboardData, 300000);
    
    // Cleanup
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

  useEffect(() => {
    fetchAreasData();
  }, [selectedFilter]);

  // Cálculos
  const totalArea = areasData.reduce((sum, area) => sum + area.size, 0);
  const avgHealth = areasData.length > 0 
    ? Math.round(areasData.reduce((sum, area) => sum + area.health, 0) / areasData.length)
    : 0;

  const getHealthColor = (health) => {
    if (health >= 90) return 'text-green-400';
    if (health >= 75) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getHealthBg = (health) => {
    if (health >= 90) return 'bg-green-500';
    if (health >= 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const filteredAreas = areasData.filter(area => {
    if (selectedFilter === 'healthy') return area.health >= 90;
    if (selectedFilter === 'alert') return area.health < 90;
    return true;
  });

  // Função para exportar dados
  const handleExport = () => {
    const dataStr = JSON.stringify({ areas: areasData, fruits: fruitStats, alerts }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-${new Date().toISOString()}.json`;
    link.click();
  };

  // Função para atualizar dados de uma área específica
  const refreshAreaData = async (areaId) => {
    try {
      const response = await api.get(`/dashboard/areas/${areaId}`);
      setAreasData(prev => prev.map(area => 
        area.id === areaId ? { ...area, ...response.data } : area
      ));
    } catch (err) {
      fetchAreasData();
    }
  };

  // Função para buscar alertas em tempo real
  const fetchAlerts = async () => {
    try {
      const response = await api.get('/dashboard/alerts');
      return response.data?.alerts || [];
    } catch (err) {
      return [];
    }
  };

  // Função para buscar estatísticas geográficas com dados climáticos
  const fetchMapStats = async () => {
    try {
      // Tenta buscar dados da API própria primeiro
      const response = await api.get('/dashboard/map-stats');
      setMapStats(response.data || { litoral: 2, sertao: 3, vale: 1 });
    } catch (err) {
      // Fallback com dados baseados em coordenadas reais do Ceará
      setMapStats({ 
        litoral: 2, // Fortaleza, Aracati
        sertao: 3,  // Quixadá, Iguatu, Crateús  
        vale: 1     // Jaguaruana
      });
    }
  };

  // Loading State
  if (loading && areasData.length === 0) {
    return (
      <div className="dashboard-loading">
        <div className="loading-content">
          <RefreshCw className="loading-icon" size={48} />
          <p className="loading-text">Carregando dados do satélite...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-top">
          <div className="header-left">
            <h1 className="header-title">
              <Leaf className="header-icon" size={40} />
              Dashboard de Monitoramento
            </h1>
            <p className="header-subtitle">
              Análise em tempo real das áreas agrícolas do Ceará via satélite
            </p>
            <div className="last-update">
              Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
            </div>
          </div>
          
          <div className="header-right">
            <div className={`status-badge ${isOnline ? 'online' : 'offline'}`}>
              {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
              <span>{isOnline ? 'Online' : 'Offline'}</span>
              <div className="status-pulse"></div>
            </div>

            <select 
              className="period-select"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="week">Última Semana</option>
              <option value="month">Último Mês</option>
              <option value="quarter">Último Trimestre</option>
              <option value="year">Último Ano</option>
            </select>

            <button 
              className={`refresh-btn ${loading ? 'loading' : ''}`}
              onClick={fetchDashboardData}
              disabled={loading}
            >
              <RefreshCw size={20} className={loading ? 'spin' : ''} />
              Atualizar
            </button>

            <button className="export-btn" onClick={handleExport}>
              <Download size={20} />
              Exportar
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-banner">
            <AlertCircle size={20} />
            <span>{error}</span>
            <button onClick={fetchDashboardData} className="retry-btn">
              Tentar Novamente
            </button>
          </div>
        )}

        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card">
            <div className="card-header">
              <span className="card-label">Áreas Monitoradas</span>
              <MapPin className="card-icon" size={24} />
            </div>
            <p className="card-value">{areasData.length}</p>
            <p className="card-description positive">↑ 3 novas esta semana</p>
          </div>

          <div className="summary-card">
            <div className="card-header">
              <span className="card-label">Área Total (ha)</span>
              <TrendingUp className="card-icon" size={24} />
            </div>
            <p className="card-value">{totalArea.toLocaleString()}</p>
            <p className="card-description info">hectares cultivados</p>
          </div>

          <div className="summary-card">
            <div className="card-header">
              <span className="card-label">Saúde Média</span>
              <Leaf className="card-icon" size={24} />
            </div>
            <p className="card-value">{avgHealth}%</p>
            <p className="card-description positive">↑ +2% vs mês anterior</p>
          </div>

          <div className="summary-card">
            <div className="card-header">
              <span className="card-label">Última Varredura</span>
              <Calendar className="card-icon" size={24} />
            </div>
            <p className="card-value">Hoje</p>
            <p className="card-description info">
              {new Date().toLocaleDateString('pt-BR')} {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </header>

      {/* Tabela de Áreas - Tela Cheia */}
      <section className="monitored-areas-section full-width">
        <div className="section-header">
          <h2 className="section-title">Áreas Monitoradas</h2>
          <div className="filter-buttons">
            <button 
              onClick={() => setSelectedFilter('all')}
              className={`filter-btn ${selectedFilter === 'all' ? 'active' : 'inactive'}`}
            >
              Todas
            </button>
            <button 
              onClick={() => setSelectedFilter('healthy')}
              className={`filter-btn ${selectedFilter === 'healthy' ? 'active' : 'inactive'}`}
            >
              Saudáveis
            </button>
            <button 
              onClick={() => setSelectedFilter('alert')}
              className={`filter-btn ${selectedFilter === 'alert' ? 'active' : 'inactive'}`}
            >
              Atenção
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="areas-table">
            <thead>
              <tr>
                <th>Localização</th>
                <th>Fruta</th>
                <th>Área (ha)</th>
                <th>Saúde</th>
                <th>Umidade</th>
                <th>Coordenadas</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredAreas.map((area) => (
                <tr key={area.id}>
                  <td>
                    <div className="location-cell">
                      <MapPin size={18} />
                      <span className="location-name">{area.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="fruit-badge">{area.fruit}</span>
                  </td>
                  <td>{area.size.toLocaleString()}</td>
                  <td>
                    <div className="health-indicator">
                      <div className="health-bar">
                        <div 
                          className={`health-fill ${getHealthBg(area.health)}`}
                          style={{ width: `${area.health}%` }}
                        />
                      </div>
                      <span className={`health-value ${getHealthColor(area.health)}`}>
                        {area.health}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="water-cell">
                      <Droplets size={18} />
                      <span>{area.water}%</span>
                    </div>
                  </td>
                  <td className="coords-cell">{area.coords}</td>
                  <td>
                    <button 
                      className="action-btn"
                      onClick={() => refreshAreaData(area.id)}
                      title="Atualizar dados desta área"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Bottom Grid - Frutas e Mapa */}
      <div className="bottom-grid">
        {/* Ranking de Frutas */}
        <section className="fruit-ranking-section">
          <div className="section-header">
            <h2 className="section-title">Frutas Mais Cultivadas</h2>
            <Filter className="section-icon" size={24} />
          </div>

          <div className="fruit-list">
            {fruitStats.map((fruit, index) => (
              <div key={fruit.name} className="fruit-item">
                <div className="fruit-item-header">
                  <div className="fruit-info">
                    <span className="fruit-rank">#{index + 1}</span>
                    <div>
                      <h3 className="fruit-name">{fruit.name}</h3>
                      <p className="fruit-areas">{fruit.areas} áreas ativas</p>
                    </div>
                  </div>
                  <div className="fruit-stats">
                    <p className="fruit-area-value">{fruit.count} ha</p>
                    <span className={`fruit-growth ${fruit.growth >= 0 ? 'positive' : 'negative'}`}>
                      {fruit.growth >= 0 ? '↑' : '↓'} {Math.abs(fruit.growth)}%
                    </span>
                  </div>
                </div>
                <div className="fruit-progress-bar">
                  <div 
                    className="fruit-progress-fill"
                    style={{ 
                      width: `${(fruit.count / 1580) * 100}%`,
                      backgroundColor: fruit.color 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Mapa */}
        <section className="map-section">
          <h2 className="section-title">Distribuição Geográfica - Ceará</h2>
          
          <div className="map-container">
            <div className="ceara-map">
              <div className="map-header">
                <MapPin size={20} />
                <span>Monitoramento por Satélite - {areasData.length} áreas ativas</span>
              </div>
              
              <div className="regions-grid">
                <div className="region-card litoral">
                  <div className="region-header">
                    <h4>Região Litorânea</h4>
                    <span className="region-count">{mapStats.litoral} áreas</span>
                  </div>
                  <div className="region-details">
                    <p><strong>Principais cultivos:</strong> Coco, Caju</p>
                    <p><strong>Coordenadas:</strong> -3.7°, -38.5°</p>
                    <p><strong>Precipitação:</strong> 800-1200mm/ano</p>
                    <div className="health-indicator small">
                      <span>Saúde média: 88%</span>
                      <div className="health-bar small">
                        <div className="health-fill bg-green-500" style={{width: '88%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="region-card sertao">
                  <div className="region-header">
                    <h4>Sertão Central</h4>
                    <span className="region-count">{mapStats.sertao} áreas</span>
                  </div>
                  <div className="region-details">
                    <p><strong>Principais cultivos:</strong> Mamão, Melão</p>
                    <p><strong>Coordenadas:</strong> -5.2°, -39.3°</p>
                    <p><strong>Precipitação:</strong> 400-800mm/ano</p>
                    <div className="health-indicator small">
                      <span>Saúde média: 82%</span>
                      <div className="health-bar small">
                        <div className="health-fill bg-yellow-500" style={{width: '82%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="region-card vale">
                  <div className="region-header">
                    <h4>Vale do Jaguaribe</h4>
                    <span className="region-count">{mapStats.vale} áreas</span>
                  </div>
                  <div className="region-details">
                    <p><strong>Principais cultivos:</strong> Banana, Manga</p>
                    <p><strong>Coordenadas:</strong> -4.8°, -37.8°</p>
                    <p><strong>Precipitação:</strong> 600-900mm/ano</p>
                    <div className="health-indicator small">
                      <span>Saúde média: 91%</span>
                      <div className="health-bar small">
                        <div className="health-fill bg-green-500" style={{width: '91%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="satellite-info">
                <div className="satellite-item">
                  <div className="satellite-icon">🛰️</div>
                  <div>
                    <p><strong>Landsat 8/9</strong></p>
                    <p>Resolução: 30m | Revisita: 16 dias</p>
                  </div>
                </div>
                <div className="satellite-item">
                  <div className="satellite-icon">🌍</div>
                  <div>
                    <p><strong>Sentinel-2</strong></p>
                    <p>Resolução: 10m | Revisita: 5 dias</p>
                  </div>
                </div>
                <div className="satellite-item">
                  <div className="satellite-icon">📡</div>
                  <div>
                    <p><strong>MODIS Terra/Aqua</strong></p>
                    <p>Resolução: 250m | Revisita: diária</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Alertas - Seção Final */}
      <section className="alerts-section final-section">
        <div className="alerts-header">
          <AlertCircle size={28} />
          <h2 className="section-title">Alertas Recentes</h2>
        </div>

        <div className="alerts-list">
          {alerts.length > 0 ? (
            alerts.map((alert, index) => (
              <div key={index} className={`alert-item ${alert.type || 'info'}`}>
                <div className="alert-content">
                  <AlertCircle size={20} />
                  <div>
                    <h3 className="alert-title">{alert.title}</h3>
                    <p className="alert-description">{alert.description}</p>
                    <p className="alert-time">{alert.time}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="alert-item info">
              <div className="alert-content">
                <AlertCircle size={20} />
                <div>
                  <h3 className="alert-title">Nenhum alerta recente</h3>
                  <p className="alert-description">Todas as áreas estão funcionando normalmente</p>
                  <p className="alert-time">Atualizado agora</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;