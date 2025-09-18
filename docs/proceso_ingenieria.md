# Proceso de Ingeniería — Entrega 1

## Propósito
Definiremos de manera clara y sencilla lo que haremos desde que una tarjeta está **Ready** hasta que queda **Done** en `main`.

## Alcance
Aplicaremos el tablero Kanban: **Backlog → Ready → In-Progress → In Review → Done**, ya definido. Las ceremonias que vamos a llevar a cabo se encuentran en `docs/kanban_y_roles.md`.

## Flujo paso a paso

1) **Tomar tarjeta (Ready)**
   - Confirmar que cumple Definition of Ready [DoR](reglas_de_trabajo_y_configuracion_repo.md#definition-of-ready-dor).
   - Si falta informacion, esa tarjeta no pasara a **In-Progress**. La misma sera llevada a Backlog o se definira con el PO que se hace en ese caso.

2) **Diseño mínimo**
   - Identificar el impacto que tendria en los módulos/archivos existentes, osea que tanto van a ser modificados.
   - Seleccionar 2–3 casos de prueba clave.
   - En base a los primeros dos puntos, defino la ruta (según tamaño y riesgo); puede ser rapida, que seria para cambios chicos y acotados o con revision, que seria para cambios medianos/grandes con cierto impacto el cual requiere revision formal (1 aprobacion).

3) **TDD**
   - **Red:** escribir test que falla.
   - **Green:** implementación mínima para hacerlo pasar.
   - **Refactor:** mejorar nombres/estructura con tests verdes.
   - Repetiremos este proceso hasta cubrir criterios de aceptación.

4) **Verificación local**
   - Luego de haber cubierto los criterios de aceptacion, probamos que el proyecto compile/corra localmente, de manera correcta.
   - Los tests mas relevantes quedaran en GREEN ya refactorizados.
   - Presentaremos una evidencia breve (pasos o captura de pantalla) para que quede registrado.

5) **Integración (trunk-based)**
   - Si estamos frente a una ruta rapida, usamos rama corta desde `main` (`feat/*`, `fix/*`, `chore/*`).
   - Si estamos frente a una ruta con revision, abriremos un PR y linkeamos la tarjeta al Project.
   - Haremos uso de PRs pequeños y frecuentes, evitando asi ramas largas.

6) **Cierre**
   - Merge a `main`.
   - Actualizar docs si cambió algo visible.
   - Mover tarjeta a **Done**.

## Definición operativa de “despliegue” en E1
Para esta entrega, “desplegado” = **integrado en `main`** con DoD cumplida.
