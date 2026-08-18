# Commit #11 — Authority, Policy, Stability & Autonomous Decision Governance v1.0

## Status: APPROVED & FROZEN

**Date:** August 2026
**Module:** FlowCore Kernel — Governance, Authority & Control Dynamics
**Preceded by:** #08 What Exists, #09 What Can Act, #10 What Happens

---

## 1. Axioma Fundamental de Gobernanza

> **Authorization is a controlled transition between decision space and physical action space.**

> **Decision ≠ Authorization ≠ Action ≠ Execution**

Una **Decisión** representa la intención de un agente, humano o sintético, de seleccionar un curso de acción.

Una **Autorización** es la convalidación normativa de esa decisión frente al cuerpo de Políticas, la Matriz de Autoridad y el Estado de Conocimiento vigente.

Una **Acción** es la instrucción explícita emitida hacia el espacio operacional.

Una **Ejecución** es la manifestación física de dicha acción en la realidad material.

> *El Kernel no juzga la validez del acto humano de decidir; gobierna la viabilidad de transformar una decisión en una transición operacional válida.*

La separación entre estas dimensiones evita que FlowCore confunda:

* la intención con el permiso,
* el permiso con la orden,
* la orden con la ejecución,
* y la ejecución con el resultado observado.

---

## 2. La Cadena Causal de Gobernanza

El ciclo operacional definido en el Commit #10 se integra con una puerta explícita de gobernanza:

```text
PROPOSAL
   │
   ▼
POLICY EVALUATION
   │
   ├──────────────► POLICY CLASH
   │
   ├──────────────► INVALID POLICY
   │
   ▼
AUTHORITY EVALUATION
   │
   ├──────────────► ESCALATION REQUIRED
   │
   ▼
DECISION
   │
   ▼
AUTHORIZATION
   │
   ├──────────────► DENIED
   │
   ├──────────────► REVOKED
   │
   ▼
ACTION
   │
   ▼
EXECUTION
   │
   ▼
OBSERVATION
   │
   ▼
KNOWLEDGE UPDATE
   │
   └──────────────────────► EVALUATION
```

Esta cadena establece que una propuesta no puede convertirse directamente en una acción.

Entre ambas existen mecanismos explícitos de:

* evaluación normativa,
* evaluación de autoridad,
* decisión,
* autorización,
* validación pre-ejecución,
* y observación posterior.

---

## 3. Clasificación Invariante de Políticas

Toda política en FlowCore debe pertenecer explícitamente a una categoría de severidad.

La severidad determina:

* su capacidad de bloquear una acción,
* su posibilidad de ser delegada,
* su relación con el costo de adaptación,
* y el nivel de autonomía permitido al Kernel.

| Clase de Política   | Descripción                                                  | Comportamiento del Kernel       | Capacidad de Anulación                                     | Inercia / Histeresis                                        |
| ------------------- | ------------------------------------------------------------ | ------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------- |
| `HARD_CONSTRAINT`   | Límites físicos, estructurales o legales no negociables.     | **Bloqueo absoluto (`DENIED`)** | Ninguna autoridad humana o sintética.                      | Evaluación inmediata.                                       |
| `SAFETY_CRITICAL`   | Salvaguarda de vida humana e integridad física.              | **Bloqueo absoluto (`DENIED`)** | Solo mediante protocolos de emergencia legalmente válidos. | Evaluación inmediata.                                       |
| `MANDATORY_CONTROL` | Reglas de negocio obligatorias para la operación regular.    | **Bloqueo por defecto.**        | Escalación a autoridad superior.                           | Ignora el costo de adaptación cuando la regla es aplicable. |
| `GOVERNANCE`        | Límites operacionales de costo, riesgo o jurisdicción.       | **Aprobación requerida.**       | Concedida si cumple la matriz de autoridad.                | Sujeta a `Stability Threshold`.                             |
| `OPTIMIZATION`      | Preferencias de eficiencia económica, logística o desempeño. | **Negociable / algorítmico.**   | El Kernel puede realizar trade-offs.                       | Sujeta a `Stability Threshold`.                             |
| `ADVISORY`          | Recomendaciones y buenas prácticas operacionales.            | **Informativo.**                | No bloquea la acción.                                      | Sin efecto de estabilidad.                                  |

