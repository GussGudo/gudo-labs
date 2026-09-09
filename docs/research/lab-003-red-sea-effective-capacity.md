# 🚢 LAB-003 — Crisis del Mar Rojo y capacidad efectiva de la red marítima

## Laboratorio de Realidad Operacional — Gudo Labs

**Proyecto:** Gudo Labs
**Laboratorio:** Realidad Operacional
**Caso:** LAB-003
**Título:** Crisis del Mar Rojo — Suez, Cabo de Buena Esperanza y capacidad efectiva
**Dominio experimental:** Transporte marítimo internacional y capacidad de red
**Estado:** 🟢 CASO HISTÓRICO FORMALIZADO
**Relación con FlowCore:** 🟡 SIN IMPACTO CONSTITUCIONAL DEMOSTRADO
**Implementación FlowCore:** 🔒 SIN CAMBIOS

---

# 1. Pregunta de investigación

¿Puede una perturbación que prolonga el tiempo de tránsito de activos existentes reducir la capacidad efectiva de una red sin reducir necesariamente la cantidad física de activos disponibles?

La investigación estudia la diferencia entre:

```text
EXISTENCIA FÍSICA DE ACTIVOS
          ≠
DISPONIBILIDAD OPERACIONAL
          ≠
CAPACIDAD EFECTIVA DE RED
```

La pregunta no presupone una deficiencia particular del sistema de planificación.

Busca determinar qué ocurre con la capacidad operacional de una red cuando los activos deben recorrer rutas significativamente más largas para mantener un servicio equivalente.

---

# 2. Contexto histórico

Durante la crisis de seguridad iniciada en el Mar Rojo a finales de 2023, numerosas navieras desviaron servicios que anteriormente atravesaban el Canal de Suez hacia la ruta alrededor del Cabo de Buena Esperanza.

UNCTAD documentó que, para mediados de 2024, el tonelaje que transitaba por el Canal de Suez había disminuido aproximadamente 70% respecto de finales de 2023, mientras que el tonelaje de buques que llegaban al Golfo de Adén había disminuido aproximadamente 76%.

Durante el mismo período, las llegadas de capacidad de buques al Cabo de Buena Esperanza aumentaron aproximadamente 89%.

La perturbación no produjo únicamente un cambio geográfico de ruta.

Produjo un cambio en el tiempo durante el cual los activos permanecían comprometidos dentro del sistema.

---

# 3. Diferencia de ruta

UNCTAD presenta el siguiente ejemplo para una ruta Shenzhen–Rotterdam:

```text
VÍA SUEZ

≈ 10,000 millas náuticas
≈ 31 días


VÍA CABO DE BUENA ESPERANZA

≈ 13,000 millas náuticas
≈ 41 días
```

La modificación representa aproximadamente:

```text
+3,000 millas náuticas
+10 días de tránsito
```

por tramo.

La magnitud exacta depende de la ruta, velocidad, puertos involucrados y condiciones operativas; por tanto, estas cifras deben interpretarse como el caso de referencia utilizado por UNCTAD y no como una constante universal.

---

# 4. Efecto sobre la capacidad de servicio

El fenómeno puede representarse conceptualmente como:

```text
RUTA MÁS LARGA
       ↓
TIEMPO DE ROTACIÓN ↑
       ↓
ACTIVO OCUPADO DURANTE MÁS TIEMPO
       ↓
MENOR DISPONIBILIDAD EFECTIVA
       ↓
MÁS ACTIVOS NECESARIOS
PARA MANTENER LA MISMA FRECUENCIA
```

UNCTAD proporciona un ejemplo particularmente ilustrativo.

Una rotación India–Europa de:

```text
56 días → 8 buques
```

pasa a:

```text
63 días → 9 buques
```

si el servicio pretende mantener la misma frecuencia.

UNCTAD estimó además que la prolongación de los tiempos de tránsito podía reducir aproximadamente 9% la capacidad efectiva global de transporte de contenedores.

---

# 5. Demanda adicional de activos

El desvío alrededor del Cabo no implicó simplemente recorrer más distancia.

También modificó la cantidad de capacidad flotante necesaria para sostener los servicios existentes.

UNCTAD, utilizando datos de Clarksons Research, estimó que para mediados de 2024 el desvío de buques alrededor del Cabo de Buena Esperanza había incrementado:

```text
Demanda global de buques:
≈ +3%

Demanda de buques portacontenedores:
≈ +12%
```

Estas cifras representan demanda adicional asociada al aumento de ton-millas provocado por el desvío.

---

# 6. Propagación hacia la red terrestre

La perturbación marítima no permaneció confinada al tramo oceánico.

UNCTAD documentó efectos secundarios asociados con:

* llegadas fuera de programación;
* congestión portuaria;
* necesidad de reposicionar contenedores vacíos;
* aumento de costos;
* mayores tiempos de tránsito;
* presión sobre hubs de transbordo;
* alteración de la capacidad disponible.

La propia UNCTAD señala que el desvío alrededor del Cabo provocó presión adicional sobre puertos y generó problemas logísticos derivados de llegadas fuera de horario y reposicionamiento de contenedores vacíos.

