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
Background: **Dado** estoy en la página de reservas de medicamentos

1. Escenario: Usuario sin email intenta reservar medicamentos
**Dado** un email para reserva ""
**Y** un secret para reserva ""
**Y** un medicamento "Aspirina" con cantidad de 1 unidad
**Y** una farmacia "Farmashop"
**Cuando** hace click en el botón de reservar
**Entonces** el sistema responde con un error con un mensaje que dice *"Debe ingresar un email y secret para reservar medicamentos."*

2. Escenario: Usuario con email y secret válidos reserva en farmacia inválida
**Dado** un email para reserva "usuario@test.com"
**Y** un secret para reserva "secret123"
**Y** un medicamento "Aspirina" con cantidad de 1 unidad
**Y** una farmacia "FarmaciaInexistente"
**Cuando** hace click en el botón de reservar
**Entonces** el sistema responde con un error un mensaje que dice *"La farmacia FarmaciaInexistente no existe"*

3. Escenario: Usuario con email y secret válidos intenta reservar medicamento inexistente
**Dado** un email para reserva "usuario@test.com"
**Y** un secret para reserva "secret123"
**Y** un medicamento "MedicamentoInexistente" con cantidad de 1 unidad
**Y** el medicamento no existe en la farmacia "Farmashop"
**Y** una farmacia "Farmashop"
**Cuando** hace click en el botón de reservar
**Entonces** el sistema responde con un error con un mensaje que dice *"El medicamento MedicamentoInexistente no existe en la farmacia Farmashop"*

4. Escenario: Usuario con email y secret válidos intenta reservar medicamento sin stock
**Dado** un email para reserva "usuario@test.com"
**Y** un secret para reserva "secret123"
**Y** un medicamento "Aspirina" con cantidad de 1 unidad
**Y** no hay stock disponible para el medicamento "Aspirina" en la farmacia "Farmashop"
**Y** una farmacia "Farmashop"
**Cuando** hace click en el botón de reservar
**Entonces** el sistema muestra responde con un mensaje que dice *"No hay stock disponible para el medicamento Aspirina"*

5. Escenario: Usuario reserva un medicamento que requiere prescripción con éxito
**Dado** un email para reserva "usuario@test.com"
**Y** un secret para reserva "secret123"
**Y** un medicamento "Aspirina" con cantidad de 1 unidad que requiere prescripción médica
**Y** hay stock mayor o igual a una unidad para el medicamento "Aspirina" en la farmacia "Farmashop"
**Y** una farmacia "Farmashop"
**Cuando** hace click en el botón de reservar
**Entonces** el sistema crea la reserva con un estado *Pendiente*
**Y** descuenta la unidad del stock de los medicamentos
**Y** muestra un mensaje de reserva que dice *"Reserva creada exitosamente, el medicamento Aspirina requiere receta médica. Por favor, preséntela en la farmacia para validar la reserva."*

6. Escenario: Usuario reserva un medicamento que no requiere prescripción con éxito
**Dado** un email para reserva "usuario@test.com"
**Y** un secret para reserva "secret123"
**Y** un medicamento "Paracetamol" con cantidad de 1 unidad que no requiere prescripción médica
**Y** hay stock mayor o igual a una unidad para el medicamento "Paracetamol" en la farmacia "Farmashop"
**Y** una farmacia "Farmashop"
**Cuando** hace click en el botón de reservar
**Entonces** el sistema crea la reserva con un estado *Pendiente*
**Y** descuenta la unidad del stock de los medicamentos
**Y** muestra un mensaje de reserva que dice *"Reserva creada exitosamente"*

7. Escenario: Usuario reserva dos medicamentos uno que requiere prescripción y otro que no requiere con éxito
**Dado** un email para reserva "usuario@test.com"
**Y** un secret para reserva "secret123"
**Y** un medicamento "Aspirina" con cantidad de 1 unidad que requiere prescripción médica
**Y** un medicamento "Paracetamol" con cantidad de 1 unidad que no requiere prescripción médica
**Y** hay stock mayor o igual a una unidad para ambos medicamentos en la farmacia "Farmashop"
**Y** una farmacia "Farmashop"
**Cuando** hace click en el botón de reservar
**Entonces** el sistema crea la reserva con un estado *Pendiente*
**Y** descuenta la unidad del stock de los medicamentos
**Y** muestra un mensaje de reserva que dice *"Reserva creada exitosamente, el medicamento Aspirina requiere receta médica. Por favor, preséntela en la farmacia para validar la reserva."*

