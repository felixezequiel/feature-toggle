import { useEffect, useState, useCallback, useRef } from 'react';
import { SSEService } from '../services';
import { FeatureFlagEvent } from '../types/FeatureFlagEvent';

export const useFeatureFlagEvents = () => {
    const [events, setEvents] = useState<FeatureFlagEvent[]>([]);

    const sseServiceRef = useRef<SSEService | null>(null);
    const eventHandlerRef = useRef<((event: FeatureFlagEvent) => void) | null>(null);

    // URL específica para feature flags
    const featureFlagEventsUrl = 'http://localhost:3000/feature-flags/events';

    const handleEvent = useCallback((event: FeatureFlagEvent) => {
        setEvents(prev => [...prev, event]);
    }, []);

    useEffect(() => {
        // Obter instância única do serviço SSE
        sseServiceRef.current = SSEService.getInstance();

        // Criar handler de evento
        eventHandlerRef.current = handleEvent;

        // Adicionar handler ao serviço para o endpoint específico
        sseServiceRef.current.addEventHandler(featureFlagEventsUrl, eventHandlerRef.current);

        return () => {
            // Remover handler do serviço
            if (sseServiceRef.current && eventHandlerRef.current) {
                sseServiceRef.current.removeEventHandler(featureFlagEventsUrl, eventHandlerRef.current);
            }
        };
    }, [handleEvent]);

    const clearEvents = useCallback(() => {
        setEvents([]);
    }, []);

    const getLatestEvent = useCallback(() => {
        return events[events.length - 1];
    }, [events]);

    const getEventsByType = useCallback((type: FeatureFlagEvent['type']) => {
        return events.filter(event => event.type === type);
    }, [events]);

    return {
        events,
        clearEvents,
        getLatestEvent,
        getEventsByType
    };
};
