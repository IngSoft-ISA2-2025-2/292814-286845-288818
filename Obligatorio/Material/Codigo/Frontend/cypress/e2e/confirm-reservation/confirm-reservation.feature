# language: es
Característica: Confirmar reservas
  Como personal de farmacia
  Quiero poder confirmar reservas pendientes
  Para validar que se cumplen los requisitos antes de que el cliente retire el medicamento

  Antecedentes:
    Dado que el sistema de confirmación de reservas está disponible

  @confirmacion @reservas
  Escenario: Confirmación exitosa de una reserva pendiente
    Dado que existe una reserva pendiente con ID de referencia "ABC12345"
    Cuando el personal de farmacia confirma la reserva con ID "ABC12345"
    Entonces la reserva debe cambiar a estado "Confirmada"
    Y el sistema muestra el mensaje "Reserva confirmada exitosamente"

  @confirmacion @prescripcion
  Escenario: Confirmación de reserva que requiere validación de prescripción
    Dado que existe una reserva pendiente con ID de referencia "XYZ98765" que incluye medicamentos con prescripción
    Y el personal de farmacia ha validado la receta médica
    Cuando el personal de farmacia confirma la reserva con ID "XYZ98765"
    Entonces la reserva debe cambiar a estado "Confirmada"
    Y el sistema muestra el mensaje "Reserva confirmada exitosamente"

  @confirmacion @error-no-existe
  Escenario: Intento de confirmación de una reserva inexistente
    Dado que no existe ninguna reserva con ID de referencia "NOEXISTE"
    Cuando el personal de farmacia intenta confirmar la reserva con ID "NOEXISTE"
    Entonces el sistema responde con un error indicando "No se encontró la reserva"
    Y no se debe modificar ninguna reserva

  @confirmacion @error-estado
  Escenario: Intento de confirmación de una reserva ya confirmada (idempotencia)
    Dado que existe una reserva con ID de referencia "CONF123" y su estado es "Confirmada"
    Cuando el personal de farmacia intenta confirmar la reserva con ID "CONF123"
    Entonces el sistema no debe cambiar el estado de la reserva
    Y el sistema muestra el mensaje "La reserva ya está confirmada"

  @confirmacion @error-cancelada
  Escenario: Intento de confirmación de una reserva cancelada
    Dado que existe una reserva con ID de referencia "CANC456" y su estado es "Cancelada"
    Cuando el personal de farmacia intenta confirmar la reserva con ID "CANC456"
    Entonces el sistema no debe permitir la confirmación
    Y devuelve el mensaje "No se puede confirmar una reserva cancelada"

  @confirmacion @error-expirada
  Escenario: Intento de confirmación de una reserva expirada
    Dado que existe una reserva con ID de referencia "EXP789" y su estado es "Expirada"
    Cuando el personal de farmacia intenta confirmar la reserva con ID "EXP789"
    Entonces el sistema no debe permitir la confirmación
    Y devuelve el mensaje "No se puede confirmar una reserva expirada"

  @validacion @entrada
  Escenario: Validación - falta de ID de referencia
    Cuando el personal de farmacia envía el formulario de confirmación sin proporcionar un ID de referencia
    Entonces el sistema responde con un error indicando "Se requiere un ID de referencia válido"

  @confirmacion @ejemplos
  Esquema del escenario: Confirmaciones varias con datos de ejemplo
    Dado que existe una reserva con ID de referencia "<referenceId>" y su estado es "<estadoInicial>"
    Cuando el personal de farmacia intenta confirmar la reserva con ID "<referenceId>"
    Entonces <resultado>

    Ejemplos:
      | referenceId | estadoInicial | resultado                                                                      |
      | REF001      | Pendiente     | la reserva debe cambiar a estado "Confirmada"                                  |
      | REF002      | Confirmada    | el sistema no debe cambiar el estado de la reserva                             |
      | REF003      | Cancelada     | el sistema no debe permitir la confirmación                                    |
      | REF004      | Expirada      | el sistema no debe permitir la confirmación                                    |

  @confirmacion @fecha-limite
  Escenario: Confirmación de reserva establece fecha límite de retiro
    Dado que existe una reserva pendiente con ID de referencia "LIM888"
    Cuando el personal de farmacia confirma la reserva con ID "LIM888"
    Entonces la reserva debe cambiar a estado "Confirmada"
    Y se debe establecer una fecha límite de confirmación
    Y el sistema muestra el mensaje "Reserva confirmada exitosamente"