La clasificación de una política no puede determinarse implícitamente durante la ejecución.

Debe formar parte de la definición gobernada de la propia política.

---

## 4. Gobernanza de Políticas

### 4.1 Policy Syntax

La primera capa valida la estructura formal de una política:

* formato,
* tipos de datos,
* operadores,
* predicados,
* referencias,
* parámetros,
* y condiciones evaluables.

Una política que no puede interpretarse correctamente no puede entrar en ejecución.

---

### 4.2 Policy Validity

Una política sintácticamente correcta no necesariamente es una política válida.

La segunda capa verifica la política contra los invariantes del dominio.

Ejemplos:

```text
MAX_SPEED > 0
WORKING_HOURS <= LEGAL_LIMIT
CAPACITY_LIMIT > 0
TEMPERATURE_MIN < TEMPERATURE_MAX
```

Una política que viola un invariante de dominio se clasifica como:

```text
INVALID_POLICY
```

y pasa a:

```text
SUSPENDED
```

Una política `SUSPENDED` **no participa en el enforcement operacional**.

Esta separación es fundamental:

```text
POLICY SYNTAX
      │
      ▼
POLICY VALIDITY
      │
      ├── INVALID ──► SUSPENDED
      │
      ▼
ACTIVE & VALIDATED
      │
      ▼
POLICY ENFORCEMENT
```

El Kernel no debe permitir que una política inválida bloquee la operación simplemente porque posee una sintaxis formalmente correcta.

---

### 4.3 Policy Enforcement

El enforcement operacional evalúa y aplica únicamente políticas que cumplen simultáneamente:

```text
ACTIVE
    +
VALIDATED
```

Las políticas suspendidas, inválidas, expiradas o fuera de su ventana temporal de efectividad no deben participar en la decisión operacional.

---

### 4.4 Conflicto Normativo Insoluble

Cuando dos políticas activas y válidas entran en contradicción directa, el Kernel no debe resolver el conflicto mediante una preferencia arbitraria.

Ejemplo:

```text
POLICY A
Safety:
"Detener inmediatamente ante temperatura crítica."

POLICY B
Security:
"No detener el vehículo dentro de una zona de alto riesgo."
```

Si ambas políticas pertenecen a niveles de severidad que no permiten una resolución automática, el sistema produce:

```text
UNRESOLVED_POLICY_CLASH
```

La autorización queda congelada mientras se determina el curso de acción seguro.

Cuando existe un riesgo inmediato para la vida humana, el sistema debe aplicar el protocolo de preservación de vida definido por la autoridad normativa correspondiente y generar simultáneamente una escalación de emergencia.

El Kernel no debe inventar una regla de precedencia que no haya sido definida por la gobernanza del dominio.

---

## 5. Matriz de Delegación de Autoridad

La transformación de una `Proposal` en una `Authorization` depende de una matriz explícita de jurisdicción.

### 5.1 Autonomous Kernel Scope

El Kernel puede actuar autónomamente cuando:

* las políticas involucradas pertenecen a `OPTIMIZATION` o `ADVISORY`,
* el impacto está dentro de los límites delegados,
* el riesgo permanece dentro de los umbrales permitidos,
* y no se viola ninguna política de mayor severidad.

El Kernel puede realizar trade-offs dentro de este espacio.

---

### 5.2 Delegated Human Scope

Las decisiones que involucren:

* `MANDATORY_CONTROL`,
* `GOVERNANCE`,
* impactos financieros superiores a los límites autónomos,
* cambios operacionales de alto impacto,
* o situaciones explícitamente reservadas a autoridad humana,

requieren escalación y autorización de un agente humano con jurisdicción suficiente.

La autoridad debe estar determinada por:

* rol,
* nivel,
* jurisdicción,
* impacto,
* riesgo,
* y política aplicable.

---

### 5.3 Non-Delegable Scope

Ningún agente, humano o sintético, puede emitir una autorización que viole una `HARD_CONSTRAINT`.

La autoridad humana puede registrar una decisión o intento de override.

Eso no implica que dicha decisión pueda convertirse en una transición operacional autorizada.

