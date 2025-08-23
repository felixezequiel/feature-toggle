# Feature Flag POC com Unleash

Esta é uma POC (Proof of Concept) para demonstrar o funcionamento de feature flags usando o Unleash na versão open source gratuita. O projeto implementa **duas abordagens diferentes** para validação de feature toggles:

## 🎯 Abordagens de Feature Flags

### 1. **Validação Direta no Frontend** (App.tsx + Dashboard.tsx)
- **Configuração**: Feature flags configuradas diretamente no `App.tsx` usando `@unleash/proxy-client-react`
- **Uso**: Implementado no `Dashboard.tsx` com o componente `SimpleFeatureFlag`
- **Vantagens**: Resposta rápida, sem dependência do backend
- **Casos de uso**: Funcionalidades que não precisam de validação server-side

### 2. **Validação via Backend** (Hook personalizado + Home.tsx)
- **Configuração**: Hook personalizado que se comunica com o backend NestJS
- **Uso**: Implementado no `Home.tsx` com o componente `FeatureFlag`
- **Vantagens**: Validação server-side, controle centralizado, auditoria
- **Casos de uso**: Funcionalidades críticas que precisam de validação server-side

## 🏗️ Estrutura do Projeto

```
feature-flag/
├── backend/                 # API NestJS com TypeScript
│   ├── src/
│   ├── package.json
│   └── .env
├── frontend/               # Aplicação React com TypeScript
│   ├── src/
│   ├── package.json
│   └── .env
├── docker-compose.yml      # Configuração do Unleash + PostgreSQL
└── README.md
```

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** + **TypeScript**
- **NestJS** - Framework para APIs
- **Unleash Client** (Node.js) - Cliente para validação server-side

### Frontend
- **React 18** + **TypeScript**
- **Vite** - Build tool e dev server
- **React Router DOM v6** - Roteamento
- **@unleash/proxy-client-react** - Cliente para validação client-side

### Infraestrutura
- **Docker Compose** - Orquestração de serviços
- **Unleash Server** - Servidor de feature flags
- **PostgreSQL** - Banco de dados para configurações

## 🚀 Como Executar a Aplicação

### Passo 1: Iniciar Infraestrutura com Docker Compose

```bash
# Na raiz do projeto
docker-compose up -d

# Verificar se os serviços estão rodando
docker-compose ps

# Logs do Unleash (opcional)
docker-compose logs -f unleash
```

**Serviços iniciados:**
- **Unleash Server**: http://localhost:4242
- **PostgreSQL**: localhost:5432

### Passo 2: Configurar Variáveis de Ambiente do Backend

```bash
cd backend

# Copiar arquivo de exemplo
cp .env.example .env

# Editar as variáveis (ajuste conforme sua configuração)
nano .env
```

**Exemplo de `.env` do backend:**
```env
# Configurações do Unleash
UNLEASH_URL=http://localhost:4242/api
UNLEASH_APP_NAME=feature-flag-backend
UNLEASH_ENVIRONMENT=development
UNLEASH_CLIENT_KEY=your-client-key-here

# Configurações do servidor
PORT=3000
NODE_ENV=development
```

### Passo 3: Configurar Variáveis de Ambiente do Frontend

```bash
cd frontend

# Copiar arquivo de exemplo
cp .env.example .env

# Editar as variáveis
nano .env
```

**Exemplo de `.env` do frontend:**
```env
# Configurações do Unleash para validação client-side
VITE_UNLEASH_URL=http://localhost:4242/api
VITE_UNLEASH_APP_NAME=feature-flag-frontend
VITE_UNLEASH_ENVIRONMENT=development
VITE_UNLEASH_CLIENT_KEY=your-client-key-here

# URL do backend para validação server-side
VITE_API_URL=http://localhost:3000
```

### Passo 4: Iniciar o Backend

```bash
cd backend

# Instalar dependências
npm install

# Iniciar em modo desenvolvimento
npm run start:dev

# O backend estará disponível em: http://localhost:3000
```

### Passo 5: Iniciar o Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar em modo desenvolvimento
npm run dev

# O frontend estará disponível em: http://localhost:5173
```

## 🌐 URLs e Acessos

| Serviço | URL | Descrição |
|----------|-----|-----------|
| **Frontend** | http://localhost:5173 | Aplicação React principal |
| **Backend** | http://localhost:3000 | API NestJS |
| **Unleash Dashboard** | http://localhost:4242 | Painel de controle das feature flags |
| **PostgreSQL** | localhost:5432 | Banco de dados |

## 🔧 Configuração das Feature Flags

### Acessando o Dashboard do Unleash

1. Abra http://localhost:4242 no navegador
2. Use as credenciais padrão:
   - **Username**: `admin`
   - **Password**: `unleash4all`

### Criando Feature Flags

1. No dashboard, clique em "New Feature Toggle"
2. Configure o nome (ex: `dark-mode`, `advanced-metrics`)
3. Escolha a estratégia de rollout
4. Ative/desative conforme necessário

## 📱 Funcionalidades Demonstradas

### Dashboard (Validação Client-side)
- **Métricas avançadas**: `advanced-metrics`
- **Gráficos avançados**: `advanced-charts`
- **Funcionalidades de exportação**: `export-features`
- **Modo escuro**: `dark-mode`

### Home (Validação Server-side)
- **Dark Mode**: `dark-mode`
- **Busca avançada**: `advanced-search`
- **Analytics**: `analytics`
- **Notificações**: `notifications`
- **Funcionalidades experimentais**: `experimental-features`

## 🔍 Diferenças entre as Abordagens

| Aspecto | Client-side (App.tsx) | Server-side (Hook) |
|---------|----------------------|-------------------|
| **Performance** | ⚡ Rápida | 🐌 Requer request HTTP |
| **Segurança** | 🔓 Configuração exposta | 🔒 Validação server-side |
| **Auditoria** | ❌ Limitada | ✅ Completa |
| **Flexibilidade** | 🎯 Configuração estática | 🔄 Configuração dinâmica |
| **Casos de uso** | UI/UX, funcionalidades não críticas | Funcionalidades críticas, validações de negócio |

## 🚨 Troubleshooting

### Problemas Comuns

1. **Unleash não acessível**
   ```bash
   # Verificar se o container está rodando
   docker-compose ps
   
   # Reiniciar serviços
   docker-compose restart
   ```

2. **Erro de conexão no backend**
   - Verificar se as variáveis de ambiente estão corretas
   - Confirmar se o Unleash está rodando na porta 4242

3. **Feature flags não funcionando no frontend**
   - Verificar configuração no `App.tsx`
   - Confirmar se as variáveis de ambiente estão corretas
   - Verificar console do navegador para erros

### Logs e Debug

```bash
# Logs do Unleash
docker-compose logs unleash

# Logs do PostgreSQL
docker-compose logs postgres

# Logs do backend
cd backend && npm run start:dev

# Logs do frontend (console do navegador)
```

## 📚 Recursos Adicionais

- [Documentação oficial do Unleash](https://docs.getunleash.io/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

## 🤝 Contribuição

Para contribuir com este projeto:

1. Fork o repositório
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
