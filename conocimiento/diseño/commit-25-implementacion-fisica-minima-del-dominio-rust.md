# Commit #25 â€” ImplementaciÃ³n FÃ­sica MÃ­nima del Dominio Rust

**Tipo:** ImplementaciÃ³n fÃ­sica mÃ­nima
**Ãmbito:** `flowcore-domain`
**Commit constitucional precedente:** `94fd2a4`
**Mensaje de commit:** `feat(domain): implement minimal physical domain ontology in Rust (#25)`
**Fase:** 2 â€” MaterializaciÃ³n fÃ­sica mÃ­nima
**Estado:** CONGELADO

---

## 1. PropÃ³sito

Este documento registra la materializaciÃ³n fÃ­sica mÃ­nima y estrictamente autorizada del dominio de `FlowCore` en Rust.

La implementaciÃ³n realizada en este commit no constituye una ampliaciÃ³n conceptual del dominio ni una reinterpretaciÃ³n de los contratos normativos previamente congelados.

Su propÃ³sito exclusivo es traducir a sintaxis Rust aquellos elementos cuya representaciÃ³n fÃ­sica quedÃ³ suficientemente determinada por la precedencia normativa existente.

La regla fundamental aplicada durante esta materializaciÃ³n fue:

> Lo que estÃ¡ congelado puede escribirse.
> Lo que permanece opaco no puede inventarse.
> Lo que estÃ¡ diferido no puede implementarse por inercia.

---

## 2. Frontera constitucional previa

La materializaciÃ³n fÃ­sica parte del estado establecido por el commit:

```text
94fd2a4
```

Este commit permanece intacto.

No se reescribe, no se corrige retrospectivamente y no se altera su contenido histÃ³rico.

La implementaciÃ³n de este commit se considera una consecuencia posterior de aquella especificaciÃ³n y no una modificaciÃ³n de la misma.

La historia normativa conserva, por tanto, su precedencia causal:

```text
EspecificaciÃ³n normativa
        â”‚
        â–¼
     94fd2a4
        â”‚
        â–¼
ImplementaciÃ³n fÃ­sica mÃ­nima
        â”‚
        â–¼
     Commit #25
```

---

## 3. Principio de materializaciÃ³n

La traducciÃ³n de la especificaciÃ³n normativa a Rust se realizÃ³ bajo una regla de no inferencia:

```text
CONGELADO
    â”‚
    â””â”€â”€â–º puede materializarse fÃ­sicamente

CONTRACTUAL PERO OPACO
    â”‚
    â””â”€â”€â–º no se inventa representaciÃ³n

DIFERIDO
    â”‚
    â””â”€â”€â–º se omite de la compilaciÃ³n

NO AUTORIZADO
    â”‚
    â””â”€â”€â–º no existe en el Ã¡rbol fÃ­sico
```

Esta regla evita que una necesidad sintÃ¡ctica del compilador sea utilizada como justificaciÃ³n para introducir decisiones arquitectÃ³nicas que todavÃ­a no han sido congeladas normativamente.

---

## 4. Frontera fÃ­sica autorizada

La Fase 2 queda limitada a cuatro archivos fÃ­sicos:

```text
src/
â”œâ”€â”€ lib.rs
â””â”€â”€ domain/
    â”œâ”€â”€ mod.rs
    â”œâ”€â”€ state.rs
    â””â”€â”€ transition.rs
```

No se agregaron otros mÃ³dulos de dominio.

La implementaciÃ³n fÃ­sica queda, por tanto, estrictamente delimitada a:

1. `src/domain/state.rs`
2. `src/domain/transition.rs`
3. `src/domain/mod.rs`
4. `src/lib.rs`

---

## 5. `State<C>`

### 5.1 Contrato

`State<C>` representa el testimonio inmutable de un estado dentro de un contexto `C`.

Su representaciÃ³n fue determinada previamente como una estructura cuyo contexto permanece encapsulado.

### 5.2 ImplementaciÃ³n

```rust
/// Testimonio inmutable de un estado dentro del contexto C.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct State<C> {
    inner: C,
}

impl<C> State<C> {
    pub const fn new(context: C) -> Self {
        Self { inner: context }
    }

    pub fn context(&self) -> &C {
        &self.inner
    }
}
```

### 5.3 Decisiones respetadas

- El campo `inner` permanece privado.
- La representaciÃ³n fÃ­sica corresponde al contrato previamente congelado.
- No se agregaron campos adicionales.
- No se agregaron constructores alternativos.
- No se agregaron mÃ©todos de conveniencia adicionales.
- No se introdujo lÃ³gica normativa.
- No se introdujeron validaciones.
- No se introdujeron efectos laterales.

La API queda limitada a:

```text
State::new
State::context
```

---

## 6. `Transition<C, L, A, E>`

