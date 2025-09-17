# Marco de gestión en Kanban

## Equipo y roles
- Juan Pedro Michelini
- Juan Diego Fagnoni
- Christian Ingrey

Todos somos desarrollador y tester en todas las entregas. 

## Flujo del tablero
Backlog → Ready → In-Progress → In Review → Done

### Políticas por columna
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


