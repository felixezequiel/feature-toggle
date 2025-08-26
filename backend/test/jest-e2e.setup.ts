// Setup global para testes E2E
import 'reflect-metadata';

// Configurações globais do Jest para testes E2E
beforeAll(() => {
  // Configurar variáveis de ambiente para testes
  process.env.NODE_ENV = 'test';
  process.env.UNLEASH_URL = 'http://localhost:4242/api';
  process.env.UNLEASH_APP_NAME = 'feature-flag-backend-test';
  process.env.UNLEASH_API_KEY = 'test-api-key-12345';
});

afterAll(() => {
  // Limpar variáveis de ambiente após os testes
  delete process.env.NODE_ENV;
  delete process.env.UNLEASH_URL;
  delete process.env.UNLEASH_APP_NAME;
  delete process.env.UNLEASH_API_KEY;
});

// Configurar timeout global para testes E2E
jest.setTimeout(30000);

// Suprimir logs durante os testes para manter o output limpo
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