8. Escenario: Usuario con email existente pero secret incorrecto intenta reservar
**Dado** un email para reserva "usuario@test.com"
**Y** un secret para reserva "secretIncorrecto"
**Y** el email para reserva "usuario@test.com" ya tiene reservas con secret "secret123"
**Y** un medicamento "Aspirina" con cantidad de 1 unidad
**Y** una farmacia "Farmashop"
**Cuando** hace click en el botón de reservar
**Entonces** el sistema responde con un error con un mensaje que dice *"El secret no coincide con el registrado para este email"*


2. ## Gestionar reservas
Los clientes podrán visualizar un listado de sus reservas.

### Escenarios Gherkin
Background: **Dado** estoy en la página de mis reservas

**Como** usuario autenticado
**Quiero** poder visualizar mis reservas
**Para** poder hacer seguimiento del estado de cada una y acceder a los detalles cuando los necesite

### Escenarios Gherkin
1. Escenario: Usuario sin email intenta consultar reservas
**Dado** un email ""
**Y** un secret ""
**Cuando** hace click en el botón de consultar reservas
**Entonces** el sistema responde con un error y muestra el mensaje *"Debe ingresar un email y secret para consultar reservas."*

2. Escenario: Usuario con email y secret válidos sin reservas visualiza listado vacío
**Dado** un email "usuario@test.com"
**Y** un secret "miSecret123"
**Y** no tiene reservas creadas en el sistema
**Cuando** hace click en el botón de consultar reservas
**Entonces** el sistema responde de manera correcta, mostrando un listado vacío
**Y** muestra un mensaje que dice *"No tienes reservas creadas"*

3. Escenario: Usuario con email y secret válidos visualiza sus reservas exitosamente
**Dado** un email "usuario@test.com"
**Y** un secret "miSecret123"
**Y** tiene reservas creadas en diferentes estados "Pendiente", "Confirmada", "Expirada", "Cancelada" y "Retirada"
**Cuando** hace click en el botón de consultar reservas
**Entonces** el sistema responde de manera correcta, mostrando un listado con todas sus reservas
**Y** cada reserva muestra información básica: nombre de el/los medicamento/s, farmacia y estado
**Y** cada reserva incluye un botón para ver más detalles

4. Escenario: Usuario filtra reservas por estado
**Dado** un email "usuario@test.com"
**Y** un secret "miSecret123"
**Y** tiene reservas en diferentes estados
**Cuando** aplica filtro para ver solo reservas en estado "Confirmada"
**Entonces** el sistema responde de manera correcta, mostrando un listado únicamente con las reservas en estado "Confirmada"

5. Escenario: Usuario con email existente pero secret incorrecto intenta consultar reservas
**Dado** un email "usuario@test.com"
**Y** un secret "secretIncorrecto"
**Y** el email "usuario@test.com" ya tiene reservas con secret "miSecret123"
**Cuando** hace click en el botón de consultar reservas
**Entonces** el sistema responde con un error y muestra el mensaje *"El secret no coincide con el registrado para este email"*

6. Escenario: Usuario ordena reservas por fecha de creación descendente
**Dado** un email "usuario@test.com"
**Y** un secret "miSecret123"
**Y** tiene múltiples reservas creadas en diferentes fechas
**Cuando** solicita ordenar por fecha de creación más reciente
**Entonces** el sistema responde de manera correcta, mostrando las reservas ordenadas de más reciente a más antigua

7. Escenario: Usuario busca reservas por nombre de medicamento
**Dado** un email "usuario@test.com"
**Y** un secret "miSecret123"
**Y** tiene reservas de diferentes medicamentos
**Cuando** busca reservas por el nombre "Paracetamol"
**Entonces** el sistema responde de manera correcta, mostrando únicamente las reservas que contienen medicamentos con "Paracetamol"

