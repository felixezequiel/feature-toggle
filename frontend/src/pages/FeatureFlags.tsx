import { useState, useEffect } from 'react'
import { useFeatureFlag } from '../hooks/useFeatureFlag'
import './FeatureFlags.css'

interface FeatureFlagInfo {
  name: string
  isEnabled: boolean
  variant: string
  description?: string
}

const FeatureFlags = () => {
  const { isEnabled, getVariant, refreshFlags } = useFeatureFlag()
  const [flags, setFlags] = useState<FeatureFlagInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFlag, setSelectedFlag] = useState<string>('')
  const [userContext, setUserContext] = useState({
    userId: '',
    email: '',
    environment: 'development'
  })

  // Lista de feature flags para demonstração
  const demoFlags: FeatureFlagInfo[] = [
    { name: 'dark-mode', description: 'Habilita o tema escuro na aplicação' },
    { name: 'advanced-search', description: 'Funcionalidade de busca avançada com filtros' },
    { name: 'analytics', description: 'Dashboard de analytics e métricas' },
    { name: 'notifications', description: 'Sistema de notificações em tempo real' },
    { name: 'advanced-metrics', description: 'Métricas avançadas no dashboard' },
    { name: 'advanced-charts', description: 'Gráficos avançados e visualizações' },
    { name: 'export-features', description: 'Funcionalidades de exportação de dados' },
    { name: 'experimental-features', description: 'Funcionalidades experimentais' },
    { name: 'advanced-navbar', description: 'Elementos avançados na barra de navegação' },
    { name: 'ai-assistant', description: 'Assistente de IA integrado' },
    { name: 'multi-language', description: 'Suporte a múltiplos idiomas' }
  ]

  useEffect(() => {
    // Simular carregamento
    const timer = setTimeout(() => {
      const flagsWithStatus = demoFlags.map(flag => ({
        ...flag,
        isEnabled: isEnabled(flag.name),
        variant: getVariant(flag.name)
      }))
      setFlags(flagsWithStatus)
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [isEnabled, getVariant])

  const handleContextChange = (field: string, value: string) => {
    setUserContext(prev => ({ ...prev, [field]: value }))
  }

  const testFlagWithContext = (flagName: string) => {
    const context = {
      userId: userContext.userId || undefined,
      email: userContext.email || undefined,
      environment: userContext.environment || undefined
    }

    const isEnabledWithContext = isEnabled(flagName, context)
    const variantWithContext = getVariant(flagName, context)

    // Atualizar o status da flag testada
    setFlags(prev => prev.map(flag =>
      flag.name === flagName
        ? { ...flag, isEnabled: isEnabledWithContext, variant: variantWithContext }
        : flag
    ))
  }

  if (loading) {
    return (
      <div className="feature-flags-page">
        <div className="loading">
          <div className="spinner"></div>
          <p>Carregando feature flags...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="feature-flags-page">
      <div className="page-header">
        <h1>🔧 Gerenciamento de Feature Flags</h1>
        <p>Visualize e teste todas as feature flags disponíveis na aplicação</p>
      </div>

      <div className="context-section">
        <h2>👤 Contexto do Usuário</h2>
        <p>Configure o contexto para testar como as feature flags se comportam</p>

        <div className="context-form">
          <div className="form-group">
            <label htmlFor="userId">User ID:</label>
            <input
              type="text"
              id="userId"
              value={userContext.userId}
              onChange={(e) => handleContextChange('userId', e.target.value)}
              placeholder="ex: user123"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={userContext.email}
              onChange={(e) => handleContextChange('email', e.target.value)}
              placeholder="ex: user@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="environment">Ambiente:</label>
            <select
              id="environment"
              value={userContext.environment}
              onChange={(e) => handleContextChange('environment', e.target.value)}
            >
              <option value="development">Development</option>
              <option value="staging">Staging</option>
              <option value="production">Production</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flags-section">
        <div className="section-header">
          <h2>🚩 Feature Flags Disponíveis</h2>
          <button
            className="refresh-btn"
            onClick={refreshFlags}
          >
            🔄 Atualizar
          </button>
        </div>

        <div className="flags-grid">
          {flags.map((flag) => (
            <div key={flag.name} className="flag-card">
              <div className="flag-header">
                <h3>{flag.name}</h3>
                <div className={`flag-status ${flag.isEnabled ? 'enabled' : 'disabled'}`}>
                  {flag.isEnabled ? '✅' : '❌'}
                </div>
              </div>

              {flag.description && (
                <p className="flag-description">{flag.description}</p>
              )}

              <div className="flag-details">
                <div className="detail-item">
                  <span className="label">Status:</span>
                  <span className={`value ${flag.isEnabled ? 'enabled' : 'disabled'}`}>
                    {flag.isEnabled ? 'Habilitado' : 'Desabilitado'}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="label">Variante:</span>
                  <span className="value">{flag.variant}</span>
                </div>
              </div>

              <div className="flag-actions">
                <button
                  className="test-btn"
                  onClick={() => testFlagWithContext(flag.name)}
                >
                  🧪 Testar com Contexto
                </button>

                <button
                  className="select-btn"
                  onClick={() => setSelectedFlag(flag.name)}
                >
                  📋 Selecionar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedFlag && (
        <div className="selected-flag-section">
          <h2>🎯 Feature Flag Selecionada: {selectedFlag}</h2>
          <div className="flag-testing">
            <p>Teste esta feature flag com diferentes contextos:</p>

            <div className="test-results">
              <div className="test-result">
                <strong>Sem contexto:</strong>
                <span className={`result ${isEnabled(selectedFlag) ? 'enabled' : 'disabled'}`}>
                  {isEnabled(selectedFlag) ? '✅ Habilitado' : '❌ Desabilitado'}
                </span>
              </div>

              <div className="test-result">
                <strong>Com contexto atual:</strong>
                <span className={`result ${isEnabled(selectedFlag, userContext) ? 'enabled' : 'disabled'}`}>
                  {isEnabled(selectedFlag, userContext) ? '✅ Habilitado' : '❌ Desabilitado'}
                </span>
              </div>

              <div className="test-result">
                <strong>Variante:</strong>
                <span className="result">{getVariant(selectedFlag, userContext)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="info-section">
        <h2>ℹ️ Como Usar</h2>
        <div className="usage-info">
          <div className="usage-item">
            <h3>🔍 Verificar Status</h3>
            <p>Use o hook <code>useFeatureFlag()</code> para verificar se uma feature está habilitada</p>
          </div>

          <div className="usage-item">
            <h3>👤 Contexto do Usuário</h3>
            <p>Configure o contexto para testar diferentes cenários e estratégias de rollout</p>
          </div>

          <div className="usage-item">
            <h3>🔄 Atualizações em Tempo Real</h3>
            <p>As feature flags são atualizadas automaticamente a cada 15 segundos</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeatureFlags
