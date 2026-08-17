# Resources, Operational Capacity & Eligibility Model
## Modelo de Recursos y Capacidad Operacional v1.0 — Gudo Labs / FlowCore

---

## 1. Propósito y Axioma de Capacidad

Este documento define el modelo ontológico de recursos, capacidades y elegibilidad operacional en **FlowCore**.

Establece cómo el sistema identifica, compone, evalúa, asigna y controla los medios físicos, humanos, tecnológicos o externos necesarios para ejecutar operaciones logísticas.

### Axioma Fundamental de Capacidad Operacional

> *"A physical resource does not possess a single static operational capacity; its usable capacity emerges from the interaction between physical properties, operational constraints, mission requirements, temporal availability and execution context."*

> *(Un recurso físico no posee una única capacidad operacional estática; su capacidad utilizable emerge de la interacción entre sus propiedades físicas, restricciones operacionales, requerimientos de la misión, disponibilidad temporal y contexto de ejecución).*

---

## 2. Alcance

### Dentro del Alcance (In Scope)

- Definición de `Resource` como entidad operacional base.
- Definición de `OperationalResource` como composición dinámica de recursos.
- Abstracción de tipos de recursos:
  - `Vehicle`
  - `Driver`
  - `Trailer`
  - `Equipment`
  - `Crew`
  - `ThirdPartyResource`
  - otros recursos futuros.
- Distinción entre:
  - `Capability`
  - `Capacity`
  - `Restriction`
  - `Availability`
  - `Eligibility`
  - `Assignment`
- Distinción estricta entre **Capacidad Nominal** y **Capacidad Operacional Efectiva**.
- Modelado multidimensional de `Occupancy`.
- Evaluación contextual de elegibilidad.
- Separación entre el estado operacional `Assignment` y los eventos históricos que lo transforman.
- Evolución de asignaciones mediante eventos inmutables.

### Fuera del Alcance (Explicitly Out of Scope)

- Gestión de nómina, contratos laborales o expediente médico del `Driver`.
- Contabilidad, depreciación o adquisición de activos.
- Mantenimiento mecánico interno y gestión de refacciones.
- Algoritmos específicos de optimización de rutas.
- Solucionadores 3D de bin packing.
- Implementaciones concretas de motores de optimización.
- Integraciones específicas con proveedores externos.

---

# 3. Recurso Operacional

Un `Resource` representa cualquier medio que pueda participar en una operación logística.

Puede ser:

- físico;
- humano;
- tecnológico;
- compuesto;
- externo o subcontratado.

Ejemplos:

```text
Vehicle
Driver
Trailer
Forklift
Crew
AutonomousVehicle
ThirdPartyCarrier
