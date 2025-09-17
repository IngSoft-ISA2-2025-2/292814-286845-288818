# Primer Proceso de Ingenieria

## Estructura de carpetas
- `docs/` — proceso, kanban, calidad/deuda, actas
- `Obligatorio/Material/` — código fuente de la solución (API .NET y app Angular), base de datos y documentacion

## Definition of Ready (DoR)
**Descripción Clara**
- La tarjeta en el tablero debe tener una descripción completa de lo que se necesita construir, redactada en el formato 
```
Como [tipo de usuario] 
Quiero [hacer algo] 
Para [conseguir un beneficio]
```
- Se han definido los criterios de aceptación, que deben ser verificables y estar detallados con al menos dos escenarios diferentes, escritos en formato Gherkin.
```
Escenario: [Nombre del escenario]
Dado [Un contexto inicial]
Cuando [Ocurre una acción]
Entonces [Se obtiene un resultado esperado]
```
- Escenario Positivo: Un escenario que describe el resultado esperado cuando todo funciona correctamente.
- Escenarios Negativos: Escenarios que describen cómo debe comportarse el sistema en cada caso de error o comportamiento inesperado.

**Prioridad Asignada** 
- La tarea tiene una prioridad clara (alta, media, baja) para que el equipo sepa qué es lo más importante a abordar.

**Tamaño Manejable**
- La tarea es lo suficientemente pequeña como para ser completada por una sola persona en un tiempo razonable, reduciendo el riesgo de bloqueos.

---

## Definition of Done (DoD)
**Pasa las pruebas**
- Todas las pruebas (unitarias, de integración, funcionales) han sido ejecutadas y pasadas sin errores.

**Revisión de código** 
- Un miembro del equipo que no haya trabajado en la tarea ha revisado y aprobado el código.

**Cumple con los criterios de aceptación**
- La funcionalidad cumple con todos los criterios de aceptación definidos en la DoR.

**Código documentado** 
- El código tiene comentarios claros donde es necesario y se han actualizado los archivos de documentación.

**Rama de código fusionada**
- El código ha sido fusionado a la rama principal

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
