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

**Como** usuario autenticado
**Quiero** poder visualizar mis reservas ingresando mi email y secret
**Para** poder hacer seguimiento del estado de cada una y acceder a los detalles cuando los necesite

### Escenarios Gherkin
Background: **Dado** estoy en la página de mis reservas

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

**Como** visitante que conoce un correo y un secret
**Quiero** poder cancelar una reserva introduciendo ese correo y secret
**Para** que el sistema valide identidades sin necesidad de un usuario autenticado

### Escenarios Gherkin
Background: **Dado** que el formulario de cancelación está disponible

1. Escenario: Cancelación exitosa de una reserva existente
**Dado** que existe una reserva para el correo "cliente@example.com" con el secret "abc123"
**Cuando** el visitante solicita cancelar la reserva usando el correo "cliente@example.com" y el secret "abc123"
**Entonces** la reserva para "cliente@example.com" debe quedar marcada como cancelada
**Y** el sistema muestra el mensaje *"Reserva cancelada correctamente"*

2. Escenario: Intento de cancelación con secret incorrecto
**Dado** que existe una reserva para el correo "cliente@example.com" con el secret "abc123"
**Cuando** el visitante solicita cancelar la reserva usando el correo "cliente@example.com" y el secret "equivocado"
**Entonces** la reserva no debe ser cancelada
**Y** el sistema muestra el mensaje de error *"Secret inválido para ese correo"*

3. Escenario: Intento de cancelación cuando no existe reserva para ese correo
**Dado** que no existe ninguna reserva para el correo "sinreserva@example.com"
**Cuando** el visitante solicita cancelar la reserva usando el correo "sinreserva@example.com" y el secret "cualquiera"
**Entonces** el sistema responde con un error indicando *"No existe una reserva asociada a ese correo"*
**Y** no se debe crear ni cancelar ninguna reserva en este flujo de cancelación

4. Escenario: Comportamiento de creación implícita (contexto)
**Dado** que no existe ninguna reserva para el correo "nuevo@example.com"
**Cuando** el visitante ingresa el correo "nuevo@example.com" y el secret "nuevoSecret" en el flujo de gestión de reservas
**Entonces** el sistema crea una reserva asociada a "nuevo@example.com" con secret "nuevoSecret"
**Y** se muestra el mensaje *"Reserva creada"* como precondición para operaciones posteriores

Esquema del escenario: Cancelaciones varias con datos de ejemplo
**Dado** que existe una reserva para el correo "<email>" con el secret "<secret>"
**Cuando** el visitante solicita cancelar la reserva usando el correo "<email>" y el secret "<inputSecret>"
**Entonces** <resultado>

Ejemplos:
| email               | secret   | inputSecret | resultado                                                     |
| cliente@example.com | abc123   | abc123      | la reserva para "cliente@example.com" debe quedar marcada como cancelada |
| cliente@example.com | abc123   | equivocado  | la reserva no debe ser cancelada                              |

5. Escenario: Intento de cancelar una reserva que ya fue cancelada (idempotencia)
**Dado** que existe una reserva para el correo "cliente@example.com" con el secret "abc123" y su estado es "cancelada"
**Cuando** el visitante solicita cancelar la reserva usando el correo "cliente@example.com" y el secret "abc123"
**Entonces** el sistema no debe cambiar el estado de la reserva
**Y** el sistema muestra el mensaje *"La reserva ya está cancelada"* o una respuesta idempotente apropiada

6. Escenario: Validación - falta de secret o correo inválido
**Cuando** el visitante envía el formulario de cancelación sin proporcionar correo
**Entonces** el sistema responde con un error indicando *"Se requiere un correo válido"*

7. Escenario: Cancelar cuando existen múltiples reservas para el mismo correo
**Dado** que existen dos reservas para el correo "multi@example.com":
| secret   | estado  |
| s1       | activa  |
| s2       | activa  |
**Cuando** el visitante solicita cancelar la reserva usando el correo "multi@example.com" y el secret "s1"
**Entonces** solo la reserva con secret "s1" debe quedar marcada como cancelada
**Y** la reserva con secret "s2" debe permanecer en estado "activa"
Nota: asumimos que el secret identifica la reserva concreta cuando el correo tiene múltiples reservas.

8. Escenario: Intento de cancelación de una reserva expirada
**Dado** que existe una reserva para el correo "vencida@example.com" con el secret "oldSecret" y su estado es "expirada"
**Cuando** el visitante solicita cancelar la reserva usando el correo "vencida@example.com" y el secret "oldSecret"
**Entonces** el sistema no debe permitir la cancelación
**Y** devuelve el mensaje *"No se puede cancelar una reserva expirada"*


