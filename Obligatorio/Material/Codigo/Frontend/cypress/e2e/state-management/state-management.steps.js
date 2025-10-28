import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// ============================================================================
// BACKGROUND
// ============================================================================
Given('estoy en la página de gestión de estados', () => {
  cy.visit('/manage-reservations');
});

// ============================================================================
// GIVEN STEPS
// ============================================================================
// Nota: Los steps "un email" y "un secret" ya están definidos en manage-reservation.steps.js
// y se reutilizan automáticamente por Cypress/Cucumber

Given('quiero crear una reserva con medicamento {string} en farmacia {string}', (medicamento, farmacia) => {
  // Mock para simular que al consultar ya existe una reserva Pendiente
  cy.intercept('GET', '**/api/Reservation?**', {
    statusCode: 200,
    body: [{
      id: 1,
      reservedDrugs: [{ drugName: medicamento, quantity: 1 }],
      pharmacyName: farmacia,
      status: 'Pending',
      fechaCreacion: new Date().toISOString(),
      fechaLimiteConfirmacion: new Date(Date.now() + 86400000).toISOString()
    }]
  }).as('consultarReserva');
});

Given('tengo una reserva en estado {string}', (estado) => {
  // Map Spanish status names to English (as backend returns English)
  const statusMap = {
    'Pendiente': 'Pending',
    'Confirmada': 'Confirmed',
    'Expirada': 'Expired',
    'Cancelada': 'Canceled',
    'Retirada': 'Withdrawal'
  };
  
  const englishStatus = statusMap[estado] || estado;
  
  const reservaBase = {
    id: 1,
    reservedDrugs: [{ drugName: 'Aspirina', quantity: 1 }],
    pharmacyName: 'Farmashop',
    status: englishStatus,
    fechaCreacion: '2023-10-01T10:00:00Z',
  };

  // Agregar campos específicos según el estado
  if (englishStatus === 'Pending') {
    reservaBase.fechaLimiteConfirmacion = '2023-10-02T10:00:00Z';
  } else if (englishStatus === 'Confirmed') {
    reservaBase.idReferencia = 'REF123456';
    reservaBase.fechaConfirmacion = '2023-10-01T14:00:00Z';
  } else if (englishStatus === 'Expired') {
    reservaBase.fechaExpiracion = '2023-10-03T12:00:00Z';
  } else if (englishStatus === 'Canceled') {
    reservaBase.fechaCancelacion = '2023-10-01T15:00:00Z';
  } else if (englishStatus === 'Withdrawal') {
    reservaBase.fechaRetiro = '2023-10-02T09:00:00Z';
    reservaBase.idReferencia = 'REF123456';
  }

  cy.intercept('GET', '**/api/Reservation?**', {
    statusCode: 200,
    body: [reservaBase],
  }).as(`reserva${estado}`);
});

Given('tengo reservas en estados {string}, {string}, {string}, {string} y {string}', 
  (estado1, estado2, estado3, estado4, estado5) => {
    // Map Spanish status names to English
    const statusMap = {
      'Pendiente': 'Pending',
      'Confirmada': 'Confirmed',
      'Expirada': 'Expired',
      'Cancelada': 'Canceled',
      'Retirada': 'Withdrawal'
    };
    
    cy.intercept('GET', '**/api/Reservation?**', {
      statusCode: 200,
      body: [
        {
          id: 1,
          reservedDrugs: [{ drugName: 'Aspirina', quantity: 1 }],
          pharmacyName: 'Farmashop',
          status: statusMap[estado1] || estado1,
          fechaCreacion: '2023-10-01T10:00:00Z',
          fechaLimiteConfirmacion: '2023-10-02T10:00:00Z',
        },
        {
          id: 2,
          reservedDrugs: [{ drugName: 'Ibuprofeno', quantity: 1 }],
          pharmacyName: 'Farmacia Central',
          status: statusMap[estado2] || estado2,
          fechaCreacion: '2023-10-02T11:00:00Z',
          idReferencia: 'REF123456',
          fechaConfirmacion: '2023-10-02T14:00:00Z',
        },
        {
          id: 3,
          reservedDrugs: [{ drugName: 'Paracetamol', quantity: 1 }],
          pharmacyName: 'Farmashop',
          status: statusMap[estado3] || estado3,
          fechaCreacion: '2023-10-03T12:00:00Z',
          fechaExpiracion: '2023-10-05T12:00:00Z',
        },
        {
          id: 4,
          reservedDrugs: [{ drugName: 'Amoxicilina', quantity: 1 }],
          pharmacyName: 'Farmacia Norte',
          status: statusMap[estado4] || estado4,
          fechaCreacion: '2023-10-04T13:00:00Z',
          fechaCancelacion: '2023-10-04T15:00:00Z',
        },
        {
          id: 5,
          reservedDrugs: [{ drugName: 'Loratadina', quantity: 1 }],
          pharmacyName: 'Farmacia Sur',
          status: statusMap[estado5] || estado5,
          fechaCreacion: '2023-10-05T14:00:00Z',
          fechaRetiro: '2023-10-06T10:00:00Z',
          idReferencia: 'REF789012',
        },
      ],
    }).as('reservasTodosEstados');
  }
);

