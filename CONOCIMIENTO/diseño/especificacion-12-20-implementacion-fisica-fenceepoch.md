# Especificación 12.20 — Implementación Física de FenceEpoch

**Tipo:** Especificación física de implementación
**Ámbito:** `flowcore-domain`
**Fase:** 2 — Materialización física controlada
**Estado:** VIGENTE
**Precedencia constitucional:** D01–D08
**Auditorías precedentes:** A01, A02, A03
**Pre-auditoría:** A04-0 — APROBADA
**Objeto físico:** `FenceEpoch`
**Estado del kernel:** 🔒 CONGELADO

---

## 1. Propósito

Este documento formaliza en el repositorio la especificación física 12.20 utilizada como base para la implementación controlada de `FenceEpoch` dentro de `flowcore-domain`.

Su incorporación documental no constituye una nueva decisión constitucional.

Tampoco modifica:

* D01–D08;
* la Especificación Constitucional Final;
* A01;
* A02;
* A03;
* el contrato normativo consolidado derivado de los Commits #21 y #22;
* el histórico de los Commits #23, #24 o #25.

La finalidad de este documento es establecer una frontera documental explícita entre:

```text
Constitución
    ↓
Especificación normativa
    ↓
Especificación física 12.20
    ↓
Implementación
    ↓
Evidencia
    ↓
Auditoría A04
```

La especificación precede a la implementación.

La implementación produce evidencia.

La evidencia precede a la auditoría.

---

## 2. Naturaleza de la especificación 12.20

La especificación 12.20 pertenece al nivel **arquitectónico y físico**, no al nivel de la ontología constitucional mínima.

Por lo tanto:

```text
12.20 ≠ nueva ontología constitucional
12.20 ≠ modificación de State
12.20 ≠ modificación de Transition
12.20 ≠ evidencia
12.20 ≠ auditoría
```

Su responsabilidad consiste exclusivamente en determinar las condiciones bajo las cuales una decisión arquitectónica previamente identificada puede intentar materializarse físicamente.

En particular, la especificación aborda la frontera física asociada a:

```text
FenceEpoch
        ↓
autoridad de minting
        ↓
encapsulamiento
        ↓
no-forjabilidad
        ↓
procedencia autorizada
```

Estas propiedades no se consideran demostradas por el presente documento.

Su demostración queda reservada a la implementación y a la evidencia física producida por el compilador y las pruebas correspondientes.

---

## 3. Precedencia documental

La especificación 12.20 debe interpretarse dentro de la siguiente cadena:

```text
D01–D08
    │
    ▼
Especificación Constitucional Final
    │
    ▼
A01
    │
    ▼
A02
    │
    ▼
A03
    │
    ▼
Acta de Transición
    │
    ▼
12.20
    │
    ▼
A04-0
    │
    ▼
Implementación física
```

A04-0 determinó que la especificación 12.20 es documentalmente coherente con la cadena constitucional y contractual precedente y que no contiene una contradicción que impida iniciar la implementación física.

Esto no equivale a una demostración de las propiedades físicas de la implementación.

---

# 4. Frontera constitucional congelada

La implementación 12.20 no puede modificar la forma constitucional de:

```text
State<C>
```

ni:

```text
Transition<C₁,C₂,L,A,E>
```

No se autoriza introducir:

* nuevos parámetros constitucionales;
* nuevos campos en `State`;
* nuevos campos en `Transition`;
* nuevas operaciones constitucionales;
* nuevas relaciones constitucionales;
* nuevas entidades ontológicas;
* nuevas semánticas para `L`;
* nuevas semánticas para `A`;
* nuevas semánticas para `E`.

En particular:

```text
E ≠ Evidence como entidad constitucional
A ≠ Authority como entidad constitucional
L ≠ DomainLaw como ontología constitucional
```

Las posiciones `L`, `A` y `E` permanecen estructurales dentro de la forma ya especificada.

---

# 5. Objeto físico: FenceEpoch

`FenceEpoch` pertenece a una decisión arquitectónica/física previa relacionada con la frontera de autoridad de minting.

La especificación física establece que:

```text
FenceEpoch
```

puede existir como tipo físicamente consumible por el sistema, siempre que su construcción quede protegida mediante una frontera estructural adecuada.

La especificación no autoriza:

```text
public constructor arbitrario
```

ni:

```text
From<u64>
Into<FenceEpoch>
```

ni:

```text
conversiones primitivas equivalentes
```

ni:

```text
serialización/deserialización como mecanismo de reconstrucción
```

ni cualquier otra ruta equivalente que permita reconstruir arbitrariamente el valor fuera de la frontera autorizada.

