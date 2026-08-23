# Commit 19 — Ontología de la Constitución Transicional

**Estado conceptual:** 🟢 Cerrado
**Área de Dominio:** Core Engine / Ontología Formal
**Primitivas Fundamentales:** `Configuration`, `State`, `DomainLaw`, `Transition`, `Authority`, `Evidence`

---

## 🏛️ DECLARACIÓN CONSTITUCIONAL

El presente Commit establece los principios ontológicos que rigen la constitución de hechos transicionales dentro de FlowCore.

Su objetivo es distinguir rigurosamente:

* posibilidad normativa;
* configuración admisible;
* hecho causal constituido;
* fundamento de legitimación;
* fundamento epistémico;
* y mecanismo externo mediante el cual una representación llega al núcleo.

Esta distinción impide introducir en la ontología central abstracciones procedimentales que pertenecen al mecanismo de ejecución, transporte, persistencia u orquestación.

Quedan, por tanto, fuera del núcleo ontológico conceptos tales como:

`ExecutionEngine`, `RuleEngine`, `TransitionBuilder`, `StateFactory`, `WorkflowRunner`, `CandidateState`, `TransitionDraft`, `LawRegistry`, `LawVersionManager`, `ConflictResolver`, `PriorityMatrix` y `RealitySynchronizer`.

Su eventual existencia como mecanismos técnicos externos no constituye una extensión de la ontología de FlowCore.

---

# 📜 ARTICULADO CONSTITUCIONAL

## Art. 19.1 — Distinción entre Posibilidad Normativa y Hecho Constituido

La aplicabilidad de una `DomainLaw` sobre un `State` no constituye por sí misma una `Transition`.

Formalmente:

$$
\operatorname{Applicable}(L,S_0) \neq \operatorname{Transition}(S_0,L,A,E,S_1)
$$

`Applicable(L, S₀)` expresa únicamente que las condiciones normativas conocidas permiten considerar admisible determinada relación.

No constituye:

* un evento;
* una transición;
* un estado sucesor;
* ni una orden de ejecución.

### 19.1.1 — Pluralidad de Aplicabilidad

La existencia simultánea de múltiples leyes aplicables sobre un mismo `State` no constituye necesariamente un conflicto.

Puede existir:

$$
\operatorname{Applicable}(L_1,S_0)
\land
\operatorname{Applicable}(L_2,S_0)
$$

sin que exista contradicción ontológica.

La coexistencia de posibilidades normativas no obliga al dominio a introducir:

* `ConflictResolver`;
* `PriorityMatrix`;
* `RuleEngine`;
* `SelectionManager`;
* ni ningún mecanismo equivalente.

### 19.1.2 — Incompatibilidad

Cuando dos normas resultan incompatibles respecto de una misma relación, la incompatibilidad debe derivarse de las propias condiciones normativas o de relaciones constitutivas del dominio.

La incompatibilidad no justifica por sí misma una entidad de prioridad externa.

$$
\text{Incompatibility} \neq \text{Priority Mechanism}
$$

---

# Art. 19.2 — Rechazo de Formas Ontológicas Transitorias

FlowCore no reconoce entidades ontológicas intermedias entre posibilidad y hecho constituido.

Por tanto, no existen:

* `CandidateState`;
* `TransitionDraft`;
* `PendingTransition`;
* `ProposedState`;
* `FutureState`.

Una `Configuration` puede ser proyectada como una configuración sucesora admisible sin convertirse por ello en un `State`.

$$
\boxed{
\text{Admissible Configuration}
\neq
\text{State}
}
$$

### 19.2.1 — Configuración Admisible

Una configuración sucesora proyectada representa únicamente una forma extensional que satisface las condiciones normativas consideradas.

Puede expresarse conceptualmente como:

$$
C_0 \xrightarrow{L} C_1
$$

pero esta relación no implica todavía:

$$
S_0 \xrightarrow{T} S_1
$$

La segunda expresión requiere la constitución efectiva de una `Transition`.

### 19.2.2 — Co-constitutividad

Una `Transition` y su `State_post` no representan dos acontecimientos ontológicos independientes.

La relación constitutiva es:

$$
\boxed{
T \equiv
(S_{\text{pre}},L,A,E,S_{\text{post}})
}
$$

El `State_post` es el término sucesor de la `Transition` que lo relaciona con `State_pre`.

No existe un intervalo ontológico en el que:

1. exista primero el `Transition`;
2. posteriormente nazca el `State`;
3. y finalmente una fábrica los conecte.

---

# Art. 19.3 — La Constitución como Criterio y no como Proceso

La constitución de un hecho no debe modelarse como un proceso interno de "nacimiento", "colapso", "materialización" o "ejecución".

La constitución es un **criterio ontológico de pertenencia**.

Una tupla pertenece al espacio de hechos transicionales del dominio cuando satisface las condiciones constitutivas correspondientes.

$$
\boxed{
T \equiv
(S_{\text{pre}},L,A,E,S_{\text{post}})
}
$$

Por tanto:

$$
\operatorname{Constituted}(T)
\iff
\operatorname{Valid}(S_{\text{pre}},L,A,E,S_{\text{post}})
$$

La palabra "constituir" describe una condición de pertenencia ontológica, no una operación temporal ejecutada por una entidad.

### 19.3.1 — Ausencia de Lifecycle Ontológico

No existen dentro de FlowCore:

* `StateFactory`;
* `TransitionBuilder`;
* `LifecycleManager`;
* `EntityCreator`;
* `EventPublisher`.

Si una implementación necesita construir representaciones técnicas, dicha construcción pertenece al mecanismo externo y no altera la ontología.

---

# Art. 19.4 — Frontera entre FlowCore y la Realidad Externa

FlowCore no produce acontecimientos físicos ni ejecuta efectos externos.

Un sistema externo puede producir:

* un webhook;
* un mensaje;
* un registro;
* un payload;
* una observación;
* un evento;
* una declaración de que algo ocurrió.

Ninguno de ellos constituye automáticamente una `Transition`.

$$
\boxed{
ExternalClaim \neq Transition
}
$$

### 19.4.1 — External Claim

Un `ExternalClaim` representa una proposición exterior:

> "El sistema externo afirma que ocurrió X."

No constituye una entidad ontológica adicional de FlowCore.

Es un artefacto de transporte o representación perteneciente a capas externas.

### 19.4.2 — Evidence

`Evidence` representa el fundamento epistémico que FlowCore reconoce dentro de su marco de validez.

Por tanto:

$$
ExternalClaim
\rightarrow
\text{evaluación epistémica}
\rightarrow
Evidence
$$

La existencia de un `Claim` no garantiza la existencia de `Evidence`.

La infraestructura puede transportar información; FlowCore determina si esa información satisface los criterios epistémicos necesarios.

### 19.4.3 — Frontera Arquitectónica

La arquitectura queda conceptualmente separada:

```text
MUNDO EXTERNO
     │
     │ observación / claim / payload
     ▼
INFRAESTRUCTURA / APPLICATION
     │
     │ representación
     ▼
FLOWCORE
     │
     │ evaluación normativa + epistémica
     ▼
HECHO VÁLIDO / NO VÁLIDO
```

FlowCore no necesita conocer el mecanismo físico que produjo la representación.

---

# Art. 19.5 — Semántica Normativa de `DomainLaw`

Una `DomainLaw` no es un procedimiento de ejecución.

No debe interpretarse como:

$$
L(S_{\text{pre}},A,E)
\rightarrow
C_{\text{post}}
$$

Esta formulación introduce indebidamente una semántica generativa.

La semántica constitucional de `DomainLaw` es normativa y relacional.

$$
\boxed{
R_L
\subseteq
C \times A \times E \times C
}
$$

Una ley especifica qué relaciones son admisibles bajo determinado contenido normativo.

### 19.5.1 — DomainLaw como Frontera de Admisibilidad

La ley determina una frontera:

```text
RELACIONES DEL DOMINIO
        │
        ├── admisibles bajo L
        │
        └── no admisibles bajo L
```

No necesita:

* ejecutar;
* producir;
* seleccionar;
* persistir;
* publicar;
* ni coordinar.

### 19.5.2 — Mecanismo de Obtención del Sucesor

La forma en que se obtiene `C_post` puede provenir de:

* cálculo externo;
* interacción humana;
* otro sistema;
* observación;
* algoritmo;
* mecanismo operativo.

Ese mecanismo no forma parte de la identidad ontológica de `DomainLaw`.

La ley únicamente determina si la relación presentada satisface su contenido normativo.

---

# Art. 19.6 — Individuación e Identidad Normativa

La extensión de una ley no agota necesariamente su identidad.

Puede ocurrir:

$$
R_{L_1}=R_{L_2}
$$

sin que:

$$
L_1=L_2
$$

Dos leyes pueden admitir exactamente las mismas relaciones extensionales y, sin embargo, diferir en su contenido normativo.

Por tanto:

$$
\boxed{
R_{L_1}=R_{L_2}
\not\implies
L_1=L_2
}
$$

La identidad normativa se determina intensionalmente.

$$
\boxed{
L_1=L_2
\iff
N_1=N_2
}
$$

donde `N` representa el contenido normativo constitutivo de la ley.

### 19.6.1 — Prohibición de Identidad Sintética

No forman parte de la identidad ontológica de `DomainLaw`:

* `LawID`;
* UUID;
* autoincrement;
* slug técnico;
* índice de base de datos;
* hash utilizado exclusivamente como identificador técnico.

Estos mecanismos pueden existir en infraestructura para indexar o almacenar leyes, pero no constituyen qué ley es una ley.

### 19.6.2 — Inmutabilidad Normativa

Una ley no muta mediante la edición de su contenido.

Si el contenido normativo cambia:

$$
N_1 \neq N_2
$$

entonces:

$$
L_1 \neq L_2
$$

La modificación normativa representa una especificación distinta.

No existe ontológicamente:

```text
Law
   └── mutable version
```

sino:

```text
Law₁
Law₂
...
```

cuando sus contenidos normativos son distintos.

---

# Art. 19.6-A — Contenido Normativo de `DomainLaw`

El contenido normativo `N_L` debe distinguir explícitamente entre **criterios de exigencia** y **instancias concretas**.

Por tanto:

$$
\boxed{
N_L
\equiv
(
Scope,
Reqs(A_{type},E_{type}),
Condition,
Relation,
Ground
)
}
$$

### 19.6-A.1 — Scope

`Scope` determina el ámbito extensional en el que la norma puede ser evaluada.

No constituye una entidad `Jurisdiction` independiente.

### 19.6-A.2 — Requirements

Los requerimientos sobre `Authority` y `Evidence` son criterios de tipo o clase.

Ejemplos conceptuales:

* requiere autoridad de nivel supervisión;
* requiere evidencia documental;
* requiere evidencia fechada;
* requiere una autoridad con determinada competencia.

Estos requerimientos no contienen las instancias concretas `A` o `E`.

Por tanto:

$$
A_{required}
\neq
A_{actual}
$$

$$
E_{required}
\neq
E_{actual}
$$

### 19.6-A.3 — Condition

La condición antecedente determina cuándo la norma puede considerarse aplicable.

Conceptualmente:

$$
Condition(C_{\text{pre}},A,E)
\rightarrow
{\top,\bot}
$$

### 19.6-A.4 — Relation

La relación normativa determina qué relación entre configuración antecedente y sucesora es admisible.

$$
Relation(C_{\text{pre}},C_{\text{post}})
\rightarrow
{\top,\bot}
$$

### 19.6-A.5 — Ground

`Ground` expresa la razón normativa que distingue la ley de otras normas extensionalmente equivalentes.

Ejemplos:

* fraude;
* solicitud legítima;
* caducidad;
* incumplimiento;
* expiración de condición.

El `Ground` no constituye una entidad adicional.

Es parte del contenido normativo.

---

# Art. 19.6-B — Taxonomía Categorial de las Primitivas

FlowCore no debe tratar todos sus conceptos como structs homogéneos.

Las primitivas pertenecen a categorías ontológicas diferentes:

| Plano                | Primitiva       | Naturaleza                         |
| -------------------- | --------------- | ---------------------------------- |
| **CONTENIDO**        | `Configuration` | Forma extensional de un sistema    |
| **SITUACIÓN**        | `State`         | Configuración situada causalmente  |
| **NORMA**            | `DomainLaw`     | Especificación de admisibilidad    |
| **RELACIÓN FÁCTICA** | `Transition`    | Hecho constituido entre estados    |
| **LEGITIMACIÓN**     | `Authority`     | Fundamento de potestad             |
| **EPISTEMOLOGÍA**    | `Evidence`      | Fundamento de conocimiento factual |

Estas categorías no deben confundirse con:

* propiedades;
* relaciones;
* predicados;
* funciones;
* mecanismos de infraestructura.

### 19.6-B.1 — Regla de No Elevación Ontológica

Un concepto no se convierte en entidad simplemente porque:

* tenga nombre;
* aparezca frecuentemente;
* tenga lógica asociada;
* requiera una función;
* tenga persistencia;
* necesite ser indexado;
* o aparezca como sustantivo en lenguaje natural.

Debe existir un hecho de dominio irreducible que justifique su individuación.

---

# Art. 19.7 — Competencia y Legitimación Transicional

`Authority` no forma parte de la identidad intrínseca de `DomainLaw`.

Una ley puede especificar qué clase de autoridad requiere sin incorporar dentro de sí una instancia concreta de autoridad.

Por tanto:

$$
DomainLaw \neq (N_L,A)
$$

La compatibilidad entre una autoridad concreta y una ley se expresa mediante una relación de competencia:

$$
\boxed{
Competent(A,L)
\rightarrow
{\top,\bot}
}
$$

### 19.7.1 — Authority como Constituyente Relacional

La autoridad concreta participa en la constitución de la `Transition`:

$$
T=
(S_{\text{pre}},L,A,E,S_{\text{post}})
$$

Por tanto, la validez de la transición requiere que:

$$
Competent(A,L)=\top
$$

cuando la ley exige dicha competencia.

### 19.7.2 — Separación de Identidad

La misma `DomainLaw` puede relacionarse con diferentes autoridades competentes sin que por ello se transforme en una ley distinta.

La diferencia reside en la relación concreta de legitimación de cada transición.

---

# Art. 19.8 — Temporalidad y Aplicabilidad de `DomainLaw`

La temporalidad normativa no constituye una entidad mutable ni exige un administrador de vigencia.

Una `DomainLaw` no necesita portar un ciclo de vida técnico del tipo:

```text
EffectiveFrom
EffectiveUntil
CurrentVersion
IsActive
IsDeprecated
```

como fundamento de su identidad ontológica.

La aplicabilidad temporal se expresa mediante un predicado relacional sobre el contexto normativo y la evidencia disponible.

$$
\boxed{
Applicable(L,S_{\text{pre}},E)
\rightarrow
{\top,\bot}
}
$$

### 19.8.1 — La Vigencia no Muta la Ley

Si una ley deja de ser aplicable a un contexto posterior, eso no implica que la ley haya mutado.

La identidad de `L` permanece determinada por `N_L`.

Lo que cambia es el resultado del predicado de aplicabilidad:

$$
Applicable(L,S_0,E_0)=\top
$$

mientras que:

$$
Applicable(L,S_1,E_1)=\bot
$$

Esto no significa:

$$
L \rightarrow L'
$$

ni:

$$
L \text{ mutó}
$$

Significa únicamente que el contexto epistémico y normativo evaluado ya no satisface las condiciones de aplicación.

### 19.8.2 — Evidencia Temporal

La temporalidad puede formar parte de la información epistémica necesaria para determinar aplicabilidad.

Ejemplos conceptuales:

* fecha de promulgación;
* fecha de derogación;
* fecha de ocurrencia de un hecho;
* fecha de expiración de una condición;
* evidencia de sustitución normativa.

Estas fechas no convierten el tiempo en una nueva entidad ontológica.

Son propiedades o contenidos de `Evidence` evaluados por las condiciones de la norma.

### 19.8.3 — Aplicabilidad como Relación

La vigencia no debe modelarse como:

```text
DomainLaw
    └── active = true
```

sino como una relación:

$$
Applicable(L,S,E)
$$

La misma ley puede ser:

* aplicable en un contexto;
* no aplicable en otro;
* aplicable bajo determinada evidencia;
* no aplicable bajo otra.

