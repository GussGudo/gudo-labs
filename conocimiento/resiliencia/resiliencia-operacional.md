	# Resiliencia Operacional

## Propósito

La operación logística ocurre en un entorno físico imperfecto.

FlowCore debe considerar que pueden existir condiciones que impidan
el funcionamiento normal de los sistemas o alteren la ejecución de
una operación.

## Factores externos

Ejemplos:

- lluvia;
- inundaciones;
- accidentes;
- tráfico;
- bloqueos;
- obras;
- cortes eléctricos;
- pérdida de conectividad;
- restricciones temporales;
- eventos extraordinarios.

## Principio fundamental

> La operación no ocurre dentro del software. El software debe sobrevivir a las condiciones donde ocurre la operación.

## Offline-first

Las aplicaciones operacionales críticas deben poder continuar
funcionando con conectividad limitada o inexistente.

La aplicación debe conservar localmente la información necesaria
para ejecutar las actividades autorizadas.

Los eventos generados durante un periodo offline deben conservar:

- tipo de evento;
- momento de captura;
- ubicación;
- origen;
- contexto operacional;
- estado de sincronización.

Cuando la conectividad sea restablecida, los eventos deberán
sincronizarse y conservar su trazabilidad.

## Degradación controlada

La pérdida de una dependencia no debe provocar automáticamente
la pérdida total de la operación.

El sistema debe poder degradar sus capacidades de forma controlada:

ONLINE
→ CONECTIVIDAD DEGRADADA
→ OFFLINE
→ OPERACIÓN LOCAL
→ RECUPERACIÓN
→ SINCRONIZACIÓN

## Aprendizaje

Las interrupciones no solamente representan fallas.

También constituyen información para:

- identificar patrones;
- conocer zonas vulnerables;
- mejorar la planeación;
- mejorar las aplicaciones;
- estimar riesgos;
- desarrollar estrategias de recuperación.

## Principio

> Un sistema resiliente no es aquel que nunca falla; es aquel que puede continuar operando, recuperarse y aprender cuando algo falla.
