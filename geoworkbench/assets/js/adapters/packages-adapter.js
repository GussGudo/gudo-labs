/**
 * packages-adapter.js
 * Adaptador puro para transformar los datos de paquetes (SyntheticPackages)
 * en un ViewModel listo para el PackagesModule.
 * 
 * Responsabilidad: Validar integridad referencial y proyectar.
 * Sin DOM, sin eventos, sin estado global.
 */

class PackagesAdapter {
    /**
     * Proyecta los paquetes al ViewModel.
     * @param {Object} packageData - Datos de synthetic-packages.js ({ packages: [...] })
     * @param {Object} fleetViewModel - ViewModel de fleet-adapter.js ({ vehicles: [...] })
     * @returns {Object} PackagesViewModel
     */
    static project(packageData, fleetViewModel) {
        // 1. Validaciones de entrada
        if (!packageData || typeof packageData !== 'object' || !Array.isArray(packageData.packages)) {
            throw new TypeError('[PackagesAdapter] packageData debe ser un objeto con arreglo "packages".');
        }
        if (!fleetViewModel || typeof fleetViewModel !== 'object' || !Array.isArray(fleetViewModel.vehicles)) {
            throw new TypeError('[PackagesAdapter] fleetViewModel debe ser un objeto con arreglo "vehicles".');
        }

        const rawPackages = packageData.packages;
        const vehicles = fleetViewModel.vehicles;

        // PA-01: Validación contractual de cardinalidad
        if (rawPackages.length !== 110) {
            throw new RangeError(`[PackagesAdapter] Se esperaban 110 paquetes; recibidos: ${rawPackages.length}.`);
        }

        // 2. Validar consistencia de la flota
        const vehicleIds = new Set();
        for (const v of vehicles) {
            if (!v || typeof v !== 'object' || !v.id || typeof v.id !== 'string') {
                throw new TypeError('[PackagesAdapter] Vehículo con ID inválido en fleetViewModel.');
            }
            // PA-02: Rechazar IDs compuestos solo por espacios
            if (v.id.trim() === '') {
                throw new TypeError('[PackagesAdapter] Vehículo con ID vacío en fleetViewModel.');
            }
            if (vehicleIds.has(v.id)) {
                throw new TypeError(`[PackagesAdapter] ID de vehículo duplicado en fleetViewModel: ${v.id}`);
            }
            vehicleIds.add(v.id);
        }

        // 3. Validar y proyectar paquetes
        const projectedPackages = [];
        const packageIds = new Set();
        let assignedCount = 0;

        for (const p of rawPackages) {
            if (!p || typeof p !== 'object') {
                throw new TypeError('[PackagesAdapter] Paquete mal formado.');
            }
            if (!p.id || typeof p.id !== 'string' || p.id.trim() === '') {
                throw new TypeError('[PackagesAdapter] Paquete sin ID válido.');
            }
            if (packageIds.has(p.id)) {
                throw new TypeError(`[PackagesAdapter] ID de paquete duplicado: ${p.id}`);
            }
            packageIds.add(p.id);

            if (typeof p.weight !== 'number' || !Number.isFinite(p.weight) || p.weight < 0) {
                throw new TypeError(`[PackagesAdapter] Peso inválido en paquete ${p.id}.`);
            }
            if (typeof p.vol !== 'number' || !Number.isFinite(p.vol) || p.vol < 0) {
                throw new TypeError(`[PackagesAdapter] Volumen inválido en paquete ${p.id}.`);
            }

            // Validar vehicleId
            if (!p.vehicleId || typeof p.vehicleId !== 'string') {
                throw new TypeError(`[PackagesAdapter] vehicleId inválido en paquete ${p.id}.`);
            }
            // PA-02: Rechazar IDs de vehículo vacíos o solo espacios
            if (p.vehicleId.trim() === '') {
                throw new TypeError(`[PackagesAdapter] vehicleId vacío en paquete ${p.id}.`);
            }
            if (!vehicleIds.has(p.vehicleId)) {
                throw new TypeError(`[PackagesAdapter] El paquete ${p.id} referencia un vehículo inexistente: ${p.vehicleId}`);
            }

            // Validar stopId
            if (!p.stopId || typeof p.stopId !== 'string' || p.stopId.trim() === '') {
                throw new TypeError(`[PackagesAdapter] stopId inválido en paquete ${p.id}.`);
            }

            // Proyección
            projectedPackages.push({
                id: p.id,
                weight: p.weight,
                vol: p.vol,
                vehicleId: p.vehicleId,
                stopId: p.stopId
            });

            assignedCount++;
        }

        // 4. Validaciones finales
        const totalCount = projectedPackages.length;
        
        if (assignedCount !== totalCount) {
            throw new Error(`[PackagesAdapter] Inconsistencia: ${assignedCount} asignados de ${totalCount} totales.`);
        }

        return {
            packages: projectedPackages,
            totalCount: totalCount,
            assignedCount: assignedCount
        };
    }
}

export const packagesAdapter = PackagesAdapter;