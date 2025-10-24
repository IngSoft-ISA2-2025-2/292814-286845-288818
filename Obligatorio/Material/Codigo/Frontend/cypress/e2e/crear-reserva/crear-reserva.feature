Feature: Crear reservas
    Como usuario autenticado
    Quiero reservar medicamentos de una farmacia especifica
    Para asegurar la disponibilidad del medicamento antes de retirarlo

    Background:
        Given estoy en la página de reservas de medicamentos

    Scenario: Usuario no autenticado intenta reservar medicamentos
        Given un usuario no autenticado
        And un medicamento "Aspirina" con cantidad de 1 unidad
        And una farmacia "Farmashop"
        When hace click en el botón de reservar
        Then el sistema responde con un error con un mensaje que dice "Debe iniciar sesión para reservar medicamentos."

    Scenario: Usuario intenta reservar un medicamento en una farmacia inválida
        Given un usuario autenticado
        And un medicamento "Aspirina" con cantidad de 1 unidad
        And una farmacia "FarmaciaInexistente"
        When hace click en el botón de reservar
        Then el sistema responde con un error un mensaje que dice "La farmacia FarmaciaInexistente no existe"

    Scenario: Usuario intenta reservar un medicamento inexistente en una farmacia válida
        Given un usuario autenticado
        And un medicamento "MedicamentoInexistente" con cantidad de 1 unidad
        And el medicamento no existe en la farmacia "Farmashop"
        And una farmacia "Farmashop"
        When hace click en el botón de reservar
        Then el sistema responde con un error con un mensaje que dice "El medicamento MedicamentoInexistente no existe en la farmacia Farmashop"

    Scenario: Usuario autenticado intenta reservar un medicamento sin stock
        Given un usuario autenticado
        And un medicamento "Aspirina" con cantidad de 1 unidad
        And no hay stock disponible para el medicamento "Aspirina" en la farmacia "Farmashop"
        And una farmacia "Farmashop"
        When hace click en el botón de reservar
        Then el sistema muestra responde con un mensaje que dice "No hay stock disponible para el medicamento Aspirina"

    Scenario: Usuario reserva un medicamento que requiere prescripción con exito
        Given un usuario autenticado
        And un medicamento "Aspirina" con cantidad de 1 unidad que requiere prescripción médica
        And hay stock mayor o igual a una unidad para el medicamento "Aspirina" en la farmacia "Farmashop"
        And una farmacia "Farmashop"
        When hace click en el botón de reservar
        Then el sistema crea la reserva con un estado Pendiente
        And descuenta la unidad del stock de los medicamentos
        And muestra un mensaje que dice "Reserva creada exitosamente, el medicamento Aspirina requiere receta médica. Por favor, preséntela en la farmacia para validar la reserva."

    Scenario: Usuario reserva un medicamento que no requiere prescripción con éxito
        Given un usuario autenticado
        And un medicamento "Paracetamol" con cantidad de 1 unidad que no requiere prescripción médica
        And hay stock mayor o igual a una unidad para el medicamento "Paracetamol" en la farmacia "Farmashop"
        And una farmacia "Farmashop"
        When hace click en el botón de reservar
        Then el sistema crea la reserva con un estado Pendiente
        And descuenta la unidad del stock de los medicamentos
        And muestra un mensaje que dice "Reserva creada exitosamente"

    Scenario: Usuario reserva dos medicamentos uno que requiere prescripción y otro que no requiere con éxito
        Given un usuario autenticado
        And un medicamento "Aspirina" con cantidad de 1 unidad que requiere prescripción médica
        And un medicamento "Paracetamol" con cantidad de 1 unidad que no requiere prescripción médica
        And hay stock mayor o igual a una unidad para ambos medicamentos en la farmacia "Farmashop"
        And una farmacia "Farmashop"
        When hace click en el botón de reservar
        Then el sistema crea la reserva con un estado "Pendiente"
        And descuenta la unidad del stock de los medicamentos
        And muestra un mensaje que dice "Reserva creada exitosamente, el medicamento Aspirina requiere receta médica. Por favor, preséntela en la farmacia para validar la reserva."