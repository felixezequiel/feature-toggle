export interface FeatureFlagEvent {
    type: 'feature_flag_changed' | 'feature_flags_updated';
    toggleName?: string;
    enabled?: boolean;
    strategies?: any[];
    variants?: any[];
    totalToggles?: number;
    timestamp: string;
    project?: string;
    stale?: boolean;
}
