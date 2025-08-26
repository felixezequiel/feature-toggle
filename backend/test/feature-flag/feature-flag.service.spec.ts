import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { FeatureFlagService, UserContext } from '../../src/feature-flag/feature-flag.service';
import * as unleash from 'unleash-client';

// Mock do unleash-client
const mockUnleashClient = {
  on: jest.fn(),
  isEnabled: jest.fn(),
  getVariant: jest.fn(),
  getFeatureToggleDefinitions: jest.fn(),
  getFeatureToggleDefinition: jest.fn(),
  destroy: jest.fn(),
};

// Spy na função initialize do unleash-client
const mockInitialize = jest.spyOn(unleash as any, 'initialize').mockReturnValue(mockUnleashClient as any);

describe('FeatureFlagService', () => {
  let service: FeatureFlagService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeatureFlagService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<FeatureFlagService>(FeatureFlagService);
    configService = module.get<ConfigService>(ConfigService);

    // Reset mocks
    jest.clearAllMocks();
    mockUnleashClient.on.mockClear();
    mockUnleashClient.isEnabled.mockClear();
    mockUnleashClient.getVariant.mockClear();
    mockUnleashClient.getFeatureToggleDefinitions.mockClear();
    mockUnleashClient.getFeatureToggleDefinition.mockClear();

    // Config default envs and initialize unleash
    jest.spyOn(configService, 'get').mockReturnValue(undefined);
    service['onModuleInit']();
  });

  afterEach(() => {
    if (service) {
      service.destroy();
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should initialize unleash client with correct configuration', () => {
      const mockUrl = 'http://localhost:4242/api';
      const mockAppName = 'test-app';
      const mockApiKey = 'test-api-key';

      jest.spyOn(configService, 'get')
        .mockReturnValueOnce(mockUrl)
        .mockReturnValueOnce(mockAppName)
        .mockReturnValueOnce(mockApiKey);

      // Simular a inicialização
      service['onModuleInit']();

      expect(mockInitialize).toHaveBeenCalledWith({
        url: mockUrl,
        appName: mockAppName,
        customHeaders: {
          Authorization: mockApiKey,
        },
        refreshInterval: 5000,
        metricsInterval: 30000,
        disableMetrics: false,
      });
    });

    it('should use default values when config is not provided', () => {
      jest.spyOn(configService, 'get').mockReturnValue(undefined);

      service['onModuleInit']();

      expect(mockInitialize).toHaveBeenCalledWith({
        url: 'http://localhost:4242/api',
        appName: 'feature-flag-backend',
        customHeaders: {
          Authorization: 'default-api-key-12345',
        },
        refreshInterval: 5000,
        metricsInterval: 30000,
        disableMetrics: false,
      });
    });

    it('should set up unleash event listeners', () => {
      service['onModuleInit']();

      expect(mockUnleashClient.on).toHaveBeenCalledWith('ready', expect.any(Function));
      expect(mockUnleashClient.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockUnleashClient.on).toHaveBeenCalledWith('changed', expect.any(Function));
      expect(mockUnleashClient.on).toHaveBeenCalledWith('updated', expect.any(Function));
    });
  });

  describe('isEnabled', () => {
    it('should return true when feature flag is enabled', () => {
      const featureName = 'dark-mode';
      const context: UserContext = { userId: 'user123' };

      jest.spyOn(mockUnleashClient, 'isEnabled').mockReturnValue(true);

      const result = service.isEnabled(featureName, context);

      expect(result).toBe(true);
      expect(mockUnleashClient.isEnabled).toHaveBeenCalledWith(featureName, context);
    });

    it('should return false when feature flag is disabled', () => {
      const featureName = 'dark-mode';
      const context: UserContext = { userId: 'user123' };

      jest.spyOn(mockUnleashClient, 'isEnabled').mockReturnValue(false);

      const result = service.isEnabled(featureName, context);

      expect(result).toBe(false);
      expect(mockUnleashClient.isEnabled).toHaveBeenCalledWith(featureName, context);
    });

    it('should return false and log error when unleash throws error', () => {
      const featureName = 'dark-mode';
      const error = new Error('Unleash error');

      jest.spyOn(mockUnleashClient, 'isEnabled').mockImplementation(() => {
        throw error;
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

      const result = service.isEnabled(featureName);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        `❌ Erro ao verificar feature flag ${featureName}:`,
        error
      );

      consoleSpy.mockRestore();
    });
  });

  describe('getVariant', () => {
    it('should return variant name when feature flag has variant', () => {
      const featureName = 'dark-mode';
      const context: UserContext = { userId: 'user123' };
      const mockVariant = { name: 'enabled' };

      jest.spyOn(mockUnleashClient, 'getVariant').mockReturnValue(mockVariant);

      const result = service.getVariant(featureName, context);

      expect(result).toBe('enabled');
      expect(mockUnleashClient.getVariant).toHaveBeenCalledWith(featureName, context);
    });

    it('should return disabled when unleash throws error', () => {
      const featureName = 'dark-mode';
      const error = new Error('Unleash error');

      jest.spyOn(mockUnleashClient, 'getVariant').mockImplementation(() => {
        throw error;
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

      const result = service.getVariant(featureName);

      expect(result).toBe('disabled');
      expect(consoleSpy).toHaveBeenCalledWith(
        `Erro ao obter variante da feature flag ${featureName}:`,
        error
      );

      consoleSpy.mockRestore();
    });
  });

  describe('getFeatureFlags', () => {
    it('should return list of feature flag names', () => {
      const mockToggles = [
        { name: 'feature1' },
        { name: 'feature2' },
        { name: 'feature3' },
      ];

      jest.spyOn(mockUnleashClient, 'getFeatureToggleDefinitions').mockReturnValue(mockToggles);

      const result = service.getFeatureFlags();

      expect(result).toEqual(['feature1', 'feature2', 'feature3']);
      expect(mockUnleashClient.getFeatureToggleDefinitions).toHaveBeenCalled();
    });

    it('should return empty array when unleash throws error', () => {
      const error = new Error('Unleash error');

      jest.spyOn(mockUnleashClient, 'getFeatureToggleDefinitions').mockImplementation(() => {
        throw error;
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

      const result = service.getFeatureFlags();

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('Erro ao obter lista de feature flags:', error);

      consoleSpy.mockRestore();
    });
  });

  describe('getFeatureToggleDefinition', () => {
    it('should return feature toggle definition', () => {
      const featureName = 'dark-mode';
      const mockDefinition = { name: 'dark-mode', enabled: true };

      jest.spyOn(mockUnleashClient, 'getFeatureToggleDefinition').mockReturnValue(mockDefinition);

      const result = service.getFeatureToggleDefinition(featureName);

      expect(result).toEqual(mockDefinition);
      expect(mockUnleashClient.getFeatureToggleDefinition).toHaveBeenCalledWith(featureName);
    });

    it('should return null when unleash throws error', () => {
      const featureName = 'dark-mode';
      const error = new Error('Unleash error');

      jest.spyOn(mockUnleashClient, 'getFeatureToggleDefinition').mockImplementation(() => {
        throw error;
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

      const result = service.getFeatureToggleDefinition(featureName);

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        `Erro ao obter definição da feature flag ${featureName}:`,
        error
      );

      consoleSpy.mockRestore();
    });
  });

  describe('getFeatureFlagEvents', () => {
    it('should return observable with initial connection event', (done) => {
      const events$ = service.getFeatureFlagEvents();

      events$.subscribe({
        next: (event) => {
          expect(event.type).toBe('message');
          expect(event.data.type).toBe('connected');
          expect(event.data.message).toBe('SSE conectado');
          expect(event.data.timestamp).toBeDefined();
          done();
        },
        error: done,
      });
    });
  });

  describe('emitTestEvent', () => {
    it('should emit test event to subject', (done) => {
      const events$ = service.getFeatureFlagEvents();

      events$.subscribe({
        next: (event) => {
          if (event.data.type === 'feature_flag_changed' && event.data.toggleName === 'test-feature') {
            expect(event.data.enabled).toBe(true);
            expect(event.data.timestamp).toBeDefined();
            done();
          }
        },
        error: done,
      });

      service.emitTestEvent();
    });
  });

  describe('emitHeartbeat', () => {
    it('should emit heartbeat event to subject', (done) => {
      const mockToggles = [{ name: 'feature1' }, { name: 'feature2' }];
      jest.spyOn(mockUnleashClient, 'getFeatureToggleDefinitions').mockReturnValue(mockToggles);

      const events$ = service.getFeatureFlagEvents();

      events$.subscribe({
        next: (event) => {
          if (event.data.type === 'feature_flags_updated') {
            expect(event.data.totalToggles).toBe(2);
            expect(event.data.timestamp).toBeDefined();
            done();
          }
        },
        error: done,
      });

      service.emitHeartbeat();
    });
  });

  describe('destroy', () => {
    it('should destroy unleash client', () => {
      service.destroy();

      expect(mockUnleashClient.destroy).toHaveBeenCalled();
    });
  });
});
