import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// ============================================================================
// BACKGROUND - Se ejecuta antes de cada escenario
// ============================================================================
Given('estoy en la página de reservas de medicamentos', () => {
  cy.visit('/reservas');
});

// ============================================================================
// ESCENARIO 1: Usuario sin email intenta reservar medicamentos
// ============================================================================
Given('un email {string}', (email) => {
  cy.get('[data-cy="email-input"]').clear();
  if (email) {
    cy.get('[data-cy="email-input"]').type(email);
  }
});

Given('un secret {string}', (secret) => {
  cy.get('[data-cy="secret-input"]').clear();
  if (secret) {
    cy.get('[data-cy="secret-input"]').type(secret);
  }
});

// Step reutilizado: medicamento genérico
Given('un medicamento {string} con cantidad de {int} unidad', (nombre, cantidad) => {
  cy.get('[data-cy="medicamento-nombre-input"]').clear().type(nombre);
  cy.get('[data-cy="medicamento-cantidad-input"]').clear().type(cantidad.toString());
  cy.get('[data-cy="agregar-medicamento-btn"]').click();
});

// Step reutilizado: ingresar farmacia
Given('una farmacia {string}', (farmacia) => {
  cy.get('[data-cy="farmacia-input"]').clear().type(farmacia);
});

// Step único: click en reservar con intercept para validación de email/secret
When('hace click en el botón de reservar (no autenticado)', () => {
  cy.get('[data-cy="email-input"]').invoke('val').then((email) => {
    cy.get('[data-cy="secret-input"]').invoke('val').then((secret) => {
      if (!email || !secret) {
        cy.intercept('POST', '/api/reservas', {
          statusCode: 400,
          body: { error: 'Debe ingresar un email y secret para reservar medicamentos.' },
        }).as('sinEmailOSecret');
      }
      cy.get('[data-cy="reservar-btn"]').click();
    });
  });
});

Then('el sistema responde con un error unauthorized (401)', () => {
  cy.get('[data-cy="error-mensaje"]').should('be.visible');
  cy.get('[data-cy="error-mensaje"]').should('contain', 'Debe ingresar un email y secret para reservar medicamentos.');
});

Then('muestra un mensaje que dice {string}', (mensaje) => {
  cy.get('[data-cy="error-mensaje"]').should('contain', mensaje);
});

// ============================================================================
// ESCENARIO 2: Usuario con email y secret válidos reserva en farmacia inválida
// ============================================================================

// Steps reutilizados: email, secret, medicamento genérico, ingresar farmacia

// Step único: click en reservar con intercept para 404 farmacia inválida
When('hace click en el botón de reservar (farmacia inválida)', () => {
  cy.get('[data-cy="farmacia-input"]').invoke('val').then((farmacia) => {
    if (farmacia === 'FarmaciaInexistente') {
      cy.intercept('POST', '/api/reservas', {
        statusCode: 404,
        body: { error: `La farmacia ${farmacia} no existe` },
      }).as('farmaciaInvalida');
    }
    cy.get('[data-cy="reservar-btn"]').click();
  });
});

Then('el sistema responde con un error Not Found (404)', () => {
  cy.get('[data-cy="error-mensaje"]').should('be.visible');
  cy.get('[data-cy="error-mensaje"]').should('contain', 'La farmacia FarmaciaInexistente no existe');
});

// Step reutilizado: muestra un mensaje que dice {string}

// ============================================================================
// ESCENARIO 3: Usuario con email y secret válidos intenta reservar medicamento inexistente
// ============================================================================

// Steps reutilizados: email, secret, medicamento genérico, ingresar farmacia

Given('el medicamento no existe en la farmacia {string}', (farmacia) => {
  // Este step es solo descriptivo, la lógica se maneja en el intercept del When
});

// Step único: click en reservar con intercept para 404 medicamento inexistente
When('hace click en el botón de reservar (medicamento inexistente)', () => {
  cy.get('[data-cy="farmacia-input"]').invoke('val').then((farmacia) => {
    cy.get('[data-cy="medicamento-nombre-input"]').invoke('val').then((medicamento) => {
      if (medicamento === 'MedicamentoInexistente') {
        cy.intercept('POST', '/api/reservas', {
          statusCode: 404,
          body: { error: `El medicamento ${medicamento} no existe en la farmacia ${farmacia}` },
        }).as('reservaFallida');
      }
      cy.get('[data-cy="reservar-btn"]').click();
    });
  });
});

// Steps reutilizados: el sistema responde con un error Not Found (404), muestra un mensaje que dice {string}

// ============================================================================
// ESCENARIO 4: Usuario con email y secret válidos intenta reservar medicamento sin stock
// ============================================================================

// Steps reutilizados: email, secret, medicamento genérico, ingresar farmacia

Given('no hay stock disponible para el medicamento {string} en la farmacia {string}', (medicamento, farmacia) => {
  cy.intercept('POST', '/api/reservas', {
    statusCode: 409,
    body: { error: `No hay stock disponible para el medicamento ${medicamento}` },
  }).as('sinStock');
});

Then('el sistema muestra responde con un mensaje de error conflict (409)', () => {
  cy.get('[data-cy="error-mensaje"]').should('be.visible');
  cy.get('[data-cy="error-mensaje"]').should('contain', 'No hay stock disponible para el medicamento MedicamentoInexistente');
});

// Step reutilizado: muestra un mensaje que dice {string}

// ============================================================================
// ESCENARIO 5: Usuario reserva un medicamento que requiere prescripción con exito
// ============================================================================

// Steps reutilizados: email, secret, ingresar farmacia