Adicionalmente, el sistema gestionará las siguientes funcionalidades:

4. ## Confirmar reservas (interno): 
El personal de la farmacia podrá confirmar las reservas una vez que se verifiquen los requisitos (como la validación de prescripciones).

**Como** personal de farmacia
**Quiero** poder confirmar reservas pendientes
**Para** validar que se cumplen los requisitos antes de que el cliente retire el medicamento

### Escenarios Gherkin
Background: **Dado** que el sistema de confirmación de reservas está disponible

1. Escenario: Confirmación exitosa de una reserva pendiente
**Dado** que existe una reserva pendiente con ID de referencia "ABC12345"
**Cuando** el personal de farmacia confirma la reserva con ID "ABC12345"
**Entonces** la reserva debe cambiar a estado *"Confirmada"*
**Y** el sistema muestra el mensaje *"Reserva confirmada exitosamente"*

2. Escenario: Confirmación de reserva que requiere validación de prescripción
**Dado** que existe una reserva pendiente con ID de referencia "XYZ98765" que incluye medicamentos con prescripción
**Y** el personal de farmacia ha validado la receta médica
**Cuando** el personal de farmacia confirma la reserva con ID "XYZ98765"
**Entonces** la reserva debe cambiar a estado *"Confirmada"*
**Y** el sistema muestra el mensaje *"Reserva confirmada exitosamente"*

3. Escenario: Intento de confirmación de una reserva inexistente
**Dado** que no existe ninguna reserva con ID de referencia "NOEXISTE"
**Cuando** el personal de farmacia intenta confirmar la reserva con ID "NOEXISTE"
**Entonces** el sistema responde con un error indicando *"No se encontró la reserva"*
**Y** no se debe modificar ninguna reserva

4. Escenario: Intento de confirmación de una reserva ya confirmada (idempotencia)
**Dado** que existe una reserva con ID de referencia "CONF123" y su estado es "Confirmada"
**Cuando** el personal de farmacia intenta confirmar la reserva con ID "CONF123"
**Entonces** el sistema no debe cambiar el estado de la reserva
**Y** el sistema muestra el mensaje *"La reserva ya está confirmada"*

5. Escenario: Intento de confirmación de una reserva cancelada
**Dado** que existe una reserva con ID de referencia "CANC456" y su estado es "Cancelada"
**Cuando** el personal de farmacia intenta confirmar la reserva con ID "CANC456"
**Entonces** el sistema no debe permitir la confirmación
**Y** devuelve el mensaje *"No se puede confirmar una reserva cancelada"*

6. Escenario: Intento de confirmación de una reserva expirada
**Dado** que existe una reserva con ID de referencia "EXP789" y su estado es "Expirada"
**Cuando** el personal de farmacia intenta confirmar la reserva con ID "EXP789"
**Entonces** el sistema no debe permitir la confirmación
**Y** devuelve el mensaje *"No se puede confirmar una reserva expirada"*

7. Escenario: Validación - falta de ID de referencia
**Cuando** el personal de farmacia envía el formulario de confirmación sin proporcionar un ID de referencia
**Entonces** el sistema responde con un error indicando *"Se requiere un ID de referencia válido"*

Esquema del escenario: Confirmaciones varias con datos de ejemplo
**Dado** que existe una reserva con ID de referencia "<referenceId>" y su estado es "<estadoInicial>"
**Cuando** el personal de farmacia intenta confirmar la reserva con ID "<referenceId>"
**Entonces** <resultado>

Ejemplos:
| referenceId | estadoInicial | resultado                                                    |
| REF001      | Pendiente     | la reserva debe cambiar a estado "Confirmada"                |
| REF002      | Confirmada    | el sistema no debe cambiar el estado de la reserva           |
| REF003      | Cancelada     | el sistema no debe permitir la confirmación                  |
| REF004      | Expirada      | el sistema no debe permitir la confirmación                  |

8. Escenario: Confirmación de reserva establece fecha límite de retiro
**Dado** que existe una reserva pendiente con ID de referencia "LIM888"
**Cuando** el personal de farmacia confirma la reserva con ID "LIM888"
**Entonces** la reserva debe cambiar a estado *"Confirmada"*
**Y** se debe establecer una fecha límite de confirmación
**Y** el sistema muestra el mensaje *"Reserva confirmada exitosamente"*


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
**Y** muestra un mensaje de validación  dice *"Entrega completada exitosamente. La reserva ha sido cerrada."*

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