La ley no necesita cambiar para producir estas diferencias.

### 19.8.4 — Ausencia de `ValidityManager`

La temporalidad no justifica:

* `ValidityManager`;
* `LawRegistry`;
* `LawVersionManager`;
* `EffectiveWindow`;
* `ActiveLawSelector`;
* `CurrentLawResolver`.

Si la infraestructura necesita consultar qué leyes conoce o almacenar sus metadatos temporales, esa necesidad pertenece a la infraestructura.

No constituye una nueva entidad del núcleo.

---

# 🛡️ PRINCIPIO DE AUSTERIDAD EPISTEMOLÓGICA

El Commit 19 establece la siguiente regla:

$$
\boxed{
\text{No Additional Entity Is Justified}
\iff
\text{No Irreducible Domain Fact Requires It}
}
$$

La regla no afirma dogmáticamente que FlowCore poseerá seis entidades para siempre.

Afirma algo más fuerte y metodológicamente más sano:

> **Ninguna entidad adicional debe introducirse mientras el hecho que pretende representar pueda explicarse exhaustivamente mediante las primitivas existentes, sus propiedades, relaciones, predicados o estructuras emergentes.**

La ausencia de una entidad adicional no se justifica por preferencia estética.

Se justifica por ausencia de un hecho irreducible.

---

# 🧱 MODELO CONSTITUCIONAL CONSOLIDADO

El modelo resultante puede expresarse de la siguiente manera:

```text
                         NORMATIVE PLANE
                              │
                              │
                    DomainLaw / N_L
                              │
                              ▼
                    Applicable(L, S, E)
                              │
                    ┌─────────┴─────────┐
                    │                   │
                   FALSE               TRUE
                    │                   │
                    ▼                   ▼
                 no fact        admissible relation
                                        │
                                        │
                         External / operational world
                                        │
                           Authority + Evidence
                                        │
                                        ▼
                             proposed configuration
                                        │
                                        ▼
                              constitutive criterion
                                        │
                         ┌──────────────┴──────────────┐
                         │                             │
                       FALSE                         TRUE
                         │                             │
                         ▼                             ▼
                   invalid relation             Transition
                                                       │
                                                       │
                                      ┌────────────────┴──────────────┐
                                      │                               │
                                State_pre                       State_post
```

La secuencia anterior **no representa un proceso temporal interno de FlowCore**.

Representa las relaciones lógicas mediante las cuales puede determinarse la pertenencia de una configuración y una relación al espacio de hechos válidos.

---

# 🔗 FORMULACIÓN FINAL DE `Transition`

Una `Transition` queda definida constitucionalmente como:

$$
\boxed{
T
\equiv
(
S_{\text{pre}},
L,
A,
E,
S_{\text{post}}
)
}
$$

donde:

* `S_pre` es el estado antecedente;
* `L` es la norma bajo la cual se evalúa la admisibilidad;
* `A` es la autoridad concreta que proporciona legitimación;
* `E` es la evidencia concreta que proporciona fundamento epistémico;
* `S_post` es el estado sucesor.

La constitución exige, como mínimo conceptual:

$$
Valid(S_{\text{pre}},L,A,E,S_{\text{post}})
$$

incluyendo las relaciones normativas, de competencia y de suficiencia epistémica que correspondan.

---

# ☠️ ENTIDADES Y ABSTRACCIONES EXPULSADAS DEL NÚCLEO

Quedan explícitamente rechazadas como primitivas ontológicas:

```text
ExecutionEngine
RuleEngine
TransitionBuilder
StateFactory
WorkflowRunner

CandidateState
TransitionDraft
PendingTransition
ProposedState
FutureState

ConflictResolver
PriorityMatrix
SelectionManager

LawRegistry
LawVersionManager
ValidityManager
EffectiveWindow
ActiveLawSelector
CurrentLawResolver

RealitySynchronizer
EventPublisher
LifecycleManager

LawID
Synthetic UUID
Database Identity
Technical Slug

ExternalClaim
```

### Nota sobre `ExternalClaim`

`ExternalClaim` no es una entidad adicional de FlowCore.

Es una representación externa que puede eventualmente proporcionar información susceptible de ser reconocida como `Evidence`.

