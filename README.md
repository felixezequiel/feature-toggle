# Feature Flag POC com Unleash

Esta é uma POC (Proof of Concept) para demonstrar o funcionamento de feature flags usando o Unleash na versão open source gratuita.

## Estrutura do Projeto

- **backend/**: API NestJS com TypeScript
- **frontend/**: Aplicação React com TypeScript, Vite e React Router DOM v6

## Tecnologias Utilizadas

### Backend
- Node.js
- TypeScript
- NestJS
- Unleash Client (Node.js)

### Frontend
- React 18
- TypeScript
- Vite
- React Router DOM v6
- Unleash Client (React)

## Configuração do Docker

### Pré-requisitos
- Docker instalado e rodando
- Docker Compose instalado

### Variáveis de Ambiente
Copie o arquivo `env.example` para `.env` e ajuste as configurações conforme necessário:
```bash
cp env.example .env
```

## Como Executar

### Backend
```bash
cd backend
npm install
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Unleash Server (Recomendado - Docker Compose)
```bash
# Usando Docker Compose (recomendado)
docker-compose up -d

# Ou usando o script de inicialização
# Linux/Mac:
./start-unleash.sh

# Windows (PowerShell):
.\start-unleash.ps1

# Para parar os serviços
docker-compose down
```

### Unleash Server (Docker simples)
```bash
docker run -p 4242:4242 unleashorg/unleash-server:latest
```

## URLs e Acessos

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000
- **Unleash Dashboard**: http://localhost:4242
- **PostgreSQL**: localhost:5432

## Funcionalidades Demonstradas

- Toggle de feature flags em tempo real
- Diferentes estratégias de rollout
- Integração com frontend e backend
- Dashboard para visualizar status das flags
