# Estado General — Gudo Labs / FlowCore / GeoWorkbench

**Proyecto:** Gudo Labs  
**Alcance:** Estado consolidado de Gudo Labs, FlowCore Kernel, Logistics Domain, Application Layer y GeoWorkbench  
**Versión:** v0.5 — revisiones A-01 y A-02 incorporadas sobre v0.4  
**Estado:** 🟢 APROBADO — listo para materialización por Guss  
**Naturaleza:** Documento de orientación y continuidad. No es especificación ejecutable ni contrato de intercambio.  
**Fecha de corte documental:** Fase 18.6.6, tras Etapa 2 (contraste documental) y revisiones técnicas de Etapa 3.

---

## 0. Cómo leer este documento

Cada afirmación relevante va acompañada, cuando corresponde, de una etiqueta de estado:

| Etiqueta | Significado |
|---|---|
| **DOCUMENTADO** | Existe documentación aceptada en el repositorio. |
| **RATIFICADO CONCEPTUALMENTE** | Existe una decisión arquitectónica cerrada, pero todavía no materializada documentalmente en el repositorio. |
| **IMPLEMENTADO** | Existe código correspondiente en el repositorio. |
| **VERIFICADO (Guss)** | Existe evidencia de ejecución aportada por Guss, no re-ejecutada por Nomo ni por Kael. |
| **VERIFICADO (Kael/Nomo)** | Existe evidencia de ejecución directa. Actualmente: ninguna sobre ejecución de software. |
| **PROYECTADO** | Evolución prevista, todavía no implementada. |
| **PENDIENTE** | No existe decisión o resolución suficiente. |

Regla de lectura: una decisión **RATIFICADA CONCEPTUALMENTE** no equivale a **DOCUMENTADO**, y ninguna de las dos equivale a **IMPLEMENTADO** ni **VERIFICADO**. Este documento no eleva diseño a capacidad.

---

## 1. Identidad y propósito

**Gudo Labs** es la organización y el marco de investigación que contiene el proyecto. Su propósito declarado en `plan-post-flowcore.md` y `contract-v0.9.1.md` es **comprender la realidad operacional antes que justificar cambios en FlowCore**.

Tagline del proyecto: *Building Intelligent Systems for the Real World.*

Jerarquía funcional adoptada (resuelve la ambigüedad histórica del nombre "FlowCore"):

| Nivel | Nombre canónico | Responsabilidad |
|---|---|---|
| Organización | **Gudo Labs** | Marco de investigación, laboratorio, contrato epistemológico |
| Kernel constitucional | **FlowCore Kernel** | `State`, `Transition`, `DomainLaw`, `NormativeContent`, `FenceEpoch` — garantías constitucionales genéricas |
| Dominio | **Logistics Domain** | Conceptos, reglas, leyes y evaluación semántica logística |
| Aplicación | **Application Layer** | Orquestación, autenticación contextual, coordinación |
| Interfaz | **GeoWorkbench** | Presentación, interacción, emisión de solicitudes |

> Regla de lectura: en documentos históricos del repositorio, la palabra "FlowCore" puede referirse a cualquiera de estos niveles, y a veces al proyecto completo. Debe leerse contextualmente y, cuando se consolide, resolverse explícitamente.

Estado de la jerarquía: **RATIFICADO CONCEPTUALMENTE**. No tiene todavía documento propio en el repositorio.

---

## 2. Arquitectura actual

### 2.1 Capas y responsabilidades

Representación conceptual de responsabilidades —no es un grafo de dependencias Rust ni una especificación de llamadas entre módulos:

```text
                 GUDO LABS
          Investigación y epistemología
                       │
                marco del proyecto
                       │
       ┌───────────────┴───────────────┐
       │                               │
 FLOWCORE KERNEL                LOGISTICS DOMAIN
 Garantías genéricas            Semántica logística
       └───────────────┬───────────────┘
                       │
                APPLICATION LAYER
             Orquestación y coordinación
                       │
                  GEOWORKBENCH
             Presentación e interacción
                       │
                 OPERADORES
```

Separaciones ratificadas en Fase 18.4 (**RATIFICADO CONCEPTUALMENTE**):

