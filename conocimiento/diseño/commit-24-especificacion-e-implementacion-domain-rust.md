# Commit 24 — Especificación de Trabajo para la Primera Implementación del Dominio en Rust

**Estado conceptual:** 🟡 Fase 1 — Especificación Documental Autorizadora
**Área:** Core Engine / Domain / Rust
**Precedentes directos:** Commits #17–#20 (Ontología), Commit #21 (Contrato Mínimo), Commit #22 (Especificación Normativa de Tipos y Fronteras), Commit #23 (Especificación de Trabajo del Dominio Rust)
**Commit precedente sellado:** `2c4feb2`
**Propósito:** Congelar el marco de implementación de la frontera constitutiva del dominio en Rust sin introducir todavía código ejecutable, representación concreta no autorizada ni lógica de admisibilidad no formalizada.

---

## 🏛️ CLÁUSULA CONSTITUCIONAL PREVALENTE

> **El Commit #24 documental no diseña una nueva ontología ni inventa semántica de ejecución.**
>
> Su función es traducir de manera mecánica las restricciones congeladas en los Commits #21–#23 hacia una especificación física de implementación Rust.
>
> Ninguna estructura, trait, función, método, dependencia o abstracción podrá incorporarse si su existencia no puede justificarse directamente desde las fronteras ya establecidas.

Quedan prohibidos dentro de esta fase:

- *builders*;
- *helpers*;
- *factories*;
- *executors*;
- métodos de conveniencia;
- mutabilidad interior;
- dependencias de runtime;
- lógica ejecutable no sustentada por la norma;
- representaciones concretas elegidas únicamente por conveniencia de implementación.

---

# 1. NATURALEZA DE LA FASE

El presente documento corresponde exclusivamente a la:

> **FASE 1 — ESPECIFICACIÓN DOCUMENTAL AUTORIZADORA**

Esta fase **no constituye todavía la implementación física** de la frontera del dominio.

La secuencia autorizada es:

```text
FASE 1
Especificación documental
        │
        ▼
Auditoría de consistencia
        │
        ▼
Commit documental
        │
        ▼
FASE 2
Implementación física
        │
        ▼
FASE 3
Verificación técnica
```

Durante la Fase 1:

- no se crean archivos nuevos dentro de `src/domain/`;
- no se modifica `src/lib.rs`;
- no se modifica `src/fence_epoch.rs`;
- no se ejecuta `cargo check`;
- no se ejecuta `cargo test`;
- no se modifica `Cargo.toml`;
- no se introducen dependencias;
- no se ejecuta lógica Rust.

---

# 2. CONFINAMIENTO DEL ARTEFACTO HISTÓRICO `FenceEpoch`

El archivo:

```text
motores/flow-core/flowcore-domain/src/fence_epoch.rs
```

procede del commit histórico:

```text
9733e21 test(domain): freeze FenceEpoch constitutional attack evidence
```

Su naturaleza queda establecida como:

> **Artefacto histórico de evidencia experimental previa.**

`FenceEpoch` no forma parte de la topología constitutiva congelada en los Commits #21–#23.

## 2.1 Tratamiento autorizado

El archivo físico podrá permanecer en el repositorio como evidencia histórica.

Sin embargo, durante la implementación de #24:

- no será re-exportado;
- no será importado por `src/domain/`;
- no será utilizado como dependencia de los tipos constitucionales;
- no será incorporado a la nueva topología del dominio.

La historia de Git constituye la procedencia del artefacto.

La arquitectura vigente no depende de él.

## 2.2 Acción autorizada sobre `lib.rs`

La implementación física de #24 queda autorizada a retirar:

```rust
pub use fence_epoch::FenceEpoch;
```

y a retirar también la declaración de módulo:

```rust
mod fence_epoch;
```

cuando corresponda a la eliminación de su participación en la compilación vigente.

La preservación histórica del archivo no implica su permanencia como módulo compilado del crate.

---

# 3. TOPOLOGÍA FÍSICA CANÓNICA

La frontera autorizada para `src/domain/` queda limitada exactamente a los siguientes seis archivos:

```text
motores/flow-core/flowcore-domain/src/
│
├── lib.rs
│
├── fence_epoch.rs
│
└── domain/
    ├── mod.rs
    ├── state.rs
    ├── normative.rs
    ├── law.rs
    ├── transition.rs
    └── rejection.rs
```

Dentro de `src/domain/` queda prohibida la creación de cualquier módulo adicional.

No se autoriza la aparición de:

```text
context.rs
authority.rs
evidence.rs
executor.rs
builder.rs
factory.rs
engine.rs
helpers.rs
utils.rs
validation.rs
```

ni de cualquier otro módulo que no esté expresamente autorizado por una especificación constitucional posterior.