8. Escenario: Usuario busca reservas por nombre de farmacia
**Dado** un email "usuario@test.com"
**Y** un secret "miSecret123"
**Y** tiene reservas de diferentes farmacias
**Cuando** busca reservas por el nombre "Farmacia Central"
**Entonces** el sistema responde de manera correcta, mostrando únicamente las reservas que contienen la farmacia "Farmacia Central"


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
Background: **Dado** estoy en la página de mis reservas

1. Escenario: Reserva recién creada se asigna al estado Pendiente
**Dado** un email "usuario@test.com"
**Y** un secret "secret123"
**Y** quiero crear una reserva con medicamento "Aspirina" en farmacia "Farmashop"
**Cuando** creo la reserva
**Entonces** el sistema asigna automáticamente el estado *"Pendiente"*
**Y** la reserva es visible con estado *"Pendiente"*

2. Escenario: Sistema muestra correctamente reserva en estado Confirmada
**Dado** un email "usuario@test.com"
**Y** un secret "secret123"
**Y** tengo una reserva en estado *"Confirmada"*
**Cuando** consulto mis reservas
**Entonces** veo la reserva con estado *"Confirmada"*
**Y** veo el ID de referencia de la reserva
**Y** veo la fecha de confirmación

3. Escenario: Sistema muestra correctamente reserva en estado Expirada
**Dado** un email "usuario@test.com"
**Y** un secret "secret123"
**Y** tengo una reserva en estado *"Expirada"*
**Cuando** consulto mis reservas
**Entonces** veo la reserva con estado *"Expirada"*
**Y** veo un mensaje que dice *"Esta reserva ha expirado"*
**Y** veo la fecha de expiración

4. Escenario: Sistema muestra correctamente reserva en estado Cancelada
**Dado** un email "usuario@test.com"
**Y** un secret "secret123"
**Y** tengo una reserva en estado *"Cancelada"*
**Cuando** consulto mis reservas
**Entonces** veo la reserva con estado *"Cancelada"*
**Y** veo un mensaje que dice *"Reserva cancelada"*
**Y** veo la fecha de cancelación

5. Escenario: Sistema muestra correctamente reserva en estado Retirada
**Dado** un email "usuario@test.com"
**Y** un secret "secret123"
**Y** tengo una reserva en estado *"Retirada"*
**Cuando** consulto mis reservas
**Entonces** veo la reserva con estado *"Retirada"*
**Y** veo un mensaje que dice *"Reserva retirada exitosamente"*
**Y** veo la fecha de retiro

6. Escenario: Usuario visualiza todas sus reservas con diferentes estados
**Dado** un email "usuario@test.com"
**Y** un secret "secret123"
**Y** tengo reservas en estados *"Pendiente"*, *"Confirmada"*, *"Expirada"*, *"Cancelada"* y *"Retirada"*
**Cuando** consulto mis reservas
**Entonces** veo todas mis reservas
**Y** cada reserva muestra su estado correctamente
**Y** las reservas pendientes no muestran ID de referencia
**Y** las reservas confirmadas muestran ID de referencia

7. Escenario: Usuario filtra reservas por estado Pendiente
**Dado** un email "usuario@test.com"
**Y** un secret "secret123"
**Y** tengo reservas en diferentes estados
**Cuando** filtro por estado *"Pendiente"*
**Entonces** solo veo reservas en estado *"Pendiente"*

8. Escenario: Usuario filtra reservas por estado Confirmada
**Dado** un email "usuario@test.com"
**Y** un secret "secret123"
**Y** tengo reservas en diferentes estados
**Cuando** filtro por estado *"Confirmada"*
**Entonces** solo veo reservas en estado *"Confirmada"*

9. Escenario: Usuario filtra reservas por estado Expirada
**Dado** un email "usuario@test.com"
**Y** un secret "secret123"
**Y** tengo reservas en diferentes estados
**Cuando** filtro por estado *"Expirada"*
**Entonces** solo veo reservas en estado *"Expirada"*

10. Escenario: Usuario filtra reservas por estado Cancelada
**Dado** un email "usuario@test.com"
**Y** un secret "secret123"
**Y** tengo reservas en diferentes estados
**Cuando** filtro por estado *"Cancelada"*
**Entonces** solo veo reservas en estado *"Cancelada"*

