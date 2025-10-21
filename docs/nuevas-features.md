# Requerimiento Funcional ISA 2
Requerimiento: Sistema de Reservas de Medicamentos con BDD
Contexto: El objetivo de este requerimiento es implementar un sistema de reservas de medicamentos que se integre con las funcionalidades existentes de farmacias. El sistema debe permitir a los clientes buscar y reservar medicamentos, garantizando la disponibilidad del stock antes de su visita a la farmacia.
El sistema de reservas permitirá a los clientes:

1. ## Crear reservas
Los usuarios podrán reservar unidades de medicamentos de una farmacia específica. Durante este proceso, el sistema validará la disponibilidad del stock. Si un medicamento requiere prescripción, el sistema lo indicará y la reserva quedará en estado "Pendiente de Validación" hasta que se presente la receta.

**Como** usuario autenticado
**Quiero** reservar medicamentos de una farmacia especifica
**Para** asegurar la disponibilidad del medicamento antes de retirarlo

### Escenarios Gherkin
1. Escenario: Usuario no autenticado intenta reservar medicamentos
**Dado** un usuario no autenticado
**Cuando** intenta reservar medicamentos de una farmacia
**Entonces** el sistema responde con un error *unauthorized (401)*
**Y** muestra un mensaje que dice *"Unautharized user"*

2. Escenario: Usuario intenta reservar un medicamento en una farmacia inválida
**Dado** un usuario autenticado
**Y** selecciona una farmacia que no existe o es inválida
**Cuando** intenta reservar un medicamento
**Entonces** el sistema responde con un error *bad request (404)* 
**Y** muestra un mensaje que dice *"La farmacia seleccionada no existe"*

3. Escenario: Usuario autenticado intenta reservar un medicamento sin stock
**Dado** un usuario autenticado
**Y** selecciona una farmacia específica
**Cuando** intenta reservar un medicamento
**Y** no hay disponibilidad en el stock
**Entonces** el sistema muestra responde con un mensaje de error *conflict 409*
**Y** muestra un mensaje que dice *"No hay stock disponible para el medicamento {nombre_medicamento}*"

4. Escenario: Usuario reserva un medicamento que requiere prescripción con exito
**Dado** un usuario autenticado  
**Y** selecciona una farmacia específica  
**Cuando** intenta reservar un medicamento  
**Y** el medicamento requiere prescripción médica  
**Y** hay stock disponible  
**Entonces** el sistema crea la reserva con un estado *Pendiente*
**Y** descuenta la unidad del stock de los medicamentos
**Y** muestra un mensaje que dice *"Reserva creada exitosamente, el medicamento {nombre_medicamento} requiere receta médica. Por favor, preséntela en la farmacia para validar la reserva."*

5. Escenario: Usuario reserva un medicamento que no requiere prescripción con éxito
**Dado** un usuario autenticado
**Y** selecciona una farmacia específica
**Cuando** intenta reservar un medicamento  
**Y** el medicamento no requiere prescripción médica  
**Y** el medicamento no requiere prescripción
**Y** hay stock disponible  
**Entonces** el sistema crea la reserva con un estado *Pendiente*
**Y** descuenta la unidad del stock de los medicamentos
**Y** muestra un mensaje que dice *"Reserva creada exitosamente"*

6. Escenario: Usuario reserva dos medicamentos uno que requiere prescripción y otro que no requiere con exito
**Dado** un usuario autenticado  
**Y** selecciona una farmacia específica  
**Cuando** intenta reservar un medicamento  
**Y** el medicamento requiere prescripción médica  
**Y** hay stock disponible  
**Entonces** el sistema crea la reserva con un estado *Pendiente*
**Y** descuenta la unidad del stock de los medicamentos
**Y** muestra un mensaje que dice *"Reserva creada exitosamente, el medicamento {nombre_medicamento} requiere receta médica. Por favor, preséntela en la farmacia para validar la reserva."*

2. ## Gestionar reservas
Los clientes podrán visualizar un listado de sus reservas.

**Como** usuario autenticado
**Quiero** poder visualizar mis reservas
**Para** poder hacer seguimiento del estado de cada una y acceder a los detalles cuando los necesite

### Escenarios Gherkin
Rule: El usuario solo ve sus propias reservas y debe estar autenticado

1. Escenario: Usuario no autenticado intenta visualizar reservas
**Dado** un usuario no autenticado
**Cuando** intenta acceder al listado de sus reservas
**Entonces** el sistema responde con un error *unauthorized (401)*
**Y** muestra un mensaje que dice *"Unauthorized user"*