---

# 4. FRONTERAS CONSTITUTIVAS

Los seis módulos físicos corresponden a las siguientes fronteras:

| Módulo | Responsabilidad constitucional |
|---|---|
| `state.rs` | Testimonio de estado `State<C>` |
| `normative.rs` | Contenido normativo declarativo `NormativeContent` |
| `law.rs` | Frontera normativa `DomainLaw` |
| `transition.rs` | Relación constitutiva `Transition<C, L, A, E>` |
| `rejection.rs` | Representación del rechazo de admisibilidad |
| `mod.rs` | Exposición controlada de la frontera |

La estructura física no podrá utilizarse para introducir responsabilidades adicionales.

---

# 5. CONTRATO CANÓNICO DE `State<C>`

Archivo:

```text
src/domain/state.rs
```

## 5.1 Identidad

El tipo constitucional será:

```rust
pub struct State<C>
```

## 5.2 Invariantes

`State<C>` deberá cumplir:

- sus campos serán privados;
- no permitirá construcción literal externa;
- no expondrá mutabilidad interior;
- no expondrá referencias mutables;
- no contendrá primitivas de interior mutability;
- representará un testimonio de estado asociado al contexto `C`.

La representación concreta del almacenamiento deberá limitarse a aquello que haya sido autorizado por los contratos precedentes.

# 6. CONTRATO CANÓNICO DE `NormativeContent`

Archivo:

```text
src/domain/normative.rs
```

## 6.1 Identidad

El tipo constitucional será:

```rust
pub struct NormativeContent
```

## 6.2 Opacidad de representación

La representación interna de `NormativeContent` permanece deliberadamente opaca.

Esta especificación **no congela**:

- `String`;
- `&'static str`;
- `Vec<u8>`;
- closures;
- punteros a función;
- bytecode;
- AST;
- cualquier otra representación concreta.

La implementación futura deberá utilizar únicamente una representación que pueda derivarse de la norma declarativa previamente congelada.

## 6.3 Invariante semántico

`NormativeContent` representa contenido declarativo.

No representa:

- código ejecutable;
- una función;
- un ejecutor;
- una operación de transición;
- una autoridad;
- evidencia operacional.

No se autoriza introducir ejecución dentro de este tipo.

---

# 7. CONTRATO CANÓNICO DE `DomainLaw`

Archivo:

```text
src/domain/law.rs
```

## 7.1 Identidad

El límite normativo será:

```rust
pub trait DomainLaw
```

## 7.2 Método autorizado

La frontera normativa autoriza la operación:

```rust
fn normative_content(&self) -> NormativeContent;
```

Esta operación proporciona contenido normativo declarativo.

## 7.3 Prohibiciones

`DomainLaw` no podrá introducir métodos destinados a ejecutar o aplicar una ley.

Quedan expresamente fuera de esta frontera:

```text
execute()
apply()
next_state()
execute_transition()
apply_transition()
mutate()
```

ni equivalentes semánticos.

La ley declara una frontera normativa.

No ejecuta la transición.

---

# 8. CONTRATO CANÓNICO DE `AdmissibilityRejection`

Archivo:

```text
src/domain/rejection.rs
```

## 8.1 Identidad

La frontera de rechazo estará representada por:

```rust
pub struct InadmissibleTransition
```

y por:

```rust
pub enum AdmissibilityRejection
```

## 8.2 Naturaleza

`AdmissibilityRejection` representa una razón de rechazo.

`InadmissibleTransition` representa el resultado de una proposición constitutiva que no alcanza admisibilidad.

Ambos valores deberán ser:

- inmutables;
- explícitos;
- transportables como valores;
- libres de excepciones;
- libres de `panic!`.

## 8.3 Representación de razones

Las razones concretas de rechazo deberán corresponder exclusivamente a las categorías ya autorizadas por la especificación normativa precedente.

No se autoriza introducir nuevas razones de rechazo durante la implementación de #24.

Si una razón no está formalmente congelada por los precedentes, deberá permanecer fuera de la implementación hasta su correspondiente especificación normativa.

---

# 9. CONTRATO CANÓNICO DE `Transition<C, L, A, E>`

Archivo:

```text
src/domain/transition.rs
```

## 9.1 Firma canónica

La firma única y obligatoria es:

```rust
pub struct Transition<C, L, A, E>
```

Esta parametrización será uniforme en toda la implementación.

No se permite ninguna variante como:

```text
Transition<C, A, E, L>
Transition<C, A, E L>
Transition<L, C, A, E>
```

ni ninguna otra permutación.

## 9.2 Correspondencia ontológica

Los parámetros representan:

```text
C = Contexto
L = Ley
A = Autoridad
E = Evidencia
```

