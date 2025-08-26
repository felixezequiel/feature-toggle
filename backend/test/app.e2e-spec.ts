import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
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
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/feature-flags (GET)', () => {
    return request(app.getHttpServer())
      .get('/feature-flags')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/feature-flags/status (GET)', () => {
    return request(app.getHttpServer())
      .get('/feature-flags/status')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('status', 'active');
        expect(res.body).toHaveProperty('timestamp');
        expect(res.body).toHaveProperty('message');
      });
  });

  it('/feature-flags/check/:name (GET)', () => {
    const featureName = 'test-feature';
    
    return request(app.getHttpServer())
      .get(`/feature-flags/check/${featureName}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('name', featureName);
        expect(res.body).toHaveProperty('enabled');
        expect(res.body).toHaveProperty('variant');
      });
  });

  it('/feature-flags/test-event (POST)', () => {
    return request(app.getHttpServer())
      .post('/feature-flags/test-event')
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('message', 'Evento de teste emitido');
      });
  });

  it('/feature-flags/heartbeat (POST)', () => {
    return request(app.getHttpServer())
      .post('/feature-flags/heartbeat')
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('message', 'Heartbeat emitido');
      });
  });

  it('/feature-flags/events (GET) - SSE endpoint', () => {
    return request(app.getHttpServer())
      .get('/feature-flags/events')
      .set('Accept', 'text/event-stream')
      .expect(200)
      .expect((res) => {
        expect(res.headers['content-type']).toContain('text/event-stream');
      });
  });

  it('should handle non-existent routes with 404', () => {
    return request(app.getHttpServer())
      .get('/non-existent-route')
      .expect(404);
  });

  it('should handle feature flag check with query parameters', () => {
    const featureName = 'dark-mode';
    const userId = 'user123';
    const email = 'user@example.com';
    
    return request(app.getHttpServer())
      .get(`/feature-flags/check/${featureName}`)
      .query({ userId, email })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('name', featureName);
        expect(res.body).toHaveProperty('enabled');
        expect(res.body).toHaveProperty('variant');
      });
  });
});