- **FlowCore Kernel** no conoce logística ni interfaz.
- **Logistics Domain** no conoce GeoWorkbench.
- **Application Layer** traduce entre dominio e interfaz.
- **GeoWorkbench** no implementa reglas del dominio ni importa tipos internos del kernel (`State<C>`, `Transition<C,L,A,E>`, `FenceEpoch`, `DomainLaw`, `NormativeContent`).

Estado documental: no existe documento propio de esta jerarquía en el repositorio. La representación anterior es la referencia canónica para la consolidación, no una capa ya escrita.

### 2.2 Frontera de software de FlowCore Kernel

`commit-12-executable-software-contracts.md` establece la frontera **outbound** del kernel hacia sistemas externos de ejecución física: `Command`, `DeliveryAttempt`, `ExternalPort`, `Adapter`, `ExternalClaim`, `PhysicalEvidence`, `ExecutionState`, `KnowledgeState`, `ReconciliationEngine`.

Estado: **DOCUMENTADO** (`conocimiento/arquitectura/commit-12-...`). Estado declarado del propio documento: **ARCHITECTURE DRAFT v1.0**. **No** hay evidencia de implementación ni verificación.

### 2.3 Dos familias de puertos

El contraste documental de Etapa 2 identificó que el proyecto usa el término "puerto" para dos realidades arquitectónicamente distintas:

| Familia | Propósito | Ejemplo |
|---|---|---|
| **Puerto de consulta** | Obtener información externa; el proveedor aporta datos, el dominio conserva la evaluación semántica | `routing-port.md` (OSRM, GraphHopper, Valhalla) |
| **Puerto de ejecución** | Solicitar acciones externas que pueden producir efectos físicos | `ExternalPort` de Commit #12 |

Requisitos por familia:

- **Consulta**: preservación semántica, procedencia, versionado, trazabilidad y políticas de repetición apropiadas al caso.
- **Ejecución**: identidad de intención, idempotencia frente a efectos externos, evidencia física, reconciliación y compensación cuando corresponda.

La distinción **no** constituye una jerarquía de puertos más o menos importantes. Son contratos diferentes porque sus consecuencias son diferentes.

Estado: **RATIFICADO CONCEPTUALMENTE** (hallazgo del contraste de Etapa 2). No está escrito en documento del repositorio. Es una decisión arquitectónica derivada, no una modificación de `routing-port.md` ni de Commit #12.

### 2.4 Frontera inbound — Fase 18.6.6

El proyecto **no tiene arquitectura documentada** para la frontera **inbound** entre GeoWorkbench, Application Layer y las responsabilidades de dominio/kernel. Esa frontera es el objeto de Fase 18.6.6.

La formulación correcta de la frontera es:

```text
GeoWorkbench → Application Layer → (Logistics Domain + FlowCore Kernel)
```

La Application Layer **coordina** ambas responsabilidades. No se establece una dependencia lineal `Logistics Domain → FlowCore Kernel`: esa dependencia no ha sido definida, y no debe introducirse por omisión en un diagrama de flujo.

Estado: **RATIFICADO CONCEPTUALMENTE** en decisiones de Fase 18; **PENDIENTE** de documento propio (Documento B); **NO IMPLEMENTADO**; **NO VERIFICADO**.

---

## 3. Inventario real de componentes

### 3.1 Gudo Labs (`H:\Proyectos\gudo-labs`)

- Repositorio Git: **sí** (`H:\Proyectos\gudo-labs\.git`).
- Rama: `main`, sincronizada con `origin/main`.
- HEAD al corte: `84a8859 docs(research): add methodological contract consolidation record`.
- Working tree: **limpio**. Staging: **vacío**.
- Documentación Markdown: **53 archivos** identificados en la auditoría de inventario de Etapa 1.
- Estado: **IMPLEMENTADO** como repositorio documental; **VERIFICADO (Guss)** vía auditoría de Etapa 1.

### 3.2 GeoWorkbench (`H:\Proyectos\geoworkbench`)

