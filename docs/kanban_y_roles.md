# Marco de gestión en Kanban

## Equipo y roles
- Juan Pedro Michelini
- Juan Diego Fagnoni
- Christian Ingrey

Todos somos desarrollador y tester en todas las entregas. 
> Rol de la etapa: **Product Owner (Etapa 2)** → Christian Ingrey. El PO rota en las siguientes etapas.

## Flujo del tablero
Backlog → Ready → In-Progress → In Review → Done

### Políticas por columna

**Backlog**
- Ideas y necesidades del producto. No necesariamente listas para empezar.
- Se prioriza y refina en el siguiente paso, ya teniendo definido la Definition of Ready (DoR) del equipo.

**Ready:**
- Una tarea se mueve a Ready cuando ha sido analizada y está lista para ser desarrollada.
- Para pasar a esta columna, la tarea debe cumplir con la Definition of Ready [DoR](reglas_de_trabajo_y_configuracion_repo.md#definition-of-ready-dor) del equipo.
  
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
- Una tarea solo se mueve a la columna Done cuando ha cumplido con la Definition of Done [DoD](proceso_ingenieria.md#definition-of-done-dod) del equipo.
- Esto asegura que la funcionalidad es estable, de alta calidad y está lista para su despliegue o entrega al cliente.

## Ceremonias

- **Sprint Planning (inicio de cada entrega/sprint)**
  - **Objetivo:** Acordar junto al equipo el objetivo y el alcance del sprint. Seleccionar del Backlog las tarjetas que cumplan con la Definition of Ready, pudiendolas mover asi a Ready, para luego pasarlas poco a poco a In Progress, respetando el WIP. Identificar dependencias/riesgos entre las tarjetas y, si hace falta, descomponer en subtareas.
  - **Salida:** Objetivo y alcance del sprint, lista de tarjetas seleccionadas (con su prioridad y tamaño) y dependencias y riesgos anotados.

- **Sprint Review (al finalizar cada entrega/sprint - antes de la Retrospective)**
  - **Objetivo:** Presentar el trabajo completado durante el sprint al Product Owner y stakeholders. Demostrar las funcionalidades desarrolladas, validar que cumplen con los criterios de aceptación y recopilar feedback para futuras iteraciones.
  - **Participantes:** Todo el equipo + Product Owner + stakeholders (si los hay)
  - **Actividades:** 
    - Demostración de funcionalidades completadas (tarjetas en Done)
    - Revisión de bugs corregidos con evidencia de funcionamiento
    - Validación de criterios de aceptación por parte del PO
    - Feedback y nuevas ideas para el Product Backlog
  - **Salida:** Funcionalidades validadas por el PO, feedback documentado, nuevos items para el Backlog (si surgen), y decisión sobre si el objetivo del sprint fue cumplido.
  
- **Sprint Retrospective (al finalizar cada entrega/sprint)**
  - **Objetivo:** Mejorar el proceso y el flujo de trabajo, ver que aspectos fueron positivos y aportaron valor al sprint, como tambien ver que aspectos se pueden mejorar y añadir para mejorar el proceso del siguiente sprint.
  - **Salida:** Lista de objetivos y acciones grupales con el objetivo de cumplirlas y respetarlas para el/los proximo/s sprint/s.



