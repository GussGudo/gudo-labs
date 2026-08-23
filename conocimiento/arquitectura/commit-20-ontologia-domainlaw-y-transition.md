# Commit 20 — Ontología de DomainLaw y Transition

**Estado conceptual:** 🟢 Congelado / Auditado
**Área de Dominio:** Core Engine / Ontología Formal
**Precedente:** Commit 19 — Ontología de la Constitución Transicional

---

## 🏛️ DECLARACIÓN CONSTITUCIONAL

El presente Commit establece la ontología formal de `DomainLaw` y `Transition` dentro de FlowCore.

Su propósito es establecer una frontera estricta entre:

* especificación normativa exógena;
* reconocimiento de contenido normativo;
* admisibilidad de una proposición relacional;
* constitución de un hecho transicional;
* identidad normativa;
* representación técnica;
* y mecanismos de ejecución.

Este Commit no prescribe una implementación concreta.

La ontología definida aquí es independiente de Rust, de cualquier lenguaje de programación, de mecanismos de persistencia, de bases de datos y de cualquier representación técnica particular.

> **La ley no es un motor que ejecuta; es el término normativo de una proposición relacional.**

---

# 20.1 — Recognition ≠ Admissibility ≠ Constitution

Se establecen tres operaciones conceptualmente distintas:

### Recognition

Determina si una especificación exógena puede ser reconocida como contenido normativo legítimo dentro del dominio.

[
\operatorname{Recognition} :
\operatorname{NormativeSpecification}
\rightarrow
N_L
]

Recognition es un juicio de forma y suficiencia normativa.

No constituye todavía ninguna transición.

---

### Admissibility

Determina si una proposición relacional concreta satisface el contenido normativo de una ley:

[
\operatorname{Admissible}
(
N_L,
C_{\text{pre}},
A,
E,
C_{\text{post}}
)
\in
{\top,\bot}
]

Admissibility es un juicio semántico sobre una proposición concreta.

No constituye todavía el hecho transicional.

---

### Constitution

Si la proposición es admisible, puede constituirse el hecho relacional:

[
\operatorname{Admissible}
\Rightarrow
\operatorname{Constitute}
]

El resultado constituido es una `Transition`.

Por tanto:

[
\boxed{
Recognition
\neq
Admissibility
\neq
Constitution
}
]

Ninguno de estos tres conceptos requiere convertirse en una entidad, servicio o componente autónomo del dominio.

---

# 20.2 — DomainLaw ≠ Execution

Una `DomainLaw` no ejecuta operaciones ni produce estados sucesores.

Queda expresamente prohibida la interpretación:

[
L(C_{\text{pre}},A,E)
\rightarrow
C_{\text{post}}
]

La ley no es una máquina de transición.

La configuración sucesora debe formar parte de la proposición que se somete al juicio de admisibilidad.

La estructura conceptual de una transición es:

[
T
\equiv
(
S_{\text{pre}},
L,
A,
E,
S_{\text{post}}
)
]

donde:

* (S_{\text{pre}}) es el estado precedente;
* (L) es la ley invocada como término normativo;
* (A) es la autoridad concreta;
* (E) es la evidencia concreta;
* (S_{\text{post}}) es el estado sucesor propuesto.

La ley no calcula (S_{\text{post}}).

---

# 20.3 — Normative Content

El contenido normativo de una `DomainLaw` se define como:

[
\boxed{
N_L
\equiv
(
Scope,
Condition,
Relation,
Ground
)
}
]

Estos cuatro componentes constituyen el contenido normativo.

---

## Scope

Determina el universo o subespacio de configuraciones sobre el cual la norma es aplicable.

[
Scope(C)\rightarrow{\top,\bot}
]

No constituye una ejecución.

---

## Condition

Expresa las condiciones antecedentes relacionadas con:

* configuración precedente;
* autoridad;
* evidencia.

[
Condition(C_{\text{pre}},A,E)
\rightarrow
{\top,\bot}
]

Los términos `Authority` y `Evidence` contenidos en los requisitos normativos son criterios o tipos de exigencia.

No son las instancias concretas de autoridad o evidencia que posteriormente participarán en una transición.

---

## Relation

Expresa la relación normativa exigida entre configuración precedente y configuración sucesora:

[
Relation(C_{\text{pre}},C_{\text{post}})
\rightarrow
{\top,\bot}
]

La relación restringe la admisibilidad de la configuración sucesora.

No genera dicha configuración.

---

## Ground

`Ground` representa la razón normativa intrínseca de la ley:

[
\boxed{
Ground \equiv NormativeRationale
}
]

Es el fundamento justificativo o `ratio legis` que explica por qué la restricción normativa existe.

`Ground` es constituyente del contenido normativo.

No es:

* `Evidence`;
* `Provenance`;
* un identificador técnico;
* un hash;
* una referencia accidental a un archivo;
* una etiqueta de interfaz.

