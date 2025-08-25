import { useFlag, useVariant } from "@unleash/proxy-client-react"
import { ReactNode } from "react"

type Props = {
    featureName: string
    variant?: string
    fallback?: ReactNode
    children: ReactNode
}
export const SimpleFeatureFlag = ({ featureName, fallback, children, variant }: Props) => {
    const featureEnabled = useFlag(featureName)
    const variantConfig = useVariant(featureName)

    if (variantConfig.name === variant && variantConfig.enabled) return children

    return featureEnabled ? children : fallback
}