- Repositorio Git: **no** (ni en la ruta ni en ancestros).
- Contenido: `index.html` + `assets/{css,js}` + `engine/`.
- 37 archivos identificados: 11 CSS, 25 JavaScript y `index.html`. El conteo incluye los archivos `.bak` identificados.
- Módulos JS: dashboard, fleet, map, packages, routes, terminal, context-panel, validation.
- Adaptadores JS: los mismos 8.
- Estado interno: `ScenarioState`, `UIState`, `DiagnosticState`.
- Infraestructura interna: `EventBus`, `DiagnosticCoordinator`.
- `engine/`: directorio existente, **sin archivos visibles reportados en la búsqueda realizada**. La búsqueda no fue ejecutada con `-Force`; contenido oculto no ha sido descartado.
- Documentación Markdown: **ninguna identificada**.
- Archivos `.bak` identificados: `app.js.bak` y `base.css.bak`. Su vigencia, procedencia y relación con el código activo no han sido determinadas. No se modificarán ni eliminarán durante esta consolidación.
- Estado: **IMPLEMENTADO** (código funcional reportado por Guss); **VERIFICADO (Guss)** en fases 13–17 vía evidencia de navegador; **NO VERIFICADO** por Nomo ni Kael.

---

## 4. Fases cerradas

### 4.1 GeoWorkbench — Fases UI 13–17

| Fase | Módulo | Estado | Evidencia |
|---|---|---|---|
| 13 | ContextPanel | Cerrada | VERIFICADO (Guss) |
| 14 | Map | Cerrada | VERIFICADO (Guss) |
| 15 | Packages | Cerrada | VERIFICADO (Guss) |
| 16 | Routes | Cerrada | VERIFICADO (Guss) |
| 17 | Validation | Cerrada | VERIFICADO (Guss) |

Cierres respaldados por evidencia funcional reportada, no re-ejecutada. La clasificación de archivos de Etapa 1 confirma la existencia de los módulos correspondientes; no vuelve a verificar su comportamiento.

### 4.2 Fase 18 — Investigación conceptual

| Sub-fase | Contenido | Estado |
|---|---|---|
| 18.1 | Auditoría del estado real de FlowCore | Cerrada conceptualmente |
| 18.2 | Reconstrucción constitucional 12–19 | Cerrada conceptualmente; pruebas A/B/C ejecutadas por Guss |
| 18.3 | Conceptos del dominio logístico | Cerrada conceptualmente |
| 18.4 | Separación de responsabilidades | Cerrada conceptualmente |
| 18.5 | Frontera GeoWorkbench ↔ dominio | Cerrada conceptualmente |
| 18.6.1 | Casos de uso UC-01..UC-09 (catálogo) | Cerrada conceptualmente |
| 18.6.2 | Resultados, estados y errores | Cerrada conceptualmente |
| 18.6.3 | Identidad, autoridad y contexto | Cerrada conceptualmente |
| 18.6.4 | Proposal / Authorization / Recognition | Cerrada conceptualmente |
| 18.6.5 | Evidence | Cerrada conceptualmente |
| 18.6.6 | Contratos de intercambio | **Abierta** (ver §5) |

Evidencia disponible de 18.2:

- `cargo test`: 1 prueba unitaria + 1 suite de integración aprobadas — **VERIFICADO (Guss)**.
- Trybuild: ataques A, B, C y acceso a campo privado de `NormativeContent` rechazados — **VERIFICADO (Guss)**.
- **No demostrado**: cobertura completa de ataques D–J; regresión constitucional completa G0→RED→G1.

La reconstrucción documental de los Commits 12–19 y la implementación física posterior son estados distintos. Las pruebas A/B/C no demuestran la cobertura D–J.

---

## 5. Fases abiertas

### 5.1 Fase 18.6.6 — Contratos de intercambio

| Elemento | Estado |
|---|---|
| `ApplicationEnvelope` | **RATIFICADO CONCEPTUALMENTE — consolidación formal pendiente** |
| UC-01 `InitializeScenarioCommand` | **RATIFICADO CONCEPTUALMENTE — consolidación formal pendiente** |
| UC-02 `QueryScenarioRequest` | **RATIFICADO CONCEPTUALMENTE — consolidación formal pendiente** |
| UC-03 `ProposeRoutesCommand` | **RATIFICADO CONCEPTUALMENTE — consolidación formal pendiente** (incluye `requestedWindow` ratificado) |
| UC-04 `AuthorizeProposalCommand` | **RATIFICADO CONCEPTUALMENTE — consolidación formal pendiente** |
| UC-05 `RecognizeProposalCommand` | **Sin abrir** |
| UC-06 `RevokeAssignmentCommand` | **Sin abrir** |
| UC-07 `QueryProposalsRequest` | **Sin abrir** |
| UC-08 `QueryAssignmentsRequest` | **Sin abrir** |
| UC-09 `QueryEvidenceRequest` | **Sin abrir** |

