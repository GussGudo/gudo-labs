# Commit 21 — Contrato Minimalista del Dominio en Rust

**Estado conceptual:** 🟡 En diseño / Contrato técnico
**Área de Dominio:** Core Engine / Domain
**Precedente:** Commit 20 — Ontología de DomainLaw y Transition
**Propósito:** Traducir las invariantes ontológicas congeladas a un contrato mínimo de representación en Rust, sin introducir mecanismos de ejecución, persistencia, infraestructura o aplicación.

---

## 🏛️ DECLARACIÓN CONSTITUCIONAL

El Commit 21 inicia la transición entre la **ontología formal** de FlowCore y su **representación técnica en Rust**.

Este commit no implementa el motor completo.

Tampoco introduce:

* base de datos;
* ORM;
* API;
* serialización;
* mensajería;
* persistencia;
* servicios de aplicación;
* ejecución de workflows;
* motores de reglas;
* registries;
* compiladores de políticas;
* DSLs;
* mecanismos de planificación;
* infraestructura.

Su único propósito es establecer cómo las invariantes ontológicas ya congeladas pueden convertirse en **fronteras verificables mediante el sistema de tipos de Rust**.

La regla constitucional de esta etapa es:

> **La implementación debe obedecer a la ontología; la ontología no debe modificarse para acomodarse a la implementación.**

---

# 1. PRECEDENTE ONTOLÓGICO

El Commit 20 estableció que:

[
Recognition \neq Admissibility \neq Constitution
]

y que:

[
N_L =
(Scope,\ Condition,\ Relation,\ Ground)
]

donde `N_L` representa el contenido normativo de una `DomainLaw`.

También quedó establecido:

[
Admissible(N_L,C_{pre},A,E,C_{post})
]

como predicado de admisibilidad de una proposición relacional completa.

La consecuencia fundamental es:

[
Admissible = \top
\Rightarrow
\exists Transition
]

La `Transition` no representa una intención futura.

No representa una solicitud.

No representa un candidato.

No representa un cambio pendiente.

No representa una instrucción para modificar un estado.

Representa el **hecho transicional constituido**.

---

# 2. OBJETIVO TÉCNICO DEL COMMIT 21

El objetivo de este commit es responder:

> ¿Cómo puede Rust impedir que una `Transition` inválida sea construida accidentalmente?

La respuesta arquitectónica buscada es:

[
\boxed{
\exists T \Rightarrow Valid(T)
}
]

La estructura técnica deberá hacer que la validez de una `Transition` no sea una propiedad que el consumidor deba recordar comprobar manualmente.

Debe ser una propiedad protegida por la frontera de construcción del tipo.

---

# 3. TRANSITION COMO WITNESS

Una `Transition` será considerada un **witness** de una relación transicional constituida.

Su existencia expresa que la proposición:

[
(S_{pre},L,A,E,S_{post})
]

superó el criterio de constitución establecido por el dominio.

Por tanto:

[
Transition
\neq
CandidateTransition
]

[
Transition
\neq
TransitionRequest
]

[
Transition
\neq
TransitionDraft
]

[
Transition
\neq
ExecutionResult
]

La ontología solo reconoce una de ellas:

[
\boxed{Transition = ConstitutedRelationalFact}
]

---

# 4. PROHIBICIÓN DE ESTADOS INVÁLIDOS REPRESENTABLES

El contrato técnico deberá minimizar la posibilidad de que exista una instancia de `Transition` que no haya atravesado su criterio constitutivo.

La representación conceptual mínima es:

```text
Transition
├── pre
├── law
├── authority
├── evidence
└── post
```

Pero la estructura anterior no debe ser públicamente construible mediante inicialización arbitraria de sus campos.

El consumidor no debe poder expresar conceptualmente:

```text
Transition {
    pre: ...,
    law: ...,
    authority: ...,
    evidence: ...,
    post: ...
}
```

como mecanismo normal de creación.

La razón no es estética.

La razón es constitucional:

[
\boxed{
Construction(Transition)
\subseteq
Constitution
}
]

---

# 5. FRONTERA DE CONSTRUCCIÓN

La creación de `Transition` deberá estar encapsulada dentro del módulo responsable de preservar su invariante.

Conceptualmente:

```text
                    proposición
                        │
                        ▼
              ┌────────────────────┐
              │ Admissibility      │
              │                    │
              │ N_L + Cpre + A + E │
              │       + Cpost      │
              └─────────┬──────────┘
                        │
                 ┌──────┴──────┐
                 │             │
                FALSE         TRUE
                 │             │
                 ▼             ▼
             rechazo       Transition
                              │
                              ▼
                         hecho constituido
```