Por tanto, el fenómeno estudiado no debe modelarse exclusivamente como:

```text
ORIGEN → DESTINO
```

sino como una perturbación que atraviesa múltiples nodos de una red:

```text
BUQUE
  ↓
RUTA
  ↓
PUERTO
  ↓
TRANSBORDO
  ↓
CONTENEDORES
  ↓
RED TERRESTRE
```

---

# 7. Distinción central del caso

LAB-003 identifica una diferencia entre:

```text
CAPACIDAD NOMINAL
```

y:

```text
CAPACIDAD EFECTIVA
```

Un sistema puede conservar físicamente los mismos activos y, sin embargo, disponer de menos capacidad efectiva para prestar el mismo nivel de servicio.

Formalmente:

```text
CAPACIDAD FÍSICA
       ↓
TIEMPO DE OCUPACIÓN
       ↓
DISPONIBILIDAD
       ↓
CAPACIDAD EFECTIVA
```

El fenómeno no requiere que desaparezcan activos.

Es suficiente con que los activos permanezcan ocupados durante más tiempo.

---

# 8. Observación histórica

El caso permite establecer como observación histórica:

> **Una perturbación de ruta puede reducir la capacidad efectiva de una red al incrementar el tiempo de ciclo de los activos que la integran.**

Esta afirmación está respaldada por la evidencia histórica de la crisis del Mar Rojo y por el mecanismo documentado por UNCTAD.

---

# 9. Hipótesis operacional

A partir de la evidencia se formula la siguiente hipótesis:

> **Cuando una red mantiene una frecuencia de servicio determinada y una perturbación incrementa el tiempo de ciclo de sus activos, la capacidad efectiva disponible puede disminuir y requerir capacidad adicional para conservar el mismo nivel de servicio.**

La hipótesis es compatible con el ejemplo histórico:

```text
56 días / 8 buques
        ↓
63 días / 9 buques
```

pero no debe generalizarse automáticamente a cualquier red, servicio o activo.

---

# 10. Variables relevantes

El caso permite identificar las siguientes variables:

```text
Tiempo de tránsito
Tiempo de rotación
Frecuencia de servicio
Número de activos
Capacidad por activo
Disponibilidad efectiva
Demanda
Congestión
Capacidad portuaria
Disponibilidad de contenedores
```

Una representación simplificada es:

```text
T_rotación ↑
     ↓
Disponibilidad ↓
     ↓
Capacidad efectiva ↓
     ↓
Necesidad de activos ↑
```

---

# 11. Qué demuestra el caso

LAB-003 proporciona evidencia histórica de que:

1. una modificación de ruta puede incrementar significativamente la distancia recorrida;
2. el incremento de distancia puede aumentar el tiempo de tránsito;
3. el aumento del tiempo de tránsito puede aumentar el tiempo de rotación;
4. mantener la frecuencia de servicio puede requerir activos adicionales;
5. el efecto puede manifestarse como una reducción de capacidad efectiva;
6. la perturbación puede propagarse hacia puertos y otros nodos de la red.

Estos mecanismos están documentados por UNCTAD en el contexto de la crisis del Mar Rojo y otros chokepoints marítimos.

---

# 12. Qué NO demuestra el caso

LAB-003 no demuestra que:

```text
❌ toda perturbación de ruta reduzca necesariamente la capacidad efectiva;
❌ exista una fórmula universal para calcular la capacidad efectiva;
❌ el tiempo de tránsito sea la única variable relevante;
❌ la congestión portuaria tenga una única causa;
❌ la crisis del Mar Rojo pueda explicarse únicamente por el desvío;
❌ todos los servicios necesiten el mismo número adicional de buques;
❌ exista una nueva entidad necesaria para representar el fenómeno;
❌ FlowCore necesite incorporar este fenómeno al kernel.
```

El caso histórico es multicausal.

UNCTAD identifica simultáneamente las perturbaciones del Mar Rojo/Suez, las restricciones del Canal de Panamá, la evolución de la demanda y otros cambios de la red marítima como factores relevantes.

---

# 13. Evidencia descartada

Durante la auditoría inicial se identificaron algunas cifras que no deben formar parte del caso formal sin una fuente específica suficientemente sólida.

Se excluyen:

```text
1.8 millones TEU adicionales inmovilizados
<0.7% de flota idle
+40–50% de consumo de bunker por viaje
10–11 millones de toneladas adicionales de CO₂
```

Estas cifras no se incorporan al expediente porque no son necesarias para demostrar la pregunta principal y no cuentan con respaldo suficiente dentro del conjunto de fuentes utilizado para este laboratorio.

La ausencia de una cifra no afecta la validez del fenómeno principal.

---

# 14. Evidencia primaria

La fuente principal del expediente es:

**UNCTAD — Review of Maritime Transport 2024: Navigating maritime chokepoints.**

El informe documenta:

```text
≈ -70% tonelaje por Suez
≈ -76% tonelaje por Golfo de Adén
≈ +89% llegadas al Cabo de Buena Esperanza
≈ +3% demanda global de buques
≈ +12% demanda de portacontenedores
≈ 10,000 nm / 31 días vía Suez
≈ 13,000 nm / 41 días vía Cabo
```

