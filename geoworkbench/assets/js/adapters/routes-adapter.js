/**
 * routes-adapter.js
 * Adaptador puro para transformar el escenario geoespacial sintético
 * en un ViewModel de rutas para el RoutesModule.
 */

class RoutesAdapter {
    static project(syntheticMap) {
        // --- 1. Validaciones de entrada ---
        if (!syntheticMap || typeof syntheticMap !== 'object') {
            throw new TypeError('[RoutesAdapter] syntheticMap debe ser un objeto.');
        }
        if (!syntheticMap.cedis || !syntheticMap.routes || !Array.isArray(syntheticMap.stops)) {
            throw new TypeError('[RoutesAdapter] syntheticMap debe tener cedis, routes y stops.');
        }

        const { cedis, routes, stops } = syntheticMap;

        // Validar que cedis.id sea string no vacío
        if (typeof cedis.id !== 'string' || cedis.id.trim() === '') {
            throw new TypeError('[RoutesAdapter] cedis.id debe ser un string no vacío.');
        }

        // Validar que routes sea un objeto plano
        if (typeof routes !== 'object' || routes === null || Array.isArray(routes)) {
            throw new TypeError('[RoutesAdapter] routes debe ser un objeto plano.');
        }

        const routeIds = Object.keys(routes);
        if (routeIds.length === 0) {
            throw new TypeError('[RoutesAdapter] No hay rutas definidas en el mapa.');
        }

        // RA-01: Validar unicidad de IDs en la fuente de paradas
        const stopMap = new Map();
        for (const stop of stops) {
            if (!stop || typeof stop !== 'object' || !stop.id) {
                throw new TypeError('[RoutesAdapter] Parada mal formada.');
            }
            if (stopMap.has(stop.id)) {
                throw new TypeError(`[RoutesAdapter] ID de parada duplicado en la fuente: ${stop.id}`);
            }
            stopMap.set(stop.id, stop);
        }

        const projectedRoutes = [];
        const globalSeenStops = new Set();

        for (const vehicleId of routeIds) {
            const sequence = routes[vehicleId];

            if (!Array.isArray(sequence)) {
                throw new TypeError(`[RoutesAdapter] La ruta ${vehicleId} no es un arreglo.`);
            }
            if (sequence.length < 3) {
                throw new TypeError(`[RoutesAdapter] La ruta ${vehicleId} debe tener al menos CEDIS, una parada y CEDIS.`);
            }

            if (sequence[0] !== cedis.id || sequence[sequence.length - 1] !== cedis.id) {
                throw new TypeError(`[RoutesAdapter] La ruta ${vehicleId} no comienza y termina en el CEDIS.`);
            }

            for (let i = 1; i < sequence.length - 1; i++) {
                if (sequence[i] === cedis.id) {
                    throw new TypeError(`[RoutesAdapter] La ruta ${vehicleId} contiene CEDIS en posición intermedia.`);
                }
            }

            const deliveryStops = [];
            const localSeenStops = new Set();

            for (let i = 1; i < sequence.length - 1; i++) {
                const stopId = sequence[i];
                const stop = stopMap.get(stopId);

                if (!stop) {
                    throw new TypeError(`[RoutesAdapter] La ruta ${vehicleId} contiene parada inexistente: ${stopId}`);
                }

                // RA-02: Validar primero duplicado local, luego global
                if (localSeenStops.has(stopId)) {
                    throw new TypeError(`[RoutesAdapter] La ruta ${vehicleId} repite parada: ${stopId}`);
                }
                localSeenStops.add(stopId);

                if (globalSeenStops.has(stopId)) {
                    throw new TypeError(`[RoutesAdapter] Parada ${stopId} aparece en múltiples rutas.`);
                }
                globalSeenStops.add(stopId);

                if (stop.routeId !== vehicleId) {
                    throw new TypeError(`[RoutesAdapter] Parada ${stopId} de ruta ${vehicleId} tiene routeId incorrecto: ${stop.routeId}`);
                }

                if (stop.order !== i) {
                    throw new TypeError(`[RoutesAdapter] Parada ${stopId} de ruta ${vehicleId} tiene order ${stop.order}, esperaba ${i}.`);
                }

                deliveryStops.push({ id: stop.id, order: stop.order });
            }

            if (deliveryStops.length === 0) {
                throw new TypeError(`[RoutesAdapter] La ruta ${vehicleId} no contiene paradas de entrega.`);
            }

            projectedRoutes.push({
                vehicleId: vehicleId,
                stopsCount: deliveryStops.length,
                sequence: sequence.slice(),
                deliveryStops: deliveryStops
            });
        }

        // RA-03: Cobertura completa
        if (globalSeenStops.size !== stops.length) {
            throw new TypeError(`[RoutesAdapter] Cobertura incompleta: ${stops.length} paradas en la fuente, ${globalSeenStops.size} referenciadas en rutas.`);
        }

        // Validar unicidad de vehicleId
        const vehicleIds = projectedRoutes.map(r => r.vehicleId);
        if (new Set(vehicleIds).size !== vehicleIds.length) {
            throw new Error('[RoutesAdapter] Existen rutas duplicadas para un mismo vehículo.');
        }

        return {
            routes: projectedRoutes,
            totalRoutes: projectedRoutes.length
        };
    }
}

export const routesAdapter = RoutesAdapter;