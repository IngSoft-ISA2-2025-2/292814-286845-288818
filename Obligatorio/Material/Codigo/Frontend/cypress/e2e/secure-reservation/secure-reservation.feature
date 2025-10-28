Feature: Validación Segura de Reservas
    Como sistema
    Quiero generar un par de claves público-privada para cada reserva
    Para asegurar la autenticidad del cliente y la correcta entrega del medicamento

    Background:
        Given estoy en la página de validación de reservas

    # Nota: Este escenario se prueba en create-reservation.feature
    # Scenario: Sistema genera claves público-privada al crear una reserva exitosamente
    #     Given un usuario autenticado con email "usuario@test.com"
    #     And una reserva creada para el medicamento "Aspirina" en la farmacia "Farmashop"
    #     When el sistema procesa la reserva
    #     Then el sistema genera automáticamente un par de claves público-privada
    #     And la clave pública se muestra al usuario
    #     And la clave privada se almacena de forma segura en el sistema
    #     And muestra un mensaje de validación que dice "Reserva creada exitosamente. Guarde su clave pública para retirar el medicamento en la farmacia."

    Scenario: Cliente presenta clave pública válida en la farmacia para validar reserva
        Given una reserva confirmada con código "RES-12345"
        And la reserva tiene una clave pública "PUBKEY-ABC123XYZ"
        And estoy en la página de validación de reservas en farmacia
        When ingreso la clave pública "PUBKEY-ABC123XYZ"
        And hago click en el botón de validar
        Then el sistema valida correctamente la clave pública
        And muestra la información de la reserva: medicamento, cantidad, cliente
        And muestra un mensaje de validación que dice "Entrega completada exitosamente. La reserva ha sido cerrada."

    Scenario: Cliente presenta clave pública inválida o inexistente en la farmacia
        Given estoy en la página de validación de reservas en farmacia
        And no existe ninguna reserva con la clave pública "PUBKEY-INVALID999"
        When ingreso la clave pública "PUBKEY-INVALID999"
        And hago click en el botón de validar
        Then el sistema responde con un error de tipo "not found (404)"
        And muestra un mensaje de validación que dice "La clave pública proporcionada no es válida o no existe"

    Scenario: Cliente presenta clave pública de una reserva ya expirada
        Given una reserva expirada con código "RES-67890"
        And la reserva tiene una clave pública "PUBKEY-EXPIRED456"
        And la reserva está en estado "Expirada"
        And estoy en la página de validación de reservas en farmacia
        When ingreso la clave pública "PUBKEY-EXPIRED456"
        And hago click en el botón de validar
        Then el sistema responde con un error de tipo "forbidden (403)"
        And muestra un mensaje de validación que dice "La reserva ha expirado y no puede ser utilizada"

    Scenario: Cliente presenta clave pública de una reserva cancelada
        Given una reserva cancelada con código "RES-54321"
        And la reserva tiene una clave pública "PUBKEY-CANCELLED789"
        And la reserva está en estado "Cancelada"
        And estoy en la página de validación de reservas en farmacia
        When ingreso la clave pública "PUBKEY-CANCELLED789"
        And hago click en el botón de validar
        Then el sistema responde con un error de tipo "forbidden (403)"
        And muestra un mensaje de validación que dice "La reserva fue cancelada y la clave pública ya no es válida"

    Scenario: Empleado de farmacia valida reserva con clave pública y completa la entrega
        Given soy un empleado autenticado de la farmacia "Farmashop"
        And existe una reserva confirmada con clave pública "PUBKEY-DELIVERY999"
        And la reserva está en estado "Confirmada"
        And estoy en la página de validación de reservas en farmacia
        When ingreso la clave pública "PUBKEY-DELIVERY999"
        And hago click en el botón de validar
        Then el sistema marca la reserva como "Retirada"
        And invalida la clave pública para evitar reutilización
        And muestra un mensaje de validación que dice "Entrega completada exitosamente. La reserva ha sido cerrada."

    # Nota: Este escenario se prueba en create-reservation.feature
    # Scenario: Usuario visualiza su clave pública en la pantalla de confirmación
    #     Given estoy en la página de crear-reserva
    #     And un usuario con email "usuario@test.com" y secret "secret123"
    #     And ha creado una reserva para "Paracetamol" en farmacia "Farmashop"
    #     When la reserva se crea exitosamente
    #     Then el sistema muestra la clave pública "PUBKEY-VIEW456"
    #     And muestra instrucciones que dicen "Guarde esta clave pública. La necesitará para retirar su medicamento en la farmacia."
    #     And puedo ver el estado de la reserva como "Confirmada"