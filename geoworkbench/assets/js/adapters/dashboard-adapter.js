/**
 * dashboard-adapter.js
 * Adaptador para transformar datos de dominio (ScenarioState) en un ViewModel de presentación (DashboardViewModel).
 * Responsabilidad: Transformación pura. Sin DOM, sin eventos, sin estado propio.
 * Frontera de entrada protegida: valida la estructura mínima requerida antes de proyectar.
 */

class DashboardAdapter {
    /**
     * S-20: Traducción explícita de estado operativo a estado visual.
     * Lanza excepción si el estado no es conocido.
     */
    static #projectStatus(vehicle) {
        switch (vehicle.operationalStatus) {
            case 'inactive':
            case 'maintenance':
                return 'inactive';
            
            case 'available':
                return 'active';
            
            case 'assigned':
                // Regla de presentación: Alerta visual por alta ocupación
                return vehicle.metrics.volPercentage > 95 ? 'warning' : 'active';
            
            default:
                // S-20: Fallar rápido ante estados no contemplados
                throw new TypeError(
                    `[DashboardAdapter] Estado operativo desconocido: ${vehicle.operationalStatus}`
                );
        }
    }

    /**
     * Valida que las entradas tengan la estructura mínima requerida por el adaptador.
     * No duplica los controles de ScenarioState, solo protege la frontera de lectura.
     */
    static #validateInputs(summary, vehicles) {
        // 1. Validar summary
        if (!summary || typeof summary !== 'object' || Array.isArray(summary)) {
            throw new TypeError('[DashboardAdapter] summary debe ser un objeto válido.');
        }

        const requiredSummaryKeys = ['totalPackages', 'totalStops', 'assignedVehicles', 'totalVehicles', 'totalDistanceKm'];
        for (const key of requiredSummaryKeys) {
            if (typeof summary[key] !== 'number' || !Number.isFinite(summary[key])) {
                throw new TypeError(`[DashboardAdapter] summary.${key} debe ser un número finito.`);
            }
        }

        // 2. Validar vehicles
        if (!Array.isArray(vehicles)) {
            throw new TypeError('[DashboardAdapter] vehicles debe ser un arreglo.');
        }

        for (let i = 0; i < vehicles.length; i++) {
            // Detectar sparse arrays (huecos)
            if (!Object.hasOwn(vehicles, i)) {
                throw new TypeError(`[DashboardAdapter] vehicles contiene un hueco en el índice ${i}.`);
            }

            const v = vehicles[i];
            if (!v || typeof v !== 'object' || Array.isArray(v)) {
                throw new TypeError(`[DashboardAdapter] El vehículo en el índice ${i} debe ser un objeto.`);
            }

            // Validar campos específicos que el adaptador utiliza
            if (typeof v.id !== 'string') throw new TypeError(`[DashboardAdapter] vehicles[${i}].id debe ser un string.`);
            if (typeof v.type !== 'string') throw new TypeError(`[DashboardAdapter] vehicles[${i}].type debe ser un string.`);
            if (typeof v.operationalStatus !== 'string') throw new TypeError(`[DashboardAdapter] vehicles[${i}].operationalStatus debe ser un string.`);
            
            if (!v.metrics || typeof v.metrics !== 'object' || Array.isArray(v.metrics)) {
                throw new TypeError(`[DashboardAdapter] vehicles[${i}].metrics debe ser un objeto.`);
            }
            if (typeof v.metrics.volPercentage !== 'number' || !Number.isFinite(v.metrics.volPercentage)) {
                throw new TypeError(`[DashboardAdapter] vehicles[${i}].metrics.volPercentage debe ser un número finito.`);
            }
        }
    }

    /**
     * Proyecta los datos del dominio al contrato de presentación.
     * @param {Object} summary - Objeto de resumen del dominio (ScenarioState.summary)
     * @param {Array} vehicles - Arreglo de vehículos del dominio (ScenarioState.vehicles)
     * @returns {Object} DashboardViewModel { kpis: [], vehicles: [] }
     * @throws {TypeError} Si las entradas violan la estructura mínima o los estados son desconocidos.
     */
    static project(summary, vehicles) {
        // 1. Validar la frontera de entrada
        this.#validateInputs(summary, vehicles);

        // 2. Proyección de KPIs
        const kpis = [
            { label: 'Paquetes', value: String(summary.totalPackages) },
            { label: 'Paradas', value: String(summary.totalStops) },
            { label: 'Vehículos asignados', value: `${summary.assignedVehicles} / ${summary.totalVehicles}` },
            { label: 'Distancia total', value: `${summary.totalDistanceKm.toFixed(2)} km` }
        ];

        // 3. Proyección de Vehículos
        const projectedVehicles = vehicles.map(v => {
            return {
                id: v.id,
                type: v.type,
                vol: v.metrics.volPercentage,
                status: this.#projectStatus(v) 
            };
        });

        return {
            kpis: kpis,
            vehicles: projectedVehicles
        };
    }
}

export const dashboardAdapter = DashboardAdapter;