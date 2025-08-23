import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { initialize, UnleashConfig } from 'unleash-client';

export interface UserContext {
  userId?: string;
  email?: string;
  environment?: string;
  [key: string]: any;
}

@Injectable()
export class FeatureFlagService implements OnModuleInit {
  private unleash: ReturnType<typeof initialize>;

  constructor(private configService: ConfigService) { }

  onModuleInit() {
    const unleashConfig: UnleashConfig = {
      url: this.configService.get('UNLEASH_URL') || 'http://localhost:4242/api',
      appName: this.configService.get('UNLEASH_APP_NAME') || 'feature-flag-backend',
      customHeaders: {
        Authorization: this.configService.get('UNLEASH_API_KEY') || 'default-api-key-12345'
      },
      refreshInterval: 5000,
      metricsInterval: 30000,
      disableMetrics: false
    };

    console.log('🚀 Inicializando Unleash client com configurações:', unleashConfig);

    this.unleash = initialize(unleashConfig);

    // Log para debug
    this.unleash.on('ready', () => {
      console.log('✅ Unleash client conectado com sucesso!');
      console.log('📊 Feature flags disponíveis:', this.unleash.getFeatureToggleDefinition('dark-mode'));
    });

    this.unleash.on('error', (err: any) => {
      console.error('❌ Erro no Unleash client:', err);
    });
  }

  isEnabled(featureName: string, context?: UserContext): boolean {
    try {
      const isEnabled = this.unleash.isEnabled(featureName, context);
      return isEnabled;
    } catch (error) {
      console.error(`❌ Erro ao verificar feature flag ${featureName}:`, error);
      return false;
    }
  }

  getVariant(featureName: string, context?: UserContext): string {
    try {
      const variant = this.unleash.getVariant(featureName, context);
      return variant.name;
    } catch (error) {
      console.error(`Erro ao obter variante da feature flag ${featureName}:`, error);
      return 'disabled';
    }
  }

  getFeatureFlags(): string[] {
    try {
      return this.unleash.getFeatureToggleDefinitions().map(toggle => toggle.name);
    } catch (error) {
      console.error('Erro ao obter lista de feature flags:', error);
      return [];
    }
  }

  getFeatureToggleDefinition(featureName: string) {
    try {
      return this.unleash.getFeatureToggleDefinition(featureName);
    } catch (error) {
      console.error(`Erro ao obter definição da feature flag ${featureName}:`, error);
      return null;
    }
  }

  destroy() {
    if (this.unleash) {
      this.unleash.destroy();
    }
  }
}
