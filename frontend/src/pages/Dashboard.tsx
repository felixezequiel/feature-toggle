import { useState, useEffect } from 'react'
import './Dashboard.css'
import { SimpleFeatureFlag } from '../components/simpleFeatureFlag'

interface DashboardData {
  users: number
  revenue: number
  growth: number
  conversionRate: number
  roi: number
}

interface ChartData {
  labels: string[]
  data: number[]
}

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    users: 1250,
    revenue: 45000,
    growth: 12.5,
    conversionRate: 3.2,
    roi: 245
  })

  const [isDarkMode, setIsDarkMode] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  // Simular dados em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setDashboardData(prev => ({
        users: prev.users + Math.floor(Math.random() * 10 - 5),
        revenue: prev.revenue + Math.floor(Math.random() * 1000 - 500),
        growth: prev.growth + (Math.random() * 2 - 1),
        conversionRate: prev.conversionRate + (Math.random() * 0.2 - 0.1),
        roi: prev.roi + (Math.random() * 10 - 5)
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Dados simulados para gráficos
  const chartData: ChartData = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    data: [1200, 1250, 1300, 1280, 1350, 1400]
  }

  const handleMetricClick = (metricName: string) => {
    setSelectedMetric(selectedMetric === metricName ? null : metricName)
  }

  const handleExport = async (type: string) => {
    setIsExporting(true)
    // Simular processo de exportação
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsExporting(false)
    alert(`Exportação ${type} concluída com sucesso!`)
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.body.classList.toggle('dark-mode')
  }

  const fallbackAdvancedMetrics = () => {
    return (
      <div className="feature-status disabled">
        <p>❌ Desabilitado</p>
        <small>Métricas avançadas não estão disponíveis</small>
      </div>
    )
  }

  const fallbackAdvancedCharts = () => {
    return (
      <div className="feature-status disabled">
        <p>❌ Desabilitado</p>
        <small>Gráficos avançados não estão disponíveis</small>
      </div>
    )
  }

  const fallbackExportFeatures = () => {
    return (
      <div className="feature-status disabled">
        <p>❌ Desabilitado</p>
        <small>Funcionalidades de exportação não estão disponíveis</small>
      </div>
    )
  }

  const fallbackDarkMode = () => {
    return (
      <div className="feature-status disabled">
        <p>❌ Desabilitado</p>
        <small>Modo escuro não está disponível</small>
      </div>
    )
  }

  const renderMetricCard = (title: string, value: string | number, change: string, icon: string, isAdvanced = false, metricName?: string) => (
    <div
      className={`metric-card ${isAdvanced ? 'advanced' : ''} ${selectedMetric === metricName ? 'selected' : ''}`}
      onClick={() => metricName && handleMetricClick(metricName)}
      style={{ cursor: metricName ? 'pointer' : 'default' }}
    >
      <h3>{icon} {title}</h3>
      <div className="metric-value">{value}</div>
      <div className="metric-change positive">{change}</div>
      {metricName && (
        <div className="metric-details">
          <small>Clique para mais detalhes</small>
        </div>
      )}
    </div>
  )

  const renderChart = (title: string, description: string, data?: ChartData) => (
    <div className="chart-placeholder">
      <h4>{title}</h4>
      <div className="chart-content">
        {data ? (
          <div className="chart-data">
            <div className="chart-bars">
              {data.data.map((value, index) => (
                <div
                  key={index}
                  className="chart-bar"
                  style={{ height: `${(value / Math.max(...data.data)) * 100}%` }}
                  title={`${data.labels[index]}: ${value}`}
                />
              ))}
            </div>
            <div className="chart-labels">
              {data.labels.map((label, index) => (
                <span key={index} className="chart-label">{label}</span>
              ))}
            </div>
          </div>
        ) : (
          description
        )}
      </div>
    </div>
  )

  return (
    <div className={`dashboard ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="dashboard-header">
        <h1>📊 Dashboard Inteligente</h1>
        <p>Visão geral completa da aplicação com funcionalidades controladas por feature flags</p>
        <div className="header-stats">
          <span>🔄 Atualizado em tempo real</span>
          <span>⚡ Performance otimizada</span>
        </div>
      </div>

      <div className="metrics-grid">
        {renderMetricCard(
          'Usuários Ativos',
          dashboardData.users.toLocaleString(),
          `+${dashboardData.growth.toFixed(1)}%`,
          '👥',
          false,
          'users'
        )}

        {renderMetricCard(
          'Receita Mensal',
          `R$ ${dashboardData.revenue.toLocaleString()}`,
          '+8.2%',
          '💰',
          false,
          'revenue'
        )}

        {renderMetricCard(
          'Taxa de Conversão',
          `${dashboardData.conversionRate.toFixed(1)}%`,
          '+1.1%',
          '📈',
          false,
          'conversion'
        )}

        {/* Feature flag para métrica avançada */}
        <SimpleFeatureFlag featureName="advanced-metrics" fallback={fallbackAdvancedMetrics()}>
          {renderMetricCard(
            'ROI por Campanha',
            `${dashboardData.roi.toFixed(0)}%`,
            '+15.3%',
            '🎯',
            true,
            'roi'
          )}
        </SimpleFeatureFlag>
      </div>

      {/* Seção de insights rápidos */}
      <div className="quick-insights">
        <h2>💡 Insights Rápidos</h2>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon">🚀</div>
            <h4>Crescimento Acelerado</h4>
            <p>Usuários cresceram 12.5% este mês</p>
          </div>
          <div className="insight-card">
            <div className="insight-icon">💰</div>
            <h4>Receita Estável</h4>
            <p>Receita mensal mantém tendência positiva</p>
          </div>
          <div className="insight-card">
            <div className="insight-icon">📊</div>
            <h4>Conversão Melhorou</h4>
            <p>Taxa de conversão aumentou 1.1%</p>
          </div>
        </div>
      </div>

      {/* Feature flag para gráficos avançados */}
      <SimpleFeatureFlag featureName="advanced-charts" fallback={fallbackAdvancedCharts()}>
        <div className="charts-section">
          <h2>📈 Análise Visual Avançada</h2>
          <div className="charts-grid">
            {renderChart('Crescimento de Usuários', 'Dados de crescimento de usuários ao longo do tempo', chartData)}
            {renderChart('Análise de Receita', 'Análise detalhada de receita por período')}
          </div>
        </div>
      </SimpleFeatureFlag>

      {/* Feature flag para funcionalidades de exportação */}
      <SimpleFeatureFlag featureName="export-features" fallback={fallbackExportFeatures()}>
        <div className="export-section">
          <h2>📤 Exportação Inteligente</h2>
          <p className="section-description">
            Exporte seus dados em diferentes formatos para análise externa
          </p>
          <div className="export-options">
            <button
              className="export-btn"
              onClick={() => handleExport('PDF')}
              disabled={isExporting}
            >
              {isExporting ? '⏳ Processando...' : '📊 Exportar Relatório PDF'}
            </button>
            <button
              className="export-btn"
              onClick={() => handleExport('CSV')}
              disabled={isExporting}
            >
              {isExporting ? '⏳ Processando...' : '📈 Exportar Dados CSV'}
            </button>
            <button
              className="export-btn"
              onClick={() => handleExport('Dashboard')}
              disabled={isExporting}
            >
              {isExporting ? '⏳ Processando...' : '📋 Exportar Dashboard'}
            </button>
          </div>
        </div>
      </SimpleFeatureFlag>

      {/* Feature flag para modo escuro */}
      <SimpleFeatureFlag featureName="dark-mode" fallback={fallbackDarkMode()} variant='dark-mode'>
        <div className="theme-toggle">
          <h3>🎨 Personalização Avançada</h3>
          <p>Personalize sua experiência com temas e configurações</p>
          <div className="theme-controls">
            <button
              className={`theme-btn ${isDarkMode ? 'active' : ''}`}
              onClick={toggleDarkMode}
            >
              {isDarkMode ? '☀️ Modo Claro' : '🌙 Modo Escuro'}
            </button>
            <div className="theme-info">
              <small>Clique para alternar entre os temas</small>
            </div>
          </div>
        </div>
      </SimpleFeatureFlag>

      {/* Seção de feature flags com melhor organização */}
      <div className="feature-flags-info">
        <h3>🔧 Controle de Funcionalidades</h3>
        <p className="section-description">
          Gerencie e monitore todas as feature flags ativas no sistema
        </p>
        <div className="flags-list">
          <div className="flag-item">
            <div className="flag-header">
              <span className="flag-name">advanced-metrics</span>
              <SimpleFeatureFlag featureName="advanced-metrics" fallback={fallbackAdvancedMetrics()} variant='advanced-metrics'>
                <div className={`flag-status enabled`}>
                  <p>✅ Habilitado</p>
                </div>
              </SimpleFeatureFlag>
            </div>
            <p className="feature-description">
              Funcionalidade de métricas avançadas com análise profunda
            </p>
            <div className="flag-meta">
              <span className="flag-version">v2.1.0</span>
              <span className="flag-date">Atualizado há 2 dias</span>
            </div>
          </div>

          <div className="flag-item">
            <div className="flag-header">
              <span className="flag-name">advanced-charts</span>
              <SimpleFeatureFlag featureName="advanced-charts" fallback={fallbackAdvancedCharts()} variant='advanced-charts'>
                <div className={`flag-status enabled`}>
                  <p>✅ Habilitado</p>
                </div>
              </SimpleFeatureFlag>
            </div>
            <p className="feature-description">
              Gráficos interativos e visualizações avançadas
            </p>
            <div className="flag-meta">
              <span className="flag-version">v1.8.2</span>
              <span className="flag-date">Atualizado há 1 semana</span>
            </div>
          </div>

          <div className="flag-item">
            <div className="flag-header">
              <span className="flag-name">export-features</span>
              <SimpleFeatureFlag featureName="export-features" fallback={fallbackExportFeatures()} variant='export-features'>
                <div className={`flag-status enabled`}>
                  <p>✅ Habilitado</p>
                </div>
              </SimpleFeatureFlag>
            </div>
            <p className="feature-description">
              Sistema completo de exportação de dados
            </p>
            <div className="flag-meta">
              <span className="flag-version">v2.0.0</span>
              <span className="flag-date">Atualizado hoje</span>
            </div>
          </div>

          <div className="flag-item">
            <div className="flag-header">
              <span className="flag-name">dark-mode</span>
              <SimpleFeatureFlag featureName="dark-mode" fallback={fallbackDarkMode()}>
                <div className={`flag-status enabled`}>
                  <p>✅ Habilitado</p>
                </div>
              </SimpleFeatureFlag>
            </div>
            <p className="feature-description">
              Tema escuro para melhor experiência visual
            </p>
            <div className="flag-meta">
              <span className="flag-version">v1.5.1</span>
              <span className="flag-date">Atualizado há 3 dias</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer com informações adicionais */}
      <div className="dashboard-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>📊 Sobre o Dashboard</h4>
            <p>Dashboard inteligente com feature flags para controle granular de funcionalidades</p>
          </div>
          <div className="footer-section">
            <h4>🔧 Tecnologias</h4>
            <p>React, TypeScript, CSS3, Feature Flags</p>
          </div>
          <div className="footer-section">
            <h4>📈 Status</h4>
            <p>Sistema operacional • {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
