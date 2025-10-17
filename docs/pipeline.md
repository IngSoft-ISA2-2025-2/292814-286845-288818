# Pipeline CI/CD - Configuración y Procesos

## Introducción

El pipeline CI/CD está diseñado para garantizar la calidad del código y automatizar la validación antes de la integración a producción. Implementa un enfoque de Git Flow donde todas las ramas se integran libremente a `develop`, pero el merge a `main` requiere validación exhaustiva.

## Arquitectura del Pipeline

### Backend Workflows
- **backend-build.yml**: Compilación y verificación de dependencias
- **backend-unit-test.yml**: Ejecución de tests unitarios TDD
- **backend-code-coverage.yml**: Validación de cobertura mínima (85%)
- **backend-formatting.yml**: Verificación de estándares de código

### Frontend Workflows (BDD + UI)
- **frontend-build.yml**: Compilación y build de aplicación Angular
- **frontend-formatting.yml**: Validación de estándares de código frontend
- **frontend-bdd-tests.yml**: Ejecución de escenarios Cypress BDD
- **frontend-unit-tests.yml**: Tests unitarios de componentes


### Workflow de Integración
- **main-merge.yml**: Orquestación completa para merges a `main`

## Flujo de Validación por Ramas

### Integración a Develop
**Activación**: Pull Request hacia `develop`  
**Validaciones Automáticas**:
- Build exitoso (backend + frontend)
- Tests unitarios TDD pasando
- Escenarios BDD básicos (smoke tests)
- Formateo de código correcto

**Proceso Manual**:
- Revisión técnica opcional
- Merge directo sin aprobaciones requeridas

### Integración a Main
**Activación**: Pull Request desde `develop` hacia `main`  
**Validaciones Automáticas**:
- **Backend**: Build + tests TDD + cobertura ≥85%
- **Frontend**: Build + tests unitarios + escenarios BDD Cypress- Tests unitarios con 100% de éxito
- Cobertura de código ≥ 85%
- Estándares de formateo aplicados

**Proceso Manual**:
- Revisión de código obligatoria (1 aprobación)
- Validación de criterios de aceptación BDD
- Verificación de commits etiquetados ([BDD-*]/[TDD-*])
- Validación de criterios de aceptación
- Verificación de documentación actualizada

## Gates de Calidad

### Criterios de Bloqueo
El pipeline bloquea automáticamente el merge si:
- Falla la compilación de cualquier componente
- Algún test unitario no pasa
- La cobertura de código cae por debajo del 90%
- El código no cumple con los estándares de formateo

### Métricas de Seguimiento
- **Build Success Rate**: Porcentaje de builds exitosos
- **Test Coverage**: Tendencia de cobertura de código
- **Mean Time to Merge**: Tiempo promedio desde PR hasta merge
- **Failed Pipeline Recovery**: Tiempo de resolución de pipelines fallidos

## Integración con el Proceso de Desarrollo

### Responsabilidades del Desarrollador

**Para Nuevas Funcionalidades (BDD+TDD)**:
- Ejecutar escenarios BDD: `npm run cypress:run`
- Ejecutar tests TDD: `dotnet test`
- Verificar build completo: `dotnet build` + `npm run build`
- Validar cobertura ≥85%
- Confirmar integración E2E funcionando

**Para Bugs (TDD)**:
- Ejecutar tests unitarios: `dotnet test`
- Verificar build: `dotnet build`
- Aplicar formateo: `dotnet format`
- Confirmar cobertura adecuada
- Confirmar que el bug se reproduce y se corrige

### Responsabilidades del Revisor

**Para merges a `main`**:
- Validar pipeline completamente verde (BDD+TDD+E2E)
- Revisar commits etiquetados correctamente
- Verificar que comportamiento BDD cumple criterios de aceptación
- Confirmar trazabilidad con Discovery/Example Mapping
- Validar estándares arquitectónicos mantenidos

## Configuración Técnica

### Triggers
- **Push a develop**: Validación básica (build + tests unitarios + BDD smoke)
- **Pull Request a main**: Pipeline completo BDD+TDD+E2E
- **Merge a main**: Validación final y despliegue

### Stack Tecnológico BDD

**Discovery & Formulation**:
- Example Mapping (físico/digital)
- Gherkin para especificaciones (.feature files)

**Automation**:
- **Frontend BDD**: Cypress + Cucumber integration
- **Backend TDD**: MSTest + Moq (.NET)
- **E2E Integration**: Cypress end-to-end scenarios

**Reporting**:
- Living Documentation generada desde .feature files
- Reportes de cobertura TDD automatizados
- Dashboard de escenarios BDD (pasando/fallando)

## Beneficios del Pipeline

**Para el Equipo**:
- Feedback inmediato sobre calidad del código
- Prevención de regresiones antes de integración
- Proceso consistente independiente del desarrollador

**Para el Producto**:
- Rama `main` siempre en estado deployable
- Calidad de código garantizada automáticamente
- Trazabilidad completa de cambios validados

**Para el Proceso**:
- Reducción de tiempo en revisiones manuales
- Automatización de tareas repetitivas de validación
- Métricas objetivas de calidad del desarrollo

## Mantenimiento y Evolución

El pipeline se revisa y ajusta según:
- Cambios en la arquitectura del proyecto
- Nuevos requisitos de calidad identificados
- Optimizaciones de tiempo de ejecución
- Feedback del equipo sobre eficiencia del proceso

Esta configuración asegura que cada línea de código integrada en `main` ha pasado por validación automatizada completa, manteniendo la estabilidad del producto mientras permite desarrollo ágil en `develop`.