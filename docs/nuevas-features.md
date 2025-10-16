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

3. ## Cancelar reservas
En caso de ser necesario, los usuarios tendrán la opción de cancelar sus reservas.

**Como** usuario autenticado 
**Quiero** poder cancelar una reserva
**Para** poder liberar medicamentos que ya no necesito y evitar problemas a la farmacia

Adicionalmente, el sistema gestionará las siguientes funcionalidades:

4. ## Confirmar reservas (interno): 
El personal de la farmacia podrá confirmar las reservas una vez que se verifiquen los requisitos (como la validación de prescripciones).

**Como** empleado de la farmacia autenticado
**Quiero** poder confirmar reservas
**Para** avisar al cliente que su reserva fue procesada y que los medicamentos ya se reservaron

5. ## Gestión de estados
Internamente, el sistema gestionará las reservas a través de diferentes estados: "Pendiente" (al crearse), "Confirmada" (tras la validación y confirmación), "Expirada" (si no se retira en un tiempo determinado) y "Cancelada" (si el usuario la anula o el sistema la cancela por falta de validación).

**Como** sistema
**Quiero** poder gestionar las reservas a traves de estados
**Para** reflejar con precisión su situación actual y facilitar el seguimiento tanto para usuarios como para farmacias

6. ## Validación Segura de Reservas
Para robustecer la seguridad del proceso, cuando se genere una reserva, el sistema creará un par de claves público-privada. Para hacer uso de la reserva en la farmacia, el cliente deberá proveer la clave pública para que el sistema la valide, asegurando así la autenticidad y correcta entrega del medicamento.

**Como** sistema
**Quiero** generar un par de claves publico-privada
**Para** asegurar la autenticidad del cliente y la correcta entrega del medicamento



Se debe disponer de endpoints REST para interactuar con estas funcionalidades (crear, listar, confirmar y cancelar reservas). En el frontend, se desarrollarán pantallas para la búsqueda de medicamentos, la creación de reservas y la visualización y gestión de las reservas del usuario.