Ninguno de los nueve tiene documento propio en el repositorio a la fecha del corte.

Nota de consistencia: la etiqueta `RATIFICADO CONCEPTUALMENTE — consolidación formal pendiente` se aplica a los cuatro UC con decisiones ratificadas (UC-01 a UC-04) para conservar el mismo lenguaje del Documento B. No debe interpretarse como contrato formalmente consolidado.

#### UC-04 — Decisiones ratificadas y pendientes

Decisiones conceptuales ratificadas en revisión técnica de Etapa 3:

- Código de discrepancia de evaluación: `EVALUATION_VERSION_MISMATCH`.
- `expectedEvaluationId` es opcional; si se proporciona, debe coincidir con la evaluación vigente.
- Replay idempotente de `DENIED`: misma `idempotencyKey` y mismos argumentos devuelven el resultado `DENIED` original.
- Idempotencia precede a la comprobación de conflicto por autorización activa.
- Solo `AUTHORIZED` crea una Authorization.
- Los fallos técnicos no se convierten en `DENIED`.
- Un `CONDITIONAL` debe identificar condiciones concretas pendientes, aunque el DTO que las transporta permanezca diferido.
- La expiración posterior de una evaluación no invalida retroactivamente una Authorization ya emitida. El Recognition vuelve a comprobar las condiciones que correspondan.
- No se permite sustitución de autorización activa en v1. Una autorización expirada permanece como antecedente histórico; una nueva puede emitirse después de su vencimiento. Revocación anticipada fuera del alcance inicial.

Aspectos pendientes de consolidación formal:

- Integración del contrato UC-04 completo en el Documento B.
- DTO de `CONDITIONAL`, cuya estructura permanece diferida.
- Política de replay idempotente de **errores terminales** (no solo `DENIED`). Pendiente de decisión.

Las decisiones conceptuales enumeradas anteriormente están ratificadas; su consolidación documental no equivale al cierre del contrato.

### 5.2 Integración GeoWorkbench ↔ FlowCore

Frontera conceptual definida. Integración ejecutable **no implementada ni verificada**. Tecnología física de Application Layer **no decidida**.

---

## 6. Decisiones ratificadas (resumen referencial)

Consolidado de decisiones cerradas en Fase 18 y documentadas en conversación (no en repositorio todavía). Referencia, no sustitución del detalle:

- **FlowCore Kernel intacto.** Implementación mínima; no es dominio logístico operacional terminado.
- **Greedy E16-B1 cerrado** y documentado. No reabrir.
- **`src/fence_epoch.rs`** (archivo no declarado en árbol activo) no debe eliminarse ni confundirse con `FenceEpoch` activo sin investigación específica.
- **Frontera Application Layer** independiente de GeoWorkbench y del kernel.
- **`RequestContext`** construido por el servidor; `declaredActor` del cliente nunca es autoridad.
- **Proposal / Authorization / Recognition** son entidades distintas.
- **`AUTHORIZED` ≠ `RECOGNIZED`.** **`REVOKED` ≠ eliminado.** **`BLOCKED` ≠ `REJECTED`.**
- **Evidence**: separación entre Evidence original, EvidenceAssessment y EvidenceLink ratificada en 18.6.5. La aceptación depende de la afirmación o decisión a la que se vincula. La noción conceptual de **ImpactAssessment sobre evidencia** fue discutida como concepto; **no se presenta aquí como tipo implementado ni como nombre de tipo cerrado**.
- **`FenceEpoch`** no es autorización logística.
- **`retryable`** es recomendación del servidor, no garantía.
- **`requestedWindow`** en UC-03: opcional, único por secuencia, temporalmente explícito, `INVALID_TIME_WINDOW` como `reasonCode` bajo `INVALID_INPUT` para entrada malformada, `UNDETERMINED` para evaluación sin intervalo disponible.
- **UC-04**: ver §5.1.

