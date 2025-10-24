import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// ============================================================================
// BACKGROUND - Se ejecuta antes de cada escenario
// ============================================================================
Given('estoy en la página de mis reservas', () => {
  cy.visit('/reservas');
});

// ============================================================================
// ESCENARIO 1: Usuario sin email intenta consultar reservas
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

When('hace click en el botón de consultar reservas', () => {
  cy.get('[data-cy="email-input"]').invoke('val').then((email) => {
    cy.get('[data-cy="secret-input"]').invoke('val').then((secret) => {
      if (!email || !secret) {
        cy.intercept('POST', '/api/reservas/consultar', {
          statusCode: 400,
          body: { error: 'Debe ingresar un email y secret para consultar reservas.' },
        }).as('sinEmailOSecret');
      }
      cy.get('[data-cy="consultar-reservas-btn"]').click();
    });
  });
});

Then('el sistema responde con un error y muestra el mensaje {string}', (mensaje) => {
  cy.get('[data-cy="error-mensaje"]').should('be.visible');
  cy.get('[data-cy="error-mensaje"]').should('contain', mensaje);
});

// ============================================================================
// ESCENARIO 2: Usuario con email y secret válidos sin reservas visualiza listado vacío
// ============================================================================

// Steps reutilizados: email, secret

Given('no tiene reservas creadas en el sistema', () => {
  cy.intercept('POST', '/api/reservas/consultar', {
    statusCode: 200,
    body: [],
  }).as('reservasVacias');
});

// Step reutilizado: hace click en el botón de consultar reservas

Then('el sistema responde de manera correcta, mostrando un listado vacío', () => {
  cy.get('[data-cy="listado-reservas"]').should('be.visible');
  cy.get('[data-cy="reserva-item"]').should('not.exist');
});

Then('muestra un mensaje que dice {string}', (mensaje) => {
  cy.get('[data-cy="mensaje-vacio"]').should('contain', mensaje);
});

// ============================================================================
// ESCENARIO 3: Usuario con email y secret válidos visualiza sus reservas exitosamente
// ============================================================================

// Steps reutilizados: email, secret

Given(
  'tiene reservas creadas en diferentes estados {string}, {string}, {string}, {string} y {string}',
  (estado1, estado2, estado3, estado4, estado5) => {
    cy.intercept('POST', '/api/reservas/consultar', {
      statusCode: 200,
      body: [
        {
          id: 1,
          medicamentos: [{ nombre: 'Aspirina' }],
          farmacia: 'Farmashop',
          estado: estado1,
          fechaCreacion: '2023-10-01T10:00:00Z',
        },
        {
          id: 2,
          medicamentos: [{ nombre: 'Paracetamol' }],
          farmacia: 'Farmacia Central',
          estado: estado2,
          fechaCreacion: '2023-10-02T11:00:00Z',
        },
        {
          id: 3,
          medicamentos: [{ nombre: 'Ibuprofeno' }],
          farmacia: 'Farmashop',
          estado: estado3,
          fechaCreacion: '2023-10-03T12:00:00Z',
        },
        {
          id: 4,
          medicamentos: [{ nombre: 'Amoxicilina' }],
          farmacia: 'Farmacia Norte',
          estado: estado4,
          fechaCreacion: '2023-10-04T13:00:00Z',
        },
        {
          id: 5,
          medicamentos: [{ nombre: 'Omeprazol' }],
          farmacia: 'Farmacia Sur',
          estado: estado5,
          fechaCreacion: '2023-10-05T14:00:00Z',
        },
      ],
    }).as('reservasExitosas');
  }
);

// Step reutilizado: hace click en el botón de consultar reservas

Then('el sistema responde de manera correcta, mostrando un listado con todas sus reservas', () => {
  cy.get('[data-cy="listado-reservas"]').should('be.visible');
  cy.get('[data-cy="reserva-item"]').should('have.length', 5);
});

Then('cada reserva muestra información básica: nombre de el/los medicamento/s, farmacia y estado', () => {
  cy.get('[data-cy="reserva-medicamento"]').should('be.visible');
  cy.get('[data-cy="reserva-farmacia"]').should('be.visible');
  cy.get('[data-cy="reserva-estado"]').should('be.visible');
});

Then('cada reserva incluye un botón para ver más detalles', () => {
  cy.get('[data-cy="ver-detalles-btn"]').should('have.length', 5);
});

// ============================================================================
// ESCENARIO 4: Usuario filtra reservas por estado
// ============================================================================

// Steps reutilizados: email, secret

Given('tiene reservas en diferentes estados', () => {
  cy.intercept('POST', '/api/reservas/consultar', {
    statusCode: 200,
    body: [
      { id: 1, medicamentos: [{ nombre: 'Aspirina' }], farmacia: 'Farmashop', estado: 'Pendiente' },
      { id: 2, medicamentos: [{ nombre: 'Paracetamol' }], farmacia: 'Farmacia Central', estado: 'Confirmada' },
      { id: 3, medicamentos: [{ nombre: 'Ibuprofeno' }], farmacia: 'Farmashop', estado: 'Expirada' },
    ],
  }).as('reservasVariadas');
});

When('aplica filtro para ver solo reservas en estado {string}', (estado) => {
  cy.intercept(
    'POST',
    '/api/reservas/consultar',
    {
      statusCode: 200,
      body: [
        { id: 2, medicamentos: [{ nombre: 'Paracetamol' }], farmacia: 'Farmacia Central', estado: estado },
      ],
    }
  ).as('reservasFiltradas');

  cy.get('[data-cy="filtro-estado"]').select(estado);
  cy.get('[data-cy="aplicar-filtro-btn"]').click();
});

Then('el sistema responde de manera correcta, mostrando un listado únicamente con las reservas en estado {string}', (estado) => {
  cy.get('[data-cy="reserva-estado"]').each(($el) => {
    cy.wrap($el).should('contain', estado);
  });
});

// ============================================================================
// ESCENARIO 5: Usuario intenta acceder a detalles de reserva inexistente
// ============================================================================

// Steps reutilizados: email, secret

When('intenta acceder a detalles de una reserva que no existe', () => {
  cy.intercept('GET', '/api/reservas/999', {
    statusCode: 404,
    body: { error: 'Reserva no encontrada' },
  }).as('reservaInexistente');

  cy.visit('/reservas/999');
});

Then('el sistema responde con un error, mostrando un mensaje que dice {string}', (mensaje) => {
  cy.get('[data-cy="error-mensaje"]').should('contain', mensaje);
});

// ============================================================================
// ESCENARIO 6: Usuario accede a detalles de una reserva específica
// ============================================================================

// Steps reutilizados: email, secret

Given('tiene una reserva creada', () => {
  cy.intercept('GET', '/api/reservas/1', {
    statusCode: 200,
    body: {
      id: 1,
      medicamentos: [{ nombre: 'Aspirina', cantidad: 2 }],
      farmacia: 'Farmashop',
      estado: 'Confirmada',
      fechaCreacion: '2023-10-01T10:00:00Z',
    },
  }).as('detalleReserva');
});

When('selecciona ver detalles de la reserva', () => {
  cy.get('[data-cy="ver-detalles-btn"]').first().click();
});

Then(
  'el sistema responde de manera correcta, mostrando la información detallada completa de la reserva: medicamento/s, cantidad, farmacia, estado, fecha de creación, id',
  () => {
    cy.get('[data-cy="detalle-medicamento"]').should('be.visible');
    cy.get('[data-cy="detalle-cantidad"]').should('be.visible');
    cy.get('[data-cy="detalle-farmacia"]').should('be.visible');
    cy.get('[data-cy="detalle-estado"]').should('be.visible');
    cy.get('[data-cy="detalle-fecha-creacion"]').should('be.visible');
    cy.get('[data-cy="detalle-id"]').should('be.visible');
  }
);

// ============================================================================
// ESCENARIO 7: Usuario con email existente pero secret incorrecto intenta consultar reservas
// ============================================================================

// Steps reutilizados: email, secret

Given('el email {string} ya tiene reservas con secret {string}', (email, secretCorrecto) => {
  cy.intercept('POST', '/api/reservas/consultar', (req) => {
    if (req.body.email === email && req.body.secret !== secretCorrecto) {
      req.reply({
        statusCode: 403,
        body: { error: 'El secret no coincide con el registrado para este email' },
      });
    }
  }).as('secretIncorrecto');
});

// Step reutilizado: hace click en el botón de consultar reservas
// Step reutilizado: el sistema responde con un error y muestra el mensaje {string}

// ============================================================================
// ESCENARIO 8: Usuario visualiza reservas pendientes con opciones disponibles
// ============================================================================

// Steps reutilizados: email, secret

Given('tiene una reserva en estado {string}', (estado) => {
  cy.intercept('POST', '/api/reservas/consultar', {
    statusCode: 200,
    body: [
      {
        id: 1,
        medicamentos: [{ nombre: 'Aspirina' }],
        farmacia: 'Farmashop',
        estado: estado,
        fechaLimite: '2023-10-02T10:00:00Z',
        fechaExpiracion: '2023-10-01T10:00:00Z',
        fechaCancelacion: '2023-10-01T15:00:00Z',
        fechaRetiro: '2023-10-02T09:00:00Z',
        idReferencia: estado === 'Confirmada' ? 'REF123456' : null,
      },
    ],
  }).as(`reservas${estado}`);
});

// Step reutilizado: hace click en el botón de consultar reservas
// Step reutilizado: el sistema responde de manera correcta, mostrando un listado con todas sus reservas

Then('la reserva pendiente muestra claramente el estado {string}', (estado) => {
  cy.get('[data-cy="reserva-estado"]').should('contain', estado);
});

Then('incluye un botón para cancelar la reserva', () => {
  cy.get('[data-cy="cancelar-reserva-btn"]').should('be.visible');
});

Then('muestra la fecha límite para confirmar la reserva', () => {
  cy.get('[data-cy="fecha-limite"]').should('be.visible');
});

Then('no muestra ID de referencia hasta que sea confirmada', () => {
  cy.get('[data-cy="id-referencia"]').should('not.exist');
});

// ============================================================================
// ESCENARIO 9: Usuario visualiza ID de referencia para reservas confirmadas
// ============================================================================

// Steps reutilizados: email, secret, tiene una reserva en estado "Confirmada"
// Step reutilizado: hace click en el botón de consultar reservas
// Step reutilizado: el sistema responde de manera correcta, mostrando un listado con todas sus reservas

Then('la reserva confirmada muestra un ID de referencia único', () => {
  cy.get('[data-cy="id-referencia"]').should('be.visible');
  cy.get('[data-cy="id-referencia"]').should('not.be.empty');
});

// ============================================================================
// ESCENARIO 10: Usuario visualiza reservas expiradas con indicaciones
// ============================================================================

// Steps reutilizados: email, secret, tiene una reserva en estado "Expirada"
// Step reutilizado: hace click en el botón de consultar reservas
// Step reutilizado: el sistema responde de manera correcta, mostrando un listado con todas sus reservas

Then('la reserva expirada muestra claramente el estado {string}', (estado) => {
  cy.get('[data-cy="reserva-estado"]').should('contain', estado);
});

Then('muestra la fecha de expiración', () => {
  cy.get('[data-cy="fecha-expiracion"]').should('be.visible');
});

// ============================================================================
// ESCENARIO 11: Usuario ordena reservas por fecha de creación descendente
// ============================================================================

// Steps reutilizados: email, secret

Given('tiene múltiples reservas creadas en diferentes fechas', () => {
  cy.intercept('POST', '/api/reservas/consultar', {
    statusCode: 200,
    body: [
      { id: 1, medicamentos: [{ nombre: 'Aspirina' }], fechaCreacion: '2023-10-01T10:00:00Z' },
      { id: 2, medicamentos: [{ nombre: 'Paracetamol' }], fechaCreacion: '2023-10-03T10:00:00Z' },
      { id: 3, medicamentos: [{ nombre: 'Ibuprofeno' }], fechaCreacion: '2023-10-02T10:00:00Z' },
    ],
  }).as('reservasMultiplesFechas');
});

When('solicita ordenar por fecha de creación más reciente', () => {
  cy.intercept(
    'POST',
    '/api/reservas/consultar',
    {
      statusCode: 200,
      body: [
        { id: 2, medicamentos: [{ nombre: 'Paracetamol' }], fechaCreacion: '2023-10-03T10:00:00Z' },
        { id: 3, medicamentos: [{ nombre: 'Ibuprofeno' }], fechaCreacion: '2023-10-02T10:00:00Z' },
        { id: 1, medicamentos: [{ nombre: 'Aspirina' }], fechaCreacion: '2023-10-01T10:00:00Z' },
      ],
    }
  ).as('reservasOrdenadas');

  cy.get('[data-cy="ordenar-fecha-btn"]').click();
});

