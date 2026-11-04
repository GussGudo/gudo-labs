/**
 * map-adapter.js
 * Adaptador puro para transformar el escenario geoespacial en un ViewModel visual.
 */

const VALID_STATUSES = new Set(['active', 'warning', 'inactive']);

class MapAdapter {
    static project(syntheticMap, fleetViewModel, selectedItem, width, height) {
        // --- Validaciones iniciales ---
        if (!syntheticMap || typeof syntheticMap !== 'object') {
            throw new TypeError('[MapAdapter] syntheticMap debe ser un objeto.');
        }
        if (!syntheticMap.cedis || !Array.isArray(syntheticMap.stops) || !syntheticMap.routes) {
            throw new TypeError('[MapAdapter] syntheticMap debe tener cedis, stops y routes.');
        }
        if (!fleetViewModel || !Array.isArray(fleetViewModel.vehicles)) {
            throw new TypeError('[MapAdapter] fleetViewModel debe tener vehicles.');
        }
        if (typeof width !== 'number' || !Number.isFinite(width) || width <= 0) {
            throw new TypeError('[MapAdapter] width debe ser un número finito positivo.');
        }
        if (typeof height !== 'number' || !Number.isFinite(height) || height <= 0) {
            throw new TypeError('[MapAdapter] height debe ser un número finito positivo.');
        }

        const { cedis, stops, routes } = syntheticMap;

        // --- Validar CEDIS ---
        if (
            !cedis.id || typeof cedis.id !== 'string' ||
            !Number.isFinite(cedis.lat) || cedis.lat < -90 || cedis.lat > 90 ||
            !Number.isFinite(cedis.lon) || cedis.lon < -180 || cedis.lon > 180
        ) {
            throw new TypeError('[MapAdapter] CEDIS mal formado o coordenadas inválidas.');
        }

        // --- Validar paradas ---
        const stopIdSet = new Set();
        stops.forEach((s, i) => {
            if (!s || typeof s !== 'object') throw new TypeError(`[MapAdapter] Parada ${i} no es un objeto válido.`);
            if (!s.id || typeof s.id !== 'string') throw new TypeError(`[MapAdapter] Parada ${i} no tiene id válido.`);
            if (stopIdSet.has(s.id)) throw new TypeError(`[MapAdapter] ID de parada duplicado: ${s.id}`);
            stopIdSet.add(s.id);

            if (!Number.isFinite(s.lat) || s.lat < -90 || s.lat > 90) throw new TypeError(`[MapAdapter] Latitud inválida en parada ${s.id}.`);
            if (!Number.isFinite(s.lon) || s.lon < -180 || s.lon > 180) throw new TypeError(`[MapAdapter] Longitud inválida en parada ${s.id}.`);
            if (typeof s.routeId !== 'string') throw new TypeError(`[MapAdapter] Parada ${s.id} sin routeId.`);
            if (typeof s.order !== 'number' || !Number.isInteger(s.order)) throw new TypeError(`[MapAdapter] Parada ${s.id} con order inválido.`);
        });

        // --- Validar vehículos (MA-07, MA-08) ---
        const vehicleIdSet = new Set();
        fleetViewModel.vehicles.forEach(v => {
            if (!v || typeof v !== 'object') {
                throw new TypeError('[MapAdapter] Vehículo inválido en FleetViewModel.');
            }
            if (!v.id || typeof v.id !== 'string') {
                throw new TypeError('[MapAdapter] Vehículo con id inválido en FleetViewModel.');
            }
            if (vehicleIdSet.has(v.id)) {
                throw new TypeError(`[MapAdapter] ID de vehículo duplicado en FleetViewModel: ${v.id}`);
            }
            vehicleIdSet.add(v.id);

            if (!VALID_STATUSES.has(v.status)) {
                throw new TypeError(`[MapAdapter] Estado semántico inválido para ${v.id}: ${v.status}`);
            }
        });

        // --- Validar rutas ---
        const routesList = Object.keys(routes);
        routesList.forEach(vehicleId => {
            if (!vehicleIdSet.has(vehicleId)) {
                throw new TypeError(`[MapAdapter] Ruta ${vehicleId} no corresponde a un vehículo en FleetViewModel.`);
            }
        });

        const globalSeen = new Set();
        routesList.forEach(vehicleId => {
            const seq = routes[vehicleId];
            if (!Array.isArray(seq)) throw new TypeError(`[MapAdapter] Ruta ${vehicleId} no es un arreglo.`);
            if (seq.length < 2) throw new TypeError(`[MapAdapter] Ruta ${vehicleId} debe tener al menos el CEDIS.`);

            if (seq[0] !== cedis.id || seq[seq.length - 1] !== cedis.id) {
                throw new TypeError(`[MapAdapter] Ruta ${vehicleId} no comienza y termina en el CEDIS.`);
            }
            for (let i = 1; i < seq.length - 1; i++) {
                if (seq[i] === cedis.id) throw new TypeError(`[MapAdapter] Ruta ${vehicleId} contiene CEDIS intermedio.`);
            }

            const routeStops = new Set();
            let expectedOrder = 1;
            for (const ref of seq) {
                if (ref === cedis.id) continue;

                if (routeStops.has(ref)) throw new TypeError(`[MapAdapter] Ruta ${vehicleId} repite parada: ${ref}`);
                routeStops.add(ref);

                if (globalSeen.has(ref)) throw new TypeError(`[MapAdapter] Parada ${ref} aparece en múltiples rutas.`);
                globalSeen.add(ref);

                const stop = stops.find(s => s.id === ref);
                if (!stop) throw new TypeError(`[MapAdapter] Ruta ${vehicleId} contiene parada inexistente: ${ref}`);
                if (stop.routeId !== vehicleId) throw new TypeError(`[MapAdapter] Parada ${ref} declara routeId ${stop.routeId}, aparece en ${vehicleId}.`);
                if (stop.order !== expectedOrder) throw new TypeError(`[MapAdapter] Parada ${ref} tiene order ${stop.order}, esperaba ${expectedOrder}.`);
                expectedOrder++;
            }
        });

        stops.forEach(s => {
            if (!globalSeen.has(s.id)) throw new TypeError(`[MapAdapter] Parada ${s.id} no está en ninguna ruta.`);
        });

        // --- Índice de estados semánticos ---
        const vehicleStatusMap = new Map();
        fleetViewModel.vehicles.forEach(v => {
            vehicleStatusMap.set(v.id, v.status);
        });

        // --- Proyección equirectangular ---
        const padding = 40;
        const usableWidth = width - padding * 2;
        const usableHeight = height - padding * 2;
        if (usableWidth <= 0 || usableHeight <= 0) throw new TypeError('[MapAdapter] Dimensiones demasiado pequeñas.');

        let minLat = cedis.lat, maxLat = cedis.lat, minLon = cedis.lon, maxLon = cedis.lon;
        stops.forEach(s => {
            if (s.lat < minLat) minLat = s.lat;
            if (s.lat > maxLat) maxLat = s.lat;
            if (s.lon < minLon) minLon = s.lon;
            if (s.lon > maxLon) maxLon = s.lon;
        });

        const rangeX = (maxLon - minLon) || 1e-9;
        const rangeY = (maxLat - minLat) || 1e-9;
        if (rangeX < 1e-9 && rangeY < 1e-9) throw new TypeError('[MapAdapter] Extensión degenerada.');

        const refLat = (minLat + maxLat) / 2;
        const cosRef = Math.cos(refLat * Math.PI / 180);
        const adjustedRangeX = rangeX * cosRef;

        const scaleX = usableWidth / adjustedRangeX;
        const scaleY = usableHeight / rangeY;
        const scale = Math.min(scaleX, scaleY);

        const offsetX = padding + (usableWidth - adjustedRangeX * scale) / 2;
        const offsetY = padding + (usableHeight - rangeY * scale) / 2;

        const project = (lat, lon) => ({
            x: offsetX + (lon - minLon) * cosRef * scale,
            y: height - (offsetY + (lat - minLat) * scale)
        });

        // --- Construir ViewModel ---
        const projectedStops = stops.map(s => {
            const p = project(s.lat, s.lon);
            return {
                id: s.id, x: p.x, y: p.y, routeId: s.routeId, order: s.order,
                status: vehicleStatusMap.get(s.routeId)
            };
        });

        const stopMap = new Map(projectedStops.map(s => [s.id, s]));

        let selectedVehicleId = null;
        if (selectedItem && selectedItem.type === 'vehicle' && routesList.includes(selectedItem.id)) {
            selectedVehicleId = selectedItem.id;
        }

        const cedisPoint = project(cedis.lat, cedis.lon);

        const projectedRoutes = {};
        routesList.forEach(vehicleId => {
            const seq = routes[vehicleId];
            const points = seq.map(ref => {
                if (ref === cedis.id) return { x: cedisPoint.x, y: cedisPoint.y };
                const stop = stopMap.get(ref);
                return { x: stop.x, y: stop.y };
            });

            projectedRoutes[vehicleId] = {
                vehicleId,
                points,
                status: vehicleStatusMap.get(vehicleId),
                isSelected: vehicleId === selectedVehicleId
            };
        });

        return {
            width, height,
            cedis: { x: cedisPoint.x, y: cedisPoint.y },
            stops: projectedStops,
            routes: projectedRoutes,
            selectedVehicleId
        };
    }
}

export const mapAdapter = MapAdapter;