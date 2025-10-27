Feature: Confirmar reservas
  Como personal de farmacia
  Quiero poder confirmar reservas pendientes
  Para validar que se cumplen los requisitos antes de que el cliente retire el medicamento

  Background:
    Given que el sistema de confirmación de reservas está disponible

  Scenario: Confirmación exitosa de una reserva pendiente
    Given que existe una reserva pendiente con ID de referencia "ABC12345"
    When el personal de farmacia confirma la reserva con ID "ABC12345"
    Then la reserva debe cambiar a estado "Confirmada"
    And el sistema muestra el mensaje "Reserva confirmada exitosamente"

  Scenario: Confirmación de reserva que requiere validación de prescripción
    Given que existe una reserva pendiente con ID de referencia "XYZ98765" que incluye medicamentos con prescripción
    And el personal de farmacia ha validado la receta médica
    When el personal de farmacia confirma la reserva con ID "XYZ98765"
    Then la reserva debe cambiar a estado "Confirmada"
    And el sistema muestra el mensaje "Reserva confirmada exitosamente"

  Scenario: Intento de confirmación de una reserva inexistente
    Given que no existe ninguna reserva con ID de referencia "NOEXISTE"
    When el personal de farmacia intenta confirmar la reserva con ID "NOEXISTE"
    Then el sistema responde con un error indicando "No se encontró la reserva"
    And no se debe modificar ninguna reserva

  Scenario: Intento de confirmación de una reserva ya confirmada (idempotencia)
    Given que existe una reserva con ID de referencia "CONF123" y su estado es "Confirmada"
    When el personal de farmacia intenta confirmar la reserva con ID "CONF123"
    Then el sistema no debe cambiar el estado de la reserva
    And el sistema muestra el mensaje "La reserva ya está confirmada"

  Scenario: Intento de confirmación de una reserva cancelada
    Given que existe una reserva con ID de referencia "CANC456" y su estado es "Cancelada"
    When el personal de farmacia intenta confirmar la reserva con ID "CANC456"
    Then el sistema no debe permitir la confirmación
    And devuelve el mensaje "No se puede confirmar una reserva cancelada"

  Scenario: Intento de confirmación de una reserva expirada
    Given que existe una reserva con ID de referencia "EXP789" y su estado es "Expirada"
    When el personal de farmacia intenta confirmar la reserva con ID "EXP789"
    Then el sistema no debe permitir la confirmación
    And devuelve el mensaje "No se puede confirmar una reserva expirada"

  Scenario: Validación - falta de ID de referencia
    When el personal de farmacia envía el formulario de confirmación sin proporcionar un ID de referencia
    Then el sistema responde con un error indicando "Se requiere un ID de referencia válido"

  Scenario Outline: Confirmaciones varias con datos de ejemplo
    Given que existe una reserva con ID de referencia "<referenceId>" y su estado es "<estadoInicial>"
    When el personal de farmacia intenta confirmar la reserva con ID "<referenceId>"
    Then <resultado>

    Examples:
      | referenceId | estadoInicial | resultado                                                                      |
      | REF001      | Pendiente     | la reserva debe cambiar a estado "Confirmada"                                  |
      | REF002      | Confirmada    | el sistema no debe cambiar el estado de la reserva                             |
      | REF003      | Cancelada     | el sistema no debe permitir la confirmación                                    |
      | REF004      | Expirada      | el sistema no debe permitir la confirmación                                    |

  Scenario: Confirmación de reserva establece fecha límite de retiro
    Given que existe una reserva pendiente con ID de referencia "LIM888"
    When el personal de farmacia confirma la reserva con ID "LIM888"
    Then la reserva debe cambiar a estado "Confirmada"
    And se debe establecer una fecha límite de confirmación
    And el sistema muestra el mensaje "Reserva confirmada exitosamente"