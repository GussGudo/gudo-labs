#Physical Domain Model & Materiality Limits
## Modelo Físico de Dominio v1.0 — Gudo Labs / FlowCore

---

## 1. Propósito y Axioma de Existencia

Este documento establece el modelo físico de dominio de **FlowCore**, definiendo cómo se representa, estructura, custodia y transforma la realidad material dentro del núcleo logístico.

### Axioma Fundamental de Existencia Físico-Comercial

> *"FlowCore does not assert commercial inventory existence; FlowCore attests physical existence under operational custody."*
>
> *(FlowCore no declara la existencia comercial del inventario; FlowCore atestigua la existencia física de mercancía bajo custodia operacional).*

FlowCore debe representar con fidelidad la realidad física observada —incluyendo daños, faltantes, mermas, estados no utilizables, consolidaciones, desconsolidaciones y transferencias de custodia— sin convertirse en la autoridad contable o comercial sobre el inventario.

---

## 2. Alcance

### Dentro del Alcance (In Scope)

* Definición de la frontera de autoridad sobre la materialidad física.
* Separación entre expectativa comercial y observación física.
* Principio de separación entre Modelo de Dominio y Persistencia Técnica.
* Adopción del patrón híbrido de Historia Inmutable (`History`) y Proyección Materializada (`CurrentState`).
* Descomposición ontológica de `Goods`, `InventoryUnitDeclared`, `InventoryUnitObserved` y `HandlingUnit`.
* Separación ontológica entre `TransportResource` y `HandlingUnit`.
* Definición del grafo recursivo de contención (`Nesting`).
* Definición de la custodia como relación multidimensional.
* Definición de estados físicos observables.
* Tratamiento explícito de discrepancias físicas mediante `DiscrepancyEvent`.
* Conservación de proveniencia durante transformaciones físicas.

### Fuera del Alcance (Explicitly Out of Scope)

* Esquemas DDL, tablas o scripts de PostgreSQL.
* Mapeo ORM.
* Selección de drivers o mecanismos específicos de persistencia.
* Algoritmos de cubicaje tridimensional.
* Optimización de rutas.
* Cálculo de capacidad de vehículos.
* Gestión integral de flota.
* Contabilidad, valuación o ajuste financiero del inventario.

---

## 3. Frontera de Autoridad sobre la Materialidad

FlowCore distingue formalmente entre aquello que un sistema externo **declara que debería existir** y aquello que FlowCore **observa físicamente que existe**.

| Concepto | Pregunta Ontológica | Autoridad Maestra | Naturaleza en FlowCore |
| :--- | :--- | :--- | :--- |
| **`Goods`** | ¿Qué propiedades físicas tiene el material? | Catálogo Externo / PIM | Referencia de propiedades y restricciones físicas. |
| **`InventoryUnitDeclared`** | ¿Qué inventario debería existir según la expectativa comercial? | ERP / OMS / WMS Externo | Expectativa comercial inmutable dentro de FlowCore. |
| **`InventoryUnitObserved`** | ¿Qué unidad física fue realmente observada? | **FlowCore Kernel** | Atestación física inmutable. |
| **`HandlingUnit`** | ¿En qué soporte físico se contiene o transporta la mercancía? | **FlowCore Kernel** | Entidad física y grafo de contención. |
| **`TransportResource`** | ¿Qué recurso de transporte porta las unidades de carga? | Sistema de Recursos / Fleet + FlowCore para su utilización operacional | Recurso operacional utilizado por FlowCore, separado de la carga. |
| **`Custody`** | ¿Quién responde operacionalmente por la mercancía, dónde y durante qué intervalo? | **FlowCore Kernel** | Relación operacional respaldada por evidencia. |
| **`Evidence`** | ¿Qué demuestra lo ocurrido físicamente? | **FlowCore Kernel** | Evidencia inmutable asociada a hechos operacionales. |

### Principio de Autoridad Dual

FlowCore no intenta resolver la existencia comercial mediante observación física.

La expectativa comercial y la realidad física pueden divergir legítimamente:

```text
                 EXPECTATIVA COMERCIAL
                       ERP / OMS
                           │
                           │
                           ▼
              InventoryUnitDeclared
                       100 unidades
                           │
                           ▼
                  ┌─────────────────┐
                  │    FlowCore     │
                  │ Physical        │
                  │ Observation     │
                  └────────┬────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
    InventoryUnitObserved        DiscrepancyEvent
        98 unidades                   2 faltantes