### 6.1 Contrato

`Transition` representa una proposiciÃ³n de relaciÃ³n constitutiva entre un estado previo y un estado posterior, acompaÃ±ada por ley, autoridad y evidencia.

La ordenaciÃ³n genÃ©rica fÃ­sica utilizada es:

```text
Transition<C, L, A, E>
```

donde:

```text
C = Contexto
L = Ley
A = Autoridad
E = Evidencia
```

### 6.2 ImplementaciÃ³n

```rust
use crate::domain::state::State;

/// ProposiciÃ³n de relaciÃ³n constitutiva inmutable.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Transition<C, L, A, E> {
    pre: State<C>,
    law: L,
    authority: A,
    evidence: E,
    post: State<C>,
}
```

### 6.3 Decisiones respetadas

Los cinco componentes permanecen privados:

```text
pre
law
authority
evidence
post
```

No se introdujeron:

- getters pÃºblicos;
- constructores pÃºblicos;
- mÃ©todos de conveniencia;
- lÃ³gica de transiciÃ³n;
- validaciones;
- mecanismos de mutaciÃ³n;
- funciones de constituciÃ³n;
- representaciÃ³n alternativa.

La estructura constituye Ãºnicamente la materializaciÃ³n fÃ­sica de la forma previamente autorizada.

---

## 7. `src/domain/mod.rs`

El mÃ³dulo de dominio expone Ãºnicamente los componentes fÃ­sicamente materializados:

```rust
pub mod state;
pub mod transition;

pub use state::State;
pub use transition::Transition;
```

La superficie queda deliberadamente reducida.

No se agregan mÃ³dulos para tipos cuya representaciÃ³n continÃºa opaca.

---

## 8. `src/lib.rs`

La raÃ­z de la librerÃ­a conserva la prohibiciÃ³n de cÃ³digo `unsafe` y pasa a exponer el mÃ³dulo de dominio:

```rust
#![forbid(unsafe_code)]

pub mod domain;
```

La modificaciÃ³n implica:

```text
Antes:

lib.rs
 â””â”€â”€ FenceEpoch


DespuÃ©s:

lib.rs
 â””â”€â”€ domain
      â”œâ”€â”€ State
      â””â”€â”€ Transition
```

`FenceEpoch` no fue eliminado fÃ­sicamente del disco.

Permanece en:

```text
src/fence_epoch.rs
```

pero queda fuera de la compilaciÃ³n y de la superficie pÃºblica al eliminar su declaraciÃ³n:

```rust
mod fence_epoch;
```

y su reexport:

```rust
pub use fence_epoch::FenceEpoch;
```

---

## 9. Elementos deliberadamente no materializados

Una parte esencial de este commit es aquello que deliberadamente no fue escrito.

La ausencia de estos tipos no constituye una omisiÃ³n accidental.

Constituye una decisiÃ³n arquitectÃ³nica obligatoria.

---

## 9.1 `NormativeContent`

`NormativeContent` fue establecido como un tipo opaco de contenido normativo declarativo.

La especificaciÃ³n normativa impide congelar prematuramente una representaciÃ³n concreta de almacenamiento.

Por lo tanto, no se introdujo ninguna representaciÃ³n artificial como:

```rust
struct NormativeContent {
    inner: String,
}
```

ni:

```rust
struct NormativeContent(Vec<u8>);
```

ni:

```rust
struct NormativeContent;
```

ni:

```rust
struct NormativeContent(PhantomData<()>);
```

ni ninguna otra representaciÃ³n equivalente.

La implementaciÃ³n fÃ­sica queda diferida hasta que su representaciÃ³n haya sido constitucionalmente determinada.

---

## 9.2 `DomainLaw`

`DomainLaw` depende directamente de `NormativeContent`:

```text
DomainLaw
    â”‚
    â””â”€â”€â–º normative_content()
              â”‚
              â–¼
       NormativeContent
```

La firma conceptual del contrato es:

```rust
pub trait DomainLaw {
    fn normative_content(&self) -> NormativeContent;
}
```

Sin embargo, dado que `NormativeContent` continÃºa siendo opaco y su representaciÃ³n fÃ­sica no ha sido congelada, materializar `DomainLaw` en esta fase habrÃ­a obligado a introducir una representaciÃ³n artificial de dicho tipo.

Por esa razÃ³n, `DomainLaw` tampoco se materializa fÃ­sicamente en este commit.

Esto no invalida su existencia conceptual.

La distinciÃ³n es:

```text
Contrato normativo       = existente
RepresentaciÃ³n Rust      = diferida
```

---

## 9.3 `AdmissibilityRejection`

El rechazo de admisibilidad fue establecido como un tipo cuyo contenido interno permanece opaco.

No se congelaron variantes concretas.

