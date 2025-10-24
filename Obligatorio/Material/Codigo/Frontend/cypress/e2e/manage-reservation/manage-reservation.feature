Feature: Gestionar reservas
    Como usuario autenticado
    Quiero poder visualizar mis reservas
    Para poder hacer seguimiento del estado de cada una y acceder a los detalles cuando los necesite

    Rule: El usuario solo ve sus propias reservas y debe estar autenticado

    Background:
        Given estoy en la página de mis reservas

    Scenario: Usuario no autenticado intenta visualizar reservas
        Given un usuario no autenticado
        When intenta acceder al listado de sus reservas
        Then el sistema responde con un error y muestra el mensaje "Debe iniciar sesión para ver sus reservas"

    Scenario: Usuario autenticado sin reservas visualiza listado vacío
        Given un usuario autenticado
        And no tiene reservas creadas en el sistema
        When solicita visualizar sus reservas
        Then el sistema responde de manera correcta, mostrando un listado vacío
        And muestra un mensaje que dice "No tienes reservas creadas"

    Scenario: Usuario autenticado visualiza sus reservas exitosamente
        Given un usuario autenticado
        And tiene reservas creadas en diferentes estados "Pendiente", "Confirmada", "Expirada", "Cancelada" y "Retirada"
        When solicita visualizar sus reservas
        Then el sistema responde de manera correcta, mostrando un listado con todas sus reservas
        And cada reserva muestra información básica: nombre de el/los medicamento/s, farmacia y estado
        And cada reserva incluye un botón para ver más detalles

    Scenario: Usuario filtra reservas por estado
        Given un usuario autenticado
        And tiene reservas en diferentes estados
        When aplica filtro para ver solo reservas en estado "Confirmada"
        Then el sistema responde de manera correcta, mostrando un listado únicamente con las reservas en estado "Confirmada"

    Scenario: Usuario intenta acceder a detalles de reserva inexistente
        Given un usuario autenticado
        When intenta acceder a detalles de una reserva que no existe
        Then el sistema responde con un error, mostrando un mensaje que dice "Reserva no encontrada"

    Scenario: Usuario accede a detalles de una reserva específica
        Given un usuario autenticado
        And tiene una reserva creada
        When selecciona ver detalles de la reserva
        Then el sistema responde de manera correcta, mostrando la información detallada completa de la reserva: medicamento/s, cantidad, farmacia, estado, fecha de creación, id

    Scenario: Usuario visualiza reservas pendientes con opciones disponibles
        Given un usuario autenticado
        And tiene una reserva en estado "Pendiente"
        When solicita visualizar sus reservas
        Then el sistema responde de manera correcta, mostrando un listado con todas sus reservas
        And la reserva pendiente muestra claramente el estado "Pendiente"
        And muestra un mensaje que dice "Reserva pendiente de confirmación por la farmacia"
        And incluye un botón para cancelar la reserva
        And muestra la fecha límite para confirmar la reserva
        And no muestra ID de referencia hasta que sea confirmada

    Scenario: Usuario visualiza ID de referencia para reservas confirmadas
        Given un usuario autenticado
        And tiene una reserva en estado "Confirmada"
        When solicita visualizar sus reservas
        Then el sistema responde de manera correcta, mostrando un listado con todas sus reservas
        And la reserva confirmada muestra un ID de referencia único
        And muestra un mensaje que dice "Presenta este ID en la farmacia para retirar tu medicamento"

    Scenario: Usuario visualiza reservas expiradas con indicaciones
        Given un usuario autenticado
        And tiene una reserva en estado "Expirada"
        When solicita visualizar sus reservas
        Then el sistema responde de manera correcta, mostrando un listado con todas sus reservas
        And la reserva expirada muestra claramente el estado "Expirada"
        And muestra un mensaje que dice "Esta reserva ha expirado. Puedes crear una nueva reserva si aún necesitas el medicamento"
        And muestra la fecha de expiración

    Scenario: Usuario ordena reservas por fecha de creación descendente
        Given un usuario autenticado
        And tiene múltiples reservas creadas en diferentes fechas
        When solicita ordenar por fecha de creación más reciente
        Then el sistema responde de manera correcta, mostrando las reservas ordenadas de más reciente a más antigua

    Scenario: Usuario busca reservas por nombre de medicamento
        Given un usuario autenticado
        And tiene reservas de diferentes medicamentos
        When busca reservas por el nombre "Paracetamol"
        Then el sistema responde de manera correcta, mostrando únicamente las reservas que contienen medicamentos con "Paracetamol"

    Scenario: Usuario busca reservas por nombre de farmacia
        Given un usuario autenticado
        And tiene reservas de diferentes farmacias
        When busca reservas por el nombre "Farmacia Central"
        Then el sistema responde de manera correcta, mostrando únicamente las reservas que contienen la farmacia "Farmacia Central"

    Scenario: Usuario visualiza reservas canceladas con información del motivo
        Given un usuario autenticado
        And tiene una reserva en estado "Cancelada"
        When solicita visualizar sus reservas
        Then el sistema responde de manera correcta, mostrando un listado con todas sus reservas
        And la reserva cancelada muestra claramente el estado "Cancelada"
        And muestra un mensaje que dice "Reserva cancelada. No es posible reactivarla"
        And muestra la fecha de cancelación

    Scenario: Usuario visualiza reservas retiradas con confirmación exitosa
        Given un usuario autenticado
        And tiene una reserva en estado "Retirada"
        When solicita visualizar sus reservas
        Then el sistema responde de manera correcta, mostrando un listado con todas sus reservas
        And la reserva retirada muestra claramente el estado "Retirada"
        And muestra un mensaje que dice "Reserva retirada exitosamente"
        And muestra la fecha de retiro