2. Escenario: Usuario autenticado sin reservas visualiza listado vacío
**Dado** un usuario autenticado
**Y** no tiene reservas creadas en el sistema
**Cuando** solicita visualizar sus reservas
**Entonces** el sistema responde con *ok (200)*
**Y** muestra un listado vacío
**Y** muestra un mensaje que dice *"No tienes reservas creadas"*

3. Escenario: Usuario autenticado visualiza sus reservas exitosamente
**Dado** un usuario autenticado
**Y** tiene reservas creadas en el sistema
**Cuando** solicita visualizar sus reservas
**Entonces** el sistema responde con *ok (200)*
**Y** muestra un listado con todas sus reservas
**Y** cada reserva muestra: medicamento, farmacia, estado, fecha de creación

4. Escenario: Usuario visualiza reservas con diferentes estados
**Dado** un usuario autenticado
**Y** tiene reservas en estado *Pendiente*, *Confirmada* y *Expirada*
**Cuando** solicita visualizar sus reservas
**Entonces** el sistema responde con *ok (200)*
**Y** muestra todas las reservas con sus respectivos estados
**Y** indica claramente el estado actual de cada reserva

5. Escenario: Usuario filtra reservas por estado "Pendiente"
**Dado** un usuario autenticado
**Y** tiene reservas en diferentes estados
**Cuando** aplica filtro para ver solo reservas *Pendientes*
**Entonces** el sistema responde con *ok (200)*
**Y** muestra únicamente las reservas en estado *Pendiente*

6. Escenario: Usuario filtra reservas por estado "Confirmada"
**Dado** un usuario autenticado
**Y** tiene reservas en diferentes estados
**Cuando** aplica filtro para ver solo reservas *Confirmadas*
**Entonces** el sistema responde con *ok (200)*
**Y** muestra únicamente las reservas en estado *Confirmada*

7. Escenario: Usuario accede a detalles de una reserva específica
**Dado** un usuario autenticado
**Y** tiene una reserva creada
**Cuando** selecciona ver detalles de la reserva
**Entonces** el sistema responde con *ok (200)*
**Y** muestra información detallada: medicamento, cantidad, farmacia, estado, fecha, clave pública

8. Escenario: Usuario intenta acceder a detalles de reserva inexistente
**Dado** un usuario autenticado
**Cuando** intenta acceder a detalles de una reserva que no existe
**Entonces** el sistema responde con un error *not found (404)*
**Y** muestra un mensaje que dice *"Reserva no encontrada"*

9. Escenario: Usuario visualiza reservas con información de clave pública
**Dado** un usuario autenticado
**Y** tiene reservas creadas en el sistema
**Cuando** solicita visualizar sus reservas
**Entonces** el sistema responde con *ok (200)*
**Y** muestra cada reserva con su clave pública generada
**Y** cada reserva incluye un botón para copiar la clave pública
**Y** muestra un mensaje que dice *"Presenta esta clave en la farmacia para retirar tu medicamento"*

10. Escenario: Usuario ordena reservas por fecha de creación descendente
**Dado** un usuario autenticado
**Y** tiene múltiples reservas creadas en diferentes fechas
**Cuando** solicita ordenar por fecha de creación más reciente
**Entonces** el sistema responde con *ok (200)*
**Y** muestra las reservas ordenadas de más reciente a más antigua

11. Escenario: Usuario busca reservas por nombre de medicamento
**Dado** un usuario autenticado
**Y** tiene reservas de diferentes medicamentos
**Cuando** busca reservas por el nombre *"Paracetamol"*
**Entonces** el sistema responde con *ok (200)*
**Y** muestra únicamente las reservas que contienen medicamentos con *"Paracetamol"*

12. Escenario: Sistema muestra error temporal al cargar reservas
**Dado** un usuario autenticado
**Cuando** solicita visualizar sus reservas
**Y** el sistema tiene un error temporal de base de datos
**Entonces** el sistema responde con un error *internal server error (500)*
**Y** muestra un mensaje que dice *"Error temporal del sistema. Intente nuevamente en unos segundos"*

3. ## Cancelar reservas
En caso de ser necesario, los usuarios tendrán la opción de cancelar sus reservas.

**Como** usuario autenticado 
**Quiero** poder cancelar una reserva
**Para** poder liberar medicamentos que ya no necesito y evitar problemas a la farmacia

1. Escenario: Usuario no autenticado intenta cancelar una reserva
**Dado** un usuario no autenticado
**Cuando** intenta cancelar una reserva
**Entonces** el sistema responde con un error *unauthorized (401)*
**Y** muestra un mensaje que dice *"Unauthorized user"*

2. Escenario: Usuario cancela una reserva en estado "Pendiente" exitosamente
**Dado** un usuario autenticado
**Y** tiene una reserva en estado *Pendiente*
**Cuando** selecciona cancelar la reserva
**Entonces** el sistema responde con *ok (200)*
**Y** cambia el estado de la reserva a *Cancelada*
**Y** devuelve las unidades al stock del medicamento
**Y** muestra un mensaje que dice *"Reserva cancelada exitosamente"*

3. Escenario: Usuario cancela una reserva en estado "Confirmada" exitosamente
**Dado** un usuario autenticado
**Y** tiene una reserva en estado *Confirmada*
**Cuando** selecciona cancelar la reserva
**Entonces** el sistema responde con *ok (200)*
**Y** cambia el estado de la reserva a *Cancelada*
**Y** devuelve las unidades al stock del medicamento
**Y** muestra un mensaje que dice *"Reserva cancelada exitosamente"*

4. Escenario: Usuario intenta cancelar una reserva ya cancelada
**Dado** un usuario autenticado
**Y** tiene una reserva en estado *Cancelada*
**Cuando** intenta cancelar la reserva nuevamente
**Entonces** el sistema responde con un error *bad request (400)*
**Y** muestra un mensaje que dice *"La reserva ya se encuentra cancelada"*

5. Escenario: Usuario intenta cancelar una reserva expirada
**Dado** un usuario autenticado
**Y** tiene una reserva en estado *Expirada*
**Cuando** intenta cancelar la reserva
**Entonces** el sistema responde con un error *bad request (400)*
**Y** muestra un mensaje que dice *"No se puede cancelar una reserva expirada"*

6. Escenario: Usuario intenta cancelar una reserva inexistente
**Dado** un usuario autenticado
**Cuando** intenta cancelar una reserva que no existe
**Entonces** el sistema responde con un error *not found (404)*
**Y** muestra un mensaje que dice *"Reserva no encontrada"*

7. Escenario: Usuario cancela reserva y recibe confirmación con clave pública actualizada
**Dado** un usuario autenticado
**Y** tiene una reserva en estado *Pendiente* con clave pública generada
**Cuando** selecciona cancelar la reserva
**Entonces** el sistema responde con *ok (200)*
**Y** cambia el estado de la reserva a *Cancelada*
**Y** invalida la clave pública asociada a la reserva
**Y** muestra un mensaje que dice *"Reserva cancelada. La clave pública ya no es válida"*

8. Escenario: Usuario confirma cancelación mediante diálogo de confirmación
**Dado** un usuario autenticado
**Y** tiene una reserva en estado *Pendiente*
**Cuando** selecciona cancelar la reserva
**Y** confirma la cancelación en el diálogo
**Entonces** el sistema responde con *ok (200)*
**Y** procesa la cancelación exitosamente
**Y** muestra un mensaje que dice *"Reserva cancelada exitosamente"*

9. Escenario: Usuario cancela la acción de cancelar reserva
**Dado** un usuario autenticado
**Y** tiene una reserva en estado *Pendiente*
**Cuando** selecciona cancelar la reserva
**Y** cancela la acción en el diálogo de confirmación
**Entonces** la reserva mantiene su estado original
**Y** no se realizan cambios en el sistema
**Y** regresa a la vista anterior

10. Escenario: Usuario cancela múltiples reservas en lote
**Dado** un usuario autenticado
**Y** tiene múltiples reservas en estado *Pendiente*
**Cuando** selecciona cancelar múltiples reservas
**Y** confirma la acción de cancelación en lote
**Entonces** el sistema responde con *ok (200)*
**Y** cancela todas las reservas seleccionadas
**Y** devuelve todas las unidades correspondientes al stock
**Y** muestra un mensaje que dice *"Se cancelaron {cantidad} reservas exitosamente"*

11. Escenario: Usuario intenta cancelar reserva después de tiempo límite
**Dado** un usuario autenticado
**Y** tiene una reserva en estado *Confirmada*
**Y** han pasado más de 24 horas desde la confirmación
**Cuando** intenta cancelar la reserva
**Entonces** el sistema responde con un error *bad request (400)*
**Y** muestra un mensaje que dice *"No se puede cancelar una reserva después de 24 horas de confirmación"*