Given('tengo reservas en diferentes estados', () => {
  cy.intercept('GET', '**/api/Reservation?**', {
    statusCode: 200,
    body: [
      { 
        id: 1, 
        reservedDrugs: [{ drugName: 'Aspirina', quantity: 1 }], 
        pharmacyName: 'Farmashop', 
        status: 'Pending',
        fechaCreacion: '2023-10-01T10:00:00Z',
        fechaLimiteConfirmacion: '2023-10-02T10:00:00Z'
      },
      { 
        id: 2, 
        reservedDrugs: [{ drugName: 'Ibuprofeno', quantity: 1 }], 
        pharmacyName: 'Farmacia Central', 
        status: 'Confirmed',
        fechaCreacion: '2023-10-02T11:00:00Z',
        idReferencia: 'REF789',
        fechaConfirmacion: '2023-10-02T14:00:00Z'
      },
      { 
        id: 3, 
        reservedDrugs: [{ drugName: 'Paracetamol', quantity: 1 }], 
        pharmacyName: 'Farmashop', 
        status: 'Expired',
        fechaCreacion: '2023-10-03T12:00:00Z',
        fechaExpiracion: '2023-10-05T12:00:00Z'
      },
      { 
        id: 4, 
        reservedDrugs: [{ drugName: 'Amoxicilina', quantity: 1 }], 
        pharmacyName: 'Farmacia Norte', 
        status: 'Canceled',
        fechaCreacion: '2023-10-04T13:00:00Z',
        fechaCancelacion: '2023-10-04T15:00:00Z'
      },
      { 
        id: 5, 
        reservedDrugs: [{ drugName: 'Loratadina', quantity: 1 }], 
        pharmacyName: 'Farmacia Sur', 
        status: 'Withdrawal',
        fechaCreacion: '2023-10-05T14:00:00Z',
        fechaRetiro: '2023-10-06T10:00:00Z',
        idReferencia: 'REF111'
      },
    ],
  }).as('reservasVariadas');
});

// ============================================================================
// WHEN STEPS
// ============================================================================
When('creo la reserva', () => {
  // Simulamos que se creó la reserva consultándola
  cy.get('[data-cy="consultar-reservas-btn"]').click();
  cy.wait('@consultarReserva');
});

When('consulto mis reservas', () => {
  cy.get('[data-cy="consultar-reservas-btn"]').click();
  cy.wait(1000); // Wait for reservations to load
});

When('filtro por estado {string}', (estado) => {
  cy.get('[data-cy="consultar-reservas-btn"]').click();
  cy.wait(1000); // Wait for reservations to load
  cy.get('[data-cy="filtro-estado"]').select(estado);
  cy.wait(500); // Wait for filter to apply
});

// ============================================================================
// THEN STEPS
// ============================================================================
Then('el sistema asigna automáticamente el estado {string}', (estado) => {
  cy.get('[data-cy="reserva-estado"]', { timeout: 5000 }).should('be.visible');
  cy.get('[data-cy="reserva-estado"]').should('contain', estado);
});

Then('la reserva es visible con estado {string}', (estado) => {
  cy.get('[data-cy="listado-reservas"]', { timeout: 5000 }).should('be.visible');
  cy.get('[data-cy="reserva-estado"]', { timeout: 5000 }).first().should('contain', estado);
});

Then('veo la reserva con estado {string}', (estado) => {
  cy.get('[data-cy="listado-reservas"]', { timeout: 5000 }).should('be.visible');
  cy.get('[data-cy="reserva-estado"]', { timeout: 5000 }).should('contain', estado);
});

Then('veo el ID de referencia de la reserva', () => {
  cy.get('[data-cy="id-referencia"]', { timeout: 5000 }).should('be.visible');
  cy.get('[data-cy="id-referencia"]').should('contain', 'REF');
});

Then('veo la fecha de confirmación', () => {
  cy.get('[data-cy="fecha-confirmacion"]', { timeout: 5000 }).should('be.visible');
});

Then('veo un mensaje que dice {string}', (mensaje) => {
  cy.get('[data-cy="mensaje-estado"]', { timeout: 5000 }).should('be.visible');
  cy.get('[data-cy="mensaje-estado"]').should('contain', mensaje);
});

Then('veo la fecha de expiración', () => {
  cy.get('[data-cy="fecha-expiracion"]', { timeout: 5000 }).should('be.visible');
});

Then('veo la fecha de cancelación', () => {
  cy.get('[data-cy="fecha-cancelacion"]', { timeout: 5000 }).should('be.visible');
});

Then('veo la fecha de retiro', () => {
  cy.get('[data-cy="fecha-retiro"]', { timeout: 5000 }).should('be.visible');
});

Then('veo todas mis reservas', () => {
  cy.get('[data-cy="listado-reservas"]', { timeout: 5000 }).should('be.visible');
  cy.get('[data-cy="reserva-card"]', { timeout: 5000 }).should('have.length.at.least', 1);
});

Then('cada reserva muestra su estado correctamente', () => {
  cy.get('[data-cy="reserva-estado"]', { timeout: 5000 }).should('be.visible');
});

Then('las reservas pendientes no muestran ID de referencia', () => {
  cy.get('[data-cy="reserva-card"]', { timeout: 5000 }).each(($card) => {
    cy.wrap($card).within(() => {
      cy.get('[data-cy="reserva-estado"]').invoke('text').then((estado) => {
        if (estado.includes('Pendiente')) {
          cy.get('[data-cy="id-referencia"]').should('not.exist');
        }
      });
    });
  });
});

Then('las reservas confirmadas muestran ID de referencia', () => {
  cy.get('[data-cy="reserva-card"]', { timeout: 5000 }).each(($card) => {
    cy.wrap($card).within(() => {
      cy.get('[data-cy="reserva-estado"]').invoke('text').then((estado) => {
        if (estado.includes('Confirmada') || estado.includes('Retirada')) {
          cy.get('[data-cy="id-referencia"]').should('exist');
        }
      });
    });
  });
});

Then('solo veo reservas en estado {string}', (estado) => {
  cy.get('[data-cy="reserva-estado"]', { timeout: 5000 }).should('have.length.at.least', 1);
  cy.get('[data-cy="reserva-estado"]').each(($estado) => {
    cy.wrap($estado).should('contain', estado);
  });
});