Por lo tanto, no se introdujo artificialmente:

```rust
enum AdmissibilityRejection {
    UnsatisfiedDomainLaw,
}
```

ni ninguna otra enumeraciÃ³n, estructura o representaciÃ³n equivalente.

Su representaciÃ³n fÃ­sica queda pendiente de la formalizaciÃ³n normativa correspondiente.

---

## 9.4 `InadmissibleTransition`

`InadmissibleTransition` permanece igualmente opaco.

No se introdujo una estructura artificial para satisfacer una dependencia sintÃ¡ctica.

No se agregaron:

- campos ficticios;
- variantes ficticias;
- constructores artificiales;
- marcadores de tipo;
- `PhantomData`;
- unit structs;
- almacenamiento placeholder.

La representaciÃ³n permanece diferida.

---

## 9.5 `try_constitute`

`try_constitute` no fue implementado.

La razÃ³n no es una limitaciÃ³n tÃ©cnica.

La razÃ³n es constitucional.

El contrato normativo correspondiente dejÃ³ pendiente la definiciÃ³n formal del juicio de admisibilidad.

Por lo tanto, no existe autorizaciÃ³n para inventar:

- reglas de admisibilidad;
- orden de evaluaciÃ³n;
- validaciones;
- errores;
- condiciones de rechazo;
- construcciÃ³n del estado posterior;
- semÃ¡ntica de transiciÃ³n.

En consecuencia:

```text
try_constitute
        â”‚
        â–¼
     DIFERIDO
```

y permanece completamente fuera de la implementaciÃ³n fÃ­sica de esta fase.

---

## 10. `FenceEpoch`

`FenceEpoch` permanece fÃ­sicamente en el repositorio:

```text
src/fence_epoch.rs
```

pero ya no forma parte de la compilaciÃ³n de la librerÃ­a.

Esta decisiÃ³n no constituye eliminaciÃ³n histÃ³rica ni modificaciÃ³n del artefacto anterior.

La separaciÃ³n es intencional:

```text
FenceEpoch
   â”‚
   â”œâ”€â”€ permanece en disco
   â”‚
   â””â”€â”€ no participa en lib.rs
```

La frontera constitucional anterior queda preservada.

---

## 11. VerificaciÃ³n tÃ©cnica

La herramienta Rust utilizada durante esta fase fue:

```text
rustup 1.29.0 (28d1352db 2026-03-05)
rustc 1.98.0 (88d9e12ae 2026-08-18)
cargo 1.98.0 (797e8a9bc 2026-08-05)
```

La verificaciÃ³n tÃ©cnica se realizÃ³ mediante:

```powershell
cargo check
```

Resultado observado:

```text
Updating crates.io index
Checking flowcore-domain v0.1.0
Finished `dev` profile [unoptimized + debuginfo]
```

Por lo tanto:

```text
cargo check
    â”‚
    â–¼
   PASS
```

La implementaciÃ³n fÃ­sica compilÃ³ correctamente bajo la herramienta Rust disponible en el entorno.

No se introdujeron errores de compilaciÃ³n durante esta materializaciÃ³n.

---

## 12. VerificaciÃ³n del staging

Antes del cierre del commit se realizÃ³:

```powershell
git diff --cached --check
```

Resultado:

```text
sin salida
```

Esto confirma que el contenido staged no presenta errores de whitespace detectables mediante dicha verificaciÃ³n.

La composiciÃ³n del cambio quedÃ³ limitada a:

```text
A  src/domain/mod.rs
A  src/domain/state.rs
A  src/domain/transition.rs
M  src/lib.rs
```

No se incluyÃ³:

```text
src/fence_epoch.rs
```

como modificaciÃ³n o eliminaciÃ³n.

---

## 13. Historial constitucional previo

La frontera histÃ³rica inmediata se verificÃ³ mediante:

```powershell
git log --oneline -5
```

Resultado observado:

```text
94fd2a4 (HEAD -> main) docs: define especificacion de implementacion del dominio Rust
2c4feb2 docs: define especificacion de trabajo del dominio Rust
058c987 docs(domain): specify normative types and boundaries for Rust implementation (#22)
11c840c docs: define minimal domain contract in Rust (#21)
0ccf52d docs: freeze ontology of DomainLaw and Transition (#20)
```

El commit `94fd2a4` constituye la frontera constitucional inmediatamente anterior a esta materializaciÃ³n.

Este commit no modifica ninguno de dichos antecedentes.

---

## 14. Integridad del Ã¡rbol

La implementaciÃ³n fÃ­sica no alterÃ³:

```text
Cargo.toml
```

ni introdujo dependencias adicionales.

Tampoco se materializaron tipos o mÃ³dulos no autorizados.

La estructura fÃ­sica resultante es:

```text
flowcore-domain
â””â”€â”€ src
    â”œâ”€â”€ lib.rs
    â”œâ”€â”€ fence_epoch.rs
    â””â”€â”€ domain
        â”œâ”€â”€ mod.rs
        â”œâ”€â”€ state.rs
        â””â”€â”€ transition.rs
```

---

## 15. Principio de no ficciÃ³n arquitectÃ³nica

Este commit establece explÃ­citamente que una necesidad del compilador no constituye autorizaciÃ³n arquitectÃ³nica.

En particular:

```text
"Rust necesita una representaciÃ³n"
```

no implica:

```text
"la arquitectura ya autorizÃ³ una representaciÃ³n"
```

Cuando existe una dependencia entre un contrato congelado y un tipo cuya representaciÃ³n continÃºa opaca, la consecuencia correcta es el diferimiento.

No se utilizan tipos falsos para hacer compilar el sistema.

No se utilizan estructuras unitarias artificiales.

No se utilizan campos privados ficticios.

No se utilizan variantes inventadas.

No se utilizan `PhantomData` como mecanismo de evasiÃ³n.

La compilabilidad nunca se utiliza como sustituto de la especificaciÃ³n.

---

## 16. Frontera fÃ­sica de la Fase 2

La Fase 2 queda cerrada en la siguiente frontera:

```text
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚       MATERIALIZACIÃ“N AUTORIZADA            â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ State<C>                         IMPLEMENTADO â”‚
â”‚ Transition<C,L,A,E>             IMPLEMENTADO â”‚
â”‚ domain/mod.rs                   IMPLEMENTADO â”‚
â”‚ lib.rs                          ACTUALIZADO  â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚       MATERIALIZACIÃ“N DIFERIDA              â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ NormativeContent                DIFERIDO     â”‚
â”‚ DomainLaw                       DIFERIDO     â”‚
â”‚ AdmissibilityRejection          DIFERIDO     â”‚
â”‚ InadmissibleTransition          DIFERIDO     â”‚
â”‚ try_constitute                  DIFERIDO     â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚       CONFINAMIENTO                          â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ FenceEpoch                      NO EXPUESTO  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## 17. Regla de continuidad

El siguiente paso del proyecto no debe inferirse por inercia a partir de este commit.

La existencia de:

```text
State<C>
Transition<C,L,A,E>
```

no autoriza automÃ¡ticamente:

```text
DomainLaw
NormativeContent
AdmissibilityRejection
InadmissibleTransition
try_constitute
```

Cada uno de esos elementos requerirÃ¡ su propia autorizaciÃ³n normativa o una extensiÃ³n explÃ­cita de la especificaciÃ³n existente.

La regla de continuidad queda congelada como:

> Lo que no estÃ¡ determinado constitucionalmente no existe todavÃ­a en Rust.

---

## 18. Resultado del Commit #25

El Commit #25 representa la primera materializaciÃ³n fÃ­sica mÃ­nima del dominio Rust bajo disciplina constitucional estricta.

Se consiguiÃ³:

- materializar `State<C>`;
- materializar `Transition<C,L,A,E>`;
- establecer el mÃ³dulo `domain`;
- reorientar `lib.rs`;
- retirar `FenceEpoch` de la compilaciÃ³n pÃºblica;
- conservar `fence_epoch.rs` fÃ­sicamente;
- verificar compilaciÃ³n mediante `cargo check`;
- verificar integridad staged mediante `git diff --cached --check`;
- evitar representaciones artificiales;
- evitar tipos ficticios;
- evitar lÃ³gica normativa no especificada;
- preservar intacta la frontera histÃ³rica `94fd2a4`.

El resultado es deliberadamente pequeÃ±o.

Esa pequeÃ±ez no representa falta de implementaciÃ³n.

Representa control arquitectÃ³nico.

---

## 19. Cierre constitucional

Este commit no afirma que el dominio completo estÃ© implementado.

Afirma algo mÃ¡s preciso:

> La parte del dominio cuya representaciÃ³n fÃ­sica estaba suficientemente determinada ha sido materializada en Rust sin introducir decisiones que pertenecen a fases posteriores.

La implementaciÃ³n termina exactamente donde termina la especificaciÃ³n.

Nada mÃ¡s.

Nada menos.

```text
ESPECIFICACIÃ“N
      â”‚
      â–¼
DETERMINACIÃ“N
      â”‚
      â–¼
MATERIALIZACIÃ“N
      â”‚
      â–¼
VERIFICACIÃ“N
      â”‚
      â–¼
COMMIT #25
```

**Estado final:**

```text
FASE 2 â€” MATERIALIZACIÃ“N FÃSICA MÃNIMA
                         â”‚
                         â–¼
                      CERRADA
```

---

**Fin del acta constitucional del Commit #25.**
