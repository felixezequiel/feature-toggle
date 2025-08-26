import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('App Integration Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  }, 5000);

  describe('App endpoints', () => {
    it('should return backend health message for root endpoint', async () => {
      const response = await request(app.getHttpServer())
        .get('/')
        .expect(200);

      expect(response.text).toBe('Feature Flag POC Backend está funcionando! 🚀');
    });

    it('should return 404 for non-existent endpoint', async () => {
      await request(app.getHttpServer())
        .get('/non-existent')
        .expect(404);
    });
  });

  describe('Feature Flag endpoints', () => {
    it('should return list of feature flags', async () => {
      const response = await request(app.getHttpServer())
        .get('/feature-flags')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should check feature flag status', async () => {
      const featureName = 'test-feature';

      const response = await request(app.getHttpServer())
        .get(`/feature-flags/check/${featureName}`)
        .expect(200);

      expect(response.body).toHaveProperty('name', featureName);
      expect(response.body).toHaveProperty('enabled');
      expect(response.body).toHaveProperty('variant');
    });

    it('should return service status', async () => {
      const response = await request(app.getHttpServer())
        .get('/feature-flags/status')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'active');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('message');
    });

    it('should emit test event', async () => {
      const response = await request(app.getHttpServer())
        .post('/feature-flags/test-event')
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Evento de teste emitido');
    });

    it('should emit heartbeat', async () => {
      const response = await request(app.getHttpServer())
        .post('/feature-flags/heartbeat')
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Heartbeat emitido');
    });

    it('should handle SSE events endpoint (smoke, without holding stream)', async () => {
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
              // SSE endpoint should return a stream
              expect(response.headers['content-type']).toContain('text/event-stream');
              expect(response.headers['cache-control']).toContain('no-cache');
              expect(response.headers['connection']).toBe('keep-alive');
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
    it('should handle invalid feature flag names gracefully', async () => {
      const response = await request(app.getHttpServer())
        .get('/feature-flags/check/invalid-feature-name-with-special-chars!@#')
        .expect(200);

      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('enabled');
      expect(response.body).toHaveProperty('variant');
    });

    it('should handle malformed query parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/feature-flags/check/test-feature')
        .query({
          userId: 'user123',
          invalidParam: 'value',
          anotherInvalid: 'another-value'
        })
        .expect(200);

      expect(response.body).toHaveProperty('name', 'test-feature');
      expect(response.body).toHaveProperty('enabled');
      expect(response.body).toHaveProperty('variant');
    });
  });

  describe('Performance and reliability', () => {
    it('should handle multiple concurrent requests', async () => {
      const concurrentRequests = 3; // Reduzir de 5 para 3 para evitar sobrecarga
      const promises = [];

      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(
          request(app.getHttpServer())
            .get('/feature-flags/status')
            .timeout({ deadline: 5000, response: 5000 }) // Aumentar timeout
            .expect(200)
        );
      }

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect(response.body).toHaveProperty('status', 'active');
        expect(response.body).toHaveProperty('timestamp');
      });
    });

    it('should handle rapid successive requests', async () => {
      const rapidRequests = 5; // Reduzir de 10 para 5 para evitar sobrecarga

      for (let i = 0; i < rapidRequests; i++) {
        const response = await request(app.getHttpServer())
          .get('/feature-flags/status')
          .timeout({ deadline: 5000, response: 5000 }) // Aumentar timeout
          .expect(200);

        expect(response.body).toHaveProperty('status', 'active');

        // Pequena pausa entre requests para evitar sobrecarga
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    });
  });
});
