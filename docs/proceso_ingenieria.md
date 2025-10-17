# Proceso de Ingeniería — Entrega 3

## Propósito
Definiremos de manera clara y sencilla lo que haremos desde que una tarjeta está **Ready** hasta que queda **Done** en `main`, incorporando BDD para nuevas funcionalidades y manteniendo TDD para corrección de bugs.

## Alcance
Aplicaremos el tablero Kanban: **Backlog → Ready → In-Progress → In Review → Done**, ya definido. Las ceremonias que vamos a llevar a cabo se encuentran en `docs/kanban_y_roles.md`.

**NUEVO para E3**: 
- Incorporación de BDD (Behavior Driven Development) para nuevas funcionalidades
- Proceso de Discovery con Example Mapping y los Tres Amigos (PO, Desarrollador, Tester)
- Pipeline CI/CD expandido para incluir BDD scenarios y tests E2E

## Flujo paso a paso

** A CHEQUEAR **

### Para NUEVAS FUNCIONALIDADES (BDD-first): 

1) **Discovery (Los Tres Amigos)**
   - **Example Mapping Session** (25 min máximo):
     - Historia (amarilla): "Como... Quiero... Para..."
     - Reglas (azules): Criterios de aceptación 
     - Ejemplos (verdes): Casos concretos por regla (min 2: positivo/negativo)
     - Preguntas (rojas): Resolver antes de continuar
   - **Salida**: Reglas claras, ejemplos concretos, cero preguntas pendientes

2) **Formulation (si justificado)**
   - Traducir ejemplos a escenarios Gherkin
   - **Feature/Rule/Scenario** estructura
   - Lenguaje de dominio, no técnico
   - Validar con los Tres Amigos antes de implementar

3) **BDD Frontend-First**
   - **[BDD-RED]**: Escribir escenarios Cypress que fallen
   - **[BDD-GREEN]**: Implementación mínima UI para pasar escenarios  
   - **[BDD-REFACTOR]**: Mejorar UX/código frontend manteniendo comportamiento

4) **TDD Backend (Supporting Frontend)**
   - **[TDD-RED]**: Tests unitarios que fallen basados en contratos frontend
   - **[TDD-GREEN]**: Implementación mínima lógica de negocio
   - **[TDD-REFACTOR]**: Refactorización técnica

### Para CORRECCIÓN DE BUGS (TDD-only):

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

3) **TDD**
   - **Red:** escribir test que falla.
   - **Green:** implementación mínima para hacerlo pasar.
   - **Refactor:** mejorar nombres/estructura con tests verdes.
   - **REGLA**: No debe haber actualizaciones de código sin tests que lo respalden
   - Repetiremos este proceso hasta cubrir criterios de aceptación.

4) **Verificación local con Pipeline**
   - **BDD**: `npm run cypress:run` - escenarios deben pasar
   - **TDD**: `dotnet test` - tests unitarios al 100%
   - **Build**: `dotnet build` y `npm run build` exitosos
   - **Cobertura**: Mantener ≥85% en backend
   - **Formateo**: Estándares aplicados automáticamente
   - **E2E**: Validar comportamiento completo si es feature nueva

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
