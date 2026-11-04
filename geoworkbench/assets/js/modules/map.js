/**
 * map.js
 * Módulo de interfaz para el mapa geoespacial.
 */

const VALID_STATUSES = ['active', 'warning', 'inactive'];

class MapModule {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this._isInitialized = false;
    }

    init() {
        if (this._isInitialized) return true;
        this.canvas = document.getElementById('map-canvas');
        if (!this.canvas) {
            console.error('[Map] Canvas #map-canvas no encontrado.');
            return false;
        }
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) return false;
        this._isInitialized = true;
        return true;
    }

    #isValidViewModel(vm) {
        if (!vm || typeof vm !== 'object' || Array.isArray(vm)) return false;
        if (typeof vm.width !== 'number' || !Number.isFinite(vm.width) || vm.width <= 0) return false;
        if (typeof vm.height !== 'number' || !Number.isFinite(vm.height) || vm.height <= 0) return false;
        if (!vm.cedis || typeof vm.cedis !== 'object') return false;
        if (typeof vm.cedis.x !== 'number' || !Number.isFinite(vm.cedis.x)) return false;
        if (typeof vm.cedis.y !== 'number' || !Number.isFinite(vm.cedis.y)) return false;

        if (!Array.isArray(vm.stops)) return false;
        for (const s of vm.stops) {
            if (!s || typeof s !== 'object') return false;
            if (typeof s.id !== 'string') return false;
            if (typeof s.x !== 'number' || !Number.isFinite(s.x)) return false;
            if (typeof s.y !== 'number' || !Number.isFinite(s.y)) return false;
            if (!VALID_STATUSES.includes(s.status)) return false;
        }

        if (!vm.routes || typeof vm.routes !== 'object') return false;
        for (const [vehicleId, route] of Object.entries(vm.routes)) {
            if (!route || typeof route !== 'object') return false;
            if (route.vehicleId !== vehicleId) return false;
            if (!Array.isArray(route.points)) return false;
            if (typeof route.isSelected !== 'boolean') return false;
            if (!VALID_STATUSES.includes(route.status)) return false;
            for (const p of route.points) {
                if (!p || typeof p !== 'object') return false;
                if (typeof p.x !== 'number' || !Number.isFinite(p.x)) return false;
                if (typeof p.y !== 'number' || !Number.isFinite(p.y)) return false;
            }
        }

        // MM-06: Coherencia de selección
        let selectedRouteCount = 0;
        if (vm.selectedVehicleId !== null && vm.selectedVehicleId !== undefined) {
            if (!vm.routes[vm.selectedVehicleId]) return false;
        }
        for (const [vehicleId, route] of Object.entries(vm.routes)) {
            if (route.isSelected) {
                if (vm.selectedVehicleId !== vehicleId) return false;
                selectedRouteCount++;
            }
        }
        if (vm.selectedVehicleId !== null && vm.selectedVehicleId !== undefined) {
            if (selectedRouteCount !== 1) return false;
        } else {
            if (selectedRouteCount !== 0) return false;
        }

        return true;
    }

    render(viewModel) {
        if (!this._isInitialized) return false;
        if (!this.#isValidViewModel(viewModel)) {
            console.error('[Map] ViewModel inválido.');
            return false;
        }

        // MM-07: Verificar que las dimensiones internas coincidan con el ViewModel
        if (this.canvas.width !== viewModel.width || this.canvas.height !== viewModel.height) {
            console.error(`[Map] Las dimensiones del Canvas (${this.canvas.width}x${this.canvas.height}) no coinciden con el ViewModel (${viewModel.width}x${viewModel.height}).`);
            return false;
        }

        const ctx = this.ctx;
        const { width, height, cedis, stops, routes, selectedVehicleId } = viewModel;

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#0e1116';
        ctx.fillRect(0, 0, width, height);

        Object.values(routes).forEach(route => {
            const isSelected = route.isSelected;
            const isDimmed = selectedVehicleId && !isSelected;
            ctx.save();
            ctx.beginPath();
            ctx.lineWidth = isSelected ? 3 : 1.5;
            ctx.strokeStyle = this._getColor(route.status, isDimmed);
            ctx.globalAlpha = isDimmed ? 0.3 : 0.8;
            const points = route.points;
            if (points.length > 0) {
                ctx.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.stroke();
            ctx.restore();
        });

        stops.forEach(stop => {
            const isSelected = selectedVehicleId === stop.routeId;
            const isDimmed = selectedVehicleId && !isSelected;
            ctx.beginPath();
            ctx.arc(stop.x, stop.y, isSelected ? 4 : 2.5, 0, Math.PI * 2);
            ctx.fillStyle = this._getColor(stop.status, isDimmed);
            ctx.globalAlpha = isDimmed ? 0.3 : 1;
            ctx.fill();
            ctx.globalAlpha = 1;
        });

        ctx.beginPath();
        ctx.arc(cedis.x, cedis.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#d29922';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('CEDIS', cedis.x, cedis.y - 12);
        return true;
    }

    _getColor(status, isDimmed) {
        if (isDimmed) return '#484f58';
        switch (status) {
            case 'active': return '#55B6A8';
            case 'warning': return '#E4B65D';
            case 'inactive': return '#484f58';
            default: return '#484f58';
        }
    }

    destroy() {
        this.canvas = null;
        this.ctx = null;
        this._isInitialized = false;
    }
}

export const mapModule = new MapModule();