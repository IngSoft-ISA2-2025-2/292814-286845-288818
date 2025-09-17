# Marco de gestión en Kanban

## Equipo y roles
- Juan Pedro Michelini
- Juan Diego Fagnoni
- Christian Ingrey

Todos somos desarrollador y tester en todas las entregas. 
> Rol de la etapa: **Product Owner (Etapa 1)** → Juan Pedro Michelini. El PO rota en las siguientes etapas.

## Flujo del tablero
Backlog → Ready → In-Progress → In Review → Done

--- 

### Definition of Ready (DoR)
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

### Definition of Done (DoD)
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

### Políticas por columna

**Backlog**
- Ideas y necesidades del producto. No necesariamente listas para empezar.
- Se prioriza y refina en el siguiente paso, ya teniendo definido la Definition of Ready (DoR) del equipo.

**Ready:**
- Una tarea se mueve a Ready cuando ha sido analizada y está lista para ser desarrollada.
- Para pasar a esta columna, la tarea debe cumplir con la Definition of Ready (DoR) del equipo.
  
**In-Progress (WIP):**
- El límite de WIP (Work In Progress) es de 2 tareas que pueden estar en esta columna al mismo tiempo (por persona), es decir como somos 3 integrantes 6 tareas es lo maximo permitido en esta columna.
- La persona que toma la tarjeta se hace responsable de ella hasta que pase a la siguiente columna.
- El equipo se enfoca en terminar lo que ya se empezó antes de tomar una nueva tarea del Backlog.
- Si alguno de los integrantes del equipo se tranca con una tarea, el equipo completo colabora para desbloquearla (swarming). Decidimos esto ya que nos va permitir reducir los tiempos de entrega (Lead Time) y mantener el flujo de trabajo.

**In Review:**
- Una tarea se mueve a In Review cuando el desarrollo inicial ha terminado.
- Al tener una tarea en esta columna, se avisa al equipo que la tarea está lista para ser revisada y testeada.
- Un miembro del equipo diferente al que haya desarrollado la tarea debe hacer la revisión de código y las pruebas funcionales. Estas pruebas validan que la tarea cumple con los criterios de aceptación definidos.
- Si se encuentran errores, la tarea vuelve a In-Progress. La persona que la revisó debe agregar comentarios o indicaciones claras para que el desarrollador original pueda corregirla.
  
**Done:**
- Una tarea solo se mueve a la columna Done cuando ha cumplido con la Definition of Done (DoD) del equipo.
- Esto asegura que la funcionalidad es estable, de alta calidad y está lista para su despliegue o entrega al cliente.

## Ceremonias

- **Sprint Planning (inicio de cada entrega/sprint)**
  - **Objetivo:** Acordar junto al equipo el objetivo y el alcance del sprint. Seleccionar del Backlog las tarjetas que cumplan con la Definition of Ready, pudiendolas mover asi a Ready, para luego pasarlas poco a poco a In Progress, respetando el WIP. Identificar dependencias/riesgos entre las tarjetas y, si hace falta, descomponer en subtareas.
  - **Salida:** Objetivo y alcance del sprint, lista de tarjetas seleccionadas (con su prioridad y tamaño) y dependencias y riesgos anotados.
  
- **Sprint Retrospective (al finalizar cada entrega/sprint)**
  - **Objetivo:** Mejorar el proceso y el flujo de trabajo, ver que aspectos fueron positivos y aportaron valor al sprint, como tambien ver que aspectos se pueden mejorar y añadir para mejorar el proceso del siguiente sprint.
  - **Salida:** Lista de objetivos y acciones grupales con el objetivo de cumplirlas y respetarlas para el/los proximo/s sprint/s.

## Estrategia de branching
- Elegimos utilizar un modelo simplificado de Git Flow o GitHub Flow.
- main: Siempre debe estar en un estado estable y lista para ser desplegada en producción.
- **Ramificación de tareas**: por cada tarea que el equipo toma del tablero Kanban, se crea una nueva rama a partir de main.

### Nomenclatura de Ramas
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
### Nomenclatura de Commits
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