12. Escenario: Sistema muestra error al cancelar por problema de conexión
**Dado** un usuario autenticado
**Y** tiene una reserva en estado *Pendiente*
**Cuando** intenta cancelar la reserva
**Y** el sistema tiene un error de conexión con la base de datos
**Entonces** el sistema responde con un error *internal server error (500)*
**Y** muestra un mensaje que dice *"Error del sistema. No se pudo cancelar la reserva. Intente nuevamente"*


Adicionalmente, el sistema gestionará las siguientes funcionalidades:

4. ## Confirmar reservas (interno): 
El personal de la farmacia podrá confirmar las reservas una vez que se verifiquen los requisitos (como la validación de prescripciones).

**Como** empleado de la farmacia autenticado
**Quiero** poder confirmar reservas
**Para** avisar al cliente que su reserva fue procesada y que los medicamentos ya se reservaron

### Escenarios Gherkin
1. Escenario: Empleado no autenticado intenta confirmar una reserva
**Dado** un empleado no autenticado
**Cuando** intenta confirmar una reserva
**Entonces** el sistema responde con un error *unauthorized (401)*
**Y** muestra un mensaje que dice *"Unautharized user"*

2. Escenario: Empleado autenticado intenta confirmar una reserva inexistente
**Dado** un empleado autenticado
**Y** proporcionar un identificador de reserva inexistente
**Cuando** intenta confirmar una reserva
**Entonces** el sistema responde con un error *not found (404)*
**Y** muestra un mensaje que dice *"The specified reservation does not exist"*

3. Escenario: Empleado autenticado intenta confirmar una reserva ya confirmada
**Dado** un empleado autenticado
**Y** una reserva que ya esta en estado Confiramda
**Cuando** intenta confirmar nuevamente la reserva
**Entonces** el sistema responde con un error *conflict (409)*
**Y** muestra un mensaje que dice *"The reservation was previously confirmed"*

4. Escenario: Empleado autenticado intenta confirmar una reserva canelada
**Dado** un empleado autenticado
**Y** una reserva que esta en estado Cancelada
**Cuando** intenta confirmar la reserva
**Entonces** el sistema responde con un error *conflict (409)*
**Y** muestra un mensaje que dice *"A cancelled reservation cannot be confirmed"*

5. Escenario: Empleado autenticado intenta confirmar una reserva expirada
**Dado** un empleado autenticado
**Y** una reserva que esta en estado Expirada
**Cuando** intenta confirmar la reserva
**Entonces** el sistema responde con un error *conflict (409)*
**Y** muestra un mensaje que dice *"The reservation has expired and cannot be confirmed."*

6. Escenario: Empleado autenticado confirma exitosamente una reserva pendiente
**Dado** un empleado autenticado
**Y** una reserva en estado Pendiente 
**Cuando** cuando confirma la reserva
**Entonces** el sistema actualiza el estado de la reserva a Confirmada
**Y** muestra un mensaje que dice *"Reservation successfully confirmed. The medication can be picked up by the customer."*
**Y** notifica al usuario que su medicamento está listo para retirar 

7. Escenario: Empleado autenticado intenta confirmar una reserva perteneciente a otra farmacia
**Dado** un empleado autenticado perteneciente a la farmacia Farmacia X
**Y** una reserva asociada a la Farmacia Y
**Cuando** intenta confirmar la reserva
**Entonces** el sistema responde con un error *forbidden (403)*
**Y** muestra un mensaje que dice *"You do not have permission to confirm reservations from another pharmacy"*

8. Escenario: Error inesperado durante la confirmación de una reserva
**Dado** un empleado autenticado
**Y** una reserva válida en estado pendiente
**Cuando** intenta confirmar la reserva
**Y** ocurre un error interno en el sistema
**Entonces** el sistema responde con un error *internal server error (500)*
**Y** muestra un mensaje que dice *"An error occurred while confirming your reservation. Please try again later."*


5. ## Gestión de estados
Internamente, el sistema gestionará las reservas a través de diferentes estados: "Pendiente" (al crearse), "Confirmada" (tras la confirmación), "Expirada" (si no se retira en un tiempo determinado) y "Cancelada" (si el usuario la anula o el sistema la cancela por falta de confirmación).

**Como** sistema
**Quiero** poder gestionar las reservas a través de estados
**Para** reflejar con precisión su situación actual y facilitar el seguimiento tanto para usuarios como para farmacias

### Escenarios Gherkin
1. Escenario: Reserva recién creada se asigna al estado Pendiente
**Dado** una reserva creada por un usuario autenticado
**Cuando** el sistema registra la reserva
**Entonces** el sistema asigna automáticamente el estado *Pendiente*
**Y** la reserva queda visible en el listado del cliente con estado Pendiente

