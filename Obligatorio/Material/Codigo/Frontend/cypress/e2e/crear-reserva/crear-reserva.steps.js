import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// ============================================================================
// BACKGROUND - Se ejecuta antes de cada escenario
// ============================================================================
Given('estoy en la página de reservas de medicamentos', () => {
  cy.visit('/reservas');
});

// ============================================================================
// ESCENARIO 1: Usuario no autenticado intenta reservar medicamentos
// ============================================================================
Given('un usuario no autenticado', () => {
  cy.window().then((win) => {
    win.localStorage.removeItem('login');
  });
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

// Step único: click en reservar con intercept para 401
When('hace click en el botón de reservar (no autenticado)', () => {
  cy.window().then((win) => {
    const login = win.localStorage.getItem('login');
    if (!login) {
      cy.intercept('POST', '/api/reservas', {
        statusCode: 401,
        body: { error: 'Debe iniciar sesión para reservar medicamentos.' },
      }).as('unauthorizedReserva');
    }
  }).then(() => {
    cy.get('[data-cy="reservar-btn"]').click();
  });
});

Then('el sistema responde con un error unauthorized (401)', () => {
  cy.get('[data-cy="error-mensaje"]').should('be.visible');
  cy.get('[data-cy="error-mensaje"]').should('contain', 'Debe iniciar sesión para reservar medicamentos.');
});

Then('muestra un mensaje que dice {string}', (mensaje) => {
  cy.get('[data-cy="error-mensaje"]').should('contain', mensaje);
});

// ============================================================================
// ESCENARIO 2: Usuario intenta reservar un medicamento en una farmacia inválida
// ============================================================================

Given('un usuario autenticado', () => {
  cy.window().then((win) => {
    const login = {
      userName: 'usuarioTest',
      role: 'Client',
      token: 'tokenDeEjemplo123',
    };
    win.localStorage.setItem('login', JSON.stringify(login));
  });
});

// Steps reutilizados: medicamento genérico, ingresar farmacia

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
// ESCENARIO 3: Usuario intenta reservar un medicamento inexistente en una farmacia válida
// ============================================================================

// Steps reutilizados: usuario autenticado, medicamento genérico, ingresar farmacia

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
// ESCENARIO 4: Usuario autenticado intenta reservar un medicamento sin stock
// ============================================================================

// Steps reutilizados: usuario autenticado, medicamento genérico, ingresar farmacia

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

// Steps reutilizados: usuario autenticado, ingresar farmacia

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

// Steps reutilizados: usuario autenticado, ingresar farmacia

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

// Steps reutilizados: usuario autenticado, ingresar farmacia

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