Given('un medicamento {string} con cantidad de {int} unidad que requiere prescripción médica', (nombre, cantidad) => {
  cy.get('[data-cy="medicamento-nombre-input"]').clear().type(nombre);
  cy.get('[data-cy="medicamento-cantidad-input"]').clear().type(cantidad.toString());
  cy.get('[data-cy="requiere-prescripcion-checkbox"]').check();
  cy.get('[data-cy="agregar-medicamento-btn"]').click();
});

Given('hay stock mayor o igual a una unidad para el medicamento {string} en la farmacia {string}', (medicamento, farmacia) => {
  cy.intercept('POST', '/api/reservas', {
    statusCode: 201,
    body: {
      id: 1,
      estado: 'Pendiente',
      medicamentos: [{ nombre: medicamento, cantidad: 1, requierePrescripcion: true }],
      farmacia: farmacia,
      mensaje: `Reserva creada exitosamente, el medicamento ${medicamento} requiere receta médica. Por favor, preséntela en la farmacia para validar la reserva.`,
    },
  }).as('reservaExitosa');
});

Then('el sistema crea la reserva con un estado Pendiente', () => {
  cy.get('[data-cy="success-mensaje"]').should('be.visible');
  cy.get('[data-cy="estado-reserva"]').should('contain', 'Pendiente');
});

Then('descuenta la unidad del stock de los medicamentos', () => {
  cy.get('[data-cy="stock-actualizado"]').should('exist');
});

// Step reutilizado: muestra un mensaje que dice {string}

// ============================================================================
// ESCENARIO 6: Usuario reserva un medicamento que no requiere prescripción con éxito
// ============================================================================

// Steps reutilizados: email, secret, ingresar farmacia

Given('un medicamento {string} con cantidad de {int} unidad que no requiere prescripción médica', (nombre, cantidad) => {
  cy.get('[data-cy="medicamento-nombre-input"]').clear().type(nombre);
  cy.get('[data-cy="medicamento-cantidad-input"]').clear().type(cantidad.toString());
  cy.get('[data-cy="agregar-medicamento-btn"]').click();
});

Given('hay stock mayor o igual a una unidad para el medicamento {string} en la farmacia {string}', (medicamento, farmacia) => {
  cy.intercept('POST', '/api/reservas', {
    statusCode: 201,
    body: {
      id: 1,
      estado: 'Pendiente',
      medicamentos: [{ nombre: medicamento, cantidad: 1, requierePrescripcion: false }],
      farmacia: farmacia,
      mensaje: 'Reserva creada exitosamente',
    },
  }).as('reservaExitosa');
});

// Steps reutilizados: el sistema crea la reserva con un estado Pendiente, descuenta la unidad del stock, muestra un mensaje que dice {string}

// ============================================================================
// ESCENARIO 7: Usuario reserva dos medicamentos uno que requiere prescripción y otro que no requiere con éxito
// ============================================================================

// Steps reutilizados: email, secret, ingresar farmacia

Given('hay stock mayor o igual a una unidad para ambos medicamentos en la farmacia {string}', (farmacia) => {
  cy.intercept('POST', '/api/reservas', {
    statusCode: 201,
    body: {
      id: 2,
      estado: 'Pendiente',
      medicamentos: [
        { nombre: 'Aspirina', cantidad: 1, requierePrescripcion: true },
        { nombre: 'Paracetamol', cantidad: 1, requierePrescripcion: false },
      ],
      farmacia: farmacia,
      mensaje:
        'Reserva creada exitosamente, el medicamento Aspirina requiere receta médica. Por favor, preséntela en la farmacia para validar la reserva.',
    },
  }).as('reservaMultiple');
});

Then('el sistema crea la reserva con un estado {string}', (estado) => {
  cy.get('[data-cy="success-mensaje"]').should('be.visible');
  cy.get('[data-cy="estado-reserva"]').should('contain', estado);
});

// Steps reutilizados: descuenta la unidad del stock, muestra un mensaje que dice {string}

// ============================================================================
// ESCENARIO 8: Usuario con email existente pero secret incorrecto intenta reservar
// ============================================================================

Given('el email {string} ya tiene reservas con secret {string}', (email, secretCorrecto) => {
  cy.intercept('POST', '/api/reservas', (req) => {
    if (req.body.email === email && req.body.secret !== secretCorrecto) {
      req.reply({
        statusCode: 403,
        body: { error: 'El secret no coincide con el registrado para este email' },
      });
    }
  }).as('secretIncorrecto');
});

// ============================================================================
// ESCENARIO: Cliente intenta validar la reserva en una farmacia incorrecta
// ============================================================================

Given('una reserva confirmada asociada a la farmacia {string}', (farmaciaCorrecta) => {
  cy.wrap(farmaciaCorrecta).as('farmaciaCorrecta');
  // Simula que la reserva está asociada a esa farmacia
});

When('el cliente presenta la clave pública en la farmacia {string}', function (farmaciaIntento) {
  if (farmaciaIntento !== this.farmaciaCorrecta) {
    cy.intercept('POST', '/api/reservas/validar', {
      statusCode: 403,
      body: { error: 'La reserva solo puede ser validada en la farmacia seleccionada al momento de la creación' },
    }).as('farmaciaIncorrecta');
  }
  cy.get('[data-cy="validar-reserva-btn"]').click();
});

Then('el sistema responde con un error forbidden (403)', () => {
  cy.get('[data-cy="error-mensaje"]').should('be.visible');
  cy.get('[data-cy="error-mensaje"]').should(
    'contain',
    'La reserva solo puede ser validada en la farmacia seleccionada al momento de la creación'
  );
});