El punto fundamental es que el camino `TRUE` no debe ser confundido con ejecución.

No se ejecuta una transición.

Se **constituye el testimonio de que una relación propuesta es admisible**.

---

# 6. `try_constitute` COMO OPERACIÓN DE CONSTITUCIÓN

La operación técnica prevista será conceptualmente equivalente a:

```text
try_constitute(
    pre,
    law,
    authority,
    evidence,
    post
)
```

Su semántica será:

[
try_constitute(P)
=================

\begin{cases}
Transition(P) & \text{si } Admissible(P)=\top\
Rejection & \text{si } Admissible(P)=\bot
\end{cases}
]

Esta operación no será un servicio.

No será un workflow.

No será un runner.

No será un motor.

No será una entidad adicional del dominio.

Será simplemente la **frontera técnica donde una proposición relacional puede adquirir existencia como hecho constituido**.

---

# 7. POR QUÉ NO EXISTE `TransitionBuilder`

Se rechaza explícitamente el patrón:

```text
TransitionBuilder
```

cuando este represente un ciclo de vida artificial:

```text
Draft
  ↓
Builder
  ↓
Candidate
  ↓
Validate
  ↓
Finalize
  ↓
Transition
```

Este modelo introduce entidades temporales que no forman parte de la ontología.

La ontología únicamente necesita distinguir:

```text
No Transition
```

de:

```text
Transition
```

La ausencia de una transición no requiere una entidad `Draft`.

Una proposición que aún no ha sido constituida no se convierte automáticamente en una nueva especie ontológica.

---

# 8. ERROR DE CONSTITUCIÓN

El fracaso de `try_constitute` no crea una `Transition` inválida.

El resultado conceptual es:

```text
Result<Transition, InadmissibleTransition>
```

El error representa el **rechazo de constitución**, no una transición defectuosa.

Por tanto:

[
\boxed{
InvalidTransition
\notin
Transitions
}
]

Existe un rechazo.

No existe una transición inválida.

---

# 9. INMUTABILIDAD DESPUÉS DE LA CONSTITUCIÓN

Una vez constituida, la `Transition` deberá comportarse como un testimonio inmutable del hecho relacional.

Conceptualmente:

```text
Transition
    │
    ├── pre
    ├── law
    ├── authority
    ├── evidence
    └── post
```

Estos componentes forman parte del hecho constituido.

Modificar cualquiera de ellos después de la constitución produciría una proposición distinta.

Por ello:

[
T_1 =
(S_{pre},L,A,E,S_{post})
]

no puede transformarse silenciosamente en:

[
T_2 =
(S'*{pre},L',A',E',S'*{post})
]

mediante mutación interna.

Si el dominio necesita otro hecho, debe existir otro hecho.

---

# 10. `mutability` NO ES UN MECANISMO DE NEGOCIO

Rust permite representar valores mutables técnicamente.

Eso no significa que la ontología de FlowCore deba admitir mutabilidad conceptual.

La distinción es:

```text
Rust puede permitir mutación.
        ≠
El dominio permite mutar un hecho constituido.
```

La decisión del dominio prevalece.

Por ello, la representación de `Transition` deberá proteger sus invariantes mediante encapsulamiento y exposición controlada.

---

# 11. IDENTIDAD DE LA TRANSITION

La identidad de una `Transition` tampoco debe confundirse con:

* dirección de memoria;
* `Uuid`;
* clave primaria;
* identificador generado;
* posición en una colección;
* hash técnico.

La identidad ontológica de la transición deriva de la proposición constituida que representa.

Conceptualmente:

[
T \equiv
(S_{pre},L,A,E,S_{post})
]

La representación concreta de identidad técnica será objeto de análisis posterior y no deberá introducirse prematuramente en este commit.

---

# 12. DOMAINLAW NO ES UN RUST TYPE

El Commit 20 estableció:

[
DomainLaw \neq RustType
]

Por tanto, el contrato técnico no debe asumir que:

```rust
struct CancellationLaw;
```

sea ontológicamente idéntico a una `DomainLaw`.

Ese `struct` es una representación.

La ley es el contenido normativo:

[
N_L
]

El mismo `N_L` podría ser representado posteriormente mediante:

* un tipo estático;
* una estructura declarativa;
* una representación persistida;
* una representación deserializada;
* otra forma técnicamente válida.

Ninguna de ellas constituye por sí misma la identidad normativa.

---

# 13. EL TRAIT COMO FRONTERA TÉCNICA, NO COMO ONTOLOGÍA

La existencia de un `trait` en Rust no implica que el dominio posea una entidad ontológica llamada `Trait`.

El trait será únicamente una herramienta de abstracción técnica.

Su responsabilidad deberá limitarse a expresar aquello que el dominio necesita conocer de una representación de `DomainLaw`.

Debe evitarse que el trait se convierta en:

```text
LawEngine
```

o:

```text
RuleRunner
```

o:

```text
PolicyExecutor
```

---

# 14. PROHIBICIÓN DE `execute`

Queda expresamente prohibida la interpretación:

```rust
law.execute(pre, authority, evidence)
```

con resultado:

```text
post
```

Esto violaría:

[
L(C_{pre},A,E)
\rightarrow
C_{post}
]

La ley no genera el estado sucesor.

La proposición debe presentar ambos extremos:

[
C_{pre}
]

y:

[
C_{post}
]

La ley participa en el juicio que determina si la relación entre ellos es admisible.

---

# 15. ADMISSIBILITY COMO PREDICADO

La forma conceptual sigue siendo:

[
Admissible(
N_L,
C_{pre},
A,
E,
C_{post}
)
]

La implementación futura podrá utilizar una función pura, una operación asociada u otra frontera técnica apropiada.

Pero el contrato semántico permanece:

```text
entrada:
    N_L
    C_pre
    A
    E
    C_post

salida:
    admissible
    o
    inadmissible
```

No produce:

```text
C_post
```

No muta:

```text
C_pre
```

No crea automáticamente:

```text
Transition
```

La constitución ocurre únicamente cuando el resultado positivo permite materializar el witness.

---

# 16. RECOGNITION NO SE CONFUNDE CON CONSTITUTION

El sistema deberá mantener separadas las siguientes fronteras:

```text
External Specification
        │
        ▼
Recognition
        │
        ▼
Normative Content
        │
        ▼
Admissibility
        │
        ▼
Constitution
        │
        ▼
Transition
```

Estas etapas no deberán fusionarse en una única operación genérica.

Especialmente:

```text
parse()
```

no significa:

```text
constitute()
```

y:

```text
admissible()
```

no significa:

```text
execute()
```

---

# 17. EL PAPEL DE `Ground`

`Ground` permanece definido según el Commit 20 como:

[
Ground =
NormativeRationale
]

Es parte del contenido normativo.

No es:

```text
Evidence
```

No es:

```text
Provenance
```

No es:

```text
Hash
```

No es:

```text
LawId
```

No es:

```text
DatabaseReference
```

Su representación concreta en Rust permanece deliberadamente abierta.

El contrato de implementación no deberá convertir prematuramente `Ground` en una estructura técnica cuya semántica todavía no haya sido establecida.

---

# 18. IDENTIDAD NORMATIVA

La identidad normativa permanece definida como:

[
L_1=L_2
\iff
Can(N_1)=Can(N_2)
]

donde:

[
Can(N_L)
========

(
Can(Scope),
Can(Condition),
Can(Relation),
Can(Ground)
)
]

La implementación de `Can` no forma parte todavía del presente contrato.

Por tanto:

```text
Can(N_L)
```

es una abstracción semántica.

No se prescribe todavía:

```rust
fn canonicalize(...)
```

No se prescribe todavía:

```rust
Canonicalizer
```

No se prescribe todavía:

```text
SHA-256
```

ni ningún algoritmo equivalente.

---

# 19. PROHIBICIÓN DE IDENTIDAD SINTÉTICA DE LA LEY

Queda prohibido utilizar como identidad normativa:

```text
Uuid
TypeId
PrimaryKey
MemoryAddress
RegistryIndex
DatabaseId
```

Estos valores podrán existir eventualmente en capas técnicas posteriores si cumplen una función de infraestructura.

Pero ninguno podrá sustituir:

[
Can(N_L)
]

como concepto de identidad normativa.

---

# 20. CERO REGISTRY

No se introduce:

```text
LawRegistry
```

No se introduce:

```text
LawManager
```

No se introduce:

```text
ActiveLawStore
```

No se introduce:

```text
LawCatalog
```

La admisibilidad de una proposición depende de la ley presentada dentro de esa proposición.

No existe un inventario global necesario para que una ley sea ley.

---

# 21. CERO MOTOR DE REGLAS

No se introduce:

```text
RuleRunner
PolicyEngine
LawEngine
RuleEngine
PolicyExecutor
```

El dominio no necesita un agente encargado de "hacer cumplir" las leyes.

El contrato establece una frontera de reconocimiento y admisibilidad.

La ejecución de procesos operativos, cuando exista, pertenece a otra capa conceptual y deberá justificarse posteriormente.

---

# 22. CERO DSL EJECUTABLE

El contenido normativo no será representado mediante:

```text
Lua
Python
JavaScript
Rhai
closures
scripts
arbitrary expressions
```

Tampoco se introducirá accidentalmente un lenguaje Turing-completo disfrazado de:

```text
ExpressionEngine
RuleExpression
DynamicPredicate
ScriptNode
```

La expresividad normativa deberá permanecer restringida al universo semántico que el dominio justifique.

---

# 23. GRAMÁTICA ALGEBRAICA COMO PRINCIPIO

El Commit 20 estableció:

[
N_L \in FiniteAlgebraicGrammar
]

Esto no significa necesariamente:

```text
enum con tres variantes
```

Significa que la forma de expresión normativa pertenece a una estructura algebraica delimitada por el dominio.

La implementación concreta de esa gramática no se congela completamente en este punto.

Primero se debe determinar:

```text
qué relaciones existen;
qué combinadores existen;
qué valores son legítimos;
qué composiciones son significativas;
qué equivalencias son constitucionalmente válidas.
```

Después se decidirá cómo expresarlas en Rust.

---

# 24. SEPARACIÓN ENTRE DOMAIN DATA Y RUNTIME

La arquitectura deberá preservar:

[
DomainConcept
\neq
SemanticPredicate
\neq
RustRepresentation
]

Y también:

[
DomainData
\neq
RuntimeMechanism
]

Una representación técnica puede ser evaluada por código.

Pero eso no significa que el dato normativo sea código.

La diferencia deberá permanecer visible en el diseño.

---

# 25. PRIVACIDAD COMO BARRERA DE INVARIANTE

Rust permite que una estructura pública mantenga campos privados, evitando que consumidores externos puedan construir o modificar directamente su representación interna.

Esta propiedad del lenguaje resulta adecuada para representar la frontera técnica de una `Transition`.

La intención arquitectónica es:

```text
mundo externo
     │
     │ no puede fabricar arbitrariamente
     ▼
Transition
     │
     │ solo mediante constitución legítima
     ▼
hecho constituido
```

La privacidad de los campos será considerada una herramienta de encapsulamiento técnico, no una nueva regla ontológica.

---

# 26. API MÍNIMA CONCEPTUAL

El contrato buscado puede expresarse inicialmente de manera abstracta como:

```rust
pub struct Transition<C, L, A, E> {
    // representación encapsulada
}
```

y:

```rust
impl<C, L, A, E> Transition<C, L, A, E> {
    pub fn try_constitute(
        pre: State<C>,
        law: L,
        authority: A,
        evidence: E,
        post: State<C>,
    ) -> Result<Self, InadmissibleTransition>;
}
```

Este fragmento no constituye todavía una implementación definitiva.

Es una **frontera contractual provisional**.

El objetivo es preservar la semántica:

[
try_constitute(P)
\Rightarrow
Transition
]

solo cuando:

[
Admissible(P)=\top
]

---

# 27. EL ERROR NO ES PARTE DE LA TRANSITION

Un rechazo:

```text
InadmissibleTransition
```

no es una variante de:

```text
Transition
```

No debe modelarse conceptualmente como:

```text
Transition::Invalid
```

porque eso haría que la categoría `Transition` incluyera estados que contradicen su propia definición.

La separación buscada es:

```text
Result
├── Ok(Transition)
└── Err(InadmissibleTransition)
```

---

# 28. NO SE DEFINE TODAVÍA LA IMPLEMENTACIÓN COMPLETA

Este commit no decide todavía:

* todos los genéricos definitivos;
* todos los traits;
* todos los módulos;
* serialización;
* almacenamiento;
* hashing;
* índices;
* IDs técnicos;
* logging;
* observabilidad;
* concurrencia;
* persistencia;
* APIs;
* DTOs;
* adaptadores;
* infraestructura.

Estas decisiones serán posteriores.

El propósito actual es preservar el **contrato mínimo que ninguna implementación posterior puede violar**.

---

# 29. CRITERIO DE ÉXITO DEL COMMIT 21

El Commit 21 será considerado correcto cuando podamos demostrar que la representación técnica satisface:

[
\boxed{
\exists Transition
\Rightarrow
Constituted
}
]

y:

[
\boxed{
Constituted
\Rightarrow
Admissible
}
]

sin introducir:

[
Execution
]

como condición ontológica.

Además:

[
\boxed{
Transition
\neq
Candidate
\neq
Draft
\neq
Request
}
]

y:

[
\boxed{
DomainLaw
\neq
RustType
}
]

---

# 30. PRUEBA DE RESISTENCIA CONTRA LA HYDRA

Antes de considerar cerrado este contrato, cualquier diseño deberá sobrevivir estas preguntas:

### ¿Puede alguien crear una `Transition` inválida directamente?

Si sí:

[
\text{FALLA}
]

### ¿Puede alguien modificar una `Transition` después de constituirla?

Si sí:

[
\text{FALLA}
]

### ¿La ley produce `post`?

Si sí:

[
\text{FALLA}
]

### ¿Existe un `TransitionBuilder`?

Si su propósito es representar un estado intermedio inexistente en la ontología:

[
\text{FALLA}
]

### ¿Existe un `LawRegistry`?

Si es necesario para reconocer o utilizar una ley:

[
\text{FALLA}
]

### ¿Existe un `RuleRunner`?

Si convierte la ley en una máquina de ejecución:

[
\text{FALLA}
]

### ¿La identidad de la ley depende de un UUID?

Si sustituye la identidad normativa:

[
\text{FALLA}
]

### ¿La implementación obliga a cambiar la ontología?

Si sí:

[
\text{FALLA}
]

---

# 31. RELACIÓN CON EL COMMIT 20

El Commit 20 estableció:

```text
ONTOLOGÍA
```

El Commit 21 comienza a establecer:

```text
CONTRATO DE REPRESENTACIÓN
```

La frontera debe permanecer clara:

```text
Commit 20
    │
    │ qué significa
    ▼
ONTOLOGÍA
    │
    ▼
Commit 21
    │
    │ cómo puede preservarse técnicamente
    ▼
CONTRATO RUST
```

El código no debe convertirse en una nueva fuente de verdad ontológica.

Debe ser un mecanismo para preservar la verdad ya establecida.

---

# 32. PRINCIPIO DE NO INVERSIÓN

Queda establecido:

[
\boxed{
Ontology
\rightarrow
Semantic Contract
\rightarrow
Type Representation
}
]

Nunca:

[
\boxed{
Rust Type
\rightarrow
Ontology
}
]

No se aceptará una decisión únicamente porque:

> "Rust lo hace más fácil."

La pregunta correcta será:

> "¿Esta representación preserva exactamente la semántica que ya hemos establecido?"

---

# 33. ESTADO DEL COMMIT 21

El presente documento representa el inicio del contrato técnico.

No constituye todavía una implementación final.

No congela todavía todos los tipos concretos.

No autoriza todavía la construcción del motor completo.

El siguiente análisis deberá estudiar con mayor precisión:

```text
State
Configuration
DomainLaw
NormativeContent
Authority
Evidence
Transition
InadmissibleTransition
```

y determinar cuáles son verdaderos conceptos de dominio y cuáles son solamente parámetros técnicos necesarios para representar las relaciones ya definidas.

---

# 34. DECLARACIÓN FINAL

FlowCore no comenzará su implementación preguntando:

> "¿Qué structs necesitamos?"

Comenzará preguntando:

> "¿Qué invariantes deben ser imposibles de violar?"

Después:

> "¿Qué representación de Rust hace que esas invariantes sean difíciles o imposibles de romper?"

Y solamente después:

> "¿Qué código debemos escribir?"

Por tanto:

[
\boxed{
\text{Ontology}
\rightarrow
\text{Invariant}
\rightarrow
\text{Contract}
\rightarrow
\text{Type}
\rightarrow
\text{Implementation}
}
]

La implementación será subordinada al dominio.

Nunca al revés.

---

## 🧱 ESTADO CONSTITUCIONAL

**Commit 21 — Contrato Minimalista del Dominio en Rust**

**Estado:** 🟡 En diseño.

**No congelado todavía.**

La primera pieza técnica bajo análisis será:

[
\boxed{
Transition
\text{ como witness inmutable de una relación constituida}
}
]

El siguiente interrogatorio deberá determinar la frontera exacta de construcción, visibilidad, propiedad e invariantes de `Transition` antes de introducir cualquier implementación adicional.

> **"El tipo no debe decirnos qué es el dominio.
> El dominio debe decirnos qué debe impedir el tipo."**

**Gudo Labs — FlowCore**

*Primero descubrimos qué puede existir. Después congelamos por qué puede existir. Solo entonces permitimos que el código exista.*