y describe los efectos de las rutas prolongadas sobre costos, congestión y capacidad.

Como fuente complementaria se utiliza el análisis de UNCTAD publicado en abril de 2024, que documenta:

```text
56 días → 8 buques
63 días → 9 buques
≈ 9% reducción de capacidad efectiva global
```

para ilustrar el mecanismo de extensión del ciclo.

---

# 15. Estado epistemológico

```text
DATOS HISTÓRICOS
        🟢
        ↓
MECANISMOS OBSERVADOS
        🟢
        ↓
INTERPRETACIÓN OPERACIONAL
        🟢
        ↓
GENERALIZACIÓN UNIVERSAL
        🔴 NO AUTORIZADA
```

El laboratorio conserva la diferencia entre:

```text
DATO
  ≠
INTERPRETACIÓN
  ≠
HIPÓTESIS
  ≠
LEY UNIVERSAL
```

---

# 16. Relación con LAB-001 y LAB-002

LAB-003 presenta una relación conceptual interesante con los casos anteriores:

```text
LAB-001
Capacidad nominal
      ≠
Viabilidad operacional


LAB-002
Distancia individual
      ≠
Rendimiento sistémico


LAB-003
Activos existentes
      ≠
Capacidad efectiva
```

Los tres casos sugieren una familia común de preguntas sobre sistemas logísticos:

```text
MÉTRICA AGREGADA
       ↓
¿REPRESENTA REALMENTE
LA CAPACIDAD OPERACIONAL?
       ↓
INVESTIGAR
```

Sin embargo, esta semejanza no constituye por sí misma una nueva teoría ni una nueva entidad de FlowCore.

---

# 17. Impacto sobre FlowCore

Estado actual:

```text
🟢 NINGÚN IMPACTO CONSTITUCIONAL DEMOSTRADO
```

LAB-003 no modifica:

```text
State<C>
Transition<C,L,A,E>
FenceEpoch
NormativeContent
DomainLaw
```

No crea:

```text
❌ nueva entidad
❌ nuevo tipo
❌ nueva relación constitutiva
❌ nueva especificación
❌ nueva regla constitucional
```

El caso permanece dentro del:

```text
CONOCIMIENTO OPERACIONAL
```

y no cruza hacia:

```text
CONSTITUCIÓN DE FLOWCORE
```

---

# 18. Resultado

LAB-003 establece como resultado provisional:

> **La crisis del Mar Rojo constituye un caso histórico documentado en el que la prolongación de las rutas marítimas incrementó los tiempos de tránsito y la demanda de capacidad de buques, reduciendo la capacidad efectiva disponible para mantener determinados servicios y generando efectos secundarios sobre otros nodos de la red logística.**

Esta conclusión está respaldada por la evidencia histórica recopilada, pero permanece limitada al fenómeno observado y no se transforma en una regla universal.

---

# 19. Estado final del laboratorio

```text
LAB-003
│
├── Pregunta                    🟢 DEFINIDA
├── Contexto histórico          🟢 DOCUMENTADO
├── Datos                       🟢 DISPONIBLES
├── Fuentes                     🟢 AUDITADAS
├── Mecanismo                   🟢 DOCUMENTADO
├── Hipótesis                   🟢 FORMULADA
├── Generalización universal    🔴 NO AUTORIZADA
├── Impacto sobre FlowCore      🟢 NINGUNO DEMOSTRADO
└── Estado                      🟢 FORMALIZADO
```

---

# 20. Principio extraído

El caso permite conservar una observación operacional:

> **La capacidad de una red no depende únicamente de cuántos activos existen, sino también del tiempo durante el cual dichos activos permanecen comprometidos dentro del sistema.**

Y:

> **La existencia física de capacidad no implica necesariamente disponibilidad operacional de esa capacidad.**

Estas observaciones pertenecen al laboratorio de realidad operacional.

No constituyen todavía una decisión constitucional de FlowCore.

---

# 21. Estado del proyecto

```text
GUDO LABS
    │
    ├── LAB-001
    │     └── 🟢 Formalizado
    │
    ├── LAB-002
    │     └── 🟡 Diseñado / sin datos
    │
    └── LAB-003
          └── 🟢 Formalizado
                 │
                 ▼
          CASO HISTÓRICO
                 │
                 ▼
          SIN IMPACTO DEMOSTRADO
                 │
                 ▼
          FLOWCORE EN REPOSO
```

---

# 22. Regla de cierre

LAB-003 no ordena continuar investigando.

No ordena crear LAB-004.

No ordena modificar FlowCore.

No ordena implementar código.

El caso queda disponible como conocimiento histórico para futuras investigaciones.

```text
LAB-003
   ↓
CONOCIMIENTO
   ↓
REPOSO
```

**El caso queda formalizado.**

**La evidencia histórica queda preservada.**

**FlowCore permanece en reposo.**

🐉🔬🏛️🚢

**Fin de LAB-003.**
