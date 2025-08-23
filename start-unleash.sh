#!/bin/bash

echo "🚀 Iniciando Unleash Feature Flag Server..."
echo ""

# Verificar se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi

# Parar containers existentes se houver
echo "🛑 Parando containers existentes..."
docker-compose down

# Remover volumes se necessário (descomente a linha abaixo para reset completo)
# docker-compose down -v

# Construir e iniciar os serviços
echo "🔨 Construindo e iniciando serviços..."
docker-compose up -d

# Aguardar os serviços ficarem prontos
echo "⏳ Aguardando serviços ficarem prontos..."
sleep 10

# Verificar status dos containers
echo "📊 Status dos containers:"
docker-compose ps

echo ""
echo "✅ Unleash está rodando em: http://localhost:4242"
echo "🔑 Token de API padrão: default:development.unleash-insecure-api-token-12345"
echo "🗄️  PostgreSQL está rodando em: localhost:5432"
echo ""
echo "Para parar os serviços, execute: docker-compose down"
echo "Para ver os logs, execute: docker-compose logs -f"
