# Commit 23 — Especificación de Trabajo para la Implementación del Dominio en Rust

**Estado conceptual:** 🟡 En diseño / Especificación de Trabajo Operativa
**Área:** Core Engine / Domain / Rust
**Precedentes Directos:** Commits #17–#20 (Ontología), Commit #21 (Contrato Mínimo), Commit #22 (Especificación Normativa de Tipos y Fronteras)
**Propósito:** Definir la topología de módulos, visibilidad de fronteras, árbol de dependencias admisibles e invariantes a demostrar para la futura implementación de `src/domain/`, sin escribir código Rust, sin ejecutar Cargo y sin modificar el árbol de fuentes ejecutable.

---

## 🏛️ CLÁUSULA CONSTITUCIONAL PREVALENTE

> **El Commit #23 no podrá introducir una abstracción cuya necesidad no pueda trazarse directamente a los Commits #17–#22.**
>
> La implementación en Rust no tiene potestad para inventar conceptos, wrappers de conveniencia ni estructuras intermedias. Su única función es demostrar la estricta fidelidad a las fronteras previamente congeladas.

---

## 1. TOPOLOGÍA DE MÓDULOS Y RESPONSABILIDAD ONTOLÓGICA

La organización de archivos en `src/domain/` responde estrictamente a fronteras semánticas definidas por la ontología, nunca a la conveniencia del programador:

```text
src/domain/
├── mod.rs          <-- Frontera Pública de Exposición (Re-exportación restringida)
├── state.rs        <-- State<C> (Testimonio inmutable)
├── normative.rs    <-- NormativeContent (Contenido declarativo)
├── law.rs          <-- DomainLaw (Frontera normativa / Trait)
├── transition.rs   <-- Transition<C, L, A, E> y try_constitute()
└── rejection.rs    <-- InadmissibleTransition y AdmissibilityRejection
```

La organización anterior constituye únicamente el plano estructural autorizado para la futura implementación de `src/domain/`.

Cada archivo corresponde a una frontera semántica previamente establecida. La organización física del código no podrá utilizarse para introducir responsabilidades que no hayan sido definidas por los precedentes constitucionales.

---

## 2. MATRIZ DE VISIBILIDAD, EXPOSICIÓN Y PRIVACIDAD DE CAMPOS

La existencia de un módulo no implica que sus tipos o campos sean públicos. La visibilidad (`pub`) en Rust se somete a la siguiente matriz de confinamiento de tipos y fronteras:

| **Archivo / Módulo** | **Tipo / Abstracción** | **Visibilidad del Tipo** | **Visibilidad de Campos / Métodos Internos** | **Justificación Constitucional (#22)** |
|---|---|---|---|---|
| **`state.rs`** | `State<C>` | `pub struct` | **Privados** (no `pub fields`) | Impide la construcción arbitraria de estados no validados. Sin `&mut self`. |
| **`normative.rs`** | `NormativeContent` | `pub struct` | **Privados / Opaque** | Exclusivamente declarativo. Prohibido código ejecutable, closures o bytecode. |
| **`law.rs`** | `DomainLaw` | `pub trait` | Método `normative_content(&self)` **público** | Solo expone contenido declarativo. Prohibidos `execute()`, `apply()`, `next_state()`. |
| **`transition.rs`** | `Transition<C, L, A, E>` | `pub struct` | **Campos estrictamente privados** | `pre`, `law`, `authority`, `evidence`, `post` no son accesibles directamente ni mutables. |
| **`transition.rs`** | `try_constitute(...)` | `pub fn` | Exposición de la frontera constitutiva | Frontera constitutiva autorizada para la creación externa de `Transition<C, L, A, E>`. |
| **`rejection.rs`** | `InadmissibleTransition` | `pub struct` | Campos privados o accesores inmutables | Representa el rechazo como un valor en `Err(...)`. No es un panic ni excepción de runtime. |

### 2.1 Principio de confinamiento

La visibilidad pública se limita a las fronteras necesarias para que el dominio pueda ser utilizado sin permitir la construcción arbitraria de valores que deban estar sujetos a invariantes constitutivos.

En particular:

- Los campos constitutivos de `State<C>` permanecen privados.
- Los campos constitutivos de `Transition<C, L, A, E>` permanecen privados.
- La creación de `Transition<C, L, A, E>` desde fuera de su módulo se realiza exclusivamente mediante `try_constitute(...)`.
- `DomainLaw` expone únicamente el contenido normativo autorizado.
- `InadmissibleTransition` representa un rechazo como valor, no como excepción de ejecución.

La implementación futura deberá preservar estas fronteras sin introducir accesores que permitan reconstruir indirectamente una vía de mutación o construcción arbitraria.

---

## 3. GRAFO DE DEPENDENCIAS CONCEPTUALES VS. AUTORIDAD SEMÁNTICA

La dirección de importación técnica en Rust no concede autoridad de modificación ni capacidad de ejecución:

```text
                 normative
                     ▲
                     │
                    law
                     ▲
                     │
state ──────────► transition ◄──────── rejection
                     │
                     ▼
             try_constitute()
          (Frontera Constitutiva)
```

### 3.1 `transition.rs` como frontera constitutiva

`transition.rs` constituye la frontera técnica donde se intenta transformar la proposición relacional en un `Transition<C, L, A, E>`, conforme al juicio de admisibilidad autorizado por el Commit #22.

La existencia de esta frontera no convierte a `Transition` en una entidad ejecutora. Su función es representar una transición ya constituida bajo las condiciones normativas previamente establecidas.

### 3.2 Ausencia de autoridad ejecutiva en `DomainLaw`

La utilización de `DomainLaw` dentro de la constitución de una transición no autoriza al trait a ejecutar transiciones, aplicar efectos, calcular estados posteriores por mutación ni producir efectos secundarios.

El método autorizado es:

```text
normative_content(&self)
```

Su función queda limitada a proporcionar contenido declarativo.

Quedan expresamente fuera de la frontera normativa:

```text
execute()
apply()
next_state()
```

### 3.3 Ausencia de autoridad ejecutiva en `State`

`State<C>` representa un testimonio inmutable del estado correspondiente al contexto `C`.

No constituye una máquina de transición.

No posee autoridad para:

- mutarse internamente;
- ejecutar leyes;
- producir transiciones;
- evaluar efectos;
- modificar otros estados.

### 3.4 Ausencia de infraestructura externa

Ningún tipo secundario del núcleo del dominio puede depender directamente de infraestructura externa para adquirir significado ontológico.

La infraestructura podrá existir en capas posteriores del sistema, pero no podrá introducirse como dependencia constitutiva del dominio.

---

## 4. BARRERA DE AUSTERIDAD Y CONTROL DE DEPENDENCIAS

### 4.1 Prohibición de Dependencias Externas en Cargo

Para el núcleo del dominio, el archivo `Cargo.toml` no incluirá dependencias de infraestructura:

- `serde` / `bincode` / `json`
  - La serialización no es una propiedad constitutiva del dominio.
- `uuid` / `ulid` o mecanismos equivalentes
  - No podrán utilizarse para fabricar identidad ontológica.
- `tokio` / `async-std` / `futures`
  - Cero asincronía o runtimes dentro de la semántica de dominio.

La ausencia de estas dependencias no constituye una prohibición tecnológica global para FlowCore. La restricción se aplica específicamente al núcleo semántico del dominio.

### 4.2 Restricción sobre `std::sync` y Mutabilidad Interior

No se autoriza mutabilidad interior (`RefCell`, `Cell`, `Mutex`, `RwLock` y sus equivalentes) en los tipos constitutivos del dominio.

Cualquier dependencia futura de sincronización deberá justificarse arquitectónicamente y no podrá formar parte de la semántica ontológica.

### 4.3 Principio de austeridad

La implementación deberá preferir las capacidades expresivas propias del lenguaje y de la arquitectura ya congelada antes que incorporar dependencias destinadas a resolver problemas que no pertenecen a la frontera del dominio.

Toda dependencia nueva que afecte directa o indirectamente al núcleo semántico deberá demostrar una necesidad trazable a los precedentes constitucionales.

---

## 5. PROPIEDADES INVARIANTES A DEMOSTRAR (REQUERIMIENTOS DE AUDITORÍA)

La implementación posterior, a partir del Commit #24, deberá demostrar la satisfacción de las siguientes propiedades formales, sin prescribir aún la herramienta o mecanismo de testing específico.

### 5.1 Inexpugnabilidad de `Transition`

Demostrar que un valor del tipo `Transition<C, L, A, E>` jamás puede ser instanciado omitiendo el juicio de admisibilidad de `try_constitute()`.

La estructura deberá impedir la construcción externa directa cuando dicha construcción permita eludir las condiciones constitutivas.

### 5.2 Inmutabilidad Constitutiva

Demostrar la imposibilidad de alterar las proposiciones de un `State<C>` o un `Transition<C, L, A, E>` una vez constituidos.

La ausencia de mutabilidad deberá mantenerse tanto en la interfaz pública como en las rutas internas de construcción.

### 5.3 Ausencia de Estado Inválido

Demostrar que un rechazo de admisibilidad (`InadmissibleTransition`) es un valor disjunto que jamás habita dentro de un `Ok(Transition<C, L, A, E>)`.

La frontera constitutiva deberá distinguir inequívocamente entre:

```text
Ok(Transition<C, L, A, E>)
```

y:

```text
Err(InadmissibleTransition)
```

El rechazo no deberá convertirse en un `panic`, excepción de runtime ni estado parcialmente constituido.

### 5.4 Pasividad Normativa de `DomainLaw`

Demostrar que invocar `normative_content()` es una operación pura de lectura que no altera el estado del sistema ni produce transiciones por sí misma.

La ley proporciona contenido normativo.

La ley no ejecuta.

La ley no muta.

La ley no constituye por sí misma una transición.

---

## 6. FRONTERA ENTRE ESPECIFICACIÓN E IMPLEMENTACIÓN

El presente documento define el plano de trabajo para la futura implementación, pero no constituye autorización para comenzar a escribir código dentro de `src/domain/`.

Hasta el cierre del Commit #23:

- No se escribirá código Rust de dominio.
- No se ejecutará `cargo`.
- No se ejecutarán pruebas.
- No se modificará el árbol de fuentes ejecutable.
- No se introducirán dependencias nuevas.
- No se crearán implementaciones provisionales.
- No se realizarán refactorizaciones anticipadas.
- No se crearán wrappers de conveniencia.
- No se introducirán abstracciones no trazables a los Commits #17–#22.

La implementación queda deliberadamente desplazada al Commit #24.

---

## 7. CRITERIO DE ACEPTACIÓN DEL COMMIT #23

El Commit #23 se considerará listo para cierre cuando:

1. El documento exista exactamente en:

   `conocimiento/diseño/commit-23-especificacion-de-trabajo-domain-rust.md`

2. El archivo se encuentre correctamente añadido al área de preparación.

3. `git diff --cached` represente el documento completo sin truncamientos estructurales.

4. `git diff --cached --check` no reporte errores de whitespace.

5. La firma canónica `Transition<C, L, A, E>` sea uniforme en todas las secciones donde aparezca.

6. La palabra `estrictamente` sea utilizada en castellano donde corresponda.

7. No exista ninguna variante sintáctica de la firma genérica.

8. No exista código Rust ejecutable introducido como parte del Commit #23.

9. El árbol de fuentes ejecutable permanezca sin modificaciones.

10. La implementación continúe expresamente reservada para el Commit #24.

---

## 🧱 ESTADO DE PREPARACIÓN

```text
#17–#20  Ontología
     ↓
#21      Contrato Mínimo
     ↓
#22      Especificación Normativa de Tipos
     ↓
#23      Plano de Trabajo (Este documento)
     ↓
══════════════════════════════
   FRONTERA DE IMPLEMENTACIÓN
══════════════════════════════
     ↓
#24      Primera Implementación de src/domain/
```

El plano de excavación queda completo y validado ontológicamente.

Una vez sellado este documento, la implementación quedará autorizada únicamente para una futura trinchera #24, sujeta íntegramente a esta especificación.

> *"Primero descubrimos qué puede existir. Después congelamos por qué puede existir. Solo en ese momento permitimos que el código exista."*

**Gudo Labs — FlowCore**