---

# 6. Soberanía del tipo

La implementación debe conservar la soberanía del tipo `FenceEpoch` dentro del crate que controla su definición.

La propiedad arquitectónica buscada es:

```text
Type Sovereignty
        ∧
Primitive Minting Authority
        ⊆
Same Sovereign Crate
```

Esto significa que el crate que define físicamente `FenceEpoch` mantiene también el control estructural sobre las rutas mediante las cuales puede ser creado.

La soberanía del tipo no implica por sí misma:

* identidad global;
* unicidad matemática;
* persistencia;
* procedencia histórica;
* autoridad dinámica;
* identidad del llamador.

Es una frontera arquitectónica de construcción y representación.

---

# 7. Autoridad de minting

La especificación requiere una frontera física entre:

```text
consumidor de FenceEpoch
```

y:

```text
ruta de minting
```

La ruta de minting no debe exponerse indiscriminadamente como API pública.

En consecuencia, una función con una forma equivalente a:

```rust
pub fn try_mint(...)
```

no queda autorizada simplemente por conveniencia sintáctica.

La visibilidad concreta debe elegirse de acuerdo con la topología física y comprobarse mediante compilación y pruebas.

La autorización física prevista es estructural:

```text
alcance del módulo
        +
encapsulamiento
        +
visibilidad Rust
```

No se utilizará identidad dinámica del llamador como mecanismo de autorización.

---

# 8. `pub(crate)` y autoridad

La especificación incorpora explícitamente la corrección derivada de Hydra #111:

```text
pub(crate)
    ≠
GovernanceOnly
```

`pub(crate)` proporciona accesibilidad dentro del crate.

No constituye una ACL dinámica ni una frontera equivalente a:

```text
solo gobernanza
```

Por lo tanto, la implementación no puede interpretar `pub(crate)` como demostración suficiente de autoridad exclusiva.

Cuando sea necesaria una frontera más estrecha, deberá obtenerse mediante la topología real de módulos y las reglas de visibilidad correspondientes.

---

# 9. Co-localización de gobernanza

La especificación mantiene la decisión arquitectónica de co-localizar la autoridad primitiva de minting con la soberanía del tipo dentro del mismo crate soberano.

La intención es preservar:

```text
definición de FenceEpoch
        +
control de minting
        ↓
misma frontera soberana
```

Esta decisión no crea una nueva entidad ontológica denominada `Governance`.

Tampoco convierte la gobernanza en una forma constitucional.

Es exclusivamente una decisión de arquitectura física.

---

# 10. Encapsulamiento de FenceEpoch

Los datos internos de `FenceEpoch` deben permanecer privados.

La representación concreta puede utilizar una estructura interna mínima, siempre que no se introduzcan semánticas no autorizadas.

Por ejemplo, una representación escalar puede utilizarse como mecanismo físico de almacenamiento.

Sin embargo:

```text
representación interna
    ≠
identidad ontológica
```

y:

```text
valor interno
    ≠
prueba de unicidad
```

La elección de una representación física no constituye por sí misma una demostración de ninguna propiedad constitucional.

---

# 11. Constructor físico

La existencia de un constructor interno no debe interpretarse como autorización pública para crear `FenceEpoch`.

La forma conceptual permitida es una ruta interna equivalente a:

```rust
FenceEpoch::new(...)
```

cuya visibilidad queda restringida por la topología física.

No se autoriza un constructor público arbitrario.

Tampoco se autoriza una ruta alternativa que permita evadir la frontera estructural.

---

# 12. Minting

La operación de minting constituye una operación física de construcción.

No se le atribuyen automáticamente:

* validación normativa;
* admisibilidad;
* autoridad semántica;
* procedencia histórica;
* identidad global;
* unicidad global;
* persistencia;
* causalidad;
* temporalidad.

Una operación física equivalente a:

```rust
mint(sequence)
```

solo puede representar la construcción prevista por la frontera arquitectónica.

No debe convertirse en un motor de reglas.

---

# 13. Ausencia de identidad dinámica

La implementación no utilizará mecanismos de:

* introspección del llamador;
* callbacks de autorización;
* passkeys dinámicas;
* identificación runtime del módulo;
* ACL dinámica;
* comprobaciones equivalentes de identidad del consumidor.

La razón es la observación establecida en Hydra #109:

```text
Rust privacy
    ≠
caller identity
```

La frontera requerida debe descansar en la estructura estática del programa.

---

# 14. No-forjabilidad

La propiedad física buscada es:

> Un consumidor externo no debe poder construir arbitrariamente un `FenceEpoch` mediante acceso directo a su representación interna.

Esto requiere, como mínimo:

```text
campos privados
        +
constructor no público
```

La prueba física correspondiente deberá demostrar el rechazo real del compilador.

No se considera evidencia suficiente una afirmación documental.

---

# 15. No colapso a primitivo

La implementación no debe proporcionar una conversión implícita o explícita no autorizada que reduzca:

```text
FenceEpoch
```

a:

```text
u64
```

o reconstruya:

```text
FenceEpoch
```

desde:

```text
u64
```

mediante traits de conversión u otros mecanismos equivalentes.

La ausencia de:

```rust
From<u64> for FenceEpoch
```

debe poder verificarse mediante una prueba de compilación negativa.

---

# 16. No minting directo externo

La superficie pública del crate no debe exponer directamente la ruta interna de minting.

El consumidor externo debe encontrar un rechazo del compilador al intentar acceder a módulos o funciones privadas.

La prueba correspondiente pertenece a la batería de ataques 12.19.

La propiedad buscada es estructural:

```text
consumidor externo
        ↓
NO puede alcanzar
        ↓
ruta interna de minting
```

---

# 17. Duplication — 12.19-D

El ataque 12.19-D investiga la posibilidad de duplicación mediante mecanismos como:

* `Copy`;
* `Clone`;
* reutilización posterior a un `move`;
* reconstrucción equivalente.

Sin embargo, la especificación establece una precaución epistemológica:

```text
Move semantics
    ≠
unicidad global
```

y:

```text
ausencia de Clone/Copy
    ≠
demostración de no duplicación
```

Por esta razón, no se autoriza declarar que la propiedad de unicidad o no duplicación está demostrada únicamente eliminando `Copy` o `Clone`.

La prueba física de 12.19-D queda condicionada a que la propiedad exacta que se desea demostrar sea suficientemente determinada.

Hasta entonces:

```text
12.19-D = DIFERIDO
```

No debe fabricarse una prueba cuyo único efecto sea demostrar una propiedad diferente.

---

# 18. Replay — 12.19-E

El ataque 12.19-E investiga la posibilidad de reutilización o replay de una capacidad o mecanismo de autorización.

La especificación no autoriza introducir:

```text
MintCapability
```

por defecto.

El modelo seleccionado para esta fase es el modelo estructural sin capacidad adicional:

```text
Model 1
```

Por tanto, no debe crearse una entidad `MintCapability` únicamente para satisfacer el ataque E.

La prueba de replay queda:

```text
DIFERIDA
```

mientras no exista una capacidad física cuya reutilización constituya una propiedad real que pueda ser auditada.

No se debe fabricar una ontología de capacidad para producir una prueba artificial.

---

# 19. Ataques 12.19-F a 12.19-J

Los ataques restantes definidos en la especificación constitucional original son:

```text
12.19-F — Adapter Authority
12.19-G — Runtime Faucet
12.19-H — Governance Bypass
12.19-I — Circular Dependency
12.19-J — Public Authority Faucet
```

Estos nombres representan superficies de ataque arquitectónicas identificadas previamente.

No implican que deban existir automáticamente diez pruebas físicas independientes.

Cada ataque deberá clasificarse según:

```text
¿Existe actualmente una propiedad física demostrable?
            │
       ┌────┴────┐
      SÍ         NO
      │           │
      ▼           ▼
materializar   diferir /
prueba real    documentar
```

No se autoriza crear módulos, capacidades, adaptadores, faucets o entidades únicamente para que los ataques tengan algo que atacar.

La ausencia de una implementación de una superficie no constituye automáticamente evidencia de seguridad.

---

# 20. Suite de ataques como protocolo de evidencia

La batería 12.19 debe interpretarse como:

```text
especificación de propiedades a atacar
```

y no como:

```text
lista obligatoria de archivos trybuild
```

La evidencia debe surgir de una propiedad real de la implementación.

Cada prueba debe satisfacer:

```text
propiedad definida
        ↓
mecanismo físico correspondiente
        ↓
ataque reproducible
        ↓
resultado real del compilador
        ↓
stderr real
```

No se permite:

```text
resultado supuesto
stderr inventado
```

---

# 21. trybuild y evidencia negativa

Las pruebas de compilación negativa constituyen un mecanismo adecuado para propiedades relacionadas con:

* privacidad;
* visibilidad;
* construcción externa;
* acceso a módulos internos;
* conversiones no disponibles;
* rutas estructuralmente inaccesibles.

La evidencia `.stderr` debe proceder exclusivamente de una ejecución real del compilador.

