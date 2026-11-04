/**
 * diagnostic-coordinator.js
 * Coordinador central para el registro de eventos de diagnóstico.
 * Responsabilidad: Unificar la escritura en DiagnosticState y la notificación mediante EventBus.
 */

import { DiagnosticState } from '../state/diagnostic-state.js';
import { EventBus } from '../events/event-bus.js';

class DiagnosticCoordinator {
    /**
     * Registra un evento y, si tiene éxito, notifica al sistema.
     */
    static log(level, source, code, message, details = null) {
        const event = DiagnosticState.record(level, source, code, message, details);
        EventBus.emit('DIAGNOSTIC_UPDATED', event);
        return event;
    }
}

export const diagnosticCoordinator = DiagnosticCoordinator;