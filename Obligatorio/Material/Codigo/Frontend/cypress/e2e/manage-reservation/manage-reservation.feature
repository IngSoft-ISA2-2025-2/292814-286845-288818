Feature: Gestionar reservas
    Como usuario
    Quiero poder visualizar mis reservas ingresando mi email y secret
    Para poder hacer seguimiento del estado de cada una y acceder a los detalles cuando los necesite

    Background:
        Given estoy en la página de mis reservas

    Scenario: Usuario sin email intenta consultar reservas
        Given un email ""
        And un secret ""
        When hace click en el botón de consultar reservas
        Then el sistema responde con un error y muestra el mensaje "Debe ingresar un email y secret para consultar reservas."

    Scenario: Usuario con email y secret válidos sin reservas visualiza listado vacío
        Given un email "usuario@test.com"
        And un secret "miSecret123"
        And no tiene reservas creadas en el sistema
        When hace click en el botón de consultar reservas
        Then el sistema responde de manera correcta, mostrando un listado vacío
        And muestra un mensaje que dice "No tienes reservas creadas"

    Scenario: Usuario con email y secret válidos visualiza sus reservas exitosamente
        Given un email "usuario@test.com"
        And un secret "miSecret123"
        And tiene reservas creadas en diferentes estados "Pendiente", "Confirmada", "Expirada", "Cancelada" y "Retirada"
        When hace click en el botón de consultar reservas
        Then el sistema responde de manera correcta, mostrando un listado con todas sus reservas
        And cada reserva muestra información básica: nombre de el/los medicamento/s, farmacia y estado
        And cada reserva incluye un botón para ver más detalles

    Scenario: Usuario filtra reservas por estado
        Given un email "usuario@test.com"
        And un secret "miSecret123"
        And tiene reservas en diferentes estados
        When aplica filtro para ver solo reservas en estado "Confirmada"
        Then el sistema responde de manera correcta, mostrando un listado únicamente con las reservas en estado "Confirmada"

    Scenario: Usuario intenta acceder a detalles de reserva inexistente
        Given un email "usuario@test.com"
        And un secret "miSecret123"
        When intenta acceder a detalles de una reserva que no existe
        Then el sistema responde con un error, mostrando un mensaje que dice "Reserva no encontrada"

    Scenario: Usuario accede a detalles de una reserva específica
        Given un email "usuario@test.com"
        And un secret "miSecret123"
        And tiene una reserva creada
        When selecciona ver detalles de la reserva
        Then el sistema responde de manera correcta, mostrando la información detallada completa de la reserva: medicamento/s, cantidad, farmacia, estado, fecha de creación, id
    
    Scenario: Usuario con email existente pero secret incorrecto intenta consultar reservas
        Given un email "usuario@test.com"
        And un secret "secretIncorrecto"
        And el email "usuario@test.com" ya tiene reservas con secret "miSecret123"
        When hace click en el botón de consultar reservas
        Then el sistema responde con un error y muestra el mensaje "El secret no coincide con el registrado para este email"

    Scenario: Usuario visualiza reservas pendientes con opciones disponibles
        Given un email "usuario@test.com"
        And un secret "miSecret123"
        And tiene una reserva en estado "Pendiente"
        When hace click en el botón de consultar reservas
        Then el sistema responde de manera correcta, mostrando un listado con todas sus reservas
        And la reserva pendiente muestra claramente el estado "Pendiente"
        And muestra un mensaje que dice "Reserva pendiente de confirmación por la farmacia"
        And incluye un botón para cancelar la reserva
        And muestra la fecha límite para confirmar la reserva
        And no muestra ID de referencia hasta que sea confirmada

    Scenario: Usuario visualiza ID de referencia para reservas confirmadas
        Given un email "usuario@test.com"
        And un secret "miSecret123"
        And tiene una reserva en estado "Confirmada"
        When hace click en el botón de consultar reservas
        Then el sistema responde de manera correcta, mostrando un listado con todas sus reservas
        And la reserva confirmada muestra un ID de referencia único
        And muestra un mensaje que dice "Presenta este ID en la farmacia para retirar tu medicamento"

    Scenario: Usuario visualiza reservas expiradas con indicaciones
        Given un email "usuario@test.com"
        And un secret "miSecret123"
        And tiene una reserva en estado "Expirada"
        When hace click en el botón de consultar reservas
        Then el sistema responde de manera correcta, mostrando un listado con todas sus reservas
        And la reserva expirada muestra claramente el estado "Expirada"
        And muestra un mensaje que dice "Esta reserva ha expirado. Puedes crear una nueva reserva si aún necesitas el medicamento"
        And muestra la fecha de expiración

    Scenario: Usuario ordena reservas por fecha de creación descendente
        Given un email "usuario@test.com"
        And un secret "miSecret123"
        And tiene múltiples reservas creadas en diferentes fechas
        When solicita ordenar por fecha de creación más reciente
        Then el sistema responde de manera correcta, mostrando las reservas ordenadas de más reciente a más antigua

    Scenario: Usuario busca reservas por nombre de medicamento
        Given un email "usuario@test.com"
        And un secret "miSecret123"
        And tiene reservas de diferentes medicamentos
        When busca reservas por el nombre "Paracetamol"
        Then el sistema responde de manera correcta, mostrando únicamente las reservas que contienen medicamentos con "Paracetamol"

    Scenario: Usuario busca reservas por nombre de farmacia
        Given un email "usuario@test.com"
        And un secret "miSecret123"
        And tiene reservas de diferentes farmacias
        When busca reservas por el nombre "Farmacia Central"
        Then el sistema responde de manera correcta, mostrando únicamente las reservas que contienen la farmacia "Farmacia Central"

    Scenario: Usuario visualiza reservas canceladas con información del motivo
        Given un email "usuario@test.com"
        And un secret "miSecret123"
        And tiene una reserva en estado "Cancelada"
        When hace click en el botón de consultar reservas
        Then el sistema responde de manera correcta, mostrando un listado con todas sus reservas
        And la reserva cancelada muestra claramente el estado "Cancelada"
        And muestra un mensaje que dice "Reserva cancelada. No es posible reactivarla"
        And muestra la fecha de cancelación

    Scenario: Usuario visualiza reservas retiradas con confirmación exitosa
        Given un email "usuario@test.com"
        And un secret "miSecret123"
        And tiene una reserva en estado "Retirada"
        When hace click en el botón de consultar reservas
        Then el sistema responde de manera correcta, mostrando un listado con todas sus reservas
        And la reserva retirada muestra claramente el estado "Retirada"
        And muestra un mensaje que dice "Reserva retirada exitosamente"
        And muestra la fecha de retiro