No se permite escribir manualmente un `.stderr` antes de observar el diagnóstico correspondiente.

El flujo correcto es:

```text
código de ataque
      ↓
cargo test
      ↓
diagnóstico real
      ↓
actualización controlada de .stderr
      ↓
cargo test
      ↓
PASS
```

---

# 22. Evidencia positiva

Las propiedades permitidas deben tener también pruebas positivas cuando corresponda.

Una prueba positiva debe demostrar únicamente aquello que efectivamente ejecuta.

Por ejemplo:

```text
mint
  ↓
FenceEpoch
  ↓
valor observable mediante API interna
```

puede demostrar que la ruta física interna existe y produce un valor.

No demuestra por sí misma:

* autoridad legítima;
* unicidad;
* procedencia;
* identidad;
* validez normativa;
* admisibilidad.

La evidencia debe interpretarse exactamente al nivel de la propiedad observada.

---

# 23. Mutación controlada

La validación posterior puede utilizar una secuencia:

```text
G₀
 ↓
implementación correcta
 ↓
GREEN
```

seguida de:

```text
RED
 ↓
mutación controlada de la propiedad protegida
 ↓
la prueba debe detectar la violación
```

y finalmente:

```text
G₁
 ↓
restauración de la implementación
 ↓
GREEN
```

Esta secuencia no debe ejecutarse ni declararse completada hasta disponer de evidencia real.

La mutación constituye una prueba de sensibilidad de la suite.

---

# 24. Dependencias y alcance

La implementación 12.20 no autoriza:

* nuevas dependencias runtime;
* infraestructura externa;
* persistencia;
* serialización;
* adaptadores;
* repositorios;
* ejecutores;
* servicios;
* identificación dinámica;
* mecanismos externos de autorización.

El dominio físico debe permanecer mínimo.

---

# 25. Relación con State y Transition

La implementación de `FenceEpoch` no requiere modificar:

```text
State<C>
```

ni:

```text
Transition<C₁,C₂,L,A,E>
```

No se agrega `FenceEpoch` como:

* campo de `State`;
* parámetro nuevo de `Transition`;
* evidencia constitucional;
* autoridad constitucional;
* ley constitucional;
* identidad constitucional.

Su responsabilidad pertenece a la frontera arquitectónica/física correspondiente.

---

# 26. Límites epistemológicos

La especificación 12.20 no permite inferir:

```text
compiló
    ⇒
es constitucionalmente verdadero
```

ni:

```text
prueba negativa pasó
    ⇒
autoridad global demostrada
```

ni:

```text
campo privado
    ⇒
unicidad
```

ni:

```text
move
    ⇒
no duplicación global
```

ni:

```text
módulo privado
    ⇒
identidad del llamador
```

ni:

```text
FenceEpoch
    ⇒
Evidence
```

ni:

```text
FenceEpoch
    ⇒
Authority
```

La implementación debe ser interpretada únicamente dentro de las propiedades que sus pruebas efectivamente demuestren.

---

# 27. Estado de decisiones abiertas

La siguiente tabla permanece deliberadamente abierta cuando la especificación no congeló una decisión concreta:

| Decisión                       | Estado                                           |
| ------------------------------ | ------------------------------------------------ |
| Representación interna exacta  | Abierta físicamente                              |
| Firma exacta de minting        | Determinada durante implementación               |
| `MintError`                    | No requerido por defecto                         |
| `MintCapability`               | No adoptado en Model 1                           |
| Mecanismo exacto de capacidad  | No aplicable mientras Model 1 permanezca vigente |
| Visibilidad exacta             | Debe verificarse físicamente                     |
| Organización exacta de módulos | Guiada por la frontera aprobada                  |
| Estrategia completa de pruebas | Se determina durante B5–B8                       |
| `.stderr`                      | Solo puede generarse mediante compilación real   |

Una decisión abierta no debe resolverse por inercia.

---

# 28. Regla de no expansión

Durante la implementación queda prohibido utilizar una necesidad sintáctica del compilador como justificación para introducir una nueva decisión arquitectónica.

En particular:

```text
"Rust necesita X"
```

no significa:

```text
"FlowCore autorizó X"
```

Cuando una propiedad no esté suficientemente determinada:

```text
se detiene la materialización
```

en lugar de:

```text
inventar una representación
```

---

# 29. Relación con el histórico Commit #25

El Commit #25 constituye un antecedente histórico de la primera materialización física del dominio.

No se reescribe.

No se corrige retrospectivamente.

No se interpreta como si hubiera contenido originalmente la especificación 12.20.

