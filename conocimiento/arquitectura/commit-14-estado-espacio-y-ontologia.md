# Especificación de Arquitectura de FlowCore

## Commit 14: Espacio de Estado y Ontología de Estado

### 1. Definición epistemológica de Estado

En FlowCore, un **Estado** no es una variable mutable, un búfer de memoria ni una entidad de almacenamiento.

Un **Estado** se define estrictamente como:

> *Una proyección determinista e inmutable del dominio cuya legitimidad está determinada por evidencia admisible, procedencia y autoridad constitucional.*

Un Estado no surge ex nihilo. Es la consecuencia observable y posterior de la aplicación de las leyes del dominio sobre evidencia y eventos previamente validados.

Por lo tanto, un Estado no constituye una fuente primaria de verdad. Constituye una **proyección de verdad de dominio** derivada de aquello que el sistema está constitucionalmente autorizado a reconocer como evidencia.

---

### 2. Lo que un Estado NO es

Para impedir la degradación arquitectónica, se establecen las siguientes fronteras constitucionales.

#### 2.1 Estado no es almacenamiento

El almacenamiento pertenece a la infraestructura.

Un Estado pertenece al dominio.

La existencia física de información almacenada no constituye, por sí misma, la existencia de un Estado legítimo.

---

#### 2.2 Estado no es una caché temporal

Un Estado no puede considerarse una representación descartable cuyo significado pueda reconstruirse arbitrariamente.

Una representación temporal puede ser una optimización de infraestructura, pero no adquiere legitimidad de dominio por el simple hecho de existir.

---

#### 2.3 Estado no es mutable

Un Estado no se modifica a sí mismo.

La mutación *in-place* de un Estado constituye una violación arquitectónica.

Cuando la realidad del dominio cambia, no se modifica el Estado anterior. Se proyecta un Estado distinto como consecuencia de una transición legítima.

Por lo tanto:

> *Un Estado no es la mutación de un Estado anterior; es una proyección de dominio distinta cuya legitimidad está determinada por evidencia admisible, procedencia y autoridad constitucional.*

---

#### 2.4 Estado no es información de presentación

Una representación creada exclusivamente para satisfacer necesidades de una interfaz de usuario no constituye un Estado de FlowCore.

La presentación puede representar un Estado, pero no puede conferirle legitimidad.

La existencia de información visible no constituye evidencia de dominio.

---

### 3. Relación entre Estado, Evidencia y Procedencia

La existencia legítima de un Estado depende de una relación causal y epistemológica con la evidencia.

#### 3.1 La evidencia precede al Estado

Un Estado no puede ser afirmado arbitrariamente.

Debe ser derivable exclusivamente a partir de evidencia que haya sido considerada admisible conforme a las reglas constitucionales y del dominio.

La dirección causal fundamental es:

```text
Evidencia
    │
    ▼
Admisibilidad
    │
    ▼
Proyección
    │
    ▼
Estado
```

La ausencia de evidencia admisible impide la legitimidad de la proyección correspondiente.

---

#### 3.2 La procedencia determina la legitimidad

Toda afirmación de Estado debe poseer una procedencia trazable.

La **Procedencia** establece el origen epistemológico de aquello que permite afirmar el Estado.

Un Estado cuya legitimidad no pueda ser trazada mediante una cadena válida de procedencia hasta un origen autorizado carece de legitimidad de dominio y se considera una proyección forjada.

---

#### 3.3 Separación entre legitimidad y representación

La procedencia legitima al Estado, pero el Estado no necesita contener dentro de su representación estructural la totalidad de la cadena física de procedencia.

La arquitectura distingue deliberadamente entre:

* la **legitimidad epistemológica** de un Estado;
* su **representación dentro del dominio**;
* y la infraestructura utilizada para conservar o transportar información relacionada con él.

Esta separación evita que una decisión de representación determine prematuramente la forma futura de la implementación.

---

#### 3.4 Derivación epistemológica

La relación fundamental puede expresarse como:

$$
\text{Estado}*n =
\text{Proyección}(
\text{Estado}*{n-1},
\text{Evidencia}_n
)
$$

La proyección debe ser una evaluación determinista y legítima del dominio.

Su legitimidad requiere autorización constitucional bajo una época de dominio válida.

La época constitucional constituye una **condición de autoridad**, no un parámetro operativo impuesto anticipadamente a la implementación.

---

### 4. Dependencia de la Autoridad Constitucional

La validez de dominio de un Estado está intrínsecamente vinculada con la **Autoridad Constitucional**.

#### 4.1 Autoridad de origen

Todo Estado legítimamente proyectado debe poseer un origen constitucional identificable.

Cuando la autoridad constitucional se expresa mediante un `FenceEpoch`, el Estado debe poder vincularse conceptualmente con el `FenceEpoch` bajo el cual su proyección fue autorizada.

Esta relación establece su **autoridad de origen**:

$$
E_{\text{origin}}
$$

La autoridad de origen no constituye una instrucción de implementación ni determina por sí misma la representación física del Estado.

---

#### 4.2 Continuidad de autoridad

La evolución de la autoridad constitucional no invalida retrospectivamente los Estados que fueron legítimamente proyectados bajo una autoridad anterior.

Si un Estado fue legítimamente proyectado bajo una época válida $E_1$, continúa siendo una afirmación históricamente válida del dominio aunque posteriormente la autoridad avance hacia $E_2$.

Por lo tanto:

