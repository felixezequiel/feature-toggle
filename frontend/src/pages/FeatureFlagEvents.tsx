import React from 'react';
import { FeatureFlagEvents } from '../components/FeatureFlagEvents';

const FeatureFlagEventsPage: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    📡 Eventos em Tempo Real
                </h1>
                <p className="text-gray-600 text-lg">
                    Monitore mudanças nas feature flags em tempo real usando Server-Sent Events (SSE).
                    Esta página demonstra como o backend pode notificar o frontend sobre alterações
                    sem necessidade de WebSockets ou polling.
                </p>
            </div>

            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h2 className="text-lg font-semibold text-blue-800 mb-2">ℹ️ Como Funciona</h2>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>• O backend detecta mudanças nas feature flags via eventos do Unleash</li>
                    <li>• Eventos são enviados para o frontend usando Server-Sent Events (SSE)</li>
                    <li>• O frontend recebe notificações em tempo real sem polling</li>
                    <li>• Conexão é mantida automaticamente com reconexão em caso de erro</li>
                </ul>
            </div>

            <FeatureFlagEvents />

            <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">🧪 Teste a Funcionalidade</h3>
                <p className="text-gray-600 text-sm mb-3">
                    Para testar, altere uma feature flag no painel admin do Unleash (http://localhost:4242)
                    e veja o evento aparecer em tempo real nesta página.
                </p>
                <div className="text-xs text-gray-500">
                    <p><strong>Dica:</strong> Abra o console do navegador para ver logs detalhados dos eventos.</p>
                </div>
            </div>
        </div>
    );
};

export default FeatureFlagEventsPage;