```text
HUMAN DECISION
      │
      ▼
POLICY EVALUATION
      │
      ▼
HARD CONSTRAINT
      │
      ▼
AUTHORIZATION = DENIED
```

FlowCore no bloquea al humano como persona.

Bloquea la transición operacional inválida.

---

## 6. Registro de Decisiones, Violaciones e Intención

Cuando una decisión no obtiene autorización operacional, el Kernel no destruye ni oculta la evidencia del intento.

El Event History debe conservar la cadena causal.

Entre los hechos relevantes pueden existir:

```text
DecisionRecorded
PolicyViolationAttempt
AuthorizationDenied
ActionDenied
AuthorityEscalationRequested
```

### `DecisionRecorded`

Registra:

* quién tomó la decisión,
* cuándo,
* sobre qué Intent,
* bajo qué contexto,
* y qué curso de acción fue seleccionado.

### `PolicyViolationAttempt`

Registra:

* la política involucrada,
* su versión,
* los predicados evaluados,
* el estado epistemológico utilizado,
* y la razón de la incompatibilidad.

### `AuthorizationDenied`

Registra que la decisión no obtuvo permiso para transformarse en una acción autorizada.

### `ActionDenied`

Registra que la orden operacional no fue emitida al espacio físico.

La negativa no elimina la intención histórica.

---

## 7. Control de Estabilidad e Inercia Operacional

El Kernel debe evitar la hiper-reactividad.

Una nueva observación no implica automáticamente que deba modificarse el plan.

La adaptación posee un costo real.

Ese costo puede incluir:

* comunicación con operadores,
* reprogramación,
* redistribución de paquetes,
* modificación de rutas,
* cambios de asignación,
* perturbación de otras ejecuciones,
* carga cognitiva del operador,
* y riesgo introducido por el propio cambio.

Para políticas de tipo `GOVERNANCE` y `OPTIMIZATION`, el Kernel puede evaluar:

$$
\text{Beneficio Neto}
=====================

## \text{Ganancia Teórica del Plan}_{new}

(\text{Costo de Adaptación} + \text{Riesgo de Perturbación})
$$

Un cambio de plan no debe considerarse automáticamente mejor solamente porque produce una solución matemática superior.

Debe superar el costo de transformar el presente operacional.

---

### 7.1 Adaptation Cost

Todo cambio operacional significativo posee un costo.

El Kernel debe poder representar dicho costo explícitamente.

```text
CURRENT PLAN
     │
     ├── continue
     │
     └── adapt
            │
            ├── communication cost
            ├── reassignment cost
            ├── execution disruption
            ├── cognitive cost
            └── operational risk
```

---

### 7.2 Stability Threshold

Para políticas adaptables, un nuevo plan solo debe superar el umbral de estabilidad cuando:

$$
\text{Beneficio Neto} > \text{Stability Threshold}
$$

El objetivo no es maximizar cambios.

El objetivo es maximizar el valor operacional después de considerar el costo de cambiar.

---

### 7.3 Hysteresis / Cooldown

Después de una adaptación operacional significativa puede establecerse una:

```text
COOLDOWN WINDOW
```

Durante dicha ventana, pequeñas variaciones no deben provocar automáticamente otra modificación del plan.

Las condiciones de emergencia y las políticas de mayor severidad quedan fuera de esta protección contra el churning.

---

### 7.4 Precedencia de Seguridad

El costo de adaptación nunca puede utilizarse como argumento para ignorar una:

```text
HARD_CONSTRAINT
```

o:

```text
SAFETY_CRITICAL
```

Cuando existe una restricción legal, física o de seguridad aplicable, la estabilidad del plan deja de ser el criterio dominante.

La adaptación se convierte en una obligación operacional.

```text
OPTIMIZATION
    │
    ▼
STABILITY THRESHOLD
    │
    ▼
ADAPT ONLY IF BENEFICIAL


SAFETY / HARD CONSTRAINT
    │
    ▼
IMMEDIATE RE-EVALUATION
    │
    ▼
ADAPTATION REQUIRED
```

---

## 8. Autorización y Puerta Pre-Ejecución

Una `Authorization` no es un permiso perpetuo.

Representa una autorización válida bajo determinadas condiciones causales y durante una ventana temporal determinada.

