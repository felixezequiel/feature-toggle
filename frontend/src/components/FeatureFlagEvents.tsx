import React from 'react';
import { useFeatureFlagEvents } from '../hooks/useFeatureFlagEvents';

export const FeatureFlagEvents: React.FC = () => {
    const { events, clearEvents, getLatestEvent, getEventsByType } = useFeatureFlagEvents();

    const latestEvent = getLatestEvent();
    const changeEvents = getEventsByType('feature_flag_changed');
    const updateEvents = getEventsByType('feature_flags_updated');

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">🔔 Eventos de Feature Flags</h2>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={clearEvents}
                        className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                    >
                        Limpar
                    </button>
                </div>
            </div>

            {/* Último Evento */}
            {latestEvent && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">📡 Último Evento</h3>
                    <div className="text-sm text-blue-700">
                        <p><strong>Tipo:</strong> {latestEvent.type}</p>
                        {latestEvent.toggleName && <p><strong>Feature:</strong> {latestEvent.toggleName}</p>}
                        {latestEvent.enabled !== undefined && (
                            <p><strong>Status:</strong> {latestEvent.enabled ? '✅ Ativada' : '❌ Desativada'}</p>
                        )}
                        {latestEvent.totalToggles && <p><strong>Total:</strong> {latestEvent.totalToggles}</p>}
                        {latestEvent.project && <p><strong>Projeto:</strong> {latestEvent.project}</p>}
                        {latestEvent.stale !== undefined && (
                            <p><strong>Stale:</strong> {latestEvent.stale ? '🔄 Sim' : '✅ Não'}</p>
                        )}
                        <p><strong>Horário:</strong> {new Date(latestEvent.timestamp).toLocaleString('pt-BR')}</p>
                    </div>
                </div>
            )}

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{events.length}</div>
                    <div className="text-sm text-green-700">Total de Eventos</div>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{changeEvents.length}</div>
                    <div className="text-sm text-blue-700">Mudanças de Flags</div>
                </div>
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">{updateEvents.length}</div>
                    <div className="text-sm text-purple-700">Atualizações Gerais</div>
                </div>
            </div>

            {/* Lista de Eventos */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800">📋 Histórico de Eventos</h3>
                {events.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Nenhum evento recebido ainda...</p>
                ) : (
                    <div className="max-h-96 overflow-y-auto space-y-2">
                        {events.slice().reverse().map((event, index) => (
                            <div
                                key={`${event.timestamp}-${index}`}
                                className={`p-3 rounded-md border ${event.type === 'feature_flag_changed'
                                    ? 'bg-yellow-50 border-yellow-200'
                                    : 'bg-purple-50 border-purple-200'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <span className={`text-sm font-medium ${event.type === 'feature_flag_changed' ? 'text-yellow-700' : 'text-purple-700'
                                            }`}>
                                            {event.type === 'feature_flag_changed' ? '🔄' : '📡'} {event.type}
                                        </span>
                                        {event.toggleName && (
                                            <span className="text-sm text-gray-600">({event.toggleName})</span>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {new Date(event.timestamp).toLocaleTimeString('pt-BR')}
                                    </span>
                                </div>
                                {event.type === 'feature_flag_changed' && event.enabled !== undefined && (
                                    <div className="mt-1 text-sm text-gray-600">
                                        Status: {event.enabled ? '✅ Ativada' : '❌ Desativada'}
                                        {event.project && <span className="ml-2">| Projeto: {event.project}</span>}
                                        {event.stale !== undefined && (
                                            <span className="ml-2">| Stale: {event.stale ? '🔄 Sim' : '✅ Não'}</span>
                                        )}
                                    </div>
                                )}
                                {event.type === 'feature_flags_updated' && event.totalToggles && (
                                    <div className="mt-1 text-sm text-gray-600">
                                        Total de flags: {event.totalToggles}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
