# Reglas de trabajo y configuración del repositorio

> En este documento hablaremos sobre: DoR, CA, DoD, buenas prácticas, branching, commits, nomenclatura y estructura.

## Estructura de carpetas
- `docs/` — proceso, kanban, calidad/deuda, actas
- `Obligatorio/Material/` — código fuente de la solución (API .NET y app Angular), base de datos y documentacion

## Definition of Ready (DoR)
**Descripción Clara**
- La tarjeta en el tablero debe tener una descripción completa de lo que se necesita construir, redactada en el formato 

### Para NUEVAS FUNCIONALIDADES (BDD):

**Historia de Usuario Completa**
- Descripción en formato estándar:
```
Como [tipo de usuario] 
Quiero [hacer algo] 
Para [conseguir un beneficio]
```

**Discovery Completado**
- Example Mapping realizado con los Tres Amigos (PO + Dev + Tester)
- Reglas de negocio documentadas (tarjetas azules)
- Ejemplos concretos definidos: mínimo 2 por regla (positivo/negativo)
- Cero preguntas pendientes (tarjetas rojas resueltas)

- Se han definido los criterios de aceptación, que deben ser verificables y estar detallados con al menos dos escenarios diferentes, escritos en formato Gherkin.

**Criterios de Aceptación BDD**
- Escenarios en formato Gherkin derivados de Example Mapping:
```
Escenario: [Nombre del escenario]
Dado [Un contexto inicial]
Cuando [Ocurre una acción]
Entonces [Se obtiene un resultado esperado]
```
- Al menos un escenario positivo y uno negativo por regla de negocio

### Para CORRECCIÓN DE BUGS (TDD):

**Descripción del Bug**
- Pasos claros para reproducir el error
- Comportamiento actual vs comportamiento esperado
- Impacto y severidad identificados (crítico/alto/medio/bajo)

**Criterios de Aceptación TDD**
- Condiciones específicas para considerar el bug resuelto
- Test cases que validen la corrección
- Casos edge que previenen regresión

### Común para Ambos:
**Prioridad Asignada** 
- Prioridad clara (alta, media, baja) según impacto de negocio

**Tamaño Manejable**
- Completable por una persona en tiempo razonable (≤5 días)
- Si es mayor, debe descomponerse en subtareas

---

## Definition of Done (DoD)

**Pasa las pruebas**
- Todas las pruebas (unitarias, de integración, funcionales) han sido ejecutadas y pasadas sin errores.

**Revisión de código** 
- Un miembro del equipo que no haya trabajado en la tarea ha revisado y aprobado el código.

### Para NUEVAS FUNCIONALIDADES (BDD):

**Frontend BDD Completo**
- Escenarios Cypress implementados y pasando ([BDD-GREEN], [BDD-REFACTOR])
- UI cumple comportamiento especificado en Example Mapping
- Tests E2E validando flujo completo de usuario

**Backend TDD Completo**
- Tests unitarios implementados y pasando ([TDD-GREEN], [TDD-REFACTOR])
- Cobertura de código ≥85% mantenida
- Lógica de negocio validada

**Integración BDD+TDD**
- Frontend y backend integrados correctamente
- Comportamiento end-to-end según criterios de aceptación
- Todos los escenarios Gherkin cumplidos

### Para CORRECCIÓN DE BUGS (TDD):

**Bug Resuelto con TDD**
- Test que reproduce el bug implementado
- Fix implementado con tests pasando ([TDD-GREEN], [TDD-REFACTOR])
- Regresión prevenida con test permanente

### Común para Ambos:

**Calidad y Proceso**
- Pipeline CI/CD completo pasando (build + tests + cobertura)
- Commits etiquetados correctamente ([BDD-*]/[TDD-*])
- Revisión de código aprobada (solo develop → main)

**Criterios de Aceptación**
- Funcionalidad cumple criterios definidos en DoR
- Validación manual por persona diferente al desarrollador

**Integración**
- Código mergeado a develop exitosamente
- Documentación actualizada si es necesario

---

## Estrategia de branching
- Elegimos utilizar un modelo simplificado de Git Flow o GitHub Flow.
- main: Siempre debe estar en un estado estable y lista para ser desplegada en producción.
- **Ramificación de tareas**: por cada tarea que el equipo toma del tablero Kanban, se crea una nueva rama a partir de main.

## Estandares de nomenclatura
El nombre de una rama debe comunicar su propósito de manera inmediata.
- Cada rama debe tener **prefijos de tipo**
  - feature/: Para nuevas funcionalidades o características.
  - bugfix/: Para la corrección de errores.
  - hotfix/: Para correcciones de errores urgentes en producción.
  - chore/: Para tareas de mantenimiento que no cambian la lógica de la aplicación (ej., actualizar dependencias, refactorizar código sin cambiar el comportamiento).
- **Nombre Descriptivo**: Después del prefijo, se usa un nombre que describe la tarea de forma concisa, usando guiones en lugar de espacios.
- Ejemplos:
  ```
  feature/crear-formulario-contacto
  bugfix/solucionar-problema-login
  chore/actualizar-dependencias-npm
  hotfix/parche-critico-pagos
  ```
### Nomenclatura de commits
El formato que se utilizara es el sigiente: 
```
tipo(ámbito): descripción
```
- **Tipo**: El tipo de cambio
  - feat: Una nueva funcionalidad.
  - fix: Una corrección de error.
  - docs: Cambios en la documentación.
  - style: Cambios de formato (sin cambios en el código).
  - refactor: Refactorización de código (sin cambios de funcionalidad).
  - test: Añadir o corregir pruebas.
  - chore: Tareas de mantenimiento.
- **Ámbito**: Indica la parte del código que se ha modificado.
- **Descripción**: Un mensaje corto y conciso en tiempo presente e imperativo.
- Ejemplos:
  ```
  feat(auth): agregar validación al formulario de registro
  fix(login): solucionar bug que no permite recordar contraseña
  refactor: simplificar función de cálculo de precios
  docs: actualizar README con instrucciones de instalación
  ```
### Nomenclatura de codigo
- **C#**: Clases/Interfaces `PascalCase` (interfaces con `I`), métodos `PascalCase`, variables `camelCase`.
- **Angular/TS**: archivos `kebab-case` (`user-list.component.ts`), clases `PascalCase`, variables `camelCase`.

## Pull Requests
- Linkear el PR al issue correspondiente (GitHub Projects).
- Incluir breve descripción y evidencia (captura/pasos).
- No self-merge. Se requiere 1 aprobación.
- Si el PR queda bloqueado, avisar al equipo para swarming.
