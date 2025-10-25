Feature: Gestión de estados
    Como sistema
    Quiero poder gestionar las reservas a través de estados
    Para reflejar con precisión su situación actual y facilitar el seguimiento tanto para usuarios como para farmacias

    Background:
        Given estoy en la página de gestión de estados

    Scenario: Reserva recién creada se asigna al estado Pendiente
        Given un email "usuario@test.com"
        And un secret "secret123"
        And quiero crear una reserva con medicamento "Aspirina" en farmacia "Farmashop"
        When creo la reserva
        Then el sistema asigna automáticamente el estado "Pendiente"
        And la reserva es visible con estado "Pendiente"

    Scenario: Sistema muestra correctamente reserva en estado Confirmada
        Given un email "usuario@test.com"
        And un secret "secret123"
        And tengo una reserva en estado "Confirmada"
        When consulto mis reservas
        Then veo la reserva con estado "Confirmada"
        And veo el ID de referencia de la reserva
        And veo la fecha de confirmación

    Scenario: Sistema muestra correctamente reserva en estado Expirada
        Given un email "usuario@test.com"
        And un secret "secret123"
        And tengo una reserva en estado "Expirada"
        When consulto mis reservas
        Then veo la reserva con estado "Expirada"
        And veo un mensaje que dice "Esta reserva ha expirado"
        And veo la fecha de expiración

    Scenario: Sistema muestra correctamente reserva en estado Cancelada
        Given un email "usuario@test.com"
        And un secret "secret123"
        And tengo una reserva en estado "Cancelada"
        When consulto mis reservas
        Then veo la reserva con estado "Cancelada"
        And veo un mensaje que dice "Reserva cancelada"
        And veo la fecha de cancelación

    Scenario: Sistema muestra correctamente reserva en estado Retirada
        Given un email "usuario@test.com"
        And un secret "secret123"
        And tengo una reserva en estado "Retirada"
        When consulto mis reservas
        Then veo la reserva con estado "Retirada"
        And veo un mensaje que dice "Reserva retirada exitosamente"
        And veo la fecha de retiro

    Scenario: Usuario visualiza todas sus reservas con diferentes estados
        Given un email "usuario@test.com"
        And un secret "secret123"
        And tengo reservas en estados "Pendiente", "Confirmada", "Expirada", "Cancelada" y "Retirada"
        When consulto mis reservas
        Then veo todas mis reservas
        And cada reserva muestra su estado correctamente
        And las reservas pendientes no muestran ID de referencia
        And las reservas confirmadas muestran ID de referencia

    Scenario: Usuario filtra reservas por estado Pendiente
        Given un email "usuario@test.com"
        And un secret "secret123"
        And tengo reservas en diferentes estados
        When filtro por estado "Pendiente"
        Then solo veo reservas en estado "Pendiente"

    Scenario: Usuario filtra reservas por estado Confirmada
        Given un email "usuario@test.com"
        And un secret "secret123"
        And tengo reservas en diferentes estados
        When filtro por estado "Confirmada"
        Then solo veo reservas en estado "Confirmada"

    Scenario: Usuario filtra reservas por estado Expirada
        Given un email "usuario@test.com"
        And un secret "secret123"
        And tengo reservas en diferentes estados
        When filtro por estado "Expirada"
        Then solo veo reservas en estado "Expirada"

    Scenario: Usuario filtra reservas por estado Cancelada
        Given un email "usuario@test.com"
        And un secret "secret123"
        And tengo reservas en diferentes estados
        When filtro por estado "Cancelada"
        Then solo veo reservas en estado "Cancelada"

    Scenario: Usuario filtra reservas por estado Retirada
        Given un email "usuario@test.com"
        And un secret "secret123"
        And tengo reservas en diferentes estados
        When filtro por estado "Retirada"
        Then solo veo reservas en estado "Retirada"