Then('el sistema responde de manera correcta, mostrando las reservas ordenadas de más reciente a más antigua', () => {
  cy.get('[data-cy="reserva-item"]').first().should('contain', 'Paracetamol');
  cy.get('[data-cy="reserva-item"]').last().should('contain', 'Aspirina');
});

// ============================================================================
// ESCENARIO 12: Usuario busca reservas por nombre de medicamento
// ============================================================================

// Steps reutilizados: email, secret

Given('tiene reservas de diferentes medicamentos', () => {
  cy.intercept('POST', '/api/reservas/consultar', {
    statusCode: 200,
    body: [
      { id: 1, medicamentos: [{ nombre: 'Paracetamol' }], farmacia: 'Farmashop' },
      { id: 2, medicamentos: [{ nombre: 'Aspirina' }], farmacia: 'Farmacia Central' },
      { id: 3, medicamentos: [{ nombre: 'Paracetamol Extra' }], farmacia: 'Farmacia Norte' },
    ],
  }).as('reservasMedicamentos');
});

When('busca reservas por el nombre {string}', (medicamento) => {
  cy.intercept(
    'POST',
    '/api/reservas/consultar',
    {
      statusCode: 200,
      body: [
        { id: 1, medicamentos: [{ nombre: 'Paracetamol' }], farmacia: 'Farmashop' },
        { id: 3, medicamentos: [{ nombre: 'Paracetamol Extra' }], farmacia: 'Farmacia Norte' },
      ],
    }
  ).as('busquedaMedicamento');

  cy.get('[data-cy="buscar-medicamento-input"]').type(medicamento);
  cy.get('[data-cy="buscar-btn"]').click();
});

Then('el sistema responde de manera correcta, mostrando únicamente las reservas que contienen medicamentos con {string}', (medicamento) => {
  cy.get('[data-cy="reserva-medicamento"]').each(($el) => {
    cy.wrap($el).should('contain', medicamento);
  });
});

// ============================================================================
// ESCENARIO 13: Usuario busca reservas por nombre de farmacia
// ============================================================================

// Steps reutilizados: email, secret

Given('tiene reservas de diferentes farmacias', () => {
  cy.intercept('POST', '/api/reservas/consultar', {
    statusCode: 200,
    body: [
      { id: 1, medicamentos: [{ nombre: 'Paracetamol' }], farmacia: 'Farmacia Central' },
      { id: 2, medicamentos: [{ nombre: 'Aspirina' }], farmacia: 'Farmashop' },
      { id: 3, medicamentos: [{ nombre: 'Ibuprofeno' }], farmacia: 'Farmacia Central Norte' },
    ],
  }).as('reservasFarmacias');
});

// Step reutilizado: When('busca reservas por el nombre {string}') (definido arriba para medicamentos)

Then('el sistema responde de manera correcta, mostrando únicamente las reservas que contienen la farmacia {string}', (farmacia) => {
  cy.get('[data-cy="reserva-farmacia"]').each(($el) => {
    cy.wrap($el).should('contain', farmacia);
  });
});

// ============================================================================
// ESCENARIO 14: Usuario visualiza reservas canceladas con información del motivo
// ============================================================================

// Steps reutilizados: email, secret, tiene una reserva en estado "Cancelada"
// Step reutilizado: hace click en el botón de consultar reservas
// Step reutilizado: el sistema responde de manera correcta, mostrando un listado con todas sus reservas

Then('la reserva cancelada muestra claramente el estado {string}', (estado) => {
  cy.get('[data-cy="reserva-estado"]').should('contain', estado);
});

Then('muestra la fecha de cancelación', () => {
  cy.get('[data-cy="fecha-cancelacion"]').should('be.visible');
});

// ============================================================================
// ESCENARIO 15: Usuario visualiza reservas retiradas con confirmación exitosa
// ============================================================================

// Steps reutilizados: email, secret, tiene una reserva en estado "Retirada"
// Step reutilizado: hace click en el botón de consultar reservas
// Step reutilizado: el sistema responde de manera correcta, mostrando un listado con todas sus reservas

Then('la reserva retirada muestra claramente el estado {string}', (estado) => {
  cy.get('[data-cy="reserva-estado"]').should('contain', estado);
});

Then('muestra la fecha de retiro', () => {
  cy.get('[data-cy="fecha-retiro"]').should('be.visible');
});