La correspondencia es normativa y no podrá alterarse por conveniencia de implementación.

## 9.3 Encapsulamiento

Los componentes internos de `Transition<C, L, A, E>` deberán permanecer privados.

La construcción literal externa:

```rust
Transition {
    ...
}
```

no deberá formar parte de la API pública.

La instancia deberá surgir exclusivamente a través de la frontera constitutiva autorizada.

---

# 10. FRONTERA `try_constitute`

La función constitutiva tendrá la siguiente firma conceptual canónica:

```rust
pub fn try_constitute<C, L, A, E>(
    pre: State<C>,
    law: L,
    authority: A,
    evidence: E,
    post: State<C>,
) -> Result<Transition<C, L, A, E>, InadmissibleTransition>
where
    L: DomainLaw;
```

Esta representación dentro del presente documento constituye **un contrato de firma**, no una implementación ejecutable.

## 10.1 Naturaleza del contrato

`try_constitute` representa la frontera mediante la cual una proposición de transición intenta alcanzar el estado de admisibilidad necesario para constituirse como:

```text
Transition<C, L, A, E>
```

El resultado puede ser:

```text
Transition<C, L, A, E>
```

o:

```text
InadmissibleTransition
```

## 10.2 Prohibición de implementación ficticia

El Commit #24 documental **no autoriza** un cuerpo equivalente a:

```rust
Ok(Transition { ... })
```

como mecanismo provisional.

Tampoco autoriza:

```rust
Err(...)
```

arbitrario.

No se podrá afirmar que una transición es admisible sin que exista una regla normativa que fundamente ese juicio.

## 10.3 Algoritmo de admisibilidad

La especificación del algoritmo mediante el cual se determina:

```text
admisible
```

o:

```text
inadmisible
```

queda subordinada a la formalización normativa correspondiente.

Por tanto:

> **La firma de `try_constitute` queda congelada en #24; el algoritmo de juicio no se inventa en #24.**

---

# 11. EXPOSICIÓN DE LA FRONTERA

Archivo:

```text
src/domain/mod.rs
```

Este módulo constituye la frontera pública controlada de `domain`.

La implementación deberá exponer exclusivamente los símbolos autorizados por esta especificación.

La exposición pública deberá mantener separados:

```text
State
NormativeContent
DomainLaw
Transition
try_constitute
InadmissibleTransition
AdmissibilityRejection
```

No se autoriza la exposición accidental de detalles internos mediante campos públicos, módulos auxiliares o re-exportaciones no justificadas.

---

# 12. `lib.rs` COMO FRONTERA DEL CRATE

La implementación física deberá convertir `lib.rs` en la frontera pública del crate.

La exposición constitucional será exclusivamente la necesaria para acceder a `domain`.

No deberá existir una exposición pública de:

```rust
FenceEpoch
```

ni de cualquier detalle histórico del experimento `9733e21`.

El archivo histórico podrá permanecer físicamente en el repositorio sin formar parte de la API vigente.

---

# 13. INVARIANTES DE INMUTABILIDAD

La implementación física deberá preservar:

```text
State<C>
Transition<C, L, A, E>
NormativeContent
InadmissibleTransition
```

como valores sin mutabilidad interior.

No se autoriza incorporar:

```rust
Cell
RefCell
Mutex
RwLock
```

ni mecanismos equivalentes.

Tampoco se autoriza exponer:

```rust
&mut self
&mut T
```

como parte de la API constitucional.

---

# 14. INVARIANTES DE ERROR

La frontera constitutiva deberá representar el rechazo mediante valores.

La semántica autorizada es:

```text
admisibilidad
     │
 ┌───┴────┐
 │        │
 ▼        ▼
Ok       Err
 │        │
 ▼        ▼
Transition   InadmissibleTransition
```

Queda prohibido utilizar:

```rust
panic!
unwrap()
expect()
```

como mecanismo de representación de inadmisibilidad dentro de la lógica constitucional.

Un rechazo constitutivo no es una excepción accidental.

Es un valor del dominio.

---

# 15. AUDITORÍA CON `trybuild`

`trybuild` permanece exclusivamente como dependencia de desarrollo.

Su función es proporcionar evidencia compilatoria contra intentos de evasión de las fronteras constitucionales.

La suite de auditoría podrá demostrar, entre otras propiedades:

1. imposibilidad de construir directamente `Transition<C, L, A, E>` desde fuera de su frontera;
2. imposibilidad de acceder a sus campos privados;
3. imposibilidad de introducir mutabilidad no autorizada;
4. imposibilidad de utilizar símbolos internos como parte de la API pública.

Las pruebas negativas pertenecen a la capa de auditoría.

No forman parte del modelo semántico del dominio.

---

