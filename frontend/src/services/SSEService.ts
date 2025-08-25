export type EventHandler<T> = (event: T) => void;

export interface SSEConnection<T> {
    eventSource: EventSource;
    handlers: Set<EventHandler<T>>;
}

export class SSEService {
    private static instance: SSEService;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private connections: Map<string, SSEConnection<any>> = new Map();

    private constructor() { }

    public static getInstance(): SSEService {
        if (!SSEService.instance) {
            SSEService.instance = new SSEService();
        }
        return SSEService.instance;
    }

    public addEventHandler<T>(url: string, handler: EventHandler<T>): void {
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

    public removeEventHandler<T>(url: string, handler: EventHandler<T>): void {
        const connection = this.connections.get(url);

        if (connection) {
            connection.handlers.delete(handler);

            if (connection.handlers.size === 0) {
                connection.eventSource.close();
                this.connections.delete(url);
            }
        }
    }

    private notifyHandlers<T>(url: string, event: T): void {
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
}
