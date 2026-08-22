# Especificación de Arquitectura de FlowCore
## Commit 16: Ontología de Ley de Dominio, Aplicabilidad y Admisibilidad

### 1. Definición Epistémica de Domain Law
En FlowCore, una **Domain Law** no es un algoritmo de validación, ni una función imperativa, ni una condición booleana de flujo, ni un procedimiento de verificación.

Una **Domain Law** se define estrictamente como:
> *La norma sustantiva del dominio que define las condiciones de posibilidad normativa bajo las cuales pueden constituirse relaciones legítimas entre State y Evidence.*

La Domain Law no constituye un acto de ejecución ni de verificación; define las condiciones normativas bajo las cuales una transformación del dominio puede ser ontológicamente posible y legalmente válida dentro de un régimen constitucional.

---

### 2. Jerarquía Constitucional de Restricción Normativa
Para evitar la arbitrariedad normativa y garantizar la coherencia del dominio, la validez de las normas se somete a tres capas ontológicas de restricción jerárquica:

$$\text{Invariant} \supset \text{Constitutional Authority} \supset \text{Domain Law}$$

* **Invariant (Límite Constitucional de Posibilidad):** Restricción ontológica absoluta que delimita el espacio de existencia del universo FlowCore. Toda Autoridad Constitucional y toda Domain Law DEBEN amoldarse estrictamente a las Invariantes que gobiernan este espacio. Ninguna norma es legítima si las contradice.
* **Constitutional Authority (Gobernanza de Régimen):** El marco de legitimidad respaldado por un ámbito temporal y normativo (`FenceEpoch`) que confiere validez a un conjunto de Domain Laws.
* **Domain Law (Norma Sustantiva):** La norma específica que define las condiciones de posibilidad para las relaciones sustantivas del dominio.

---

### 3. La Relación de Aplicabilidad Normativa (Normative Applicability)
La existencia de una Domain Law legítima NO implica su aplicabilidad a un State determinado. La **Normative Applicability** no es una propiedad intrínseca de la ley, sino una relación ontológica formal:

$$\text{NormativeApplicability} = R(\text{State}, \text{DomainLaw}, \text{Authority})$$

> *Una Domain Law únicamente posee aplicabilidad normativa respecto de un prior State ($S_n$) si existe una relación de jurisdicción sustantiva directa bajo una Constitutional Authority válida en el FenceEpoch ($E_n$) correspondiente al ámbito temporal y normativo de dicha relación.*

Si la relación $R(\text{State}, \text{DomainLaw}, \text{Authority})$ no existe, se constata la ausencia de jurisdicción normativa sobre dicho State. Esto imposibilita la existencia de cualquier relación posterior sobre la Evidence, sin prejuzgar la validez, integridad o autenticidad de esta última.

---

### 4. La Relación Contextual de Admisibilidad (Admissibility)
La **Admissibility** no es una propiedad de la Evidence, sino una relación contextual formal sustentada en la aplicabilidad normativa previa:

$$\text{Admissibility} = R(\text{Evidence}, \text{State}, \text{DomainLaw}, \text{Authority})$$

* **Validez de Evidencia vs. Admisibilidad:** Una Evidence puede ser auténtica, íntegra y legítima en su origen, pero no guardar una relación de admisibilidad respecto de un State y una Domain Law específicos.
* **Separación de la Procedencia (Provenance):** La procedencia o atribución del origen de la Evidence no pertenece a la Admissibility; constituye una dimensión ontológica independiente.
* **Efecto de la Inadmisibilidad:** La ausencia de la relación de admisibilidad respecto de una relación determinada NO declara la falsedad de la Evidence, NO invalida su existencia y NO constituye un estado de error de ejecución. Establece únicamente que dicha Evidence no constituye fundamento causal suficiente para esa relación específica.

---

### 5. Axiomas de Desacoplamiento Normativo
Para impedir la colusión entre ontología y procesamiento procedural, se imponen constitucionalmente las siguientes discontinuidades causales:

1. **Axioma de Inexistencia de Aplicabilidad Automática:**
   $$\text{DomainLaw} \not\Rightarrow \text{Normative Applicability}$$
2. **Axioma de Inexistencia de Admisibilidad Automática:**
   $$\text{Normative Applicability} \not\Rightarrow \text{Admissibility}$$
3. **Axioma de Inexistencia de Transición Automática:**
   $$\text{Admissibility} \not\Rightarrow \text{Transition}$$
4. **Axioma de Inmutabilidad Normativa Histórica:**
   Una relación legítimamente constituida bajo una Domain Law $L_1$ y respaldada por una Constitutional Authority válida en el FenceEpoch $E_1$ permanece históricamente válida independientemente de evoluciones normativas o de autoridad posteriores ($L_1 \to L_2$, $E_1 \to E_2$). La reevaluación anacrónica de la historia constituye una violación constitucional (*Ataque de Anacronismo Normativo*).

---

### 6. Invariantes de la Determinación Normativa
Toda relación normativa en FlowCore DEBE preservar las siguientes invariantes:

1. **Invariante de Inmunidad Constitucional:** Ninguna Domain Law puede suspender, alterar ni violar una Invariant del sistema.
2. **Invariante de No-Falsificación por Inadmisibilidad:** La ausencia de admisibilidad de una Evidence para una relación $R_1$ no destruye la existencia de la Evidence ni impide su admisibilidad potencial para una relación $R_2$.
3. **Invariante de Aislamiento Operacional:** Las relaciones de Normative Applicability y Admissibility son condiciones ontológicas de legitimidad y existencia, absolutamente independientes de rutinas, funciones, mecanismos de ejecución o cualquier estado operacional del runtime de programación.
