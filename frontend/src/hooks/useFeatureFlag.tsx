import { useEffect, useState } from 'react'

export type ContextFeatureFlag = {
  userId?: string,
  email?: string,
  environment?: string,
}

type ResponseFeatureFlag = {
  featureName: string,
  enabled: boolean, // Corrigido para 'enabled' que o frontend espera
  variant: string,
  context: ContextFeatureFlag,
  timestamp: string,
}

interface UseFeatureFlagType {
  isEnabled: (featureName: string, variant?: string, context?: ContextFeatureFlag) => Promise<boolean>
  isLoading: boolean
  error: string | null
}

export const useFeatureFlag = (): UseFeatureFlagType => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkBackendConnection = async () => {
      try {
        // Verificar se o backend está rodando
        const response = await fetch('http://localhost:3000/feature-flags/demo/features')
        if (response.ok) {
          console.log('🚀 Backend conectado com sucesso!')
          setIsLoading(false)
        } else {
          throw new Error('Backend não respondeu corretamente')
        }
      } catch (err) {
        console.error('Erro ao conectar com o backend:', err)
        setError('Falha ao conectar com o backend')
        setIsLoading(false)
      }
    }

    checkBackendConnection()
  }, [])

  const isEnabled = async (featureName: string, variant?: string, context?: ContextFeatureFlag): Promise<boolean> => {
    try {
      // Construir query string para o contexto
      const queryParams = new URLSearchParams()
      if (context?.userId) queryParams.append('userId', context.userId)
      if (context?.email) queryParams.append('email', context.email)
      if (context?.environment) queryParams.append('environment', context.environment)

      const response = await fetch(`http://localhost:3000/feature-flags/check/${featureName}?${queryParams}`)

      if (response.ok) {
        const result = await response.json() as ResponseFeatureFlag
        if (variant) return result.variant === variant
        return result.enabled
      }
      return false
    } catch (err) {
      console.error(`Erro ao verificar feature flag ${featureName}:`, err)
      return false
    }
  }

  return {
    isEnabled,
    isLoading,
    error,
  }
}