Estado: **RATIFICADO CONCEPTUALMENTE**; **PENDIENTE de consolidación en `docs/research/fase-18.6.6-contratos-de-intercambio.md`** (Documento B).

---

## 7. Deudas técnicas documentadas

| Deuda | Ámbito | Estado |
|---|---|---|
| Fase 18.6.6 sin documento propio en repositorio | Documental | PENDIENTE |
| Consolidación formal de ApplicationEnvelope, UC-01..UC-04 | Contratos | PENDIENTE |
| UC-04: DTO `CONDITIONAL` diferido; política de replay de errores terminales pendiente | Contratos | DIFERIDO / PENDIENTE |
| UC-05..UC-09 sin abrir | Contratos | PENDIENTE |
| Distinción formal puerto de consulta / puerto de ejecución no escrita | Arquitectura | PENDIENTE |
| Relación `routing-port.md` ↔ Commit #12 no explícita | Arquitectura | PENDIENTE |
| GeoWorkbench sin repositorio Git | Control de versiones | PENDIENTE (decisión de Guss) |
| GeoWorkbench sin documentación Markdown local | Documental | PENDIENTE |
| `engine/` sin archivos visibles reportados (ocultos no descartados) | Inventario | PENDIENTE |
| `.bak` en GeoWorkbench (`app.js.bak`, `base.css.bak`) — vigencia no determinada | Higiene | PENDIENTE (no tocar sin autorización) |
| Cobertura completa ataques D–J y G0→RED→G1 | Verificación FlowCore | NO DEMOSTRADO |
| Fases 13–17 sin documentación en repositorio de GeoWorkbench | Documental | PENDIENTE |

### 7.1 Deudas UX de GeoWorkbench (reportadas por Guss)

- UX-01: falta resaltado de fila seleccionada en Fleet.
- Packages: experiencia de desplazamiento horizontal mejorable.
- Map: rutas sintéticas se cruzan; ajuste dinámico de tamaño no probado.
- Routes: mejoras de validación estructural y accesibilidad.
- Sin pruebas específicas de ciclos de inicialización/destrucción de módulos.

Estas deudas **no son motivo** para reabrir fases cerradas. Se registran.

---

## 8. Evidencia disponible

### 8.1 Evidencia de ejecución

| Evidencia | Fuente | Registro |
|---|---|---|
| `cargo test` OK (1 unit + 1 integración) | Guss | Fase 18.2 |
| Trybuild A/B/C + NormativeContent rechazados | Guss | Fase 18.2 |
| Fases 13–17 funcionales en navegador | Guss | Aportada en distintas sesiones previas a Fase 18.6.6; sin fecha única registrada |

Ninguna de las anteriores ha sido re-ejecutada por Nomo o Kael.

### 8.2 Evidencia documental

- 53 archivos `.md` en `gudo-labs` (inventario en Etapa 1).
- 4 documentos contrastados en Etapa 2: `plan-post-flowcore.md`, `contract-v0.9.1.md`, `commit-12-executable-software-contracts.md`, `routing-port.md`.
- Ninguno de los cuatro cubre Fase 18.6.6.

### 8.3 Evidencia negativa (también es evidencia)

- GeoWorkbench **no** es repositorio Git.
- GeoWorkbench **no** contiene `.md` identificados.
- Fase 18.6.6 **no** tiene documento en repositorio.
- `engine/` **no** reporta archivos visibles.

---

## 9. Commits conocidos

Últimos 8 en `gudo-labs` al corte:

```text
84a8859 docs(research): add methodological contract consolidation record
fb44ec0 docs(research): consolidate methodological contract v0.9.1
d8e445e docs(lab): draft methodological contract v0.9 sections 1-5
bf7ff80 docs(lab): add Gudo Labs post-FlowCore work plan
f87f391 docs(lab): archive LAB-002 pending operational evidence
856bf68 docs(lab): formalize LAB-003 red sea capacity case
4829dec docs(lab): formalize LAB-001 operational capacity case
444d750 docs(repository): normalize canonical documentation paths
```

GeoWorkbench: sin commits (no es repositorio).

---

## 10. Próximos hitos