La presente especificación pertenece a una fase posterior de trabajo y surge después de:

```text
D01–D08
A01
A02
A03
```

y de la posterior formalización de la frontera física de `FenceEpoch`.

Por tanto:

```text
Commit #25
    ≠
12.20
```

aunque ambos formen parte de la historia de materialización física de FlowCore.

---

# 30. A04-0

La especificación 12.20 fue sometida a una pre-auditoría documental A04-0.

Resultado:

```text
A04-0 — 🟢 APROBADA POR COHERENCIA DOCUMENTAL
```

La aprobación determinó que:

* la especificación es coherente con el Commit #13;
* es compatible con el contrato consolidado del Commit #22;
* respeta A01–A03;
* no reintroduce las semánticas eliminadas o delegadas;
* no introduce nueva ontología constitucional;
* conserva la distinción entre especificación y evidencia;
* conserva las restricciones de Hydra #109 y #111;
* mantiene diferidas las decisiones que permanecen abiertas;
* no existe un residuo documentado que obligue a modificar `State` o `Transition`.

A04-0 no constituye aprobación de la implementación física.

---

# 31. Estado de la fase física

Después de A04-0:

```text
D01–D08                 🔒 SELLADOS
Especificación          🔒 SELLADA
A01                     🟢 CERRADA
A02                     🟢 CERRADA
A03                     🟢 APROBADA

12.20                   📜 VIGENTE
A04-0                   🟢 APROBADA

Kernel                  🔒 CONGELADO
Implementación          🟢 AUTORIZADA
Evidencia               ⛔ PENDIENTE
A04                     🔬 PENDIENTE
```

---

# 32. Estado físico actual

La implementación física actualmente se encuentra en la siguiente frontera:

```text
B1 — Diseño físico mínimo
        🟢

B2 — FenceEpoch
        🟢

B3 — Frontera de minting
        🟢

B4 — Prueba positiva
        🟢

B5 — Ataques
        🔬 EN CURSO

B6 — Ejecución completa
        ⛔ PENDIENTE

B7 — Evidencia .stderr
        ⛔ PENDIENTE / solo evidencia real

B8 — Mutación G₀ → RED → G₁
        ⛔ PENDIENTE

A04 — Auditoría física
        🔬 PENDIENTE
```

---

# 33. Regla de cierre

La fase física 12.20 no se considera cerrada por:

```text
cargo check
```

ni por:

```text
cargo test
```

aisladamente.

El cierre requiere:

```text
implementación
    +
pruebas relevantes
    +
evidencia real
    +
interpretación correcta
    +
auditoría A04
```

Solo entonces podrá determinarse si las propiedades físicas pretendidas han sido realmente demostradas.

---

# 34. Principio rector

La disciplina de esta fase queda resumida en:

> **La Constitución precede al código.**

> **La especificación precede a la implementación.**

> **La implementación produce evidencia.**

> **La evidencia precede a la auditoría.**

Y, para la frontera de `FenceEpoch`:

> **La privacidad estructural puede demostrar una frontera de acceso; no puede por sí sola demostrar propiedades que nunca fueron definidas ni probadas.**

---

# 35. Cierre documental de 12.20

La incorporación de este documento al repositorio tiene un propósito de trazabilidad.

No crea una nueva Constitución.

No modifica el kernel.

No reabre D01–D08.

No reabre A01–A03.

No convierte decisiones arquitectónicas en ontología constitucional.

Formaliza únicamente la especificación física que precede a la implementación actualmente autorizada.

La frontera queda:

```text
CONSTITUCIÓN
     │
     ▼
ESPECIFICACIÓN
     │
     ▼
12.20
     │
     ▼
IMPLEMENTACIÓN
     │
     ▼
EVIDENCIA
     │
     ▼
A04
     │
     ▼
CIERRE FÍSICO
```

Mientras la evidencia no haya sido auditada:

```text
12.20 = VIGENTE
Implementación = EN VALIDACIÓN
A04 = PENDIENTE
```

---

## Estado final del documento

```text
Especificación 12.20       📜 VIGENTE
Constitución               🔒 CONGELADA
Kernel                     🔒 CONGELADO
A01                        🟢 CERRADA
A02                        🟢 CERRADA
A03                        🟢 APROBADA
A04-0                      🟢 APROBADA

B1                         🟢
B2                         🟢
B3                         🟢
B4                         🟢
B5                         🔬 EN CURSO

Evidencia física           🔬 EN GENERACIÓN
A04                        ⛔ PENDIENTE
Commit de cierre           ⛔ PENDIENTE
```

**Fin de la Especificación Física 12.20.**
