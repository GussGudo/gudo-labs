# Routing Port

## Propósito

FlowCore no debe depender directamente de un proveedor específico
de mapas o routing.

El acceso a capacidades de routing debe realizarse mediante un
contrato abstracto.

## Responsabilidades

El puerto de routing podrá contemplar capacidades como:

- cálculo de rutas;
- cálculo de matrices;
- estimación de tiempos;
- alternativas de ruta;
- validación de accesibilidad;
- evaluación de restricciones.

## Implementaciones

Una implementación puede utilizar:

- OSRM;
- GraphHopper;
- Valhalla;
- otros motores.

## Principio

> Ningún proveedor externo debe convertirse en la esencia de FlowCore.

Los proveedores son adaptadores.

FlowCore conserva la responsabilidad sobre la lógica del dominio.
