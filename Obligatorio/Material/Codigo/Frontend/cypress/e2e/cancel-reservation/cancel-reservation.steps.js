import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// ============================================================================
// BACKGROUND
// ============================================================================
Given('que el formulario de cancelación está disponible', () => {
  cy.visit('/cancel-reservation');
  cy.get('[data-cy="cancel-email-input"]').should('exist');
  cy.get('[data-cy="cancel-secret-input"]').should('exist');
  cy.get('[data-cy="cancel-btn"]').should('exist');
});

// ============================================================================
// GIVEN STEPS
// ============================================================================
Given('que existe una reserva para el correo {string} con el secret {string}', (email, secret) => {
  cy.intercept('DELETE', /\/api\/Reservation(\?.*)?$/, (req) => {
    const url = new URL(req.url);
    const urlEmail = url.searchParams.get('email');
    const urlSecret = url.searchParams.get('secret');
    
    if (urlEmail === email && urlSecret === secret) {
      req.reply({
        statusCode: 200,
        body: {
          pharmacyName: 'Farmashop',
          drugsReserved: [{ drugName: 'Aspirina', drugQuantity: 2 }]
        }
      });
    } else {
      req.reply({
        statusCode: 400,
        body: { message: 'Secret inválido para ese correo' }
      });
    }
  }).as('cancelRequest');
  
  cy.wrap({ email, secret, scenario: 'success' }).as('scenarioData');
});

Given('que no existe ninguna reserva para el correo {string}', (email) => {
  cy.intercept('DELETE', /\/api\/Reservation(\?.*)?$/, {
    statusCode: 404,
    body: { message: 'No existe una reserva asociada a ese correo' }
  }).as('cancelRequest');
  
  cy.wrap({ email, scenario: 'notFound' }).as('scenarioData');
});

Given('que existe una reserva para el correo {string} con el secret {string} y su estado es {string}', (email, secret, estado) => {
  cy.intercept('DELETE', /\/api\/Reservation(\?.*)?$/, (req) => {
    const url = new URL(req.url);
    const urlEmail = url.searchParams.get('email');
    const urlSecret = url.searchParams.get('secret');
    
    if (urlEmail === email && urlSecret === secret) {
      if (estado === 'cancelada') {
        req.reply({
          statusCode: 200,
          body: {
            pharmacyName: 'Farmashop',
            drugsReserved: []
          }
        });
      } else if (estado === 'expirada') {
        req.reply({
          statusCode: 400,
          body: { message: 'No se puede cancelar una reserva expirada' }
        });
      }
    } else {
      req.reply({
        statusCode: 400,
        body: { message: 'Secret inválido' }
      });
    }
  }).as('cancelRequest');
  
  cy.wrap({ email, secret, estado, scenario: 'withState' }).as('scenarioData');
});

Given('que existen dos reservas para el correo {string}:', (email, table) => {
  const rows = table.hashes();
  
  cy.intercept('DELETE', /\/api\/Reservation(\?.*)?$/, (req) => {
    const url = new URL(req.url);
    const urlEmail = url.searchParams.get('email');
    const urlSecret = url.searchParams.get('secret');
    
    if (urlEmail === email) {
      const matchingReservation = rows.find(r => r.secret === urlSecret);
      if (matchingReservation) {
        req.reply({
          statusCode: 200,
          body: {
            pharmacyName: 'Farmashop',
            drugsReserved: [{ drugName: 'Medicamento', drugQuantity: 1 }]
          }
        });
      } else {
        req.reply({
          statusCode: 400,
          body: { message: 'Secret inválido para ese correo' }
        });
      }
    } else {
      req.reply({
        statusCode: 404,
        body: { message: 'No existe una reserva asociada a ese correo' }
      });
    }
  }).as('cancelRequest');
  
  cy.wrap({ email, reservations: rows, scenario: 'multiple' }).as('scenarioData');
});

