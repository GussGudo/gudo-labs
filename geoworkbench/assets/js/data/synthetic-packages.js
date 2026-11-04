/**
 * synthetic-packages.js
 * Generador determinista de paquetes sintéticos.
 * Semilla fija: 20261102.
 * 
 * Dependencia: Requiere que se le pase el `syntheticMap` generado por `synthetic-map.js`.
 * Esto garantiza que los paquetes se asignen a paradas que realmente existen
 * en las rutas de cada vehículo.
 */

export function generateSyntheticPackages(syntheticMap) {
    // --- 1. Validación estricta del mapa de entrada ---
    if (!syntheticMap || typeof syntheticMap !== 'object') {
        throw new TypeError('[SyntheticPackages] syntheticMap debe ser un objeto.');
    }

    const { cedis, stops, routes } = syntheticMap;

    // SP-01: Validar CEDIS
    if (!cedis || typeof cedis !== 'object' || typeof cedis.id !== 'string' || cedis.id.trim() === '') {
        throw new TypeError('[SyntheticPackages] CEDIS inválido o sin ID.');
    }

    if (!Array.isArray(stops) || !routes) {
        throw new TypeError('[SyntheticPackages] syntheticMap debe contener stops y routes.');
    }

    if (stops.length !== 93) {
        throw new TypeError(`[SyntheticPackages] Se esperaban 93 paradas, se recibieron ${stops.length}.`);
    }

    const routeIds = ['v1', 'v2', 'v3'];
    const stopIds = new Set();

    // Validar que cada parada tenga ID único, no vacío, distinto del CEDIS y routeId válido
    for (const stop of stops) {
        if (!stop || typeof stop !== 'object' || !stop.id || typeof stop.id !== 'string') {
            throw new TypeError('[SyntheticPackages] Parada mal formada o sin ID.');
        }

        // SP-04: Validar que el ID no esté vacío
        if (stop.id.trim() === '') {
            throw new TypeError('[SyntheticPackages] El ID de parada no puede estar vacío.');
        }

        // SP-04: Validar que el ID no coincida con el CEDIS
        if (stop.id === cedis.id) {
            throw new TypeError('[SyntheticPackages] El ID de una parada no puede coincidir con el CEDIS.');
        }

        if (stopIds.has(stop.id)) {
            throw new TypeError(`[SyntheticPackages] ID de parada duplicado: ${stop.id}`);
        }
        stopIds.add(stop.id);

        if (!routeIds.includes(stop.routeId)) {
            throw new TypeError(`[SyntheticPackages] Parada ${stop.id} tiene routeId inválido: ${stop.routeId}`);
        }

        if (!Number.isInteger(stop.order) || stop.order < 1) {
            throw new TypeError(`[SyntheticPackages] Parada ${stop.id} tiene order inválido: ${stop.order}`);
        }
    }

    // Validar que las rutas existan y tengan la estructura correcta
    for (const vid of routeIds) {
        const routeSeq = routes[vid];
        if (!Array.isArray(routeSeq)) {
            throw new TypeError(`[SyntheticPackages] La ruta ${vid} no es un arreglo.`);
        }
        if (routeSeq.length !== 33) {
            throw new TypeError(`[SyntheticPackages] La ruta ${vid} debe tener 33 elementos (CEDIS + 31 + CEDIS).`);
        }
        if (routeSeq[0] !== cedis.id || routeSeq[routeSeq.length - 1] !== cedis.id) {
            throw new TypeError(`[SyntheticPackages] La ruta ${vid} no comienza y termina en el CEDIS.`);
        }
    }

    // SP-03: Derivar paradas desde las rutas
    const stopsByVehicle = {
        v1: routes.v1.slice(1, -1),
        v2: routes.v2.slice(1, -1),
        v3: routes.v3.slice(1, -1)
    };

    // Validar distribución: exactamente 31 por vehículo
    for (const vid of routeIds) {
        if (stopsByVehicle[vid].length !== 31) {
            throw new TypeError(`[SyntheticPackages] Se esperaban 31 paradas para ${vid}, se recibieron ${stopsByVehicle[vid].length}.`);
        }
    }

    // Validar correspondencia bidireccional y orden (SP-02)
    for (const vid of routeIds) {
        const routeStops = stopsByVehicle[vid];
        const routeStopSet = new Set(routeStops);

        if (routeStopSet.size !== routeStops.length) {
            throw new TypeError(`[SyntheticPackages] La ruta ${vid} contiene paradas duplicadas.`);
        }

        // Validar que cada parada de la ruta tenga order correcto
        const stopOrderMap = new Map(
            stops
                .filter(stop => stop.routeId === vid)
                .map(stop => [stop.id, stop.order])
        );

        for (let i = 0; i < routeStops.length; i++) {
            const stopId = routeStops[i];
            const expectedOrder = i + 1;
            const actualOrder = stopOrderMap.get(stopId);

            if (!Number.isInteger(actualOrder) || actualOrder !== expectedOrder) {
                throw new TypeError(`[SyntheticPackages] Orden inconsistente en ${stopId}, ruta ${vid}. Esperaba ${expectedOrder}, recibió ${actualOrder}.`);
            }
        }

        // Validar que todas las paradas de stopsByVehicle[vid] estén en stops con routeId correcto
        for (const stopId of routeStops) {
            const stop = stops.find(s => s.id === stopId);
            if (!stop) {
                throw new TypeError(`[SyntheticPackages] La ruta ${vid} contiene una parada inexistente: ${stopId}`);
            }
            if (stop.routeId !== vid) {
                throw new TypeError(`[SyntheticPackages] La parada ${stopId} de la ruta ${vid} tiene routeId incorrecto: ${stop.routeId}`);
            }
        }

        // Validar que no falte ninguna parada de stops con routeId === vid
        const allStopsForVehicle = stops.filter(s => s.routeId === vid).map(s => s.id);
        for (const stopId of allStopsForVehicle) {
            if (!routeStopSet.has(stopId)) {
                throw new TypeError(`[SyntheticPackages] La parada ${stopId} de ${vid} no aparece en su ruta.`);
            }
        }
    }

    // --- 2. Generación determinista de paquetes ---
    const SEED = 20261102;
    let state = SEED;

    function random() {
        state |= 0;
        state = state + 0x6D2B79F5 | 0;
        let t = Math.imul(state ^ state >>> 15, 1 | state);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }

    const randRange = (min, max) => min + random() * (max - min);

    const packages = [];
    let pkgCounter = 1;

    // --- v1: 43 paquetes (12 paradas con 2, 19 con 1) ---
    const v1StopIndices = Array.from({ length: 31 }, (_, i) => i);
    for (let i = v1StopIndices.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [v1StopIndices[i], v1StopIndices[j]] = [v1StopIndices[j], v1StopIndices[i]];
    }
    const v1StopsWith2 = v1StopIndices.slice(0, 12).sort((a, b) => a - b);
    const v1StopsWith1 = v1StopIndices.slice(12).sort((a, b) => a - b);

    v1StopsWith2.forEach(idx => {
        const stopId = stopsByVehicle.v1[idx];
        for (let k = 0; k < 2; k++) {
            packages.push({
                id: `pkg-${String(pkgCounter).padStart(3, '0')}`,
                weight: +randRange(1, 25).toFixed(2),
                vol: +randRange(0.01, 0.20).toFixed(3),
                vehicleId: 'v1',
                stopId: stopId
            });
            pkgCounter++;
        }
    });

    v1StopsWith1.forEach(idx => {
        const stopId = stopsByVehicle.v1[idx];
        packages.push({
            id: `pkg-${String(pkgCounter).padStart(3, '0')}`,
            weight: +randRange(1, 25).toFixed(2),
            vol: +randRange(0.01, 0.20).toFixed(3),
            vehicleId: 'v1',
            stopId: stopId
        });
        pkgCounter++;
    });

    // --- v2: 26 paquetes (26 paradas con 1) ---
    const v2StopIndices = Array.from({ length: 31 }, (_, i) => i);
    for (let i = v2StopIndices.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [v2StopIndices[i], v2StopIndices[j]] = [v2StopIndices[j], v2StopIndices[i]];
    }
    const v2StopsWith1 = v2StopIndices.slice(0, 26).sort((a, b) => a - b);

    v2StopsWith1.forEach(idx => {
        const stopId = stopsByVehicle.v2[idx];
        packages.push({
            id: `pkg-${String(pkgCounter).padStart(3, '0')}`,
            weight: +randRange(1, 25).toFixed(2),
            vol: +randRange(0.01, 0.20).toFixed(3),
            vehicleId: 'v2',
            stopId: stopId
        });
        pkgCounter++;
    });

    // --- v3: 41 paquetes (10 paradas con 2, 21 con 1) ---
    const v3StopIndices = Array.from({ length: 31 }, (_, i) => i);
    for (let i = v3StopIndices.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [v3StopIndices[i], v3StopIndices[j]] = [v3StopIndices[j], v3StopIndices[i]];
    }
    const v3StopsWith2 = v3StopIndices.slice(0, 10).sort((a, b) => a - b);
    const v3StopsWith1 = v3StopIndices.slice(10).sort((a, b) => a - b);

    v3StopsWith2.forEach(idx => {
        const stopId = stopsByVehicle.v3[idx];
        for (let k = 0; k < 2; k++) {
            packages.push({
                id: `pkg-${String(pkgCounter).padStart(3, '0')}`,
                weight: +randRange(1, 25).toFixed(2),
                vol: +randRange(0.01, 0.20).toFixed(3),
                vehicleId: 'v3',
                stopId: stopId
            });
            pkgCounter++;
        }
    });

    v3StopsWith1.forEach(idx => {
        const stopId = stopsByVehicle.v3[idx];
        packages.push({
            id: `pkg-${String(pkgCounter).padStart(3, '0')}`,
            weight: +randRange(1, 25).toFixed(2),
            vol: +randRange(0.01, 0.20).toFixed(3),
            vehicleId: 'v3',
            stopId: stopId
        });
        pkgCounter++;
    });

    if (packages.length !== 110) {
        throw new Error(`[SyntheticPackages] Se esperaban 110 paquetes, se generaron ${packages.length}.`);
    }

    return {
        metadata: {
            source: 'synthetic',
            seed: SEED,
            description: '110 paquetes sintéticos distribuidos coherentemente'
        },
        packages: packages
    };
}