export interface FeatureFlagEvent {
    type: 'feature_flag_changed' | 'feature_flags_updated';
    toggleName?: string;
    enabled?: boolean;
    totalToggles?: number;
    timestamp: string;
    project?: string;
    stale?: boolean;
}
