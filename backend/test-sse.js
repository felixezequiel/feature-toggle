#!/usr/bin/env node

const EventSource = require('eventsource');

console.log('🧪 Testando comunicação SSE com o backend...');

// URL do endpoint SSE
const sseUrl = 'http://localhost:3000/feature-flags/events';

console.log(`🔌 Conectando em: ${sseUrl}`);

// Criar conexão SSE
const eventSource = new EventSource(sseUrl);

// Evento de conexão aberta
eventSource.onopen = () => {
  console.log('✅ Conexão SSE estabelecida com sucesso!');
};

// Evento de mensagem recebida
eventSource.onmessage = (event) => {
  console.log('📨 Evento recebido:');
  console.log('  Tipo:', event.type);
  console.log('  ID:', event.lastEventId);
  console.log('  Dados:', event.data);
  
  try {
    const data = JSON.parse(event.data);
    console.log('  📊 Dados parseados:', data);
  } catch (err) {
    console.log('  ❌ Erro ao parsear dados:', err.message);
  }
  console.log('---');
};

// Evento de erro
eventSource.onerror = (error) => {
  console.error('❌ Erro na conexão SSE:', error);
};

// Evento de conexão fechada
eventSource.onclose = () => {
  console.log('🔌 Conexão SSE fechada');
};

// Função para testar endpoints
async function testEndpoints() {
  const baseUrl = 'http://localhost:3000';
  
  try {
    // Testar status
    console.log('\n🔍 Testando endpoint de status...');
    const statusResponse = await fetch(`${baseUrl}/feature-flags/status`);
    const statusData = await statusResponse.json();
    console.log('✅ Status:', statusData);
    
    // Testar evento manual
    console.log('\n🧪 Testando emissão de evento...');
    const testResponse = await fetch(`${baseUrl}/feature-flags/test-event`, {
      method: 'POST'
    });
    const testData = await testResponse.json();
    console.log('✅ Teste:', testData);
    
    // Testar heartbeat
    console.log('\n💓 Testando heartbeat...');
    const heartbeatResponse = await fetch(`${baseUrl}/feature-flags/heartbeat`, {
      method: 'POST'
    });
    const heartbeatData = await heartbeatResponse.json();
    console.log('✅ Heartbeat:', heartbeatData);
    
  } catch (error) {
    console.error('❌ Erro ao testar endpoints:', error.message);
  }
}

// Aguardar um pouco e testar os endpoints
setTimeout(testEndpoints, 2000);

// Manter o script rodando por 30 segundos
setTimeout(() => {
  console.log('\n⏰ Encerrando teste após 30 segundos...');
  eventSource.close();
  process.exit(0);
}, 30000);

console.log('⏳ Aguardando eventos SSE... (pressione Ctrl+C para sair)');
