import './Home.css'
import { FeatureFlag } from '../components/featureFlag'

const Home = () => {
  const fallbackDarkMode = () => {
    return (
      <div className="feature-status disabled">
        <p>❌ Desabilitado</p>
      </div>
    )
  }

  const fallbackAdvancedSearch = () => {
    return (
      <div className="feature-status disabled">
        <p>❌ Desabilitado</p>
      </div>
    )
  }

  const fallbackAnalytics = () => {
    return (
      <div className="feature-status disabled">
        <p>❌ Desabilitado</p>
      </div>
    )
  }

  const fallbackNotifications = () => {
    return (
      <div className="feature-status disabled">
        <p>❌ Desabilitado</p>
      </div>
    )
  }

  const fallbackExperimentalFeatures = () => {
    return (
      <div className="feature-status disabled">
        <p>❌ Desabilitado</p>
      </div>
    )
  }

  return (
    <div className="home">
      <div className="hero">
        <h1>🚀 Feature Flag POC com Unleash</h1>
        <p>Demonstração de como usar feature flags para controlar funcionalidades em tempo real</p>
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <h3>🎨 Dark Mode</h3>
          <FeatureFlag featureName="dark-mode" fallback={fallbackDarkMode()}>
            <div className={`feature-status enabled`}>
              <p>✅ Habilitado</p>
            </div>
            <p className="feature-description">
              Tema escuro está disponível para os usuários
            </p>
          </FeatureFlag>
        </div>

        <div className="feature-card">
          <h3>🔍 Busca Avançada</h3>
          <FeatureFlag featureName="advanced-search" fallback={fallbackAdvancedSearch()}>
            <div className={`feature-status enabled`}>
              <p>✅ Habilitado</p>
            </div>
            <p className="feature-description">
              Funcionalidade de busca avançada com filtros
            </p>
          </FeatureFlag>
        </div>

        <div className="feature-card">
          <h3>📊 Analytics</h3>
          <FeatureFlag featureName="analytics" fallback={fallbackAnalytics()}>
            <div className={`feature-status enabled`}>
              <p>✅ Habilitado</p>
            </div>
            <p className="feature-description">
              Dashboard de analytics e métricas
            </p>
          </FeatureFlag>
        </div>

        <div className="feature-card">
          <h3>🔔 Notificações</h3>
          <FeatureFlag featureName="notifications" fallback={fallbackNotifications()}>
            <div className={`feature-status enabled`}>
              <p>✅ Habilitado</p>
            </div>
            <p className="feature-description">
              Sistema de notificações em tempo real
            </p>
          </FeatureFlag>
        </div>

        <div className="feature-card">
          <h3>🧪 Funcionalidades Experimentais</h3>
          <FeatureFlag featureName="experimental-features" fallback={fallbackExperimentalFeatures()}>
            <div className={`feature-status enabled`}>
              <p>✅ Habilitado</p>
            </div>
            <p className="feature-description">
              Funcionalidades experimentais
            </p>
          </FeatureFlag>
        </div>

      </div>


      <div className="info-section">
        <h2>ℹ️ Como Funciona</h2>
        <p>
          Esta POC demonstra como o Unleash pode ser usado para controlar funcionalidades
          em tempo real sem necessidade de deploy. As feature flags são verificadas
          através do backend que se comunica com o Unleash.
        </p>
        <div className="tech-stack">
          <h3>Stack Tecnológico:</h3>
          <ul>
            <li><strong>Backend:</strong> NestJS + TypeScript + Unleash Client</li>
            <li><strong>Frontend:</strong> React + TypeScript + Vite + React Router</li>
            <li><strong>Feature Flags:</strong> Unleash Open Source</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Home
