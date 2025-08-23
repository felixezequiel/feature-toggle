import { ReactNode, useCallback, useEffect, useState } from "react"
import { useFeatureFlag } from "../hooks/useFeatureFlag"

type Props = {
    featureName: string
    fallback?: ReactNode
    children: ReactNode
    variant?: string
}

export const FeatureFlag = ({ featureName, fallback, children, variant }: Props) => {
    const [isEnabled, setIsEnabled] = useState(false)

    const { isEnabled: isEnabledFeatureFlag, isLoading, error } = useFeatureFlag()

    const loadFeatureFlag = useCallback(async () => {
        try {
            const isEnabled = await isEnabledFeatureFlag(featureName, variant, {
                environment: import.meta.env.VITE_UNLEASH_ENVIRONMENT,
                userId: '321'
            })
            setIsEnabled(isEnabled)
        } catch (error) {
            setIsEnabled(false)
        }
    }, [featureName, variant, isEnabledFeatureFlag])

    useEffect(() => {
        loadFeatureFlag()
    }, [featureName, variant, loadFeatureFlag])

    const defineFallback = () => {
        if (isLoading) {
            return <div>Loading...</div>
        }

        if (error) {
            return <div>Error: {error}</div>
        }

        return fallback ?? null
    }

    return isEnabled ? children : defineFallback()
}