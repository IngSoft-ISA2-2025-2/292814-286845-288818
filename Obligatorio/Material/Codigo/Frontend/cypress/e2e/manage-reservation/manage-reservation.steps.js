import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// ============================================================================
// BACKGROUND - Se ejecuta antes de cada escenario
// ============================================================================
Given('estoy en la página de mis reservas', () => {
  cy.visit('/reservas');
});

// ============================================================================
// ESCENARIO 1: Usuario no autenticado intenta visualizar reservas
// ============================================================================
Given('un usuario no autenticado', () => {
  cy.window().then((win) => {
    win.localStorage.removeItem('login');
  });
});

When('intenta acceder al listado de sus reservas', () => {
  cy.intercept('GET', '/api/reservas/usuario/', {
    statusCode: 401,
    body: { error: 'Debe iniciar sesión para ver sus reservas' },
  }).as('reservasUnauthorized');
  
  cy.get('[data-cy="listar-reservas-btn"]').click();
});

Then('el sistema responde con un error y muestra el mensaje {string}', (mensaje) => {
  cy.get('[data-cy="error-mensaje"]').should('be.visible');
  cy.get('[data-cy="error-mensaje"]').should('contain', mensaje);
});

// ============================================================================
// ESCENARIO 2: Usuario autenticado sin reservas visualiza listado vacío
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

Given('no tiene reservas creadas en el sistema', () => {
  cy.intercept('GET', '/api/reservas/usuario/usuarioTest', {
    statusCode: 200,
    body: [],
  }).as('reservasVacias');
});

When('solicita visualizar sus reservas', () => {
  cy.get('[data-cy="listar-reservas-btn"]').click();
});

Then('el sistema responde de manera correcta, mostrando un listado vacío', () => {
  cy.get('[data-cy="listado-reservas"]').should('be.visible');
  cy.get('[data-cy="reserva-item"]').should('not.exist');
});

Then('muestra un mensaje que dice {string}', (mensaje) => {
  cy.get('[data-cy="mensaje-vacio"]').should('contain', mensaje);
});

// ============================================================================
// ESCENARIO 3: Usuario autenticado visualiza sus reservas exitosamente
// ============================================================================
Given(
  'tiene reservas creadas en diferentes estados {string}, {string}, {string}, {string} y {string}',
  (estado1, estado2, estado3, estado4, estado5) => {
    cy.intercept('GET', '/api/reservas/usuario/usuarioTest', {
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
Given('tiene reservas en diferentes estados', () => {
  cy.intercept('GET', '/api/reservas/usuario/usuarioTest', {
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
    'GET',
    new RegExp(`/api/reservas/usuario/usuarioTest\\?estado=${estado}`),
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
// ESCENARIO 7: Usuario visualiza reservas pendientes con opciones disponibles
// ============================================================================
Given('tiene una reserva en estado {string}', (estado) => {
  cy.intercept('GET', '/api/reservas/usuario/usuarioTest', {
    statusCode: 200,
    body: [
      {
        id: 1,
        medicamentos: [{ nombre: 'Aspirina' }],
        farmacia: 'Farmashop',
        estado: estado,
        fechaLimite: '2023-10-02T10:00:00Z',
      },
    ],
  }).as(`reservas${estado}`);
});

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
// ESCENARIO 8: Usuario visualiza ID de referencia para reservas confirmadas
// ============================================================================
Then('la reserva confirmada muestra un ID de referencia único', () => {
  cy.get('[data-cy="id-referencia"]').should('be.visible');
  cy.get('[data-cy="id-referencia"]').should('not.be.empty');
});

// ============================================================================
// ESCENARIO 9: Usuario visualiza reservas expiradas con indicaciones
// ============================================================================
Then('la reserva expirada muestra claramente el estado {string}', (estado) => {
  cy.get('[data-cy="reserva-estado"]').should('contain', estado);
});

Then('muestra la fecha de expiración', () => {
  cy.get('[data-cy="fecha-expiracion"]').should('be.visible');
});

// ============================================================================
// ESCENARIO 10: Usuario ordena reservas por fecha de creación descendente
// ============================================================================
Given('tiene múltiples reservas creadas en diferentes fechas', () => {
  cy.intercept('GET', '/api/reservas/usuario/usuarioTest', {
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
    'GET',
    '/api/reservas/usuario/usuarioTest?orden=fecha_desc',
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
// ESCENARIO 11: Usuario busca reservas por nombre de medicamento
// ============================================================================
Given('tiene reservas de diferentes medicamentos', () => {
  cy.intercept('GET', '/api/reservas/usuario/usuarioTest', {
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
    'GET',
    new RegExp(`/api/reservas/usuario/usuarioTest\\?medicamento=${medicamento}`),
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
// ESCENARIO 12: Usuario busca reservas por nombre de farmacia
// ============================================================================
Given('tiene reservas de diferentes farmacias', () => {
  cy.intercept('GET', '/api/reservas/usuario/usuarioTest', {
    statusCode: 200,
    body: [
      { id: 1, medicamentos: [{ nombre: 'Paracetamol' }], farmacia: 'Farmacia Central' },
      { id: 2, medicamentos: [{ nombre: 'Aspirina' }], farmacia: 'Farmashop' },
      { id: 3, medicamentos: [{ nombre: 'Ibuprofeno' }], farmacia: 'Farmacia Central Norte' },
    ],
  }).as('reservasFarmacias');
});

When('busca reservas por el nombre {string}', (farmacia) => {
  cy.intercept(
    'GET',
    new RegExp(`/api/reservas/usuario/usuarioTest\\?farmacia=${encodeURIComponent(farmacia)}`),
    {
      statusCode: 200,
      body: [
        { id: 1, medicamentos: [{ nombre: 'Paracetamol' }], farmacia: 'Farmacia Central' },
        { id: 3, medicamentos: [{ nombre: 'Ibuprofeno' }], farmacia: 'Farmacia Central Norte' },
      ],
    }
  ).as('busquedaFarmacia');

  cy.get('[data-cy="buscar-farmacia-input"]').type(farmacia);
  cy.get('[data-cy="buscar-btn"]').click();
});

Then('el sistema responde de manera correcta, mostrando únicamente las reservas que contienen la farmacia {string}', (farmacia) => {
  cy.get('[data-cy="reserva-farmacia"]').each(($el) => {
    cy.wrap($el).should('contain', farmacia);
  });
});

// ============================================================================
// ESCENARIO 13: Usuario visualiza reservas canceladas con información del motivo
// ============================================================================
Then('la reserva cancelada muestra claramente el estado {string}', (estado) => {
  cy.get('[data-cy="reserva-estado"]').should('contain', estado);
});

Then('muestra la fecha de cancelación', () => {
  cy.get('[data-cy="fecha-cancelacion"]').should('be.visible');
});

// ============================================================================
// ESCENARIO 14: Usuario visualiza reservas retiradas con confirmación exitosa
// ============================================================================
Then('la reserva retirada muestra claramente el estado {string}', (estado) => {
  cy.get('[data-cy="reserva-estado"]').should('contain', estado);
});

Then('muestra la fecha de retiro', () => {
  cy.get('[data-cy="fecha-retiro"]').should('be.visible');
});