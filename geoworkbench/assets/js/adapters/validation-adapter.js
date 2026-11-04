/**
 * validation-adapter.js
 * Adaptador puro que ejecuta las comprobaciones de integridad (C1-C7)
 * sobre el estado del escenario y proyecta un ViewModel de validación.
 * 
 * Responsabilidad: Auditoría independiente de invariantes.
 * Sin DOM, sin eventos, sin modificar el estado.
 * Las excepciones se propagan; no se convierten en PASS.
 */

class ValidationAdapter {
    static project(summary, vehicles, packages) {
        // 1. Validaciones de entrada
        if (!summary || typeof summary !== 'object') {
            throw new TypeError('[ValidationAdapter] summary debe ser un objeto.');
        }
        if (!Array.isArray(vehicles)) {
            throw new TypeError('[ValidationAdapter] vehicles debe ser un arreglo.');
        }
        if (!Array.isArray(packages)) {
            throw new TypeError('[ValidationAdapter] packages debe ser un arreglo.');
        }

        const checks = [];

        // C1: Cardinalidad del catálogo
        const c1Passed = summary.totalPackages === packages.length;
        checks.push({
            id: 'C1',
            name: 'Cardinalidad del catálogo',
            passed: c1Passed,
            details: c1Passed 
                ? `${packages.length} paquetes` 
                : `summary indica ${summary.totalPackages}, hay ${packages.length} paquetes.`
        });

        // C2: Referencias de vehículos (Corrección: semántica de ausencia)
        let invalidRefs = 0;
        let partialRefs = 0;
        const vehicleIds = new Set(vehicles.map(v => v.id));
        
        for (const p of packages) {
            // Ausencia válida: null explícito. Cualquier otro valor es presencia.
            const hasVehicle = p.vehicleId !== null;
            const hasStop = p.stopId !== null;
            
            if (hasVehicle !== hasStop) {
                // Asignación parcial (uno es null y el otro no)
                partialRefs++;
            } else if (hasVehicle && !vehicleIds.has(p.vehicleId)) {
                // Presencia con referencia inválida (vehículo no existe)
                invalidRefs++;
            }
            // Nota: Si ambos son null, es válido (paquete no asignado).
            // Si ambos son undefined, hasVehicle y hasStop serán true, y caerán
            // en la comprobación de vehicleIds.has(undefined) -> false -> invalidRefs++.
        }
        
        let c2Passed = true;
        let c2Details = 'Todas las referencias son válidas';
        
        if (invalidRefs > 0 || partialRefs > 0) {
            c2Passed = false;
            const parts = [];
            if (invalidRefs > 0) parts.push(`${invalidRefs} referencias inexistentes`);
            if (partialRefs > 0) parts.push(`${partialRefs} asignaciones parciales`);
            c2Details = parts.join(', ');
        }
        
        checks.push({
            id: 'C2',
            name: 'Referencias de vehículos',
            passed: c2Passed,
            details: c2Details
        });

        // C3: Consistencia de flota
        const c3Passed = summary.totalVehicles === vehicles.length;
        checks.push({
            id: 'C3',
            name: 'Consistencia de flota',
            passed: c3Passed,
            details: c3Passed
                ? `${vehicles.length} vehículos`
                : `summary indica ${summary.totalVehicles}, hay ${vehicles.length} vehículos.`
        });

        // C4: Consistencia de asignados
        const assignedCount = vehicles.filter(v => v.operationalStatus === 'assigned').length;
        const c4Passed = summary.assignedVehicles === assignedCount;
        checks.push({
            id: 'C4',
            name: 'Consistencia de asignados',
            passed: c4Passed,
            details: c4Passed
                ? `${assignedCount} vehículos asignados`
                : `summary indica ${summary.assignedVehicles}, hay ${assignedCount} asignados.`
        });

        // C5: IDs únicos de paquetes
        const pkgIds = packages.map(p => p.id);
        const pkgIdsValid = pkgIds.every(id => typeof id === 'string' && id.trim().length > 0);
        
        let c5Passed = false;
        let c5Details = '';
        
        if (!pkgIdsValid) {
            c5Details = 'Se detectaron IDs inválidos.';
        } else {
            const uniquePkgIds = new Set(pkgIds);
            if (uniquePkgIds.size === pkgIds.length) {
                c5Passed = true;
                c5Details = `${pkgIds.length} IDs únicos`;
            } else {
                c5Details = `${pkgIds.length - uniquePkgIds.size} IDs duplicados detectados.`;
            }
        }
        
        checks.push({
            id: 'C5',
            name: 'IDs únicos de paquetes',
            passed: c5Passed,
            details: c5Details
        });

        // C6: IDs únicos de vehículos
        const vehIds = vehicles.map(v => v.id);
        const vehIdsValid = vehIds.every(id => typeof id === 'string' && id.trim().length > 0);
        
        let c6Passed = false;
        let c6Details = '';
        
        if (!vehIdsValid) {
            c6Details = 'Se detectaron IDs inválidos.';
        } else {
            const uniqueVehIds = new Set(vehIds);
            if (uniqueVehIds.size === vehIds.length) {
                c6Passed = true;
                c6Details = `${vehIds.length} IDs únicos`;
            } else {
                c6Details = `${vehIds.length - uniqueVehIds.size} IDs duplicados detectados.`;
            }
        }
        
        checks.push({
            id: 'C6',
            name: 'IDs únicos de vehículos',
            passed: c6Passed,
            details: c6Details
        });

        // C7: Integridad de métricas de flota
        const VALID_STATUSES = ['available', 'assigned', 'maintenance', 'inactive'];
        let invalidVehicles = 0;
        
        for (const v of vehicles) {
            let invalid = false;
            
            if (!VALID_STATUSES.includes(v.operationalStatus)) invalid = true;
            
            const m = v.metrics;
            if (!m) {
                invalid = true;
            } else {
                if (typeof m.volPercentage !== 'number' || !Number.isFinite(m.volPercentage) || m.volPercentage < 0 || m.volPercentage > 100) invalid = true;
                if (typeof m.weightPercentage !== 'number' || !Number.isFinite(m.weightPercentage) || m.weightPercentage < 0 || m.weightPercentage > 100) invalid = true;
                if (!Number.isInteger(m.stopsCount) || m.stopsCount < 0) invalid = true;
                if (!Number.isInteger(m.packagesCount) || m.packagesCount < 0) invalid = true;
            }
            
            if (invalid) invalidVehicles++;
        }
        
        const c7Passed = invalidVehicles === 0;
        checks.push({
            id: 'C7',
            name: 'Integridad de métricas de flota',
            passed: c7Passed,
            details: c7Passed
                ? 'Todas las métricas son válidas'
                : `${invalidVehicles} vehículos con métricas inválidas.`
        });

        // Calcular totales
        const totalChecks = checks.length;
        const passedChecks = checks.filter(c => c.passed).length;
        const failedChecks = totalChecks - passedChecks;

        return {
            status: failedChecks === 0 ? 'PASS' : 'FAIL',
            checks: checks,
            totalChecks: totalChecks,
            passedChecks: passedChecks,
            failedChecks: failedChecks
        };
    }
}

export const validationAdapter = ValidationAdapter;