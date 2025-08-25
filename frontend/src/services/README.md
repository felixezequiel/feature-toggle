# SSEService - Serviço Genérico de Eventos SSE

## Visão Geral

O `SSEService` é uma implementação em POO (Programação Orientada a Objetos) que resolve o problema de duplicação de conexões SSE (Server-Sent Events) na aplicação. Ele utiliza o padrão Singleton para garantir que apenas uma instância do serviço seja criada e **uma única conexão SSE seja mantida por endpoint**.

## Problema Resolvido

**Antes:** Cada componente que usava `useFeatureFlagEvents` criava sua própria conexão SSE, resultando em múltiplas conexões desnecessárias.

**Depois:** Um único serviço centralizado gerencia múltiplas conexões SSE (uma por endpoint), compartilhadas entre todos os componentes que precisam do mesmo endpoint.

## Características Principais

### 🎯 Singleton Pattern
- Apenas uma instância do serviço é criada em toda a aplicação
- Acesso global através de `SSEService.getInstance()`

### 🔌 Controle Centralizado por Endpoint
- **Uma única conexão SSE por URL/endpoint**
- Gerenciamento automático de reconexão por endpoint
- Prevenção de conexões duplicadas para o mesmo endpoint

### 📡 Sistema de Handlers por Endpoint
- Múltiplos componentes podem se inscrever para receber eventos de um endpoint específico
- Gerenciamento automático de inscrições e cancelamentos
- Limpeza automática quando não há mais handlers para um endpoint

### 🔄 Reconexão Inteligente por Endpoint
- Tentativas automáticas de reconexão em caso de falha
- Backoff exponencial para evitar sobrecarga do servidor
- Máximo de 5 tentativas de reconexão por endpoint

### 🌐 Suporte a Múltiplos Endpoints
- Cada endpoint SSE mantém sua própria conexão
- Handlers independentes para cada tipo de evento
- Gerenciamento de status individual por endpoint

## Como Usar

### 1. Uso Básico com Hook (Feature Flags)

```typescript
import { useFeatureFlagEvents } from '../hooks/useFeatureFlagEvents';

export const MyComponent = () => {
    const { events, isConnected, error } = useFeatureFlagEvents();
    
    // O hook automaticamente se inscreve no endpoint de feature flags
    // e gerencia o ciclo de vida da conexão
    
    return (
        <div>
            <p>Status: {isConnected ? 'Conectado' : 'Desconectado'}</p>
            <p>Eventos: {events.length}</p>
        </div>
    );
};
```

### 2. Uso Direto do Serviço para Múltiplos Endpoints

```typescript
import { SSEService } from '../services';
import { FeatureFlagEvent } from '../types/FeatureFlagEvent';

export const MultiEndpointComponent = () => {
    const [featureFlagEvents, setFeatureFlagEvents] = useState<FeatureFlagEvent[]>([]);
    const [notificationEvents, setNotificationEvents] = useState<any[]>([]);
    
    useEffect(() => {
        const sseService = SSEService.getInstance();
        
        // Handler para feature flags
        const featureFlagHandler = (event: FeatureFlagEvent) => {
            setFeatureFlagEvents(prev => [...prev, event]);
        };
        
        // Handler para notificações
        const notificationHandler = (event: any) => {
            setNotificationEvents(prev => [...prev, event]);
        };
        
        // Adicionar handlers aos respectivos endpoints
        sseService.addEventHandler('http://localhost:3000/feature-flags/events', featureFlagHandler);
        sseService.addEventHandler('http://localhost:3000/notifications/events', notificationHandler);
        
        return () => {
            // Remover handlers ao desmontar
            sseService.removeEventHandler('http://localhost:3000/feature-flags/events', featureFlagHandler);
            sseService.removeEventHandler('http://localhost:3000/notifications/events', notificationHandler);
        };
    }, []);
    
    // ... resto do componente
};
```

### 3. Controle Manual das Conexões

```typescript
import { SSEService } from '../services';

export const ConnectionControl = () => {
    const handleConnect = (url: string) => {
        const sseService = SSEService.getInstance();
        sseService.connect(url);
    };
    
    const handleDisconnect = (url: string) => {
        const sseService = SSEService.getInstance();
        sseService.disconnect(url);
    };
    
    return (
        <div>
            <button onClick={() => handleConnect('http://localhost:3000/feature-flags/events')}>
                Conectar Feature Flags
            </button>
            <button onClick={() => handleConnect('http://localhost:3000/notifications/events')}>
                Conectar Notificações
            </button>
            <button onClick={() => handleDisconnect('http://localhost:3000/feature-flags/events')}>
                Desconectar Feature Flags
            </button>
        </div>
    );
};
```

### 4. Monitoramento de Múltiplas Conexões

```typescript
import { SSEService } from '../services';

export const ConnectionMonitor = () => {
    const [connectionInfo, setConnectionInfo] = useState({
        totalConnections: 0,
        activeConnections: [],
        allStatuses: new Map()
    });
    
    useEffect(() => {
        const sseService = SSEService.getInstance();
        
        const updateInfo = () => {
            setConnectionInfo({
                totalConnections: sseService.getConnectionCount(),
                activeConnections: sseService.getActiveConnections(),
                allStatuses: sseService.getAllConnections()
            });
        };
        
        updateInfo();
        const interval = setInterval(updateInfo, 1000);
        
        return () => clearInterval(interval);
    }, []);
    
    return (
        <div>
            <h3>Total de Conexões: {connectionInfo.totalConnections}</h3>
            <h4>Endpoints Ativos:</h4>
            <ul>
                {connectionInfo.activeConnections.map(url => (
                    <li key={url}>
                        {url} - {connectionInfo.allStatuses.get(url)?.isConnected ? '✅' : '❌'}
                    </li>
                ))}
            </ul>
        </div>
    );
};
```