# 16. DEPENDENCIAS

`Cargo.toml` deberá conservar:

```text
sin dependencias de runtime
```

La única dependencia previamente autorizada para esta fase de auditoría es:

```text
trybuild
```

como `dev-dependency`.

No se autoriza introducir:

```text
serde
tokio
uuid
bincode
async runtime
threading runtime
```

ni ninguna dependencia equivalente.

La aparición de una dependencia nueva requiere una especificación posterior que justifique su necesidad.

---

# 17. PROHIBICIONES ARQUITECTÓNICAS

El Commit #24 no podrá introducir:

### Patrones de construcción

```text
Builder
Factory
StateFactory
TransitionBuilder
```

### Ejecutores

```text
Executor
LawExecutor
DomainEngine
TransitionEngine
```

### Infraestructura

```text
Repository
Adapter
Serializer
Deserializer
Transport
```

### Utilidades

```text
helpers.rs
utils.rs
common.rs
```

si su existencia no está previamente autorizada por una frontera constitucional posterior.

La austeridad estructural es una propiedad del diseño.

---

# 18. CRITERIOS DE ACEPTACIÓN DE LA FASE DOCUMENTAL

La Fase 1 solamente podrá considerarse aprobada cuando:

- la firma sea uniformemente `Transition<C, L, A, E>`;
- `try_constitute` utilice exactamente la misma parametrización;
- `NormativeContent` permanezca opaco;
- no exista una implementación ficticia de admisibilidad;
- `AdmissibilityRejection` no reciba razones arbitrarias no justificadas;
- `FenceEpoch` quede fuera de la API pública vigente;
- los seis módulos de `src/domain/` sean los únicos autorizados;
- no se autoricen módulos auxiliares;
- no se introduzcan dependencias de runtime;
- la Fase 1 quede claramente separada de la implementación física.

---

# 19. SECUENCIA DE EJECUCIÓN AUTORIZADA

La evolución del Commit #24 queda congelada en tres fases:

```text
┌─────────────────────────────────────────────────────┐
│ FASE 1 — DOCUMENTAL                                 │
│                                                     │
│ Crear especificación                               │
│       ↓                                             │
│ Auditar texto                                      │
│       ↓                                             │
│ git add                                             │
│       ↓                                             │
│ git diff --cached --check                           │
│       ↓                                             │
│ Commit documental                                   │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│ FASE 2 — IMPLEMENTACIÓN FÍSICA                      │
│                                                     │
│ Modificar lib.rs                                   │
│ Crear src/domain/                                  │
│ Crear los seis módulos autorizados                 │
│                                                     │
│ SIN introducir arquitectura adicional              │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│ FASE 3 — VERIFICACIÓN                               │
│                                                     │
│ cargo check                                        │
│ cargo test                                         │
│ trybuild                                            │
│ auditoría final                                    │
└─────────────────────────────────────────────────────┘
```

**Ninguna fase podrá adelantarse a la anterior.**

---

# 20. ESTADO CONSTITUCIONAL DE `FenceEpoch`

La situación final queda expresada de la siguiente manera:

```text
                         HISTORIAL GIT
                              │
                              ▼
                         9733e21
                              │
                              ▼
                       FenceEpoch
                              │
                       evidencia histórica
                              │
                              X
                              │
                     NO FORMA PARTE DE
                     LA API VIGENTE
                              │
                              ▼
                    ┌───────────────────┐
                    │   DOMAIN #24      │
                    │                   │
                    │ State             │
                    │ NormativeContent  │
                    │ DomainLaw         │
                    │ Transition        │
                    │ Rejection         │
                    │                   │
                    └───────────────────┘
```

La historia permanece.

La arquitectura vigente queda limpia.

---

# 21. CADENA DE PRECEDENCIA

```text
#17–#20
Ontología
    │
    ▼
#21
Contrato mínimo
    │
    ▼
#22
Especificación normativa de tipos
    │
    ▼
#23 — 2c4feb2
Especificación de trabajo del dominio Rust
    │
    ▼
#24 — Fase 1
Especificación documental autorizadora
    │
    ▼
══════════════════════════════════════
     FRONTERA DE IMPLEMENTACIÓN
══════════════════════════════════════
    │
    ▼
#24 — Fase 2
Implementación física
    │
    ▼
#24 — Fase 3
Verificación técnica
```

---

# 🧱 PRINCIPIO DE CIERRE

> **Primero descubrimos qué puede existir.**
>
> **Después congelamos por qué puede existir.**
>
> **Después definimos exactamente dónde puede existir.**
>
> **Solo entonces permitimos que el código exista.**

La implementación no deberá interpretar este documento.

Deberá **obedecerlo**.

**Gudo Labs — FlowCore**