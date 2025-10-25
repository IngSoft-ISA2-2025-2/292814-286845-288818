import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// ============================================================================
// BACKGROUND - Se ejecuta antes de cada escenario
// ============================================================================
Given('estoy en la página de mis reservas', () => {
  cy.visit('/manage-reservations');
});

// ============================================================================
// GIVEN STEPS
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

Given('no tiene reservas creadas en el sistema', () => {
  cy.intercept('POST', '**/api/reservation/consult', {
    statusCode: 200,
    body: [],
  }).as('reservasVacias');
});

Given(
  'tiene reservas creadas en diferentes estados {string}, {string}, {string}, {string} y {string}',
  (estado1, estado2, estado3, estado4, estado5) => {
    cy.intercept('POST', '**/api/reservation/consult', {
      statusCode: 200,
      body: [
        {
          id: 1,
          reservedDrugs: [{ drugName: 'Aspirina', quantity: 1 }],
          pharmacyName: 'Farmashop',
          status: estado1,
          fechaCreacion: '2023-10-01T10:00:00Z',
          fechaLimiteConfirmacion: '2023-10-02T10:00:00Z',
        },
        {
          id: 2,
          reservedDrugs: [{ drugName: 'Ibuprofeno', quantity: 1 }],
          pharmacyName: 'Farmacia Central',
          status: estado2,
          fechaCreacion: '2023-10-02T11:00:00Z',
          idReferencia: 'REF123456',
        },
        {
          id: 3,
          reservedDrugs: [{ drugName: 'Paracetamol', quantity: 1 }],
          pharmacyName: 'Farmashop',
          status: estado3,
          fechaCreacion: '2023-10-03T12:00:00Z',
          fechaExpiracion: '2023-10-03T12:00:00Z',
        },
        {
          id: 4,
          reservedDrugs: [{ drugName: 'Amoxicilina', quantity: 1 }],
          pharmacyName: 'Farmacia Norte',
          status: estado4,
          fechaCreacion: '2023-10-04T13:00:00Z',
          fechaCancelacion: '2023-10-04T15:00:00Z',
        },
        {
          id: 5,
          reservedDrugs: [{ drugName: 'Loratadina', quantity: 1 }],
          pharmacyName: 'Farmacia Sur',
          status: estado5,
          fechaCreacion: '2023-10-05T14:00:00Z',
          fechaRetiro: '2023-10-06T10:00:00Z',
        },
      ],
    }).as('reservasExitosas');
  }
);

Given('tiene reservas en diferentes estados', () => {
  cy.intercept('POST', '**/api/reservation/consult', {
    statusCode: 200,
    body: [
      { 
        id: 1, 
        reservedDrugs: [{ drugName: 'Aspirina', quantity: 1 }], 
        pharmacyName: 'Farmashop', 
        status: 'Pendiente',
        fechaCreacion: '2023-10-01T10:00:00Z'
      },
      { 
        id: 2, 
        reservedDrugs: [{ drugName: 'Ibuprofeno', quantity: 1 }], 
        pharmacyName: 'Farmacia Central', 
        status: 'Confirmada',
        fechaCreacion: '2023-10-02T11:00:00Z',
        idReferencia: 'REF789'
      },
      { 
        id: 3, 
        reservedDrugs: [{ drugName: 'Paracetamol', quantity: 1 }], 
        pharmacyName: 'Farmashop', 
        status: 'Expirada',
        fechaCreacion: '2023-10-03T12:00:00Z',
        fechaExpiracion: '2023-10-03T12:00:00Z'
      },
    ],
  }).as('reservasVariadas');
});

Given('el email {string} ya tiene reservas con secret {string}', (email, secretCorrecto) => {
  cy.intercept('POST', '**/api/reservation/consult', (req) => {
    if (req.body.email === email && req.body.secret !== secretCorrecto) {
      req.reply({
        statusCode: 403,
        body: { message: 'El secret no coincide con el registrado para este email' },
      });
    }
  }).as('secretIncorrecto');
});

Given('tiene una reserva en estado {string}', (estado) => {
  const reservaBase = {
    id: 1,
    reservedDrugs: [{ drugName: 'Aspirina', quantity: 1 }],
    pharmacyName: 'Farmashop',
    status: estado,
    fechaCreacion: '2023-10-01T10:00:00Z',
  };

  // Agregar campos específicos según el estado
  if (estado === 'Pendiente') {
    reservaBase.fechaLimiteConfirmacion = '2023-10-02T10:00:00Z';
  } else if (estado === 'Confirmada') {
    reservaBase.idReferencia = 'REF123456';
  } else if (estado === 'Expirada') {
    reservaBase.fechaExpiracion = '2023-10-01T10:00:00Z';
  } else if (estado === 'Cancelada') {
    reservaBase.fechaCancelacion = '2023-10-01T15:00:00Z';
  } else if (estado === 'Retirada') {
    reservaBase.fechaRetiro = '2023-10-02T09:00:00Z';
  }

  cy.intercept('POST', '**/api/reservation/consult', {
    statusCode: 200,
    body: [reservaBase],
  }).as(`reservas${estado}`);
});