2. Escenario: Reserva pendiente pasa a estado Confirmada al ser aprobada
**Dado** una reserva en estado Pendiente
**Cuando** un empleado de la farmacia confirma la reserva
**Entonces** el sistema asigna automáticamente el estado *Confirmada*
**Y** registra la fecha y hora de confirmación

3. Escenario: Reserva pendiente se mantiene en estado Pendiente mientras no sea confirmada
**Dado** una reserva en estado Pendiente
**Cuando** el sistema evalúa el estado de la reserva
**Entonces** la reserva permanece en estado *Pendiente*
**Y** se notifica al usuario que su reserva aún no ha sido confirmada

4. Escenario: Reserva confirmada pasa a estado Expirada después del tiempo límite
**Dado** una reserva en estado Confirmada
**Y** han pasado más de 48 horas sin que el usuario retire el medicamento
**Cuando** el sistema ejecuta la tarea de control de expiración
**Entonces** el sistema cambia el estado de la reserva a *Expirada*
**Y** muestra un mensaje que dice *"La reserva ha expirado por falta de retiro"*

5. Escenario: Reserva pendiente pasa a estado Cancelada por no ser confirmada en el tiempo establecido
**Dado** una reserva en estado Pendiente
**Y** no fue confirmada dentro del plazo máximo de 24 horas
**Cuando** el sistema ejecuta la verificación programada
**Entonces** el sistema cambia el estado de la reserva a *Cancelada*
**Y** muestra un mensaje que dice *"Reserva cancelada por falta de confirmación en el tiempo establecido"*

6. Escenario: Reserva confirmada pasa a estado Cancelada por decisión del usuario
**Dado** una reserva en estado Confirmada
**Y** el usuario solicita su cancelación desde el sistema
**Cuando** se procesa la cancelación
**Entonces** el sistema cambia el estado de la reserva a *Cancelada*
**Y** muestra un mensaje que dice *"Reserva cancelada exitosamente"*

7. Escenario: Reserva cancelada no puede volver a estado anterior
**Dado** una reserva en estado Cancelada
**Cuando** el sistema intenta modificar su estado a Confirmada o Pendiente
**Entonces** el sistema responde con un error *conflict (409)*
**Y** muestra un mensaje que dice *"No se puede modificar el estado de una reserva cancelada"*

8. Escenario: Reserva expirada no puede volver a ser confirmada
**Dado** una reserva en estado Expirada
**Cuando** un empleado intenta confirmar la reserva manualmente
**Entonces** el sistema responde con un error *conflict (409)*
**Y** muestra un mensaje que dice *"No se puede confirmar una reserva expirada"*

9. Escenario: Sistema registra el historial de cambios de estado de una reserva
**Dado** una reserva que ha pasado por diferentes estados
**Cuando** el sistema actualiza el estado de la reserva
**Entonces** se guarda en el historial el nuevo estado, la fecha y el usuario o proceso que realizó el cambio
**Y** el historial puede consultarse para auditoría interna

10. Escenario: Sistema evita estados inválidos
**Dado** una reserva con un estado actual Confirmada
**Cuando** el sistema recibe una instrucción externa para asignarle un estado inexistente
**Entonces** el sistema responde con un error *bad request (400)*
**Y** muestra un mensaje que dice *"El estado indicado no es válido"*

11. Escenario: Sistema notifica al usuario cada vez que cambia el estado de su reserva
**Dado** una reserva del usuario
**Cuando** el sistema actualiza su estado a Confirmada, Expirada o Cancelada
**Entonces** el sistema envía una notificación al usuario
**Y** el mensaje indica claramente el nuevo estado y las próximas acciones posibles

6. ## Validación Segura de Reservas
Para robustecer la seguridad del proceso, cuando se genere una reserva, el sistema creará un par de claves público-privada. Para hacer uso de la reserva en la farmacia, el cliente deberá proveer la clave pública para que el sistema la valide, asegurando así la autenticidad y correcta entrega del medicamento.

**Como** sistema
**Quiero** generar un par de claves publico-privada
**Para** asegurar la autenticidad del cliente y la correcta entrega del medicamento



Se debe disponer de endpoints REST para interactuar con estas funcionalidades (crear, listar, confirmar y cancelar reservas). En el frontend, se desarrollarán pantallas para la búsqueda de medicamentos, la creación de reservas y la visualización y gestión de las reservas del usuario.

