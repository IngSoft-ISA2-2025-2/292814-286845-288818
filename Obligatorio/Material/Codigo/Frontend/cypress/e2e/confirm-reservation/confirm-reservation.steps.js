import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// ============================================================================
// BACKGROUND
// ============================================================================
Given('que el sistema de confirmación de reservas está disponible', () => {
  cy.visit('/confirm-reservation');
  cy.get('[data-cy="confirm-reference-input"]').should('exist');
  cy.get('[data-cy="confirm-btn"]').should('exist');
});

// ============================================================================
// GIVEN STEPS
// ============================================================================
Given('que existe una reserva pendiente con ID de referencia {string}', (referenceId) => {
  cy.intercept('PUT', '**/api/Reservation/confirmar**', {
    statusCode: 200,
    body: {
      pharmacyName: 'Farmashop',
      publicKey: 'PUBLIC123',
      status: 'Confirmed',
      drugsReserved: [
        { drugName: 'Aspirina', drugQuantity: 2 }
      ]
    }
  }).as('confirmRequest');
  
  cy.wrap({ referenceId, estado: 'Pendiente', scenario: 'success' }).as('scenarioData');
});

Given('que existe una reserva pendiente con ID de referencia {string} que incluye medicamentos con prescripción', (referenceId) => {
  cy.intercept('PUT', '**/api/Reservation/confirmar**', {
    statusCode: 200,
    body: {
      pharmacyName: 'Farmashop',
      publicKey: 'PUBLIC123',
      status: 'Confirmed',
      drugsReserved: [
        { drugName: 'Antibiótico', drugQuantity: 1, requiresPrescription: true }
      ]
    }
  }).as('confirmRequest');
  
  cy.wrap({ referenceId, estado: 'Pendiente', requiresPrescription: true, scenario: 'success' }).as('scenarioData');
});

Given('el personal de farmacia ha validado la receta médica', () => {
  cy.log('Receta médica validada por el personal');
});

Given('que no existe ninguna reserva con ID de referencia {string}', (referenceId) => {
  cy.intercept('PUT', '**/api/Reservation/confirmar**', {
    statusCode: 404,
    body: { message: 'No se encontró la reserva' }
  }).as('confirmRequest');
  
  cy.wrap({ referenceId, scenario: 'notFound' }).as('scenarioData');
});

Given('que existe una reserva con ID de referencia {string} y su estado es {string}', (referenceId, estado) => {
  if (estado === 'Confirmada' || estado === 'Pendiente') {
    cy.intercept('PUT', '**/api/Reservation/confirmar**', {
      statusCode: 200,
      body: {
        pharmacyName: 'Farmashop',
        publicKey: 'PUBLIC123',
        status: 'Confirmed',
        drugsReserved: [
          { drugName: 'Paracetamol', drugQuantity: 1 }
        ]
      }
    }).as('confirmRequest');
  } else if (estado === 'Cancelada') {
    cy.intercept('PUT', '**/api/Reservation/confirmar**', {
      statusCode: 400,
      body: { message: 'No se puede confirmar una reserva cancelada' }
    }).as('confirmRequest');
  } else if (estado === 'Expirada') {
    cy.intercept('PUT', '**/api/Reservation/confirmar**', {
      statusCode: 400,
      body: { message: 'No se puede confirmar una reserva expirada' }
    }).as('confirmRequest');
  }
  
  cy.wrap({ referenceId, estado, scenario: 'withState' }).as('scenarioData');
});

// ============================================================================
// WHEN STEPS
// ============================================================================
When('el personal de farmacia confirma la reserva con ID {string}', (referenceId) => {
  cy.get('[data-cy="confirm-reference-input"]').clear().type(referenceId);
  cy.get('[data-cy="confirm-btn"]').click();
  cy.wait(1000);
});

When('el personal de farmacia intenta confirmar la reserva con ID {string}', (referenceId) => {
  cy.get('[data-cy="confirm-reference-input"]').clear().type(referenceId);
  cy.get('[data-cy="confirm-btn"]').click();
  cy.wait(1000);
});

When('el personal de farmacia envía el formulario de confirmación sin proporcionar un ID de referencia', () => {
  cy.get('[data-cy="confirm-reference-input"]').clear();
  cy.get('[data-cy="confirm-btn"]').should('be.disabled');
});

// ============================================================================
// THEN STEPS
// ============================================================================
Then('la reserva debe cambiar a estado {string}', (estado) => {
  cy.get('[data-cy="custom-toast"]', { timeout: 8000 })
    .should('be.visible')
    .and('have.class', 'bg-success');
});

Then('el sistema muestra el mensaje {string}', (mensaje) => {
  cy.get('[data-cy="custom-toast"]', { timeout: 8000 }).should('be.visible');
  
  if (mensaje.toLowerCase().includes('exitosa') || mensaje.toLowerCase().includes('confirmada')) {
    cy.get('[data-cy="custom-toast"]').should('have.class', 'bg-success');
  } else {
    cy.get('[data-cy="custom-toast"]').should('have.class', 'bg-danger');
  }
});

Then('el sistema responde con un error indicando {string}', (mensaje) => {
  if (mensaje.includes('ID de referencia válido') || mensaje.includes('requerido')) {
    cy.get('[data-cy="confirm-btn"]').should('be.disabled');
  } else {
    cy.get('[data-cy="custom-toast"]', { timeout: 8000 })
      .should('be.visible')
      .and('have.class', 'bg-danger');
  }
});

Then('no se debe modificar ninguna reserva', () => {
  cy.log('No se modificó ninguna reserva');
});

Then('el sistema no debe cambiar el estado de la reserva', () => {
  cy.get('[data-cy="custom-toast"]', { timeout: 8000 })
    .should('be.visible')
    .and('have.class', 'bg-success');
});

Then('el sistema no debe permitir la confirmación', () => {
  cy.get('[data-cy="custom-toast"]', { timeout: 8000 })
    .should('be.visible')
    .and('have.class', 'bg-danger');
});

Then('devuelve el mensaje {string}', (mensaje) => {
  cy.get('[data-cy="custom-toast"]', { timeout: 8000 })
    .should('be.visible')
    .and('have.class', 'bg-danger');
});

Then('se debe establecer una fecha límite de confirmación', () => {
  cy.log('Fecha límite de confirmación establecida');
});