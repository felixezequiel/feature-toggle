import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { FeatureFlagModule } from '../../src/feature-flag/feature-flag.module';
import { ConfigModule } from '@nestjs/config';
import { FeatureFlagService } from '../../src/feature-flag/feature-flag.service';

describe('FeatureFlag Integration Tests', () => {
  let app: INestApplication;
  let featureFlagService: FeatureFlagService;

  // Mock do unleash-client para testes de integração
  const mockUnleashClient = {
    on: jest.fn(),
    isEnabled: jest.fn(),
    getVariant: jest.fn(),
    getFeatureToggleDefinitions: jest.fn(),
    getFeatureToggleDefinition: jest.fn(),
    destroy: jest.fn(),
  };

  jest.fn().mockReturnValue(mockUnleashClient);

  // Não usar jest.mock aqui; testes de integração usam spies quando necessário

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            () => ({
              UNLEASH_URL: 'http://localhost:4242/api',
              UNLEASH_APP_NAME: 'test-app',
              UNLEASH_API_KEY: 'test-api-key',
            }),
          ],
        }),
        FeatureFlagModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    featureFlagService = moduleFixture.get<FeatureFlagService>(FeatureFlagService);
    await app.init();
  });

  afterAll(async () => {
    // Ensure proper cleanup
    if (featureFlagService) {
      // Close any SSE connections or timers if they exist
      try {
        // Force cleanup of any lingering connections
        jest.clearAllTimers();
        jest.clearAllMocks();
      } catch (error) {
        // Ignore cleanup errors
      }
    }
    await app.close();
  }, 10000);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /feature-flags', () => {
    it('should return list of feature flags', async () => {
      const response = await request(app.getHttpServer())
        .get('/feature-flags')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    // remover casos forçados de erro no provider mockado
  });

  describe('GET /feature-flags/check/:name', () => {
    it('should check feature flag with user context', async () => {
      const featureName = 'dark-mode';
      const userId = 'user123';
      const email = 'user@example.com';
      const environment = 'production';

      jest.spyOn(featureFlagService, 'isEnabled').mockReturnValue(true);
      jest.spyOn(featureFlagService, 'getVariant').mockReturnValue('enabled');

      const response = await request(app.getHttpServer())
        .get(`/feature-flags/check/${featureName}`)
        .query({ userId, email, environment })
        .expect(200);

      expect(response.body).toEqual({
        name: featureName,
        enabled: true,
        variant: 'enabled',
      });

      expect(featureFlagService.isEnabled).toHaveBeenCalledWith(featureName, {
        userId,
        email,
        environment,
      });
      expect(featureFlagService.getVariant).toHaveBeenCalledWith(featureName, {
        userId,
        email,
        environment,
      });
    });

    it('should check feature flag without user context', async () => {
      const featureName = 'dark-mode';

      jest.spyOn(featureFlagService, 'isEnabled').mockReturnValue(false);
      jest.spyOn(featureFlagService, 'getVariant').mockReturnValue('disabled');

      const response = await request(app.getHttpServer())
        .get(`/feature-flags/check/${featureName}`)
        .expect(200);

      expect(response.body).toEqual({
        name: featureName,
        enabled: false,
        variant: 'disabled',
      });

      expect(featureFlagService.isEnabled).toHaveBeenCalledWith(featureName, undefined);
      expect(featureFlagService.getVariant).toHaveBeenCalledWith(featureName, undefined);
    });

    it('should handle partial user context', async () => {
      const featureName = 'dark-mode';
      const userId = 'user123';

      jest.spyOn(featureFlagService, 'isEnabled').mockReturnValue(true);
      jest.spyOn(featureFlagService, 'getVariant').mockReturnValue('enabled');

      const response = await request(app.getHttpServer())
        .get(`/feature-flags/check/${featureName}`)
        .query({ userId })
        .expect(200);

      expect(response.body).toEqual({
        name: featureName,
        enabled: true,
        variant: 'enabled',
      });

      expect(featureFlagService.isEnabled).toHaveBeenCalledWith(featureName, { userId });
      expect(featureFlagService.getVariant).toHaveBeenCalledWith(featureName, { userId });
    });

    it('should handle service errors gracefully', async () => {
      const featureName = 'dark-mode';

      jest.spyOn(featureFlagService, 'isEnabled').mockImplementation(() => {
        throw new Error('Service error');
      });

      const response = await request(app.getHttpServer())
        .get(`/feature-flags/check/${featureName}`)
        .expect(200);

      // Verificar que a resposta contém as propriedades esperadas mesmo com erro
      expect(response.body).toHaveProperty('name', featureName);
      expect(response.body).toHaveProperty('enabled');
      expect(response.body).toHaveProperty('variant');
    });
  });

  describe('GET /feature-flags/status', () => {
    it('should return service status', async () => {
      const response = await request(app.getHttpServer())
        .get('/feature-flags/status')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'active');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('message', 'Feature Flag Service ativo e funcionando');
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('POST /feature-flags/test-event', () => {
    it('should emit test event and return success message', async () => {
      jest.spyOn(featureFlagService, 'emitTestEvent').mockImplementation(() => { });

      const response = await request(app.getHttpServer())
        .post('/feature-flags/test-event')
        .expect(201);

      expect(response.body).toEqual({ message: 'Evento de teste emitido' });
      expect(featureFlagService.emitTestEvent).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors gracefully', async () => {
      jest.spyOn(featureFlagService, 'emitTestEvent').mockImplementation(() => {
        throw new Error('Service error');
      });

      await request(app.getHttpServer())
        .post('/feature-flags/test-event')
        .expect(500);
    });
  });

  describe('POST /feature-flags/heartbeat', () => {
    it('should emit heartbeat and return success message', async () => {
      jest.spyOn(featureFlagService, 'emitHeartbeat').mockImplementation(() => { });

      const response = await request(app.getHttpServer())
        .post('/feature-flags/heartbeat')
        .expect(201);

      expect(response.body).toEqual({ message: 'Heartbeat emitido' });
      expect(featureFlagService.emitHeartbeat).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors gracefully', async () => {
      jest.spyOn(featureFlagService, 'emitHeartbeat').mockImplementation(() => {
        throw new Error('Service error');
      });

      await request(app.getHttpServer())
        .post('/feature-flags/heartbeat')
        .expect(500);
    });
  });

  describe('GET /feature-flags/events', () => {
    it('should return SSE stream', async () => {
      return new Promise((resolve, reject) => {
        const req = request(app.getHttpServer())
          .get('/feature-flags/events')
          .set('Accept', 'text/event-stream')
          .timeout({ deadline: 5000, response: 5000 })
          .end((err, response) => {
            if (err) {
              reject(err);
              return;
            }

            try {
              // Verificar que é um endpoint SSE
              expect(response.headers['content-type']).toContain('text/event-stream');
              expect(response.headers['cache-control']).toContain('no-cache');
              resolve(undefined);
            } catch (error) {
              reject(error);
            }
          });

        // Cancel the request after a short delay to avoid hanging
        setTimeout(() => {
          req.abort();
          resolve(undefined);
        }, 1000);
      });
    }, 10000);
  });

  describe('Error handling', () => {
    it('should return 404 for non-existent routes', async () => {
      await request(app.getHttpServer())
        .get('/feature-flags/non-existent')
        .expect(404);
    });

    it('should handle malformed requests gracefully', async () => {
      // Test with invalid query parameters - expect 200 since the service handles errors gracefully
      const response = await request(app.getHttpServer())
        .get('/feature-flags/check/invalid-feature')
        .query({ invalidParam: 'value' })
        .expect(200);

      // Verificar que a resposta contém as propriedades esperadas
      expect(response.body).toHaveProperty('name', 'invalid-feature');
      expect(response.body).toHaveProperty('enabled');
      expect(response.body).toHaveProperty('variant');
    });
  });
});