> *La verdad histórica de un Estado no decae simplemente porque la autoridad constitucional avance.*

La transición de autoridad no constituye, por sí misma, una falsación retroactiva del dominio.

---

#### 4.3 Proyección ilícita

Una tentativa de proyectar un Estado sin un origen constitucional autorizado constituye una violación de la soberanía del dominio.

Esta condición se denomina:

**Proyección Ilícita de Estado — Unlawful State Projection**

La clasificación de esta condición pertenece a la especificación constitucional y no presupone una forma particular de implementación.

---

### 5. Separación entre Estado y Transición

La frontera entre **Estado** y **Transición** es absoluta.

#### 5.1 Estado — fisiología estática

El Estado representa la realidad espacial del dominio en un punto determinado.

Responde a:

> **¿Qué es verdadero dentro del dominio en este momento?**

El Estado describe una condición.

No describe el acto mediante el cual esa condición llegó a existir.

---

#### 5.2 Transición — dinámica cinética

Una **Transición** representa el cambio legítimo entre condiciones del dominio.

Responde a:

> **¿Qué cambio está siendo efectuado y bajo qué ley del dominio?**

La Transición describe una dinámica.

No constituye el Estado resultante.

---

#### 5.3 Frontera constitucional

La separación queda establecida mediante las siguientes prohibiciones:

* Un Estado **NO se modifica a sí mismo**.
* Un Estado **NO acepta ni rechaza evidencia**.
* La admisibilidad de evidencia pertenece al mecanismo que gobierna la proyección o transición.
* Un Estado **NO ejecuta Transiciones**.
* Un Estado **NO constituye una máquina de comportamiento**.
* Una Transición **NO redefine retrospectivamente el Estado que la precede**.
* La existencia de un Estado posterior depende de una transición legítima, pero el Estado y la transición continúan siendo conceptos ontológicamente distintos.

La relación fundamental queda expresada como:

```text
Evidencia
    │
    ▼
Autoridad + Admisibilidad
    │
    ▼
Estado
    │
    │
    ▼
Transición legítima
    │
    ▼
Estado'
```

Esta representación expresa una relación conceptual y causal, no una arquitectura de ejecución.

---

### 6. Invariantes fundamentales de un Estado legítimo

Todo Estado legítimo de FlowCore debe preservar las siguientes invariantes.

#### 6.1 Invariante de equivalencia determinista

Dadas condiciones iniciales idénticas y una secuencia idéntica de evidencia admisible, la proyección resultante debe producir exactamente la misma **semántica de dominio**.

La invariante protege la determinación del significado del Estado.

No prescribe un mecanismo particular de ejecución, representación, almacenamiento o compilación.

---

#### 6.2 Invariante de no falsificación

Un Estado legítimo no puede surgir mediante una afirmación arbitraria, valores por defecto no verificados o mecanismos que eludan las condiciones de legitimidad del dominio.

La existencia de una representación no es suficiente para demostrar la existencia de un Estado legítimo.

---

#### 6.3 Invariante de inmutabilidad

Una vez formada una proyección de Estado, sus propiedades de dominio no pueden modificarse retroactivamente.

Un cambio legítimo del dominio requiere una nueva proyección.

El Estado anterior permanece como una afirmación correspondiente a su propio punto de verdad.

---

#### 6.4 Invariante de independencia de identidad física

La identidad de un Estado pertenece al dominio y a sus condiciones de legitimidad.

No depende de:

* una ubicación física;
* una dirección de memoria;
* un mecanismo de almacenamiento;
* una representación particular;
* ni una decisión concreta de infraestructura.

La identidad física de una representación no constituye identidad ontológica del Estado.

---

### 7. Frontera contra la implementación prematura

Esta especificación deliberadamente **no define**:

* una estructura concreta de `State`;
* campos internos;
* constructores;
* métodos;
* interfaces;
* serialización;
* almacenamiento;
* estrategias de caché;
* tipos concretos del lenguaje;
* mecanismos de memoria;
* detalles de `rustc`;
* ni una representación específica de `FenceEpoch`.

Estas decisiones pertenecen a etapas posteriores de la arquitectura y solo podrán introducirse cuando la Constitución y la ontología correspondiente las hagan necesarias.

La ausencia de implementación no constituye una carencia.

Constituye una decisión arquitectónica consciente.

---

### 8. Postulado constitucional

La ontología de Estado queda finalmente resumida en el siguiente postulado:

> *Un Estado no es la mutación de un Estado anterior; es una proyección de dominio distinta cuya legitimidad está determinada por evidencia admisible, procedencia y autoridad constitucional.*

Este postulado establece la frontera que deberá respetar cualquier especificación posterior de `Transition`, consumo legítimo o representación ejecutable del dominio.

---

## Estado constitucional del documento

Con este documento quedan formalmente establecidas:

1. La definición ontológica de Estado.
2. Las exclusiones fundamentales de aquello que no constituye Estado.
3. La relación entre Estado, Evidencia y Procedencia.
4. La dependencia de legitimidad respecto de la Autoridad Constitucional.
5. La independencia entre autoridad histórica y autoridad posterior.
6. La separación absoluta entre Estado y Transición.
7. Las invariantes fundamentales de todo Estado legítimo.
8. La prohibición explícita de adelantar decisiones de implementación.

La especificación no introduce estructuras ejecutables.

Su propósito es establecer la frontera ontológica que deberá preceder a cualquier implementación posterior del Estado dentro de FlowCore.
