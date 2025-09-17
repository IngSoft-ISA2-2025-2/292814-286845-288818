# Proceso de Ingeniería — Entrega 1

## Propósito
Definir, de forma simple, qué hacemos desde que una tarjeta está **Ready** hasta que queda **Done** en `main`.

## Alcance
Aplica al flujo del tablero **Backlog → Ready → In-Progress → In Review → Done**. Las ceremonias están en `docs/kanban_y_roles.md`.

## Flujo paso a paso

1) **Tomar tarjeta (Ready)**
   - Confirmar que cumple DoR (ver CONTRIBUTING: DoR).
   - Si falta info, no se arranca; se devuelve a Backlog o se aclara con el PO.

2) **Diseño mínimo (≤15 min)**
   - Identificar impacto (módulos/archivos).
   - Enumerar 2–3 casos de prueba clave.
   - Elegir **ruta** según tamaño/riesgo:
     - **Ruta rápida** (S / bajo riesgo): pairing breve, PR chico.
     - **Ruta con revisión** (M+ / sensible): PR con 1 aprobación.

3) **TDD — ciclos cortos**
   - **Red:** escribir test que falla.
   - **Green:** implementación mínima para hacerlo pasar.
   - **Refactor:** mejorar nombres/estructura con tests verdes.
   - Repetir hasta cubrir criterios de aceptación.

4) **Verificación local**
   - Compila/corre local.
   - Tests relevantes en verde.
   - Evidencia breve (pasos o captura si aplica).

5) **Integración (trunk-based)**
   - Rama **corta** desde `main` (`feat/*`, `fix/*`, `chore/*`).
   - Abrir **PR** y **linkear la tarjeta** del Project.
   - PRs **pequeños y frecuentes** (evitar ramas largas).

6) **Revisión (cuando corresponde)**
   - **Ruta rápida**: mirada rápida (≤10 min) / pairing; si hay observaciones, se corrige.
   - **Ruta con revisión**: **1 aprobación** obligatoria de otra persona.

7) **Cierre**
   - Merge a `main`.
   - Actualizar docs si cambió algo visible (README/decisión breve).
   - Mover tarjeta a **Done**.

## Tabla guía — Rutas de integración
| Tamaño/Riesgo | Revisión | Requisitos |
|---|---|---|
| **S / bajo** | Pairing breve o mirada rápida | TDD aplicado; PR chico; evidencias mínimas |
| **M+ / sensible** | 1 aprobación obligatoria | TDD; impacto revisado; docs si aplica |

## Definición operativa de “despliegue” en E1
Para esta entrega, “desplegado” = **integrado en `main`** con DoD cumplida.