## API do Serviço

### Métodos Públicos

- `getInstance(): SSEService` - Obtém a instância única do serviço
- `connect(url: string): void` - Estabelece conexão SSE para um endpoint específico
- `disconnect(url: string): void` - Fecha a conexão SSE para um endpoint específico
- `addEventHandler<T>(url: string, handler: EventHandler<T>): void` - Adiciona um handler de eventos para um endpoint
- `removeEventHandler<T>(url: string, handler: EventHandler<T>): void` - Remove um handler de eventos de um endpoint
- `getConnectionStatus(url: string): SSEConnectionStatus | null` - Obtém o status de uma conexão específica
- `isConnected(url: string): boolean` - Verifica se um endpoint específico está conectado
- `getAllConnections(): Map<string, SSEConnectionStatus>` - Obtém status de todas as conexões
- `getActiveConnections(): string[]` - Lista todos os endpoints ativos
- `getConnectionCount(): number` - Retorna o número total de conexões
- `setReconnectConfig(maxAttempts: number, delay: number): void` - Configura reconexão
- `destroy(): void` - Destrói a instância do serviço

### Propriedades

- `isConnected: boolean` - Status da conexão (por endpoint)
- `error: string | null` - Erro da conexão, se houver (por endpoint)
- `url: string` - URL do endpoint (por endpoint)

## Fluxo de Funcionamento

1. **Primeiro Uso**: Quando `getInstance()` é chamado pela primeira vez, uma nova instância é criada
2. **Adição de Handler**: Quando `addEventHandler(url, handler)` é chamado, o serviço verifica se há conexão ativa para a URL
3. **Conexão por Endpoint**: Se não há conexão para a URL, uma nova é estabelecida automaticamente
4. **Gerenciamento de Eventos**: Todos os eventos recebidos de um endpoint são distribuídos para todos os handlers registrados para aquele endpoint
5. **Limpeza Automática**: Quando o último handler é removido de um endpoint, a conexão é fechada automaticamente

## Exemplos de Uso por Endpoint

### Feature Flags
```typescript
const sseService = SSEService.getInstance();
sseService.addEventHandler('http://localhost:3000/feature-flags/events', handleFeatureFlagEvent);
```

### Notificações
```typescript
const sseService = SSEService.getInstance();
sseService.addEventHandler('http://localhost:3000/notifications/events', handleNotificationEvent);
```

### Chat em Tempo Real
```typescript
const sseService = SSEService.getInstance();
sseService.addEventHandler('http://localhost:3000/chat/events', handleChatEvent);
```

### Logs do Sistema
```typescript
const sseService = SSEService.getInstance();
sseService.addEventHandler('http://localhost:3000/system/logs', handleSystemLogEvent);
```

## Benefícios

### ✅ Performance
- Uma única conexão SSE por endpoint em vez de múltiplas
- Menor uso de recursos de rede
- Menor sobrecarga no servidor

### ✅ Confiabilidade
- Reconexão automática por endpoint em caso de falha
- Gerenciamento centralizado de erros por endpoint
- Backoff exponencial para reconexão

### ✅ Manutenibilidade
- Código centralizado e reutilizável
- Fácil de testar e debugar
- Padrão de projeto bem estabelecido

### ✅ Escalabilidade
- Fácil adicionar novos endpoints SSE
- Suporte a múltiplos tipos de eventos
- Arquitetura extensível para diferentes domínios

### ✅ Flexibilidade
- Cada endpoint pode ter seus próprios tipos de eventos
- Handlers independentes por endpoint
- Gerenciamento de status individual

## Exemplo de Implementação

Veja os arquivos:
- `SSEServiceExample.tsx` - Exemplo básico de uso
- `MultiEndpointSSEExample.tsx` - Exemplo de múltiplos endpoints

## Configuração

Para configurar reconexão personalizada:

```typescript
const sseService = SSEService.getInstance();
sseService.setReconnectConfig(10, 2000); // 10 tentativas, 2 segundos de delay inicial
```

## Limpeza e Destruição

O serviço é automaticamente limpo quando não há mais handlers ativos para cada endpoint. Para destruir manualmente:

```typescript
const sseService = SSEService.getInstance();
sseService.destroy();
```

**Nota**: Use `destroy()` apenas quando for necessário limpar completamente o serviço. Na maioria dos casos, a limpeza automática é suficiente.

## Casos de Uso Comuns

### 1. Feature Flags
- Monitoramento de mudanças em tempo real
- Atualização automática da UI quando flags mudam

### 2. Notificações
- Recebimento de notificações push
- Atualização de contadores em tempo real

### 3. Chat/Mensagens
- Recebimento de mensagens em tempo real
- Indicadores de digitação
- Status online/offline

### 4. Logs e Monitoramento
- Recebimento de logs do sistema
- Métricas em tempo real
- Alertas de sistema

### 5. Dados em Tempo Real
- Atualizações de dashboard
- Gráficos em tempo real
- Sincronização de dados entre usuários