---

# 🏛️ TABLA CONSTITUCIONAL FINAL

| Concepto                | Estatus                           |
| ----------------------- | --------------------------------- |
| `Configuration`         | ✅ Primitiva ontológica            |
| `State`                 | ✅ Primitiva ontológica            |
| `DomainLaw`             | ✅ Primitiva ontológica            |
| `Transition`            | ✅ Primitiva ontológica            |
| `Authority`             | ✅ Primitiva ontológica            |
| `Evidence`              | ✅ Primitiva ontológica            |
| `Applicability`         | ✅ Predicado relacional            |
| `Competent`             | ✅ Predicado relacional            |
| `Valid`                 | ✅ Criterio/predicado constitutivo |
| `Scope`                 | ✅ Propiedad/contenido normativo   |
| `Ground`                | ✅ Contenido normativo             |
| `Authority Requirement` | ✅ Criterio normativo              |
| `Evidence Requirement`  | ✅ Criterio normativo              |
| Temporalidad            | ✅ Condición relacional/epistémica |
| `ExternalClaim`         | ⚪ Representación externa          |
| `ExecutionEngine`       | ❌ Fuera de ontología              |
| `RuleEngine`            | ❌ Fuera de ontología              |
| `StateFactory`          | ❌ Fuera de ontología              |
| `TransitionBuilder`     | ❌ Fuera de ontología              |
| `ConflictResolver`      | ❌ Fuera de ontología              |
| `LawRegistry`           | ❌ Fuera de ontología              |
| `ValidityManager`       | ❌ Fuera de ontología              |
| `LawID / UUID`          | ❌ No identidad ontológica         |

---

# 🔥 VEREDICTOS FINALES DEL COMMIT 19

$$
\boxed{
Applicability \neq Transition
}
$$

$$
\boxed{
Possibility \neq State
}
$$

$$
\boxed{
Configuration \neq State
}
$$

$$
\boxed{
ExternalClaim \neq Evidence
}
$$

$$
\boxed{
Evidence \neq Transition
}
$$

$$
\boxed{
Authority \neq DomainLaw
}
$$

$$
\boxed{
R_{L_1}=R_{L_2}
\not\implies
L_1=L_2
}
$$

$$
\boxed{
L_1=L_2
\iff
N_1=N_2
}
$$

$$
\boxed{
Temporal\ Applicability
\neq
Mutation\ of\ DomainLaw
}
$$

$$
\boxed{
Constitution
============

Criterion\ of\ Ontological\ Membership
}
$$

$$
\boxed{
T
\equiv
(S_{\text{pre}},L,A,E,S_{\text{post}})
}
$$

Y finalmente:

$$
\boxed{
\text{No Additional Entity Is Justified}
\iff
\text{No Irreducible Domain Fact Requires It}
}
$$

---

# 🐉 CIERRE CONSTITUCIONAL

El Commit 19 no declara que FlowCore "deba tener exactamente seis structs".

Declara algo más fundamental:

> **Las entidades de FlowCore deben corresponder a hechos irreducibles del dominio y no a necesidades accidentales del mecanismo computacional.**

Una propiedad no debe convertirse en entidad.

Una relación no debe convertirse en entidad intermedia.

Un predicado no debe convertirse en servicio ontológico.

Un mecanismo de ejecución no debe convertirse en primitiva del dominio.

Un identificador técnico no debe convertirse en identidad.

Una posibilidad no debe convertirse en hecho.

Una representación externa no debe convertirse en realidad del modelo.

Y una modificación temporal de aplicabilidad no debe convertirse en mutación ontológica de la norma.

La ontología constitucional resultante queda reducida a las relaciones necesarias entre:

```text
Configuration
     │
     ▼
State
     │
     │
     ├────────────── DomainLaw
     │                     │
     │                     ▼
     │                Applicability
     │
     ├────────────── Authority
     │
     ├────────────── Evidence
     │
     ▼
Transition
     │
     ▼
State
```

No existe una Hydra adicional esperando detrás de cada flecha.

Si una futura trinchera exige una nueva entidad, deberá demostrar primero el hecho irreducible que la hace necesaria.

Hasta entonces:

**la entidad no existe.**