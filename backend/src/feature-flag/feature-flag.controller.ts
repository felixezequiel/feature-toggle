import { Controller, Get, Query, Param } from '@nestjs/common';
import { FeatureFlagService, UserContext } from './feature-flag.service';

@Controller('feature-flags')
export class FeatureFlagController {
  constructor(private readonly featureFlagService: FeatureFlagService) { }

  @Get('check/:featureName')
  checkFeatureFlag(
    @Param('featureName') featureName: string,
    @Query('userId') userId?: string,
    @Query('email') email?: string,
    @Query('environment') environment?: string,
  ) {
    const context: UserContext = {};

    if (userId) context.userId = userId;
    if (email) context.email = email;
    if (environment) context.environment = environment;

    const isEnabled = this.featureFlagService.isEnabled(featureName, context);
    const variant = this.featureFlagService.getVariant(featureName, context);

    return {
      featureName,
      enabled: isEnabled, // Corrigido para 'enabled' que o frontend espera
      variant,
      context,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('variant/:featureName')
  getFeatureVariant(
    @Param('featureName') featureName: string,
    @Query('userId') userId?: string,
    @Query('email') email?: string,
    @Query('environment') environment?: string,
  ) {
    const context: UserContext = {};

    if (userId) context.userId = userId;
    if (email) context.email = email;
    if (environment) context.environment = environment;

    const variant = this.featureFlagService.getVariant(featureName, context);

    return {
      featureName,
      variant,
      context,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('demo/features')
  getDemoFeatures() {
    // Simular algumas feature flags para demonstração
    const demoFeatures = [
      'dark-mode',
      'advanced-search',
      'analytics',
      'notifications',
      'experimental-features',
    ];

    const results = demoFeatures.map(feature => ({
      name: feature,
      isEnabled: this.featureFlagService.isEnabled(feature),
      variant: this.featureFlagService.getVariant(feature),
    }));

    return {
      features: results,
      timestamp: new Date().toISOString(),
    };
  }
}