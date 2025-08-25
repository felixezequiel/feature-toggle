import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { initialize, UnleashConfig } from 'unleash-client';
import { Subject, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

export interface UserContext {
  userId?: string;
  email?: string;
  environment?: string;
  [key: string]: any;
}

export interface UnleashToggle {
  name: string;
  type: string;
  enabled: boolean;
  project: string;
  stale: boolean;
  strategies: any[]; // Usar any para compatibilidade com tipos internos do Unleash
  variants: any[];
  description: string;
  impressionData: boolean;
}

export interface FeatureFlagEvent {
  type: 'feature_flag_changed' | 'feature_flags_updated';
  toggleName?: string;
  enabled?: boolean;
  strategies?: any[]; // Usar any para compatibilidade
  variants?: any[];
  totalToggles?: number;
  timestamp: string;
  project?: string;
  stale?: boolean;
}

// Tipo para o evento 'changed' do Unleash
export type UnleashChangedEvent = UnleashToggle | UnleashToggle[];

// Interface para eventos SSE no formato do NestJS
export interface SSEEvent {
  data: any;
  type: string;
  id: string;
}

@Injectable()
export class FeatureFlagService implements OnModuleInit {
  private unleash: ReturnType<typeof initialize>;
  private featureFlagSubject = new Subject<FeatureFlagEvent>();

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

    this.unleash = initialize(unleashConfig);

    // Log para debug
    this.unleash.on('ready', () => {
      console.log('✅ Unleash client conectado com sucesso!');
      console.log('📊 Feature flags disponíveis:', this.unleash.getFeatureToggleDefinition('dark-mode'));
    });

    this.unleash.on('error', (err: any) => {
      console.error('❌ Erro no Unleash client:', err);
    });

    // Evento para detectar mudanças em feature flags específicas
    this.unleash.on('changed', (toggles: UnleashChangedEvent) => {
      // Processar cada toggle alterado
      if (Array.isArray(toggles)) {
        toggles.forEach(toggle => {
          if (toggle && toggle.name) {
            this.handleFeatureFlagChange(toggle.name, toggle);
          }
        });
      } else if (toggles && toggles.name) {
        // Caso seja um único toggle
        this.handleFeatureFlagChange(toggles.name, toggles);
      }
    });

    // Evento para detectar atualizações gerais
    this.unleash.on('updated', () => {
      this.handleFeatureFlagsUpdate();
    });
  }

  // Método para lidar com mudanças específicas
  private handleFeatureFlagChange(toggleName: string, toggle?: UnleashToggle) {
    const currentToggle = toggle || this.unleash.getFeatureToggleDefinition(toggleName);

    if (currentToggle) {
      // Emitir evento via SSE
      const event: FeatureFlagEvent = {
        type: 'feature_flag_changed',
        toggleName,
        enabled: currentToggle.enabled,
        strategies: currentToggle.strategies,
        variants: currentToggle.variants,
        project: currentToggle.project,
        stale: currentToggle.stale,
        timestamp: new Date().toISOString()
      };

      this.featureFlagSubject.next(event);
    }
  }

  // Método para lidar com atualizações gerais
  private handleFeatureFlagsUpdate() {
    const allToggles = this.unleash.getFeatureToggleDefinitions();

    const event: FeatureFlagEvent = {
      type: 'feature_flags_updated',
      totalToggles: allToggles.length,
      timestamp: new Date().toISOString()
    };

    this.featureFlagSubject.next(event);
  }

  // Método para obter stream de eventos no formato correto do NestJS
  getFeatureFlagEvents(): Observable<SSEEvent> {
    console.log('🔌 Cliente SSE conectado, aguardando eventos...');

    // Converter os eventos para o formato SSE do NestJS
    return this.featureFlagSubject.pipe(
      map(event => ({
        data: event,
        type: 'message',
        id: Date.now().toString()
      })),
      // Adicionar heartbeat para manter a conexão ativa
      startWith({
        data: { type: 'connected', message: 'SSE conectado', timestamp: new Date().toISOString() },
        type: 'message',
        id: Date.now().toString()
      })
    );
  }

  // Método para emitir heartbeat manual (útil para testes)
  emitHeartbeat() {
    const heartbeatEvent: FeatureFlagEvent = {
      type: 'feature_flags_updated',
      totalToggles: this.unleash ? this.unleash.getFeatureToggleDefinitions().length : 0,
      timestamp: new Date().toISOString()
    };

    this.featureFlagSubject.next(heartbeatEvent);
  }

  // Método de teste para emitir evento manualmente
  emitTestEvent() {
    const testEvent: FeatureFlagEvent = {
      type: 'feature_flag_changed',
      toggleName: 'test-feature',
      enabled: true,
      timestamp: new Date().toISOString()
    };

    this.featureFlagSubject.next(testEvent);
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
