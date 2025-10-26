# language: es
Característica: Cancelar reservas
  Como visitante que conoce un correo y un secret
  Quiero poder cancelar una reserva introduciendo ese correo y secret
  Para que el sistema valide identidades sin necesidad de un usuario autenticado

  Antecedentes:
    Dado que el formulario de cancelación está disponible

  @cancelacion @reservas
  Escenario: Cancelación exitosa de una reserva existente
    Dado que existe una reserva para el correo "cliente@example.com" con el secret "abc123"
    Cuando el visitante solicita cancelar la reserva usando el correo "cliente@example.com" y el secret "abc123"
    Entonces la reserva para "cliente@example.com" debe quedar marcada como cancelada
    Y el sistema muestra el mensaje "Reserva cancelada correctamente"

  @cancelacion @error-secret
  Escenario: Intento de cancelación con secret incorrecto
    Dado que existe una reserva para el correo "cliente@example.com" con el secret "abc123"
    Cuando el visitante solicita cancelar la reserva usando el correo "cliente@example.com" y el secret "equivocado"
    Entonces la reserva no debe ser cancelada
    Y el sistema muestra el mensaje de error "Secret inválido para ese correo"

  @cancelacion @no-reserva
  Escenario: Intento de cancelación cuando no existe reserva para ese correo
    Dado que no existe ninguna reserva para el correo "sinreserva@example.com"
    Cuando el visitante solicita cancelar la reserva usando el correo "sinreserva@example.com" y el secret "cualquiera"
    Entonces el sistema responde con un error indicando "No existe una reserva asociada a ese correo"
    Y no se debe crear ni cancelar ninguna reserva en este flujo de cancelación

  @contexto @creacion-implicita
  Escenario: Comportamiento de creación implícita (contexto)
    Dado que no existe ninguna reserva para el correo "nuevo@example.com"
    Cuando el visitante ingresa el correo "nuevo@example.com" y el secret "nuevoSecret" en el flujo de gestión de reservas
    Entonces el sistema crea una reserva asociada a "nuevo@example.com" con secret "nuevoSecret"
    Y se muestra el mensaje "Reserva creada" como precondición para operaciones posteriores

  @cancelacion @ejemplos
  Esquema del escenario: Cancelaciones varias con datos de ejemplo
    Dado que existe una reserva para el correo "<email>" con el secret "<secret>"
    Cuando el visitante solicita cancelar la reserva usando el correo "<email>" y el secret "<inputSecret>"
    Entonces <resultado>

    Ejemplos:
      | email               | secret   | inputSecret | resultado                                                     |
      | cliente@example.com | abc123   | abc123      | la reserva para "cliente@example.com" debe quedar marcada como cancelada |
      | cliente@example.com | abc123   | equivocado  | la reserva no debe ser cancelada                              |

  @cancelacion @idempotencia
  Escenario: Intento de cancelar una reserva que ya fue cancelada (idempotencia)
    Dado que existe una reserva para el correo "cliente@example.com" con el secret "abc123" y su estado es "cancelada"
    Cuando el visitante solicita cancelar la reserva usando el correo "cliente@example.com" y el secret "abc123"
    Entonces el sistema no debe cambiar el estado de la reserva
    Y el sistema muestra el mensaje "La reserva ya está cancelada" o una respuesta idempotente apropiada

  @validacion @entrada
  Escenario: Validación - falta de secret o correo inválido
    Cuando el visitante envía el formulario de cancelación sin proporcionar correo
    Entonces el sistema responde con un error indicando "Se requiere un correo válido"

  @cancelacion @multiples-reservas
  Escenario: Cancelar cuando existen múltiples reservas para el mismo correo
    Dado que existen dos reservas para el correo "multi@example.com":
      | secret   | estado  |
      | s1       | activa  |
      | s2       | activa  |
    Cuando el visitante solicita cancelar la reserva usando el correo "multi@example.com" y el secret "s1"
    Entonces solo la reserva con secret "s1" debe quedar marcada como cancelada
    Y la reserva con secret "s2" debe permanecer en estado "activa"
    # Nota: asumimos que el secret identifica la reserva concreta cuando el correo tiene múltiples reservas.

  @cancelacion @expirada
  Escenario: Intento de cancelación de una reserva expirada
    Dado que existe una reserva para el correo "vencida@example.com" con el secret "oldSecret" y su estado es "expirada"
    Cuando el visitante solicita cancelar la reserva usando el correo "vencida@example.com" y el secret "oldSecret"
    Entonces el sistema no debe permitir la cancelación
    Y devuelve el mensaje "No se puede cancelar una reserva expirada"
