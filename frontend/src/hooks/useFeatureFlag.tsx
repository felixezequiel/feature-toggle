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
}

export const useFeatureFlag = (): UseFeatureFlagType => {
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

  return { isEnabled }
}