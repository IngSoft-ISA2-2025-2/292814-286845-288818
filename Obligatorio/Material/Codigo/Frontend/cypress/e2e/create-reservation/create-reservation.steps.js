import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// ============================================================================
// BACKGROUND
// ============================================================================
Given('estoy en la página de reservas de medicamentos', () => {
  cy.visit('/create-reservation');
});

// ============================================================================
// GIVEN STEPS
// ============================================================================
Given('un email para reserva {string}', (email) => {
  cy.get('[data-cy="email-input"]').clear();
  if (email) {
    cy.get('[data-cy="email-input"]').type(email);
  }
});

Given('un secret para reserva {string}', (secret) => {
  // Esperar a que el campo esté habilitado antes de intentar escribir
  cy.get('[data-cy="secret-input"]').should('not.be.disabled');
  cy.get('[data-cy="secret-input"]').clear();
  if (secret) {
    cy.get('[data-cy="secret-input"]').type(secret);
  }
});

Given('un medicamento {string} con cantidad de {int} unidad', (nombre, cantidad) => {
  cy.get('[data-cy="medicamento-nombre-input"]').clear().type(nombre);
  cy.get('[data-cy="medicamento-cantidad-input"]').clear().type(cantidad.toString());
  cy.get('[data-cy="agregar-medicamento-btn"]').click();
});

Given('un medicamento {string} con cantidad de {int} unidad que requiere prescripción médica', (nombre, cantidad) => {
  cy.get('[data-cy="medicamento-nombre-input"]').clear().type(nombre);
  cy.get('[data-cy="medicamento-cantidad-input"]').clear().type(cantidad.toString());
  cy.get('[data-cy="agregar-medicamento-btn"]').click();
});

Given('un medicamento {string} con cantidad de {int} unidad que no requiere prescripción médica', (nombre, cantidad) => {
  cy.get('[data-cy="medicamento-nombre-input"]').clear().type(nombre);
  cy.get('[data-cy="medicamento-cantidad-input"]').clear().type(cantidad.toString());
  cy.get('[data-cy="agregar-medicamento-btn"]').click();
});

Given('una farmacia {string}', (farmacia) => {
  cy.get('[data-cy="farmacia-input"]').clear().type(farmacia);
});

Given('el medicamento no existe en la farmacia {string}', (farmacia) => {
  // Step descriptivo - configuramos el intercept
  cy.intercept('POST', '**/api/Reservation', {
    statusCode: 404,
    body: { message: 'El medicamento MedicamentoInexistente no existe en la farmacia Farmashop' }
  }).as('medicamentoInexistente');
});

Given('no hay stock disponible para el medicamento {string} en la farmacia {string}', (medicamento, farmacia) => {
  cy.intercept('POST', '**/api/Reservation', {
    statusCode: 409,
    body: { message: `No hay stock disponible para el medicamento ${medicamento}` }
  }).as('sinStock');
});

Given('hay stock mayor o igual a una unidad para el medicamento {string} en la farmacia {string}', (medicamento, farmacia) => {
  const requierePrescripcion = medicamento === 'Aspirina';
  const mensaje = requierePrescripcion
    ? `Reserva creada exitosamente, el medicamento ${medicamento} requiere receta médica. Por favor, preséntela en la farmacia para validar la reserva.`
    : 'Reserva creada exitosamente';
  
  cy.intercept('POST', '**/api/Reservation', {
    statusCode: 201,
    body: {
      id: 1,
      estado: 'Pendiente',
      medicamentos: [{ nombre: medicamento, cantidad: 1, requierePrescripcion }],
      farmacia: farmacia,
      mensaje: mensaje
    }
  }).as('reservaExitosa');
});

Given('hay stock mayor o igual a una unidad para ambos medicamentos en la farmacia {string}', (farmacia) => {
  cy.intercept('POST', '**/api/Reservation', {
    statusCode: 201,
    body: {
      id: 2,
      estado: 'Pendiente',
      medicamentos: [
        { nombre: 'Aspirina', cantidad: 1, requierePrescripcion: true },
        { nombre: 'Paracetamol', cantidad: 1, requierePrescripcion: false }
      ],
      farmacia: farmacia,
      mensaje: 'Reserva creada exitosamente, el medicamento Aspirina requiere receta médica. Por favor, preséntela en la farmacia para validar la reserva.'
    }
  }).as('reservaMultiple');
});

Given('el email para reserva {string} ya tiene reservas con secret {string}', (email, secretCorrecto) => {
  cy.intercept('POST', '**/api/Reservation', (req) => {
    if (req.body.secret !== secretCorrecto) {
      req.reply({
        statusCode: 403,
        body: { message: 'El secret no coincide con el registrado para este email' }
      });
    }
  }).as('secretIncorrecto');
});

// ============================================================================
// WHEN STEPS
// ============================================================================
When('hace click en el botón de reservar', () => {
  // Verificar si la farmacia es inexistente y configurar intercept si no está ya configurado
  cy.get('[data-cy="farmacia-input"]').invoke('val').then((farmacia) => {
    if (farmacia === 'FarmaciaInexistente') {
      cy.intercept('POST', '**/api/Reservation', {
        statusCode: 404,
        body: { message: `La farmacia ${farmacia} no existe` }
      }).as('farmaciaInexistente');
    }
  });
  
  cy.get('[data-cy="reservar-btn"]').click();
});

// ============================================================================
// THEN STEPS
// ============================================================================
Then('el sistema responde con un error con un mensaje que dice {string}', (mensaje) => {
  cy.get('[data-cy="error-mensaje"]', { timeout: 5000 }).should('be.visible');
  cy.get('[data-cy="error-mensaje"]').should('contain', mensaje);
});

Then('el sistema responde con un error un mensaje que dice {string}', (mensaje) => {
  cy.get('[data-cy="error-mensaje"]', { timeout: 5000 }).should('be.visible');
  cy.get('[data-cy="error-mensaje"]').should('contain', mensaje);
});

Then('el sistema muestra responde con un mensaje que dice {string}', (mensaje) => {
  cy.get('[data-cy="error-mensaje"]', { timeout: 5000 }).should('be.visible');
  cy.get('[data-cy="error-mensaje"]').should('contain', mensaje);
});

Then('muestra un mensaje de reserva que dice {string}', (mensaje) => {
  cy.get('[data-cy="success-mensaje"]', { timeout: 5000 }).should('be.visible');
  cy.get('[data-cy="success-mensaje"]').should('contain', mensaje);
});

Then('el sistema crea la reserva con un estado Pendiente', () => {
  cy.get('[data-cy="success-mensaje"]').should('be.visible');
  cy.get('[data-cy="estado-reserva"]').should('contain', 'Pendiente');
});

Then('el sistema crea la reserva con un estado {string}', (estado) => {
  cy.get('[data-cy="success-mensaje"]').should('be.visible');
  cy.get('[data-cy="estado-reserva"]').should('contain', estado);
});

Then('descuenta la unidad del stock de los medicamentos', () => {
  cy.get('[data-cy="stock-actualizado"]').should('exist');
});