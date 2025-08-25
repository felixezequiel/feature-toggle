export type EventHandler<T = any> = (event: T) => void;

export interface SSEConnection {
    eventSource: EventSource;
    handlers: Set<EventHandler>;
}

export class SSEService {
    private static instance: SSEService;
    private connections: Map<string, SSEConnection> = new Map();

    private constructor() { }

    public static getInstance(): SSEService {
        if (!SSEService.instance) {
            SSEService.instance = new SSEService();
        }
        return SSEService.instance;
    }

    public addEventHandler<T = any>(url: string, handler: EventHandler<T>): void {
        let connection = this.connections.get(url);

        if (!connection) {
            const eventSource = new EventSource(url);
            connection = {
                eventSource,
                handlers: new Set()
            };

            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.notifyHandlers(url, data);
                } catch (err) {
                    console.error(`❌ Erro ao processar evento SSE de ${url}:`, err);
                }
            };

            this.connections.set(url, connection);
        }

        connection.handlers.add(handler);
    }

    public removeEventHandler<T = any>(url: string, handler: EventHandler<T>): void {
        const connection = this.connections.get(url);

        if (connection) {
            connection.handlers.delete(handler);

            if (connection.handlers.size === 0) {
                connection.eventSource.close();
                this.connections.delete(url);
            }
        }
    }

    private notifyHandlers<T = any>(url: string, event: T): void {
        const connection = this.connections.get(url);

        if (connection) {
            connection.handlers.forEach(handler => {
                try {
                    handler(event);
                } catch (error) {
                    console.error(`❌ Erro ao executar handler de evento para ${url}:`, error);
                }
            });
        }
    }

    public destroy(): void {
        this.connections.forEach((connection) => {
            connection.eventSource.close();
        });
        this.connections.clear();
        SSEService.instance = null as any;
    }
}
