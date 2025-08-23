# Script PowerShell para iniciar o Unleash
Write-Host "🚀 Iniciando Unleash Feature Flag Server..." -ForegroundColor Green
Write-Host ""

# Verificar se o Docker está rodando
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Docker não está rodando. Por favor, inicie o Docker primeiro." -ForegroundColor Red
    exit 1
}

# Parar containers existentes se houver
Write-Host "🛑 Parando containers existentes..." -ForegroundColor Yellow
docker-compose down

# Construir e iniciar os serviços
Write-Host "🔨 Construindo e iniciando serviços..." -ForegroundColor Yellow
docker-compose up -d

# Aguardar os serviços ficarem prontos
Write-Host "⏳ Aguardando serviços ficarem prontos..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Verificar status dos containers
Write-Host "📊 Status dos containers:" -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "✅ Unleash está rodando em: http://localhost:4242" -ForegroundColor Green
Write-Host "🔑 Token de API padrão: default:development.unleash-insecure-api-token-12345" -ForegroundColor Yellow
Write-Host "🗄️  PostgreSQL está rodando em: localhost:5432" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para parar os serviços, execute: docker-compose down" -ForegroundColor White
Write-Host "Para ver os logs, execute: docker-compose logs -f" -ForegroundColor White
