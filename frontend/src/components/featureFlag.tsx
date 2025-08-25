import { ReactNode, useCallback, useEffect, useState } from "react"
import { useFeatureFlag } from "../hooks/useFeatureFlag"
import { useFeatureFlagEvents } from "../hooks/useFeatureFlagEvents"

type Props = {
    featureName: string
    fallback?: ReactNode
    children: ReactNode
    variant?: string
}

export const FeatureFlag = ({ featureName, fallback, children, variant }: Props) => {
    const [isEnabled, setIsEnabled] = useState(false)

    const { isEnabled: isEnabledFeatureFlag } = useFeatureFlag()
    const { events } = useFeatureFlagEvents()

    const loadFeatureFlag = useCallback(async () => {
        try {
            const isEnabled = await isEnabledFeatureFlag(featureName, variant, {
                environment: import.meta.env.VITE_UNLEASH_ENVIRONMENT,
                userId: '987'
            })
            setIsEnabled(isEnabled)
        } catch {
            setIsEnabled(false)
        }
    }, [featureName, variant, isEnabledFeatureFlag])

    useEffect(() => {
        loadFeatureFlag()
    }, [loadFeatureFlag])

    useEffect(() => {
        events.forEach(event => {
            if (event.toggleName === featureName) {
                setIsEnabled(Boolean(event.enabled))
            }
        })
    }, [events, featureName])

    const defineFallback = () => {
        return fallback ?? null
    }

    return isEnabled ? children : defineFallback()
}