---

# 20.4 — DomainLaw ≠ Rust Type

La representación técnica de una ley no constituye su identidad ontológica.

Se distinguen explícitamente:

[
PersistenceIdentity
\neq
RuntimeIdentity
\neq
TypeIdentity
\neq
DomainIdentity
]

La identidad normativa pertenece al contenido (N_L), no al mecanismo utilizado para representarlo.

Por tanto:

* una `UUID` no constituye identidad normativa;
* un `TypeId` no constituye identidad normativa;
* una clave primaria de persistencia no constituye identidad normativa;
* una dirección de memoria no constituye identidad normativa;
* el nombre de una estructura Rust no constituye identidad normativa.

La representación es contingente.

El contenido normativo es constitutivo.

---

# 20.5 — External Normative Specification ≠ DomainLaw

Una especificación externa no reconocida no es todavía una `DomainLaw`.

Ejemplos:

* JSON;
* YAML;
* payload HTTP;
* archivo de configuración;
* documento externo;
* representación serializada.

Todos ellos pertenecen al plano exógeno.

La transformación conceptual es:

[
ExternalNormativeSpecification
\xrightarrow{Recognition}
N_L
]

El dominio reconoce el contenido normativo cuando satisface las condiciones formales necesarias.

No se introduce para ello ninguna entidad global de administración normativa.

Quedan excluidos del modelo:

* `LawRegistry`;
* `LawManager`;
* `PolicyCompiler`;
* `LawEngine`;
* `RuleRunner`.

Recognition no implica la existencia de un inventario centralizado de leyes.

---

# 20.6 — Admissibility ≠ Execution

La admisibilidad se define como un predicado relacional:

[
\boxed{
Admissible
(
N_L,
C_{\text{pre}},
A,
E,
C_{\text{post}}
)
}
]

tal que:

[
\boxed{
Admissible
\iff
Scope(C_{\text{pre}})
\land
Condition(C_{\text{pre}},A,E)
\land
Relation(C_{\text{pre}},C_{\text{post}})
}
]

La evaluación del predicado no constituye ejecución.

No existe:

[
L(C_{\text{pre}},A,E)
\rightarrow
C_{\text{post}}
]

La configuración sucesora es un término de la proposición, no un producto de la ley.

---

# 20.7 — Ground y Normative Rationale

`Ground` es intrínseco a (N_L):

[
\boxed{
Ground \equiv NormativeRationale
}
]

Sin embargo:

[
Ground
\neq
Provenance
]

y:

[
Ground
\neq
Evidence
]

y:

[
Ground
\neq
Hash(N_L)
]

La procedencia externa de una norma no constituye necesariamente su identidad normativa.

Por tanto:

[
Provenance_1\neq Provenance_2
\centernot\implies
N_1\neq N_2
]

Dos normas pueden compartir exactamente el mismo fundamento normativo aunque hayan sido promulgadas, transmitidas o representadas mediante fuentes externas diferentes.

Del mismo modo, `Ground` no se reduce prematuramente a un `String`, `enum`, hash o identificador técnico.

Su semántica queda establecida sin congelar una representación algorítmica concreta.

---

# 20.8 — Identidad Intensional Canónica

La identidad de una `DomainLaw` depende de su contenido normativo:

[
\boxed{
L_1=L_2
\iff
Can(N_1)=Can(N_2)
}
]

La forma canónica es conceptual:

[
\boxed{
Can(N_L)
========

(
Can(Scope),
Can(Condition),
Can(Relation),
Can(Ground)
)
}
]

La canonicalización es una abstracción formal, no un algoritmo prescrito por este Commit.

---

## No identidad sintáctica

La igualdad de representaciones sintácticas no determina necesariamente identidad normativa:

[
AST_1=AST_2
\not\implies
N_1=N_2
]

La representación sintáctica es accidental respecto de la ontología.

---

## No identidad extensional

Tampoco se define identidad normativa mediante equivalencia operacional universal:

[
(\forall x,\ P_1(x)=P_2(x))
\not\implies
N_1=N_2
]

Dos normas pueden producir resultados equivalentes sobre determinadas configuraciones y seguir siendo normativamente distintas debido a su contenido intencional.

FlowCore no se convierte en un sistema de demostración de teoremas.

Queda excluida la exigencia de:

* SAT solving;
* theorem proving;
* equivalencia lógica universal;
* análisis exhaustivo de todos los posibles estados.

---

## Ground como constituyente

`Ground` participa en la identidad normativa:

[
Ground_1\not\equiv Ground_2
\implies
N_1\neq N_2
]

Sin embargo, `Ground` no funciona como una clave técnica única independiente del resto de (N_L).

La identidad es compuesta.

---

# 20.9 — Finite Algebraic Grammar

