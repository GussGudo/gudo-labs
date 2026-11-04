/**
 * context-panel-adapter.js
 * Adaptador puro para proyectar una entidad seleccionada al ViewModel del Panel Contextual.
 */

const VALID_OPERATIONAL_STATUSES = ['available', 'assigned', 'maintenance', 'inactive'];
const VEHICLE_KEYS = ['id', 'type', 'operationalStatus', 'metrics'];
const METRICS_KEYS = ['volPercentage', 'weightPercentage', 'stopsCount', 'packagesCount'];
const SELECTED_ITEM_KEYS = ['type', 'id'];

class ContextPanelAdapter {
    static #isPlainObject(obj) {
        if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) return false;
        const proto = Object.getPrototypeOf(obj);
        return proto === Object.prototype || proto === null;
    }

    static #hasExactKeys(obj, expectedKeys) {
        const actualKeys = Reflect.ownKeys(obj);
        return actualKeys.length === expectedKeys.length &&
               expectedKeys.every(key => Object.hasOwn(obj, key));
    }

    static #getSafeProp(obj, key) {
        const desc = Object.getOwnPropertyDescriptor(obj, key);
        if (!desc) return undefined;
        if (desc.get || desc.set) throw new TypeError(`[ContextPanelAdapter] Getter/Setter no permitido en '${key}'.`);
        return desc.value;
    }

    static #isValidSelectedItem(item) {
        if (!this.#isPlainObject(item)) return false;
        if (!this.#hasExactKeys(item, SELECTED_ITEM_KEYS)) return false;
        try {
            const type = this.#getSafeProp(item, 'type');
            const id = this.#getSafeProp(item, 'id');
            if (typeof type !== 'string' || !type.trim()) return false;
            if (typeof id !== 'string' || !id.trim() || id !== id.trim()) return false;
            return true;
        } catch (e) { return false; }
    }

    static #isValidVehicle(v) {
        if (!this.#isPlainObject(v)) return false;
        if (!this.#hasExactKeys(v, VEHICLE_KEYS)) return false;
        try {
            const id = this.#getSafeProp(v, 'id');
            const type = this.#getSafeProp(v, 'type');
            const status = this.#getSafeProp(v, 'operationalStatus');
            const metrics = this.#getSafeProp(v, 'metrics');

            if (typeof id !== 'string' || !id.trim() || id !== id.trim()) return false;
            if (typeof type !== 'string' || !type.trim()) return false;
            if (!VALID_OPERATIONAL_STATUSES.includes(status)) return false;
            
            if (!this.#isPlainObject(metrics)) return false;
            if (!this.#hasExactKeys(metrics, METRICS_KEYS)) return false;

            const vol = this.#getSafeProp(metrics, 'volPercentage');
            const weight = this.#getSafeProp(metrics, 'weightPercentage');
            const stops = this.#getSafeProp(metrics, 'stopsCount');
            const packages = this.#getSafeProp(metrics, 'packagesCount');

            if (typeof vol !== 'number' || !Number.isFinite(vol) || vol < 0 || vol > 100) return false;
            if (typeof weight !== 'number' || !Number.isFinite(weight) || weight < 0 || weight > 100) return false;
            if (!Number.isInteger(stops) || stops < 0) return false;
            if (!Number.isInteger(packages) || packages < 0) return false;
            return true;
        } catch (e) { return false; }
    }

    static #projectStatus(vehicle) {
        switch (vehicle.operationalStatus) {
            case 'inactive':
            case 'maintenance': return 'inactive';
            case 'available': return 'active';
            case 'assigned': return vehicle.metrics.volPercentage > 95 ? 'warning' : 'active';
            default: throw new TypeError(`[ContextPanelAdapter] Estado desconocido: ${vehicle.operationalStatus}`);
        }
    }

    static #projectWeightStatus(weight) {
        return weight > 95 ? 'warning' : 'active';
    }

    static project(selectedItem, entity) {
        if (!selectedItem) {
            return { state: 'EMPTY', entityType: null, data: null, message: null };
        }

        if (!this.#isValidSelectedItem(selectedItem)) {
            return { state: 'UNAVAILABLE', entityType: null, data: null, message: 'Selección inválida o corrupta' };
        }

        const selectedType = this.#getSafeProp(selectedItem, 'type');
        const selectedId = this.#getSafeProp(selectedItem, 'id');

        if (selectedType !== 'vehicle') {
            return { state: 'UNAVAILABLE', entityType: selectedType, data: null, message: `Tipo no soportado: ${selectedType}` };
        }

        if (!entity || !this.#isValidVehicle(entity)) {
            return { state: 'UNAVAILABLE', entityType: 'vehicle', data: null, message: 'Entidad no disponible o datos corruptos' };
        }

        const entityId = this.#getSafeProp(entity, 'id');
        if (selectedId !== entityId) {
            return { state: 'UNAVAILABLE', entityType: 'vehicle', data: null, message: `Inconsistencia: esperaba ${selectedId}, recibió ${entityId}` };
        }

        return {
            state: 'READY',
            entityType: 'vehicle',
            data: {
                id: entity.id,
                type: entity.type,
                status: this.#projectStatus(entity),
                metrics: {
                    vol: entity.metrics.volPercentage,
                    weight: entity.metrics.weightPercentage,
                    weightStatus: this.#projectWeightStatus(entity.metrics.weightPercentage), // CPM-02
                    stops: entity.metrics.stopsCount,
                    packages: entity.metrics.packagesCount
                }
            },
            message: null
        };
    }
}

export const contextPanelAdapter = ContextPanelAdapter;