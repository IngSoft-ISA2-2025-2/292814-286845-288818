Feature: Cancelar reservas
  Como visitante que conoce un correo y un secret
  Quiero poder cancelar una reserva introduciendo ese correo y secret
  Para que el sistema valide identidades sin necesidad de un usuario autenticado

  Background:
    Given que el formulario de cancelación está disponible

  Scenario: Cancelación exitosa de una reserva existente
    Given que existe una reserva para el correo "cliente@example.com" con el secret "abc123"
    When el visitante solicita cancelar la reserva usando el correo "cliente@example.com" y el secret "abc123"
    Then la reserva para "cliente@example.com" debe quedar marcada como cancelada
    And el sistema muestra el mensaje "Reserva cancelada correctamente"

  Scenario: Intento de cancelación con secret incorrecto
    Given que existe una reserva para el correo "cliente@example.com" con el secret "abc123"
    When el visitante solicita cancelar la reserva usando el correo "cliente@example.com" y el secret "equivocado"
    Then la reserva no debe ser cancelada
    And el sistema muestra el mensaje de error "Secret inválido para ese correo"

  Scenario: Intento de cancelación cuando no existe reserva para ese correo
    Given que no existe ninguna reserva para el correo "sinreserva@example.com"
    When el visitante solicita cancelar la reserva usando el correo "sinreserva@example.com" y el secret "cualquiera"
    Then el sistema responde con un error indicando "No existe una reserva asociada a ese correo"
    And no se debe crear ni cancelar ninguna reserva en este flujo de cancelación

  Scenario: Comportamiento de creación implícita (contexto)
    Given que no existe ninguna reserva para el correo "nuevo@example.com"
    When el visitante ingresa el correo "nuevo@example.com" y el secret "nuevoSecret" en el flujo de gestión de reservas
    Then el sistema crea una reserva asociada a "nuevo@example.com" con secret "nuevoSecret"
    And se muestra el mensaje "Reserva creada" como precondición para operaciones posteriores

  Scenario Outline: Cancelaciones varias con datos de ejemplo
    Given que existe una reserva para el correo "<email>" con el secret "<secret>"
    When el visitante solicita cancelar la reserva usando el correo "<email>" y el secret "<inputSecret>"
    Then <resultado>

    Examples:
      | email               | secret   | inputSecret | resultado                                                     |
      | cliente@example.com | abc123   | abc123      | la reserva para "cliente@example.com" debe quedar marcada como cancelada |
      | cliente@example.com | abc123   | equivocado  | la reserva no debe ser cancelada                              |

  Scenario: Intento de cancelar una reserva que ya fue cancelada (idempotencia)
    Given que existe una reserva para el correo "cliente@example.com" con el secret "abc123" y su estado es "cancelada"
    When el visitante solicita cancelar la reserva usando el correo "cliente@example.com" y el secret "abc123"
    Then el sistema no debe cambiar el estado de la reserva
    And el sistema muestra el mensaje "La reserva ya está cancelada" o una respuesta idempotente apropiada

  Scenario: Validación - falta de secret o correo inválido
    When el visitante envía el formulario de cancelación sin proporcionar correo
    Then el sistema responde con un error indicando "Se requiere un correo válido"

  Scenario: Cancelar cuando existen múltiples reservas para el mismo correo
    Given que existen dos reservas para el correo "multi@example.com":
      | secret   | estado  |
      | s1       | activa  |
      | s2       | activa  |
    When el visitante solicita cancelar la reserva usando el correo "multi@example.com" y el secret "s1"
    Then solo la reserva con secret "s1" debe quedar marcada como cancelada
    And la reserva con secret "s2" debe permanecer en estado "activa"
    # Nota: asumimos que el secret identifica la reserva concreta cuando el correo tiene múltiples reservas.

  Scenario: Intento de cancelación de una reserva expirada
    Given que existe una reserva para el correo "vencida@example.com" con el secret "oldSecret" y su estado es "expirada"
    When el visitante solicita cancelar la reserva usando el correo "vencida@example.com" y el secret "oldSecret"
    Then el sistema no debe permitir la cancelación
    And devuelve el mensaje "No se puede cancelar una reserva expirada"
