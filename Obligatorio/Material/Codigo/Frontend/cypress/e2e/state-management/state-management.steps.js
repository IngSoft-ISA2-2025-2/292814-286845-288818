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

Given('quiero crear una reserva con medicamento {string} en farmacia {string}', (medicamento, farmacia) => {
  // Mock para crear reserva - interceptará la creación
  cy.intercept('POST', '**/api/Reservation', {
    statusCode: 201,
    body: {
      id: 1,
      reservedDrugs: [{ drugName: medicamento, quantity: 1 }],
      pharmacyName: farmacia,
      status: 'Pendiente',
      fechaCreacion: new Date().toISOString(),
    }
  }).as('crearReserva');
});

Given('tengo una reserva en estado {string}', (estado) => {
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
    reservaBase.fechaConfirmacion = '2023-10-01T14:00:00Z';
  } else if (estado === 'Expirada') {
    reservaBase.fechaExpiracion = '2023-10-03T12:00:00Z';
  } else if (estado === 'Cancelada') {
    reservaBase.fechaCancelacion = '2023-10-01T15:00:00Z';
  } else if (estado === 'Retirada') {
    reservaBase.fechaRetiro = '2023-10-02T09:00:00Z';
    reservaBase.idReferencia = 'REF123456';
  }

  cy.intercept('POST', '**/api/Reservation/consult', {
    statusCode: 200,
    body: [reservaBase],
  }).as(`reserva${estado}`);
});

Given('tengo reservas en estados {string}, {string}, {string}, {string} y {string}', 
  (estado1, estado2, estado3, estado4, estado5) => {
    cy.intercept('POST', '**/api/Reservation/consult', {
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
          fechaConfirmacion: '2023-10-02T14:00:00Z',
        },
        {
          id: 3,
          reservedDrugs: [{ drugName: 'Paracetamol', quantity: 1 }],
          pharmacyName: 'Farmashop',
          status: estado3,
          fechaCreacion: '2023-10-03T12:00:00Z',
          fechaExpiracion: '2023-10-05T12:00:00Z',
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
          idReferencia: 'REF789012',
        },
      ],
    }).as('reservasTodosEstados');
  }
);

Given('tengo reservas en diferentes estados', () => {
  cy.intercept('POST', '**/api/Reservation/consult', {
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
        idReferencia: 'REF789',
        fechaConfirmacion: '2023-10-02T14:00:00Z'
      },
      { 
        id: 3, 
        reservedDrugs: [{ drugName: 'Paracetamol', quantity: 1 }], 
        pharmacyName: 'Farmashop', 
        status: 'Expirada',
        fechaCreacion: '2023-10-03T12:00:00Z',
        fechaExpiracion: '2023-10-05T12:00:00Z'
      },
      { 
        id: 4, 
        reservedDrugs: [{ drugName: 'Amoxicilina', quantity: 1 }], 
        pharmacyName: 'Farmacia Norte', 
        status: 'Cancelada',
        fechaCreacion: '2023-10-04T13:00:00Z',
        fechaCancelacion: '2023-10-04T15:00:00Z'
      },
      { 
        id: 5, 
        reservedDrugs: [{ drugName: 'Loratadina', quantity: 1 }], 
        pharmacyName: 'Farmacia Sur', 
        status: 'Retirada',
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
  // En este caso, simularíamos el botón de crear reserva
  // Pero como usamos manage-reservations, simplemente consultamos
  cy.get('[data-cy="consultar-reservas-btn"]').click();
  cy.wait('@crearReserva');
});

When('consulto mis reservas', () => {
  cy.get('[data-cy="consultar-reservas-btn"]').click();
});

When('filtro por estado {string}', (estado) => {
  cy.get('[data-cy="consultar-reservas-btn"]').click();
  cy.wait(500); // Esperar a que carguen las reservas
  cy.get('[data-cy="filtro-estado"]').select(estado);
});

// ============================================================================
// THEN STEPS
// ============================================================================
Then('el sistema asigna automáticamente el estado {string}', (estado) => {
  cy.get('[data-cy="estado-reserva"]').should('contain', estado);
});

Then('la reserva es visible con estado {string}', (estado) => {
  cy.get('[data-cy="listado-reservas"]').should('be.visible');
  cy.get('[data-cy="reserva-estado"]').first().should('contain', estado);
});

Then('veo la reserva con estado {string}', (estado) => {
  cy.get('[data-cy="listado-reservas"]').should('be.visible');
  cy.get('[data-cy="reserva-estado"]').should('contain', estado);
});

Then('veo el ID de referencia de la reserva', () => {
  cy.get('[data-cy="id-referencia"]').should('be.visible');
  cy.get('[data-cy="id-referencia"]').should('contain', 'REF');
});

Then('veo la fecha de confirmación', () => {
  cy.get('[data-cy="fecha-confirmacion"]').should('be.visible');
});

Then('veo un mensaje que dice {string}', (mensaje) => {
  cy.get('[data-cy="mensaje-estado"]').should('be.visible');
  cy.get('[data-cy="mensaje-estado"]').should('contain', mensaje);
});

Then('veo la fecha de expiración', () => {
  cy.get('[data-cy="fecha-expiracion"]').should('be.visible');
});

Then('veo la fecha de cancelación', () => {
  cy.get('[data-cy="fecha-cancelacion"]').should('be.visible');
});

Then('veo la fecha de retiro', () => {
  cy.get('[data-cy="fecha-retiro"]').should('be.visible');
});

Then('veo todas mis reservas', () => {
  cy.get('[data-cy="listado-reservas"]').should('be.visible');
  cy.get('[data-cy="reserva-card"]').should('have.length.at.least', 1);
});

Then('cada reserva muestra su estado correctamente', () => {
  cy.get('[data-cy="reserva-estado"]').should('be.visible');
});

Then('las reservas pendientes no muestran ID de referencia', () => {
  cy.get('[data-cy="reserva-card"]').each(($card) => {
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
  cy.get('[data-cy="reserva-card"]').each(($card) => {
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
  cy.get('[data-cy="reserva-estado"]').each(($estado) => {
    cy.wrap($estado).should('contain', estado);
  });
});
