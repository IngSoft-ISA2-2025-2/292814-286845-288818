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

    Scenario: Usuario con email existente pero secret incorrecto intenta consultar reservas
        Given un email "usuario@test.com"
        And un secret "secretIncorrecto"
        And el email "usuario@test.com" ya tiene reservas con secret "miSecret123"
        When hace click en el botón de consultar reservas
        Then el sistema responde con un error y muestra el mensaje "El secret no coincide con el registrado para este email"

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
