# Commit #6 — Modelo Logístico v1.1 y Fronteras del Dominio

**Proyecto:** Gudo Labs  
**Motor:** FlowCore  
**Estado:** Arquitectura conceptual consolidada  
**Versión del modelo:** v1.1  
**Naturaleza:** Architectural Milestone  
**Fecha:** Agosto 2026

---

## 1. Propósito

Este documento registra el cierre del Modelo Lógico de Información v1.1 de FlowCore.

El objetivo de esta etapa no es definir tablas, clases, APIs ni infraestructura técnica.

El objetivo es establecer qué realidad logística representa FlowCore, qué conceptos forman parte de su dominio y cuáles pertenecen al ecosistema empresarial externo.

La arquitectura se construye a partir de la realidad operacional y no a partir de una estructura tecnológica preconcebida.

---

# 2. Principio fundamental

> **FlowCore no busca administrar la empresa; busca comprender y optimizar su operación logística.**

FlowCore pertenece al dominio de la logística.

No pretende convertirse en:

- ERP
- CRM
- HCM / HR
- sistema contable
- sistema fiscal
- sistema financiero
- sistema de facturación
- plataforma de telemetría
- sistema de nómina
- sistema de cobranza

Puede integrarse con todos ellos cuando sea necesario para ejecutar correctamente una operación logística.

La integración no implica apropiación del dominio externo.

---

# 3. Frontera del dominio

FlowCore modela transformaciones logísticas.

Entre ellas:

- recibir
- almacenar
- surtir
- mover
- consolidar
- desconsolidar
- clasificar
- transferir
- cargar
- transportar
- entregar
- recolectar
- vender en ruta
- reabastecer
- retornar
- conciliar físicamente
- optimizar

La modalidad operacional puede cambiar.

La naturaleza logística permanece.

---

# 4. Modalidades soportadas

El modelo no está limitado a paquetería.

FlowCore debe poder representar operaciones como:

## Paquetería / Última Milla

Demand:
- Shipment

HandlingUnit:
- Package

Tasks:
- Pickup
- Sort
- Load
- Deliver
- Return

---

## CEDIS / Almacén

Demand:
- TransferRequest
- ReplenishmentRequest

HandlingUnit:
- Pallet
- Case
- Container

Tasks:
- Receive
- Putaway
- Pick
- Sort
- Load
- Transfer

---

## Crossdock

Demand:
- InboundManifest
- TransferRequest

HandlingUnit:
- Container
- Pallet
- Case

Tasks:
- Receive
- Unload
- Sort
- Consolidate
- Load
- Dispatch

---

## 3PL

Demand:
- ClientDemand
- Shipment
- TransferRequest

HandlingUnit:
- Variable

Tasks:
- Variable according to operational contract.

---

## Venta en Ruta

Demand:
- SalesDemand
- ReplenishmentRequest

Goods:
- Product
- InventoryUnit

HandlingUnit:
- Case
- Box
- Piece
- Other operational unit

Tasks:
- Visit
- Sell
- Deliver
- CollectReturn
- Replenish

FlowCore puede transportar y utilizar condiciones comerciales necesarias para ejecutar la operación.

La autoridad comercial permanece fuera de FlowCore.

---

# 5. Ley de abstracción logística

> **FlowCore modela transformaciones logísticas, no estructuras empresariales.**

Una empresa puede tener:

- clientes
- vendedores
- departamentos
- centros de costo
- cuentas contables
- empleados
- facturas
- políticas financieras

FlowCore no necesita convertirse en dueño de esas estructuras.

FlowCore necesita conocer solamente el contexto necesario para ejecutar la transformación logística.

---

# 6. Ley contra el centro universal

> **Ninguna entidad será elevada a centro universal del dominio cuando su existencia dependa de una modalidad logística particular.**

Por esta razón:

`Package` no es el centro del dominio.

`Route` tampoco.

`Order` tampoco.

La arquitectura utiliza conceptos más generales:

```text
Demand
Goods
HandlingUnit
Resource
Mission
Task
Stop