Por ello, toda autorización debe poseer un contexto suficiente para permitir su reevaluación.

Antes de transmitir una `Action` al espacio físico, el Kernel ejecuta un:

```text
PRE-EXECUTION GATE CHECK
```

El Gate Check verifica:

* vigencia temporal,
* políticas aplicables,
* autoridad utilizada,
* condiciones causales relevantes,
* y estado epistemológico de los predicados que justificaron la autorización.

---

### 8.1 Revocación por Relevancia Causal

Una autorización se revoca únicamente cuando cambian las condiciones causales y relevantes sobre las cuales fue concedida.

> **Una autorización se revoca únicamente cuando cambian las condiciones causales y relevantes sobre las cuales fue concedida.**

Por lo tanto, el simple hecho de que una observación no relacionada pase a:

```text
STALE
```

o:

```text
UNKNOWN
```

no revoca automáticamente la autorización.

La revocación requiere una relación causal explícita entre la información degradada y los predicados utilizados para conceder el permiso.

Ejemplo:

```text
AUTHORIZATION
    │
    ├── Predicate A: Vehicle Capacity = VALID
    ├── Predicate B: Driver Hours = VALID
    └── Predicate C: Destination Zone = AUTHORIZED
```

Si la telemetría de combustible se vuelve `UNKNOWN` pero no participa en la autorización:

```text
Fuel Telemetry = UNKNOWN
        │
        ▼
NO REVOCATION
```

Si la autorización dependía de una condición de seguridad cuyo estado pasa a `UNKNOWN`:

```text
Safety Predicate = UNKNOWN
        │
        ▼
AUTHORIZATION_REVOKED
```

Esta distinción evita tanto la permisividad peligrosa como la paranoia operacional.

---

## 9. Authorization ≠ Execution

Una autorización concedida no garantiza que la acción haya sido ejecutada.

La continuidad epistemológica con el Commit #10 exige mantener separadas estas dimensiones:

```text
AUTHORIZATION
     │
     ▼
GRANTED
     │
     ▼
ACTION
     │
     ▼
ISSUED
     │
     ▼
EXECUTION
     │
     ├── OBSERVED
     ├── UNKNOWN
     └── STALE
```

Un vehículo puede recibir una orden y perder conectividad inmediatamente después.

En ese caso:

```text
Authorization = GRANTED
Action = ISSUED
Execution = UNKNOWN
```

El Kernel no debe inferir:

```text
Execution = SUCCESS
```

simplemente porque la autorización fue concedida.

La ejecución pertenece al espacio físico.

La autorización pertenece al espacio de gobernanza.

---

## 10. Decision ≠ Authorization

La separación entre decisión y autorización preserva dos responsabilidades distintas.

Una decisión puede ser:

```text
VALID HUMAN INTENT
```

y aun así producir:

```text
AUTHORIZATION = DENIED
```

Esto no implica necesariamente que el acto humano de decidir sea inválido.

Significa que la transición operacional solicitada no está permitida bajo el estado actual del dominio.

Formalmente:

$$
\text{Decision Accepted as Intent}
\not\Rightarrow
\text{Authorization Granted}
$$

La decisión permanece registrada.

La autorización determina si dicha decisión puede cruzar la frontera hacia el espacio de acción.

---

## 11. Authorization como Frontera entre Dos Espacios

FlowCore reconoce dos espacios conceptuales:

```text
                 DECISION SPACE
                       │
                       │
               Proposal → Decision
                       │
                       ▼
              ┌───────────────────┐
              │ GOVERNANCE GATE   │
              │                   │
              │ Policy Evaluation │
              │ Authority Check   │
              │ Stability Check   │
              │ Knowledge Check   │
              └───────────────────┘
                       │
                       ▼
                 AUTHORIZATION
                       │
                       ▼
                  ACTION SPACE
                       │
                       ▼
                Action → Execution
                       │
                       ▼
                  Observation
```

La autorización constituye la frontera controlada entre:

* lo que un agente desea hacer,
* y lo que el sistema permite transformar en una orden operacional.

---

## 12. Integridad Temporal de la Gobernanza

Las políticas también están sujetas a la disciplina temporal establecida en el Commit #10.

