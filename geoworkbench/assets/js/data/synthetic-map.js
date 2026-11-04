/**
 * synthetic-map.js
 * Escenario geoespacial sintético determinista.
 * Semilla fija: 20261101.
 */

export function generateSyntheticMap() {
    const SEED = 20261101;
    let state = SEED;

    function random() {
        state |= 0;
        state = state + 0x6D2B79F5 | 0;
        let t = Math.imul(state ^ state >>> 15, 1 | state);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }

    const CENTER_LAT = 19.4326;
    const CENTER_LON = -99.1332;
    const RADIUS = 0.02;

    const cedis = { id: 'cedis-1', lat: CENTER_LAT, lon: CENTER_LON };

    const stops = [];
    const routes = { v1: ['cedis-1'], v2: ['cedis-1'], v3: ['cedis-1'] };
    const vehicles = ['v1', 'v2', 'v3'];
    const stopsPerVehicle = 31;

    let stopCounter = 1;
    vehicles.forEach(vehicleId => {
        for (let i = 0; i < stopsPerVehicle; i++) {
            const angle = random() * Math.PI * 2;
            const r = random() * RADIUS;
            const lat = CENTER_LAT + Math.sin(angle) * r;
            const lon = CENTER_LON + Math.cos(angle) * r;
            const stopId = `stop-${String(stopCounter).padStart(3, '0')}`;
            const order = i + 1;

            stops.push({
                id: stopId,
                lat: lat,
                lon: lon,
                routeId: vehicleId,
                order: order
            });

            routes[vehicleId].push(stopId);
            stopCounter++;
        }
        routes[vehicleId].push('cedis-1');
    });

    return {
        metadata: { source: 'synthetic', seed: SEED },
        cedis,
        stops,
        routes
    };
}