`Scope`, `Condition` y `Relation` pertenecen al plano de datos declarativos del dominio.

No son programas.

[
Scope,Condition,Relation
\in
DomainData
]

Por tanto:

[
\boxed{
N_L\not\equiv Program
}
]

No se permite que el contenido normativo incorpore:

* closures;
* scripts;
* código arbitrario;
* control de flujo general;
* bucles;
* evaluación dinámica de código;
* lenguajes Turing-completos.

---

## Gramática algebraica finita

El contenido normativo debe poder expresarse mediante una estructura algebraica finita de restricciones propias del dominio:

[
\boxed{
N_L
\in
FiniteAlgebraicGrammar
}
]

Esto no implica que el dominio deba reducirse a un conjunto rígido y diminuto de valores.

La restricción es sobre la **forma expresiva**, no sobre la cantidad accidental de instancias.

El dominio puede definir conceptos compuestos y combinatorios sin convertirse en un lenguaje de programación general.

---

## Separación trinitaria

Se mantiene la separación:

[
\boxed{
Ontology
\rightarrow
Semantics
\rightarrow
Implementation
}
]

La ontología determina qué conceptos existen.

La semántica determina qué significan y bajo qué condiciones se relacionan.

La implementación decide posteriormente cómo representarlos.

Este Commit no congela:

* `enum`;
* `struct`;
* `trait`;
* AST;
* parser;
* serializador;
* canonicalizer;
* evaluator.

Todos esos elementos pertenecen a una fase posterior.

---

# 🧱 Axioma Constitutivo de Transition

La `Transition` representa el hecho relacional constituido:

[
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
]

La transición no representa:

* una intención;
* una solicitud;
* un candidato;
* un borrador;
* una instrucción de ejecución.

Es el testimonio de una relación ya constituida.

Por tanto:

[
\boxed{
\exists T
\Rightarrow
Valid(T)
}
]

No existe dentro de la ontología una categoría de transición inválida ya constituida.

---

# 🚫 Entidades y mecanismos excluidos

El siguiente conjunto queda expresamente fuera del Kernel ontológico:

* `LawRegistry`;
* `LawManager`;
* `PolicyCompiler`;
* `LawEngine`;
* `RuleRunner`;
* `TransitionBuilder`;
* `CandidateState`;
* `DraftTransition`;
* `ValidityManager`;
* `EffectiveWindow`;
* `UUID` como identidad normativa;
* `TypeId` como identidad normativa;
* `Provenance` como constituyente de (N_L);
* `Evidence` como constituyente de (N_L);
* DSL generalista;
* scripting embebido;
* ejecución de código normativo.

Su exclusión no impide que una futura infraestructura externa utilice mecanismos técnicos equivalentes para sus propias necesidades.

Lo que queda prohibido es confundir esos mecanismos con conceptos constitutivos del dominio.

---

# 🏛️ Síntesis Constitucional

La arquitectura conceptual de FlowCore queda expresada así:

```text
EXTERNAL NORMATIVE SPECIFICATION
             │
             │ Recognition
             ▼
        DOMAIN LAW
             │
             ▼
      NORMATIVE CONTENT
             │
             ├── Scope
             ├── Condition
             ├── Relation
             └── Ground
             │
             │ participates in
             ▼
       ADMISSIBILITY
             │
             │
             │
C_pre ───────┼────── Authority
             │
             ├────── Evidence
             │
C_post ──────┘
             │
             │ if admissible
             ▼
        CONSTITUTION
             │
             ▼
        TRANSITION
             │
             ▼
      CONSTITUTED FACT
```

La fórmula fundamental es:

[
\boxed{
Admissible
(
N_L,
C_{\text{pre}},
A,
E,
C_{\text{post}}
)
\Rightarrow
\exists T
}
]

Y la frontera fundamental permanece:

[
\boxed{
L(C_{\text{pre}},A,E)
\rightarrow
C_{\text{post}}
\quad\text{NO ES FLOWCORE}
}
]

mientras que:

[
\boxed{
Admissible
(
N_L,
C_{\text{pre}},
A,
E,
C_{\text{post}}
)
\Rightarrow
\exists T
\quad\text{ES FLOWCORE}
}
]

---

# 🔥 Declaración de Cierre

El Commit 20 congela la ontología de `DomainLaw` y `Transition` sin comprometerla con una implementación concreta.

La ley es contenido normativo.

La admisibilidad es un juicio relacional.

La constitución es el paso mediante el cual una relación admisible adquiere existencia como hecho transicional.

La transición es el testimonio del hecho constituido.

Ninguno de estos conceptos requiere un motor de ejecución, un registro global, una identidad sintética, un lenguaje de scripting ni una implementación particular.

> **Primero la Ontología.
> Después la Semántica.
> Al final la Implementación.**

**Commit 20 — CONGELADO.**