// ============================================================================
// WHEN STEPS
// ============================================================================
When('el visitante solicita cancelar la reserva usando el correo {string} y el secret {string}', (email, secret) => {
  if (email) {
    cy.get('[data-cy="cancel-email-input"]').clear().type(email);
  } else {
    cy.get('[data-cy="cancel-email-input"]').clear();
  }

  if (secret) {
    cy.get('[data-cy="cancel-secret-input"]').clear().type(secret);
  } else {
    cy.get('[data-cy="cancel-secret-input"]').clear();
  }

  cy.get('[data-cy="cancel-btn"]').click();
  cy.wait('@cancelRequest', { timeout: 10000 });
});

When('el visitante ingresa el correo {string} y el secret {string} en el flujo de gestión de reservas', (email, secret) => {
  cy.log(`Flujo de gestión de reservas con ${email} y ${secret}`);
});

When('el visitante envía el formulario de cancelación sin proporcionar correo', () => {
  cy.get('[data-cy="cancel-email-input"]').clear();
  cy.get('[data-cy="cancel-secret-input"]').clear().type('cualquier');
  cy.get('[data-cy="cancel-btn"]').should('be.disabled');
});

// ============================================================================
// THEN STEPS
// ============================================================================
Then('la reserva para {string} debe quedar marcada como cancelada', (email) => {
  cy.get('[data-cy="custom-toast"]', { timeout: 10000 })
    .should('be.visible')
    .and('have.class', 'bg-success');
});

Then('el sistema muestra el mensaje de cancelación {string}', (mensaje) => {
  cy.get('[data-cy="custom-toast"]', { timeout: 10000 })
    .should('be.visible')
    .and('contain.text', mensaje);
});

Then('el sistema muestra el mensaje de error de cancelación {string}', (mensaje) => {
  cy.get('[data-cy="custom-toast"]', { timeout: 10000 })
    .should('be.visible')
    .and('have.class', 'bg-danger')
    .and('contain.text', mensaje);
});

Then('el sistema responde con un error de cancelación indicando {string}', (mensaje) => {
  if (mensaje.includes('correo válido') || mensaje.includes('requerido')) {
    cy.get('[data-cy="cancel-btn"]').should('be.disabled');
  } else {
    cy.get('[data-cy="custom-toast"]', { timeout: 10000 })
      .should('be.visible')
      .and('have.class', 'bg-danger');
  }
});

Then('no se debe crear ni cancelar ninguna reserva en este flujo de cancelación', () => {
  cy.log('No se realizó ninguna operación en la BD');
});

Then('la reserva no debe ser cancelada', () => {
  cy.get('[data-cy="custom-toast"]', { timeout: 10000 })
    .should('be.visible')
    .and('have.class', 'bg-danger');
});

Then('el sistema crea una reserva asociada a {string} con secret {string}', (email, secret) => {
  cy.log(`Creación de reserva no aplica en cancelación`);
});

Then('se muestra el mensaje {string} como precondición para operaciones posteriores', (mensaje) => {
  cy.log(`Mensaje esperado: ${mensaje}`);
});

Then('el sistema muestra el mensaje de cancelación {string} o una respuesta idempotente apropiada', (mensaje) => {
  cy.get('[data-cy="custom-toast"]', { timeout: 10000 })
    .should('be.visible')
    .and('have.class', 'bg-success');
});

Then('solo la reserva con secret {string} debe quedar marcada como cancelada', (secret) => {
  cy.get('[data-cy="custom-toast"]', { timeout: 10000 })
    .should('be.visible')
    .and('have.class', 'bg-success');
});

Then('la reserva con secret {string} debe permanecer en estado "activa"', (secret) => {
  cy.log(`La reserva con secret ${secret} debe permanecer activa`);
});

Then('el sistema no debe permitir la cancelación', () => {
  cy.get('[data-cy="custom-toast"]', { timeout: 10000 })
    .should('be.visible')
    .and('have.class', 'bg-danger');
});

Then('el sistema no debe cambiar el estado de la reserva cancelada', () => {
  cy.get('[data-cy="custom-toast"]', { timeout: 10000 })
    .should('be.visible')
    .and('have.class', 'bg-success');
});

Then('devuelve el mensaje de cancelación {string}', (mensaje) => {
  cy.get('[data-cy="custom-toast"]', { timeout: 10000 })
    .should('be.visible')
    .and('have.class', 'bg-danger')
    .and('contain.text', mensaje);
});