11. Escenario: Usuario filtra reservas por estado Retirada
**Dado** un email "usuario@test.com"
**Y** un secret "secret123"
**Y** tengo reservas en diferentes estados
**Cuando** filtro por estado *"Retirada"*
**Entonces** solo veo reservas en estado *"Retirada"*
**Y** devuelve las unidades al stock del medicamento
**Y** muestra un mensaje que dice *"Reserva cancelada exitosamente"*


6. ## Validación Segura de Reservas
Para robustecer la seguridad del proceso, cuando se genere una reserva, el sistema creará un par de claves público-privada. Para hacer uso de la reserva en la farmacia, el cliente deberá proveer la clave pública para que el sistema la valide, asegurando así la autenticidad y correcta entrega del medicamento.

**Como** sistema
**Quiero** generar un par de claves público-privada para cada reserva
**Para** asegurar la autenticidad del cliente y la correcta entrega del medicamento

### Escenarios Gherkin
Background: **Dado** estoy en la página de validación de reservas

1. Escenario: Cliente presenta clave pública válida en la farmacia para validar reserva
**Dado** una reserva confirmada con código "RES-12345"
**Y** la reserva tiene una clave pública "PUBKEY-ABC123XYZ"
**Y** estoy en la página de validación de reservas en farmacia
**Cuando** ingreso la clave pública "PUBKEY-ABC123XYZ"
**Y** hago click en el botón de validar
**Entonces** el sistema valida correctamente la clave pública
**Y** muestra la información de la reserva: medicamento, cantidad, cliente
**Y** muestra un mensaje de validación que dice *"Entrega completada exitosamente. La reserva ha sido cerrada."*

2. Escenario: Cliente presenta clave pública inválida o inexistente en la farmacia
**Dado** estoy en la página de validación de reservas en farmacia
**Y** no existe ninguna reserva con la clave pública "PUBKEY-INVALID999"
**Cuando** ingreso la clave pública "PUBKEY-INVALID999"
**Y** hago click en el botón de validar
**Entonces** el sistema responde con un error de tipo *"not found (404)"*
**Y** muestra un mensaje de validación que dice *"La clave pública proporcionada no es válida o no existe"*

3. Escenario: Cliente presenta clave pública de una reserva ya expirada
**Dado** una reserva expirada con código "RES-67890"
**Y** la reserva tiene una clave pública "PUBKEY-EXPIRED456"
**Y** la reserva está en estado "Expirada"
**Y** estoy en la página de validación de reservas en farmacia
**Cuando** ingreso la clave pública "PUBKEY-EXPIRED456"
**Y** hago click en el botón de validar
**Entonces** el sistema responde con un error de tipo *"forbidden (403)"*
**Y** muestra un mensaje de validación que dice *"La reserva ha expirado y no puede ser utilizada"*

4. Escenario: Cliente presenta clave pública de una reserva cancelada
**Dado** una reserva cancelada con código "RES-54321"
**Y** la reserva tiene una clave pública "PUBKEY-CANCELLED789"
**Y** la reserva está en estado "Cancelada"
**Y** estoy en la página de validación de reservas en farmacia
**Cuando** ingreso la clave pública "PUBKEY-CANCELLED789"
**Y** hago click en el botón de validar
**Entonces** el sistema responde con un error de tipo *"forbidden (403)"*
**Y** muestra un mensaje de validación que dice *"La reserva fue cancelada y la clave pública ya no es válida"*

5. Escenario: Empleado de farmacia valida reserva con clave pública y completa la entrega
**Dado** soy un empleado autenticado de la farmacia "Farmashop"
**Y** existe una reserva confirmada con clave pública "PUBKEY-DELIVERY999"
**Y** la reserva está en estado "Confirmada"
**Y** estoy en la página de validación de reservas en farmacia
**Cuando** ingreso la clave pública "PUBKEY-DELIVERY999"
**Y** hago click en el botón de validar
**Entonces** el sistema marca la reserva como *"Retirada"*
**Y** invalida la clave pública para evitar reutilización
**Y** muestra un mensaje de validación que dice *"Entrega completada exitosamente. La reserva ha sido cerrada."*


Se debe disponer de endpoints REST para interactuar con estas funcionalidades (crear, listar, confirmar y cancelar reservas). En el frontend, se desarrollarán pantallas para la búsqueda de medicamentos, la creación de reservas y la visualización y gestión de las reservas del usuario.

