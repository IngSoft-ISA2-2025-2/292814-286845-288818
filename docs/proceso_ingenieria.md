# Proceso de Ingeniería — Entrega 4

## Propósito
Definiremos de manera clara y sencilla lo que haremos desde que una tarjeta está **Ready** hasta que queda **Done** en `main`.

## Alcance
Aplicaremos el tablero Kanban: **Backlog → Ready → In-Progress → In Review → Done**, ya definido. Las ceremonias que vamos a llevar a cabo se encuentran en `docs/kanban_y_roles.md`.

**NUEVO**: Todos los cambios deben pasar por el pipeline CI/CD automatizado que incluye build, tests, cobertura y formateo de código (ver carpeta .github/workflows).

## Adaptación de Procesos para Behavior-Driven Development (BDD)

En la Entrega 3, el equipo adoptó **Behavior-Driven Development (BDD)** como metodología central para el desarrollo del sistema de reservas de medicamentos.

BDD se integró en cada fase del flujo de trabajo, modificando tanto los procesos de gestión como los de ingeniería:

## Flujo paso a paso

1) **Tomar tarjeta (Ready)**
   - Confirmar que cumple Definition of Ready [DoR](reglas_de_trabajo_y_configuracion_repo.md#definition-of-ready-dor).
   - Si falta informacion, esa tarjeta no pasara a **In-Progress**. La misma sera llevada a Backlog o se definira con el PO que se hace en ese caso.

2) **Diseño mínimo**
   - Identificar el impacto que tendria en los módulos/archivos existentes, osea que tanto van a ser modificados.
   - Seleccionar 2–3 casos de prueba clave.
   - Estimar impacto en cobertura de código (debe mantenerse ≥85%).
   - **Selección de tipo de rama** según naturaleza del cambio:
     - **`feature/*`**: Nuevas funcionalidades o mejoras
     - **`bugfix/*`**: Corrección de bugs identificados
     - **`hotfix/*`**: Fixes urgentes que requieren atención inmediata
     - **`chore/*`**: Tareas de mantenimiento, refactoring, o mejoras técnicas

3) **Ciclo BDD**
   El proceso TDD tradicional se extendió para incluir BDD en las pruebas E2E:

**Flujo de trabajo integrado**:

1. **Especificación (BDD)**: 
   - Crear/actualizar archivo `.feature` con escenarios Gherkin
   - Ubicación: `Frontend/cypress/e2e/{feature-name}/{feature-name}.feature`
   - Ejemplo: `create-reservation.feature`, `manage-reservation.feature`

2. **Step Definitions (BDD - Red)**:
   - Implementar step definitions en archivo `.steps.js`
   - Vincular cada paso Gherkin con acciones de Cypress
   - Ejecutar prueba E2E → **debe fallar** (no hay implementación)

3. **Tests Unitarios (TDD - Red)**:
   - Escribir tests unitarios para backend (.NET) y frontend (Angular/Jasmine)
   - Ejecutar `dotnet test` y `npm test` → **deben fallar**

4. **Implementación Backend (TDD - Green)**:
   - Implementar lógica mínima en C# para pasar tests unitarios
   - Estructura: `Manager → DataAccess → Domain`
   - Validar con `dotnet test`

5. **Implementación Frontend (TDD - Green)**:
   - Implementar componentes Angular y servicios
   - Validar con tests Jasmine/Karma
   - Asegurar `data-cy` attributes para selectores Cypress

6. **Validación E2E (BDD - Green)**:
   - Ejecutar tests Cypress con `npx cypress open`
   - Verificar que todos los escenarios Gherkin pasen
   - Confirmar flujo completo usuario-sistema

7. **Refactor**:
   - Mejorar código con tests verdes (unitarios y E2E)
   - Eliminar duplicación
   - Optimizar selectores y step definitions compartidos

**Regla fundamental**: Ningún código se integra sin que tanto los tests unitarios como los escenarios BDD estén en verde.

4) **Verificación local con Pipeline**
    - **Tests locales**: Ejecutar `dotnet test` - deben pasar al 100%
    - **Frontend**:
       - `npm test`  # Tests unitarios Jasmine
       - `npx cypress open`  # Tests E2E BDD (ejecución manual)
    - **Cobertura local**: Verificar que se mantiene ≥85%
    - **Build local**: Confirmar que `dotnet build` es exitoso
    - **Formateo**: Aplicar estándares de código definidos
    - **Evidencia**: Captura de pantalla de tests pasando y cobertura

5) **Integración con Develop (Git Flow)**

   **Todas las ramas → develop (SIN aprobación requerida):**
   - Rama desde `develop` (`feature/*`, `bugfix/*`, `hotfix/*`, `chore/*`)
   - **Pull Request a `develop`** con verificaciones básicas:
     -  Tests locales pasan
     -  Build exitoso  
     -  Cobertura mantenida
   - **Merge directo** tras verificación - NO requiere aprobación
   - Todas las features se integran libremente en `develop`

   **Develop como rama de integración:**
   - `develop` actúa como rama de **pre-producción**
   - Integración continua de todas las ramas surgidas desde develop
   - Testing manual y validación de estabilidad
   - Preparación para release hacia `main`

6) **Despliegue a Main con Pipeline CI/CD (única ruta con revisión)**

   **Merge develop → main (con 1 aprobación requerida):**
   
   **Criterios para mergear develop → main:**
   - **Todas las features completadas** están en `develop`
   - **Testing manual exitoso** en entorno develop
   - Ejecución completa de suite Cypress por el equipo
   - Validación del PO sobre escenarios implementados
   - **Estabilidad confirmada** - sin bugs críticos
   - **Sprint/Release completado** según planificación

## Definición operativa de "despliegue" en E2

Para esta entrega, "desplegado" = **integrado en `main`** con:
- **Desarrollo completado** en ramas surgidas desde develop
- **Integración libre** en `develop` (sin aprobación)
- **Testing manual** en entorno develop
- **Revisión y aprobación** para merge develop → main
- **Pipeline CI/CD exitoso** con todos los gates de calidad
- **DoD cumplida**