Given('tiene múltiples reservas creadas en diferentes fechas', () => {
  cy.intercept('POST', '**/api/reservation/consult', {
    statusCode: 200,
    body: [
      { 
        id: 1, 
        reservedDrugs: [{ drugName: 'Aspirina', quantity: 1 }], 
        pharmacyName: 'Farmashop',
        status: 'Pendiente',
        fechaCreacion: '2023-10-01T10:00:00Z' 
      },
      { 
        id: 2, 
        reservedDrugs: [{ drugName: 'Paracetamol', quantity: 1 }], 
        pharmacyName: 'Farmacia Central',
        status: 'Confirmada',
        fechaCreacion: '2023-10-03T10:00:00Z' 
      },
      { 
        id: 3, 
        reservedDrugs: [{ drugName: 'Ibuprofeno', quantity: 1 }], 
        pharmacyName: 'Farmacia Norte',
        status: 'Expirada',
        fechaCreacion: '2023-10-02T10:00:00Z' 
      },
    ],
  }).as('reservasMultiplesFechas');
});

Given('tiene reservas de diferentes medicamentos', () => {
  cy.intercept('POST', '**/api/reservation/consult', {
    statusCode: 200,
    body: [
      { 
        id: 1, 
        reservedDrugs: [{ drugName: 'Aspirina', quantity: 1 }], 
        pharmacyName: 'Farmashop',
        status: 'Pendiente',
        fechaCreacion: '2023-10-01T10:00:00Z'
      },
      { 
        id: 2, 
        reservedDrugs: [{ drugName: 'Ibuprofeno', quantity: 1 }], 
        pharmacyName: 'Farmacia Central',
        status: 'Confirmada',
        fechaCreacion: '2023-10-02T11:00:00Z'
      },
      { 
        id: 3, 
        reservedDrugs: [{ drugName: 'Paracetamol', quantity: 1 }], 
        pharmacyName: 'Farmacia Norte',
        status: 'Expirada',
        fechaCreacion: '2023-10-03T12:00:00Z'
      },
    ],
  }).as('reservasMedicamentos');
});

Given('tiene reservas de diferentes farmacias', () => {
  cy.intercept('POST', '**/api/reservation/consult', {
    statusCode: 200,
    body: [
      { 
        id: 1, 
        reservedDrugs: [{ drugName: 'Aspirina', quantity: 1 }], 
        pharmacyName: 'Farmacia Central',
        status: 'Pendiente',
        fechaCreacion: '2023-10-01T10:00:00Z'
      },
      { 
        id: 2, 
        reservedDrugs: [{ drugName: 'Ibuprofeno', quantity: 1 }], 
        pharmacyName: 'Farmashop',
        status: 'Confirmada',
        fechaCreacion: '2023-10-02T11:00:00Z'
      },
      { 
        id: 3, 
        reservedDrugs: [{ drugName: 'Paracetamol', quantity: 1 }], 
        pharmacyName: 'Farmacia Central Norte',
        status: 'Expirada',
        fechaCreacion: '2023-10-03T12:00:00Z'
      },
    ],
  }).as('reservasFarmacias');
});

// ============================================================================
// WHEN STEPS
// ============================================================================
When('hace click en el botón de consultar reservas', () => {
  cy.get('[data-cy="consultar-reservas-btn"]').click();
});

When('aplica filtro para ver solo reservas en estado {string}', (estado) => {
  cy.get('[data-cy="consultar-reservas-btn"]').click();
  cy.wait(500); // Esperar a que carguen las reservas
  cy.get('[data-cy="filtro-estado"]').select(estado);
});

When('solicita ordenar por fecha de creación más reciente', () => {
  cy.get('[data-cy="consultar-reservas-btn"]').click();
  cy.wait(500); // Esperar a que carguen las reservas
  cy.get('[data-cy="ordenar-fecha-btn"]').click();
});

When('busca reservas por el nombre {string}', (termino) => {
  cy.get('[data-cy="consultar-reservas-btn"]').click();
  cy.wait(500); // Esperar a que carguen las reservas
  
  // Determina si es búsqueda por medicamento o farmacia
  if (termino.toLowerCase().includes('farmacia')) {
    cy.get('[data-cy="buscar-farmacia-input"]').clear().type(termino);
  } else {
    cy.get('[data-cy="buscar-medicamento-input"]').clear().type(termino);
  }
  cy.wait(300); // Esperar a que se aplique el filtro reactivo
});

// ============================================================================
// THEN STEPS
// ============================================================================
Then('el sistema responde con un error y muestra el mensaje {string}', (mensaje) => {
  cy.get('[data-cy="error-message"]', { timeout: 5000 }).should('be.visible');
  cy.get('[data-cy="error-message"]').should('contain.text', mensaje);
});

