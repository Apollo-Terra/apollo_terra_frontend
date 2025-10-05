import { useState, useEffect } from 'react';
import { MapPin, TrendingUp, Droplets, Calendar, Filter, Download, Eye, AlertCircle, Leaf, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import '../styles/Dashboard.css';
import api from '../services/apiService';

const Dashboard = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [areasData, setAreasData] = useState([]);
  const [fruitStats, setFruitStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isOnline, setIsOnline] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [areasResponse, statsResponse] = await Promise.all([
        api.get(`/dashboard/areas?period=${selectedPeriod}`),
        api.get(`/dashboard/fruit-stats?period=${selectedPeriod}`)
      ]);
      
      setAreasData(areasResponse.data.areas || []);
      setFruitStats(statsResponse.data.fruits || []);
      setLastUpdate(new Date());
      setIsOnline(true);
    } catch (err) {
      setError('Erro ao carregar dados do dashboard. Tente novamente.');
      setIsOnline(false);
      console.error('Erro na API:', err);
    } finally {
      setLoading(false);
    }
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

  const handleExport = () => {
    // Implementar lógica de exportação
    const dataStr = JSON.stringify(areasData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-${new Date().toISOString()}.json`;
    link.click();
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

      {/* Main Grid */}
      <div className="main-grid">
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

        {/* Tabela de Áreas */}
        <section className="monitored-areas-section">
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
                      <button className="action-btn">
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Bottom Grid - Alertas e Mapa */}
      <div className="bottom-grid">
        {/* Alertas */}
        <section className="alerts-section">
          <div className="alerts-header">
            <AlertCircle size={28} />
            <h2 className="section-title">Alertas Recentes</h2>
          </div>

          <div className="alerts-list">
            <div className="alert-item warning">
              <div className="alert-content">
                <AlertCircle size={20} />
                <div>
                  <h3 className="alert-title">Nível de Umidade Baixo</h3>
                  <p className="alert-description">
                    Jaguaruana - Mamão apresenta 75% de umidade
                  </p>
                  <p className="alert-time">Há 2 horas</p>
                </div>
              </div>
            </div>

            <div className="alert-item success">
              <div className="alert-content">
                <AlertCircle size={20} />
                <div>
                  <h3 className="alert-title">Crescimento Acelerado</h3>
                  <p className="alert-description">
                    Russas - Bananeiras com 15% de crescimento
                  </p>
                  <p className="alert-time">Hoje às 10:30</p>
                </div>
              </div>
            </div>

            <div className="alert-item info">
              <div className="alert-content">
                <AlertCircle size={20} />
                <div>
                  <h3 className="alert-title">Nova Varredura Concluída</h3>
                  <p className="alert-description">
                    Aracati - Área de coco mapeada com sucesso
                  </p>
                  <p className="alert-time">Hoje às 14:30</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mapa */}
        <section className="map-section">
          <h2 className="section-title">Distribuição Geográfica</h2>
          
          <div className="map-container">
            <div className="map-overlay">
              <MapPin size={24} />
              <span>{areasData.length} áreas ativas no Ceará</span>
            </div>
          </div>

          <div className="map-stats">
            <div className="map-stat-item">
              <p className="map-stat-label">Litoral</p>
              <p className="map-stat-value">2 áreas</p>
            </div>
            <div className="map-stat-item">
              <p className="map-stat-label">Sertão</p>
              <p className="map-stat-value">3 áreas</p>
            </div>
            <div className="map-stat-item">
              <p className="map-stat-label">Vale</p>
              <p className="map-stat-value">1 área</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;