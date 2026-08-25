# Commit 22 — Especificación Normativa de Tipos y Fronteras en Rust

**Estado conceptual:** 🟡 En diseño / Especificación normativa
**Área:** Core Engine / Domain
**Precedente directo:** Commit 21 — Contrato Minimalista del Dominio en Rust
**Propósito:** Definir las fronteras mínimas de representación del dominio en Rust, estableciendo invariantes, visibilidad, firmas conceptuales y relaciones entre tipos, sin introducir todavía implementación ejecutable ni infraestructura.

---

## 🏛️ DECLARACIÓN CONSTITUCIONAL

El Commit 22 establece la **especificación normativa de tipos** que regirá la futura representación del dominio de FlowCore en Rust.

Este commit **no constituye una implementación**.

Su función es establecer la frontera que cualquier implementación posterior deberá respetar.

La regla transversal queda congelada:

> **Ninguna decisión de representación en Rust puede introducir una semántica que no haya sido previamente autorizada por la ontología establecida en los Commit #17–#20 y por el contrato mínimo establecido en el Commit #21.**

Por tanto, el lenguaje Rust queda subordinado al modelo del dominio y no puede utilizar sus mecanismos de representación para introducir conceptos ontológicamente inexistentes.

Queda prohibido, salvo autorización posterior y explícita:

* introducir identificadores sintéticos como sustitutos de identidad ontológica;
* exponer públicamente la construcción arbitraria de testimonios constitutivos;
* representar estados inválidos mediante variantes de tipos constitutivos;
* introducir builders, drafts o estados temporales de transición;
* introducir motores de reglas o agentes ejecutores bajo la abstracción `DomainLaw`;
* exigir infraestructura de persistencia, serialización, reflexión o ejecución dinámica como condición del dominio;
* introducir mutabilidad sobre testimonios constitutivos.

---

# 1. TRAZABILIDAD CONSTITUCIONAL

El Commit 21 estableció:

[
\boxed{
\exists\ Transition
\Rightarrow
Constituted
\Rightarrow
Admissible
}
]

La consecuencia técnica es que `Transition` no puede ser un contenedor arbitrariamente construible.

Debe representar exclusivamente una proposición que ya ha superado la frontera constitutiva.

Asimismo:

[
\boxed{
DomainLaw \neq ExecutionEngine
}
]

y:

[
\boxed{
DomainLaw \neq MutationMechanism
}
]

El Commit 22 traduce estas restricciones a una especificación mínima de tipos.

Los cinco pilares son:

1. `State<C>`
2. `NormativeContent`
3. `DomainLaw`
4. `Transition<C, L, A, E>`
5. `InadmissibleTransition`

La especificación de estos tipos no implica todavía la implementación de sus operaciones internas.

---

# 2. `State<C>` — TESTIMONIO INMUTABLE DE ESTADO

## 2.1 Propósito

`State<C>` representa una configuración de dominio asociada a un contexto `C`.

No debe interpretarse como:

* un registro mutable;
* un almacén de datos;
* un DTO;
* una entidad identificada artificialmente;
* un objeto con identidad sintética.

Su función es proporcionar el valor de estado utilizado por la proposición relacional de una transición.

Conceptualmente:

[
State<C>
]

representa un estado constituido como valor.

## 2.2 Frontera

La construcción arbitraria de `State<C>` no deberá quedar expuesta como una operación pública capaz de introducir configuraciones no autorizadas por el dominio.

La implementación futura deberá determinar, a partir de la semántica ya establecida, cuál es la frontera mínima de construcción de un estado.

No se autoriza en este commit una firma concreta de constructor público.

## 2.3 Mutabilidad

`State<C>` deberá ser tratado como valor inmutable desde la perspectiva del contrato de dominio.

No se autoriza:

```rust
&mut self
```

como mecanismo para alterar un estado que ya participa en un testimonio constitutivo.

La evolución de un estado deberá producir, cuando corresponda, otro valor de estado.

---

# 3. `NormativeContent` — CONTENIDO DECLARATIVO DE LA LEY

## 3.1 Propósito

`NormativeContent` representa el contenido normativo de una `DomainLaw`.