Una política debe poseer:

* identidad,
* versión,
* estado,
* autoridad emisora,
* fecha de entrada en vigor,
* y, cuando corresponda, fecha de expiración.

Los cambios de política no reescriben decisiones históricas.

```text
POLICY V1
   │
   ├── Decision A
   ├── Authorization A
   └── Action A
            │
            ▼
         HISTORY

POLICY V2
   │
   ├── applies to future evaluations
   └── does not rewrite Policy V1 history
```

Una nueva política puede cambiar el futuro.

No modifica retroactivamente el contexto epistemológico bajo el cual una decisión histórica fue tomada.

---

## 13. Síntesis de la Arquitectura Ontológica FlowCore

La evolución de los commits fundamentales puede expresarse como:

```text
#08 WHAT EXISTS
    │
    └── Material Reality + Evidence
                │
                ▼
#09 WHAT CAN ACT
    │
    └── Resources + Capacity + Constraints
                │
                ▼
#10 WHAT HAPPENS
    │
    └── Intent + Plan + Execution + Observation + Evaluation
                │
                ▼
#11 WHO MAY ACT
    │
    └── Policy + Authority + Authorization + Stability
```

El Commit #11 no reemplaza el modelo dinámico del #10.

Lo gobierna.

El sistema conserva simultáneamente:

```text
WHAT EXISTS
WHAT CAN ACT
WHAT HAPPENS
WHO MAY ACT
```

Cada pregunta posee una responsabilidad diferente.

---

## 14. Principios Fundamentales del Commit #11

FlowCore adopta las siguientes reglas:

1. `Decision` no implica `Authorization`.
2. `Authorization` no implica `Action`.
3. `Action` no implica `Execution`.
4. `Execution` no implica `Outcome`.
5. Una política inválida no participa en enforcement.
6. Solo las políticas `ACTIVE & VALIDATED` participan en enforcement.
7. Una autoridad humana puede expresar una decisión que el Kernel no puede autorizar operacionalmente.
8. Ninguna autoridad puede delegar una `HARD_CONSTRAINT`.
9. Una política nueva no reescribe decisiones históricas.
10. Una autorización posee una ventana de validez.
11. Una autorización solo se revoca cuando cambian condiciones causales relevantes.
12. `STALE` o `UNKNOWN` no implican revocación automática si la variable degradada no es relevante para la autorización.
13. El costo de adaptación no puede justificar la violación de una restricción de seguridad o legal.
14. Las políticas de optimización están sujetas a estabilidad e histeresis.
15. Los conflictos normativos insolubles requieren escalación explícita.
16. Una autorización concedida no constituye evidencia de ejecución.
17. Una acción denegada conserva su evidencia histórica.
18. La gobernanza debe ser trazable.
19. La autoridad debe estar explícitamente delimitada.
20. El Kernel gobierna transiciones operacionales; no pretende gobernar la realidad física directamente.

---

## 15. Declaración Arquitectónica

El Kernel de FlowCore no debe convertirse en una entidad que simplemente diga:

> **"Sí" o "No".**

Debe ser capaz de explicar:

* qué se propuso,
* quién lo propuso,
* qué decisión se tomó,
* qué políticas eran aplicables,
* qué autoridad era necesaria,
* qué conocimiento sustentaba la decisión,
* qué autorización fue concedida o denegada,
* qué condiciones podían revocarla,
* qué acción fue emitida,
* y qué ocurrió posteriormente en el mundo físico.

Por lo tanto:

> **Governance is not the suppression of autonomy. Governance is the controlled boundary that makes autonomy safe, explainable and accountable.**

FlowCore no busca eliminar la autonomía.

Busca hacer explícitos sus límites.

---

## 16. Estado Congelado del Commit

```text
COMMIT #11
AUTHORITY
POLICY
STABILITY
AUTONOMOUS DECISION GOVERNANCE

STATUS:
APPROVED
VALIDATED
FROZEN
```

> **Authorization is a controlled transition between decision space and physical action space.**

> **Una autorización se revoca únicamente cuando cambian las condiciones causales y relevantes sobre las cuales fue concedida.**

Gudo Labs Architecture Group — August 2026