Then('el sistema responde de manera correcta, mostrando un listado vacío', () => {
  cy.wait('@reservasVacias');
  cy.get('[data-cy="mensaje-sin-reservas"]', { timeout: 5000 }).should('be.visible');
  cy.get('[data-cy="reserva-item"]').should('not.exist');
});

Then('muestra un mensaje que dice {string}', (mensaje) => {
  // Para escenario de listado vacío
  if (mensaje === 'No tienes reservas creadas') {
    cy.get('[data-cy="mensaje-sin-reservas"]').should('contain', mensaje);
  } 
  // Para mensajes según el estado de la reserva (Pendiente, Confirmada, etc.)
  else {
    // Buscar el mensaje específico dentro de las reservas
    cy.get('[data-cy="reserva-item"]', { timeout: 3000 }).should('exist');
    
    // Mensajes posibles según estado
    const mensajesToCheck = [
      '[data-cy="mensaje-pendiente"]',
      '[data-cy="mensaje-confirmada"]',
      '[data-cy="mensaje-expirada"]',
      '[data-cy="mensaje-cancelada"]',
      '[data-cy="mensaje-retirada"]'
    ];
    
    // Verificar que al menos uno de los mensajes exista y contenga el texto
    cy.get(mensajesToCheck.join(','), { timeout: 3000 })
      .should('be.visible')
      .and('contain', mensaje);
  }
});

Then('el sistema responde de manera correcta, mostrando un listado con todas sus reservas', () => {
  cy.get('[data-cy="listado-reservas"]', { timeout: 5000 }).should('be.visible');
  cy.get('[data-cy="reserva-item"]').should('have.length.at.least', 1);
});

Then('cada reserva muestra información básica: nombre de el\\/los medicamento\\/s, farmacia y estado', () => {
  cy.get('[data-cy="reserva-medicamento"]').should('be.visible');
  cy.get('[data-cy="reserva-farmacia"]').should('be.visible');
  cy.get('[data-cy="reserva-estado"]').should('be.visible');
});

Then('cada reserva incluye un botón para ver más detalles', () => {
  cy.get('[data-cy="ver-detalles-btn"]').should('have.length.at.least', 1);
});

Then('el sistema responde de manera correcta, mostrando un listado únicamente con las reservas en estado {string}', (estado) => {
  cy.get('[data-cy="reserva-estado"]').each(($el) => {
    cy.wrap($el).should('contain', estado);
  });
});

Then('la reserva pendiente muestra claramente el estado {string}', (estado) => {
  cy.get('[data-cy="reserva-estado"]').should('contain', estado);
});

Then('incluye un botón para cancelar la reserva', () => {
  cy.get('[data-cy="cancelar-reserva-btn"]').should('be.visible');
});

Then('muestra la fecha límite para confirmar la reserva', () => {
  cy.get('[data-cy="fecha-limite-confirmacion"]').should('be.visible');
});

Then('no muestra ID de referencia hasta que sea confirmada', () => {
  cy.get('[data-cy="id-referencia"]').should('not.exist');
});

Then('la reserva confirmada muestra un ID de referencia único', () => {
  cy.get('[data-cy="id-referencia"]').should('be.visible');
  cy.get('[data-cy="id-referencia"]').should('not.be.empty');
});

Then('la reserva expirada muestra claramente el estado {string}', (estado) => {
  cy.get('[data-cy="reserva-estado"]').should('contain', estado);
});

Then('muestra la fecha de expiración', () => {
  cy.get('[data-cy="fecha-expiracion"]').should('be.visible');
});

Then('el sistema responde de manera correcta, mostrando las reservas ordenadas de más reciente a más antigua', () => {
  // Verificar que el primer elemento sea el más reciente (Paracetamol - 2023-10-03)
  cy.get('[data-cy="reserva-item"]').first().should('contain', 'Paracetamol');
  // Verificar que el último elemento sea el más antiguo (Aspirina - 2023-10-01)
  cy.get('[data-cy="reserva-item"]').last().should('contain', 'Aspirina');
});

Then('el sistema responde de manera correcta, mostrando únicamente las reservas que contienen medicamentos con {string}', (medicamento) => {
  cy.get('[data-cy="reserva-medicamento"]').each(($el) => {
    cy.wrap($el).should('contain', medicamento);
  });
});

Then('el sistema responde de manera correcta, mostrando únicamente las reservas que contienen la farmacia {string}', (farmacia) => {
  cy.get('[data-cy="reserva-farmacia"]').each(($el) => {
    cy.wrap($el).should('contain', farmacia);
  });
});

Then('la reserva cancelada muestra claramente el estado {string}', (estado) => {
  cy.get('[data-cy="reserva-estado"]').should('contain', estado);
});

Then('muestra la fecha de cancelación', () => {
  cy.get('[data-cy="fecha-cancelacion"]').should('be.visible');
});

Then('la reserva retirada muestra claramente el estado {string}', (estado) => {
  cy.get('[data-cy="reserva-estado"]').should('contain', estado);
});

Then('muestra la fecha de retiro', () => {
  cy.get('[data-cy="fecha-retiro"]').should('be.visible');
});

