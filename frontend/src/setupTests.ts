/* eslint-disable @typescript-eslint/no-explicit-any */
// Configuração global para testes
import '@testing-library/jest-dom';

// Mock do EventSource se não estiver disponível
if (typeof EventSource === 'undefined') {
    (window as any).EventSource = class MockEventSource {
        public onopen: ((event: any) => void) | null = null;
        public onmessage: ((event: any) => void) | null = null;
        public onerror: ((event: any) => void) | null = null;
        public readyState = 0;

        constructor() {
            this.readyState = 1; // OPEN
            setTimeout(() => {
                if (this.onopen) {
                    this.onopen({});
                }
            }, 0);
        }

        close() {
            this.readyState = 2; // CLOSED
        }
    };
}