| Hito | Documento / acción | Estado |
|---|---|---|
| Consolidar contratos de intercambio | Documento B: `fase-18.6.6-contratos-de-intercambio.md` | **En curso (Etapa 3)** |
| Consolidación formal de ApplicationEnvelope y UC-01..UC-04 | Documento B | PENDIENTE |
| Resolver DTO de `CONDITIONAL` en UC-04 | Documento B, sección UC-04 | Diferido |
| Resolver política de replay de errores terminales en UC-04 | Documento B, sección UC-04 | Pendiente |
| Abrir UC-05 | Documento B, sección UC-05 | Pendiente |
| Abrir UC-06..UC-09 | Documento B | Pendiente |
| Escribir distinción puerto consulta / puerto ejecución | `docs/research/` o `conocimiento/arquitectura/` | Pendiente (decisión de ubicación) |
| Resolver Git de GeoWorkbench | Decisión de Guss | Pendiente |
| Documentar fases 13–17 de GeoWorkbench | Ubicación depende de Git | Pendiente |

---

## 11. Relación con documentos existentes

| Documento | Qué aporta | Qué no cubre |
|---|---|---|
| `plan-post-flowcore.md` | Marco constitucional, protección de FlowCore, caso dorado | Contratos de intercambio, UC |
| `contract-v0.9.1.md` | Epistemología del laboratorio, estados, no fabricación, autoría ≠ autoridad | Contratos de software, UC |
| `commit-12-executable-software-contracts.md` | Frontera outbound, `Command`/`DeliveryAttempt`/`ReconciliationEngine` | Frontera inbound, Application Layer, UC |
| `routing-port.md` | Puerto de consulta hacia routing | Contratos inbound, orquestación de aplicación |
| `estado-general-...` (este) | Orientación y continuidad | Detalle de cada contrato (remite a Documento B y a los documentos fuente) |

---

## 12. Notas de honestidad documental

1. Este documento se redacta en conversación y ha sido revisado técnicamente por Kael (v0.2 a v0.5). **No ha sido materializado** en el repositorio. Guss es quien lo materializa.
2. Ninguna fase cerrada conceptualmente se presenta como IMPLEMENTADO ni VERIFICADO.
3. La evidencia de Guss se identifica como tal. No se atribuye a Nomo ni Kael.
4. Los cuatro documentos contrastados en Etapa 2 **no cubren Fase 18.6.6**. Esa cobertura es el objeto del Documento B.
5. La ambigüedad histórica de "FlowCore" queda resuelta en §1 para este documento. No se reescriben los documentos fuente. Se deja constancia de la regla de lectura.
6. Correcciones incorporadas a lo largo de las revisiones:
   - v0.2: taxonomía ampliada (§0), diagrama de responsabilidades (§2.1), requisitos por familia de puertos (§2.3), estado de `.bak` sin interpretación (§3.2), UC-04 con decisiones ratificadas y consolidación formal pendiente (§5.1), separación reconstrucción/implementación (§4.2), evidencia sin fecha única atribuida (§8.1), `EvidenceImpactAssessment` no presentado como tipo cerrado (§6).
   - v0.3: referencia de inventario Markdown corregida (§3.1); "Aspectos pendientes de consolidación formal" en UC-04 (§5.1).
   - v0.4: conteo de archivos de GeoWorkbench corregido (§3.2).
   - v0.5: **A-01** — frontera inbound reformulada como `GeoWorkbench → Application Layer → (Logistics Domain + FlowCore Kernel)` (§2.4); **A-02** — etiqueta `RATIFICADO CONCEPTUALMENTE — consolidación formal pendiente` aplicada a UC-01, UC-02 y UC-03 en §5.1 y nota de consistencia; UC-04 §5.1 amplía decisiones ratificadas con CONDITIONAL y no-invalidación retroactiva por evaluación expirada.

---

## 13. Estado del documento

```text
Documento: estado-general-gudo-labs-flowcore-geoworkbench.md
Versión:   v0.5 — A-01 y A-02 incorporadas sobre v0.4
Estado:    🟢 APROBADO — listo para materialización por Guss
Cobertura: identidad, arquitectura, inventario, fases, deudas, evidencia, commits, hitos
Pendiente: materialización por Guss; Documento B
No crea:   decisiones nuevas
No modifica: código, FlowCore, GeoWorkbench, Greedy
```