Su función es describir restricciones de manera declarativa.

Conceptualmente:

[
N_L = NormativeContent(L)
]

El contenido normativo no constituye un programa ejecutable.

## 3.2 Naturaleza algebraica

La representación conceptual mínima comprende:

[
N_L = (Scope,\ Condition,\ Relation)
]

La presencia y estructura exacta de cada componente queda sujeta a la ontología previamente establecida.

En particular, este commit **no congela todavía las variantes concretas** de:

* `Scope`;
* `Condition`;
* `Relation`.

La razón es evitar que una representación prematura de Rust determine una semántica que todavía pertenece al nivel ontológico.

## 3.3 Prohibición de ejecución

`NormativeContent` no deberá contener:

* closures;
* callbacks;
* funciones ejecutables;
* scripts;
* bytecode;
* referencias a motores de ejecución;
* mecanismos de mutación;
* efectos secundarios.

La ley debe poder existir como contenido normativo independientemente de cualquier mecanismo de ejecución.

---

# 4. `DomainLaw` — FRONTERA NORMATIVA

## 4.1 Naturaleza

`DomainLaw` representa la abstracción mediante la cual una ley del dominio expone su contenido normativo.

No representa un motor.

No representa un servicio de ejecución.

No representa una operación de mutación.

No representa un agente que produzca automáticamente un estado posterior.

La distinción fundamental es:

[
\boxed{
DomainLaw \rightarrow NormativeContent
}
]

y no:

[
\boxed{
DomainLaw \rightarrow Execute
}
]

## 4.2 Especificación conceptual

La frontera mínima autorizada es conceptualmente equivalente a:

```rust
pub trait DomainLaw {
    fn normative_content(&self) -> &NormativeContent;
}
```

Esta firma se considera **especificación normativa**, no implementación definitiva.

La forma final podrá refinarse únicamente si dicho refinamiento conserva la semántica establecida por los Commit #17–#21.

## 4.3 Prohibiciones

No se autoriza introducir en `DomainLaw` operaciones tales como:

```rust
fn execute(...);
fn apply(...);
fn evaluate_and_mutate(...);
fn next_state(...);
```

La ley no deberá convertirse en una máquina de transición.

---

# 5. `Transition<C, L, A, E>` — WITNESS CONSTITUIDO

## 5.1 Naturaleza

`Transition` representa exclusivamente una transición que ya ha sido constituida como admisible.

Conceptualmente:

[
Transition =
(S_{pre}, L, A, E, S_{post})
]

donde:

* (S_{pre}) = estado previo;
* (L) = ley aplicable;
* (A) = autoridad;
* (E) = evidencia;
* (S_{post}) = estado posterior.

La presencia del valor `Transition` constituye el testimonio técnico de que la proposición superó la frontera de admisibilidad.

## 5.2 Forma conceptual

La representación mínima queda especificada como:

```rust
pub struct Transition<C, L, A, E> {
    pre: State<C>,
    law: L,
    authority: A,
    evidence: E,
    post: State<C>,
}
```

Los campos son conceptualmente privados.

No se autoriza construcción literal desde fuera de la frontera constitutiva.

## 5.3 Ausencia de constructor arbitrario

No se autoriza:

```rust
Transition::new(...)
```

como mecanismo público de construcción.

La existencia de un `Transition` deberá depender de la operación constitutiva.

## 5.4 Ausencia de estados intermedios

No se autoriza introducir:

```text
TransitionBuilder
TransitionDraft
PartialTransition
InvalidTransition
PendingTransition
```

ni equivalentes semánticos.

La arquitectura rechaza representar como entidades del dominio estados que ontológicamente no constituyen una transición.

## 5.5 Mutabilidad

No se autoriza exponer mutación sobre un `Transition` constituido.

No deberán existir operaciones:

```rust
fn set_*(...)
fn update_*(...)
fn replace_*(...)
```

ni métodos que reciban:

```rust
&mut self
```

con el propósito de alterar los componentes constitutivos.

---

# 6. `try_constitute` — FRONTERA DE CONSTITUCIÓN

## 6.1 Propósito

La operación de constitución representa la frontera entre:

[
Proposición
]

y:

[
Transition
]

Su responsabilidad conceptual es determinar si la proposición relacional:

[
(S_{pre}, L, A, E, S_{post})
]

es admisible.

## 6.2 Resultado

La operación se especifica conceptualmente como:

```rust
Result<Transition<C, L, A, E>, InadmissibleTransition>
```

La forma conceptual de la operación es:

```rust
try_constitute(
    pre,
    law,
    authority,
    evidence,
    post
)
```

## 6.3 Condición de éxito

Si la proposición es admisible:

[
Admissible(S_{pre},L,A,E,S_{post}) = \top
]

la operación puede producir un `Transition`.

Por tanto:

[
Transition \Rightarrow Admissible
]

## 6.4 Condición de rechazo

Si:

[
Admissible(S_{pre},L,A,E,S_{post}) = \bot
]

la operación no produce una transición.

Produce:

```rust
Err(InadmissibleTransition)
```

## 6.5 Importante: ausencia de `LawEngine`

La especificación de `try_constitute` no autoriza la creación de un objeto denominado:

```text
LawEngine
RuleEngine
RuleRunner
TransitionEngine
```

La existencia de una operación constitutiva no implica la existencia de un agente ontológico denominado “motor”.

El mecanismo concreto mediante el cual se materialice el juicio de admisibilidad queda fuera de este commit y deberá ser especificado posteriormente sin introducir una entidad ontológicamente nueva.

---

# 7. `InadmissibleTransition` — RECHAZO COMO VALOR

## 7.1 Naturaleza

`InadmissibleTransition` representa el resultado semántico de que una proposición no satisface las condiciones necesarias para constituirse como transición.

No representa:

* una excepción de infraestructura;
* un panic;
* un fallo del runtime;
* una transición inválida existente;
* una variante de `Transition`.

## 7.2 Relación algebraica

La frontera se expresa mediante:

[
Result<Transition, InadmissibleTransition>
]

Por tanto:

[
Transition \not\equiv InvalidTransition
]

Una transición inadmisible **no existe como valor `Transition`**.

## 7.3 Razón del rechazo

Conceptualmente:

```rust
pub struct InadmissibleTransition {
    reason: AdmissibilityRejection,
}
```

La forma definitiva de `AdmissibilityRejection` queda fuera del alcance del Commit 22.

No se autoriza todavía congelar un catálogo arbitrario de razones si su semántica no ha sido derivada de la ontología.

---

# 8. IDENTIDAD Y PROHIBICIÓN DE IDENTIFICADORES SINTÉTICOS

La existencia de un valor de dominio no deberá depender de un identificador artificial introducido exclusivamente por conveniencia técnica.

Quedan fuera de esta especificación como mecanismos de identidad ontológica:

```text
UUID
AutoIncrement
TypeId
hash artificial
índice técnico
```

La identidad de una construcción deberá derivarse de la estructura relacional que la constituye, conforme a los principios establecidos en los Commit #17–#20.

No se permite introducir un identificador técnico para resolver una ausencia de identidad ontológica.

---

# 9. INFRAESTRUCTURA FUERA DEL DOMINIO

El dominio no deberá exigir, como condición de sus tipos fundamentales:

* bases de datos;
* serialización;
* deserialización;
* filesystem;
* red;
* logging;
* reflexión;
* runtime externo;
* persistencia;
* identificadores de infraestructura.

Si una capa externa requiere serialización, persistencia o identificación técnica, dichas necesidades deberán permanecer fuera de la semántica constitutiva del dominio.

---

# 10. MATRIZ DE AUDITORÍA CONSTITUCIONAL

Antes de autorizar implementación ejecutable, deberá verificarse:

| Criterio                                                                      | Estado requerido | Razón                                                                 |
| ----------------------------------------------------------------------------- | ---------------- | --------------------------------------------------------------------- |
| `Transition` tiene campos públicos                                            | ❌ NO             | Permitiría construcción arbitraria                                    |
| Existe `TransitionBuilder`                                                    | ❌ NO             | Introduciría estados intermedios no ontológicos                       |
| Existe `InvalidTransition`                                                    | ❌ NO             | Representaría como existente algo que no fue constituido              |
| Existe `LawEngine` como abstracción de dominio                                | ❌ NO             | Confundiría ley con mecanismo ejecutor                                |
| `DomainLaw` muta estados                                                      | ❌ NO             | Viola la separación normativa                                         |
| `DomainLaw` genera directamente `S_post`                                      | ❌ NO             | Confunde juicio normativo con producción de estado                    |
| `Transition` expone `&mut self` para alterar sus componentes                  | ❌ NO             | Viola la inmutabilidad constitutiva                                   |
| `try_constitute` puede producir `Transition` sin juicio de admisibilidad      | ❌ NO             | Rompe `Transition ⇒ Admissible`                                       |
| `InadmissibleTransition` aparece dentro de `Transition`                       | ❌ NO             | El rechazo no constituye una transición                               |
| Se requiere `UUID` para identidad ontológica                                  | ❌ NO             | Introduce identidad sintética                                         |
| El dominio requiere persistencia                                              | ❌ NO             | Contamina el núcleo con infraestructura                               |
| `NormativeContent` ejecuta closures o código                                  | ❌ NO             | Convierte contenido normativo en comportamiento                       |
| Se congelan prematuramente las variantes de `Scope`, `Condition` o `Relation` | ❌ NO             | Impediría que la ontología determine posteriormente su representación |

---

# 11. LÍMITES EXPLÍCITOS DEL COMMIT 22

El Commit 22 **sí fija**:

* las fronteras conceptuales de los cinco tipos principales;
* la naturaleza constitutiva de `Transition`;
* la ausencia de construcción arbitraria;
* la relación `Result<Transition, InadmissibleTransition>`;
* la inmutabilidad constitutiva;
* la separación entre ley y mecanismo ejecutor;
* la naturaleza declarativa de `NormativeContent`;
* la prohibición de identidad sintética;
* la separación del dominio respecto de infraestructura.

El Commit 22 **no fija todavía**:

* la implementación completa de `State<C>`;
* las variantes definitivas de `Scope`;
* las variantes definitivas de `Condition`;
* las variantes definitivas de `Relation`;
* la taxonomía completa de `AdmissibilityRejection`;
* el mecanismo interno definitivo del juicio de admisibilidad;
* módulos ejecutables;
* persistencia;
* serialización;
* infraestructura;
* pruebas de ejecución;
* integración con Cargo.

Esta separación es deliberada.

---

# 12. CRITERIO DE CONFORMIDAD PARA LA IMPLEMENTACIÓN FUTURA

Toda implementación posterior deberá poder responder afirmativamente:

1. ¿Puede existir un `Transition` sin haber demostrado admisibilidad?
2. ¿Puede existir un `Transition` parcialmente construido?
3. ¿Puede modificarse un `Transition` después de constituido?
4. ¿Puede `DomainLaw` convertirse en un ejecutor?
5. ¿Puede `NormativeContent` ejecutar comportamiento?
6. ¿Puede una transición inadmisible aparecer como un `Transition`?
7. ¿Puede una identidad técnica sustituir una relación ontológica?
8. ¿Puede el dominio depender de infraestructura para conservar su semántica?

Todas las respuestas deberán ser:

[
\boxed{NO}
]

La implementación no será considerada conforme si necesita introducir cualquiera de estos mecanismos para funcionar.

---

# 13. CONCLUSIÓN CONSTITUCIONAL

El Commit 22 establece la frontera entre la ontología ya congelada y su futura representación tipada.

La secuencia queda:

```text
Ontología
   #17
   #18
   #19
   #20
      │
      ▼
Contrato Minimalista
   #21
      │
      ▼
Especificación Normativa de Tipos
   #22
      │
      ▼
Implementación del Domain
   #23
```

El principio rector queda establecido:

> **El tipo no debe decirnos qué es el dominio.**
>
> **El dominio debe decirnos qué debe impedir el tipo.**

Por tanto, el código futuro no tendrá libertad para inventar la semántica del dominio.

Su función será demostrar que la representación técnica puede expresar y preservar las restricciones que la arquitectura ya estableció.

**El Commit 22 queda listo para auditoría documental.**

— **Gudo Labs**
