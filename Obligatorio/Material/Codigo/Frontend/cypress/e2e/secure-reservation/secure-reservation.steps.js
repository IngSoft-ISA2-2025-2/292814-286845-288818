import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// ============================================================================
// BACKGROUND
// ============================================================================
Given('estoy en la página de validación de reservas', () => {
  cy.visit('/validate-reservation');
});

Given('estoy en la página de crear-reserva', () => {
  cy.visit('/create-reservation');
});

// ============================================================================
// GIVEN STEPS
// ============================================================================
Given('un usuario autenticado con email {string}', (email) => {
  cy.wrap(email).as('userEmail');
});

Given('una reserva creada para el medicamento {string} en la farmacia {string}', (medicamento, farmacia) => {
  cy.wrap({ medicamento, farmacia }).as('reservaData');
});

Given('una reserva confirmada con código {string}', (codigo) => {
  cy.wrap(codigo).as('reservaCodigo');
});

Given('la reserva tiene una clave pública {string}', (clavePublica) => {
  cy.wrap(clavePublica).as('clavePublica');
});

Given('estoy en la página de validación de reservas en farmacia', () => {
  // Ya estamos en la página por el Background, pero podemos navegar explícitamente si es necesario
  cy.url().should('include', '/validate-reservation');
});

Given('no existe ninguna reserva con la clave pública {string}', (clavePublica) => {
  cy.intercept('POST', '**/api/Reservation/validate', {
    statusCode: 404,
    body: { message: 'La clave pública proporcionada no es válida o no existe' }
  }).as('claveInexistente');
});

Given('una reserva expirada con código {string}', (codigo) => {
  cy.wrap({ codigo, estado: 'Expirada' }).as('reservaExpirada');
});

Given('la reserva está en estado {string}', (estado) => {
  cy.wrap(estado).as('estadoReserva');
});

Given('una reserva cancelada con código {string}', (codigo) => {
  cy.wrap({ codigo, estado: 'Cancelada' }).as('reservaCancelada');
});

Given('soy un empleado autenticado de la farmacia {string}', (farmacia) => {
  cy.wrap({ rol: 'empleado', farmacia }).as('empleadoData');
});

Given('existe una reserva confirmada con clave pública {string}', (clavePublica) => {
  cy.wrap({ clavePublica, estado: 'Confirmada' }).as('reservaConfirmada');
});

Given('tengo habilitada la protección contra intentos de fuerza bruta', () => {
  cy.wrap({ proteccionActiva: true, intentos: 0 }).as('proteccionBruto');
});

Given('un usuario con email {string} y secret {string}', (email, secret) => {
  cy.get('[data-cy="email-input"]').clear().type(email);
  cy.get('[data-cy="secret-input"]').clear().type(secret);
});

Given('ha creado una reserva para {string} en farmacia {string}', (medicamento, farmacia) => {
  cy.get('[data-cy="medicamento-nombre-input"]').clear().type(medicamento);
  cy.get('[data-cy="medicamento-cantidad-input"]').clear().type('1');
  cy.get('[data-cy="agregar-medicamento-btn"]').click();
  cy.get('[data-cy="farmacia-input"]').clear().type(farmacia);
  
  // Configurar intercept para simular creación exitosa con clave pública
  cy.intercept('POST', '**/api/Reservation', {
    statusCode: 201,
    body: {
      id: 1,
      estado: 'Confirmada',
      medicamentos: [{ nombre: medicamento, cantidad: 1, requierePrescripcion: false }],
      farmacia: farmacia,
      clavePublica: 'PUBKEY-VIEW456',
      mensaje: 'Reserva creada exitosamente'
    }
  }).as('reservaConClave');
});

// ============================================================================
// WHEN STEPS
// ============================================================================
When('el sistema procesa la reserva', () => {
  // Simular el procesamiento del sistema
  cy.get('@reservaData').then((data) => {
    cy.intercept('POST', '**/api/Reservation', {
      statusCode: 201,
      body: {
        id: 1,
        estado: 'Pendiente',
        clavePublica: 'PUBKEY-AUTO123',
        clavePrivada: '***SECURED***',
        mensaje: 'Reserva creada exitosamente. Guarde su clave pública para retirar el medicamento en la farmacia.'
      }
    }).as('procesoReserva');
  });
});

When('ingreso la clave pública {string}', (clavePublica) => {
  cy.get('[data-cy="clave-publica-input"]').clear().type(clavePublica);
});

When('hago click en el botón de validar', () => {
  // Configurar intercept basado en el contexto
  cy.get('[data-cy="clave-publica-input"]').invoke('val').then((clave) => {
    if (clave === 'PUBKEY-EXPIRED456') {
      cy.intercept('POST', '**/api/Reservation/validate', {
        statusCode: 403,
        body: { message: 'La reserva ha expirado y no puede ser utilizada' }
      }).as('claveExpirada');
    } else if (clave === 'PUBKEY-CANCELLED789') {
      cy.intercept('POST', '**/api/Reservation/validate', {
        statusCode: 403,
        body: { message: 'La reserva fue cancelada y la clave pública ya no es válida' }
      }).as('claveCancelada');
    } else if (clave === 'PUBKEY-ABC123XYZ' || clave === 'PUBKEY-DELIVERY999') {
      cy.intercept('POST', '**/api/Reservation/validate', {
        statusCode: 200,
        body: {
          id: 1,
          estado: 'Confirmada',
          medicamento: 'Aspirina',
          cantidad: 2,
          cliente: 'usuario@test.com',
          farmacia: 'Farmashop',
          clavePublica: clave,
          mensaje: 'Reserva validada exitosamente. Puede proceder con la entrega del medicamento.'
        }
      }).as('validacionExitosa');
    }
  });
  
  cy.get('[data-cy="validar-btn"]').click();
});

When('confirmo la entrega del medicamento', () => {
  cy.intercept('POST', '**/api/Reservation/complete', {
    statusCode: 200,
    body: {
      id: 1,
      estado: 'Retirada',
      clavePublicaInvalida: true,
      mensaje: 'Entrega completada exitosamente. La reserva ha sido cerrada.'
    }
  }).as('entregaCompleta');
  
  cy.get('[data-cy="confirmar-entrega-btn"]').click();
});

When('ingreso una clave pública incorrecta {string} y hago click en validar', (claveIncorrecta) => {
  cy.get('[data-cy="clave-publica-input"]').clear().type(claveIncorrecta);
  
  cy.get('@proteccionBruto').then((proteccion) => {
    const nuevoIntentos = (proteccion.intentos || 0) + 1;
    cy.wrap({ proteccionActiva: true, intentos: nuevoIntentos }).as('proteccionBruto');
    
    if (nuevoIntentos >= 5) {
      cy.intercept('POST', '**/api/Reservation/validate', {
        statusCode: 429,
        body: { message: 'Demasiados intentos fallidos. Por favor, intente nuevamente en 15 minutos.' }
      }).as('bloqueoPorIntentos');
    } else {
      cy.intercept('POST', '**/api/Reservation/validate', {
        statusCode: 404,
        body: { message: 'La clave pública proporcionada no es válida o no existe' }
      }).as(`intentoFallido${nuevoIntentos}`);
    }
  });
  
  cy.get('[data-cy="validar-btn"]').click();
});

When('ingreso otra clave pública incorrecta {string} y hago click en validar', (claveIncorrecta) => {
  cy.get('[data-cy="clave-publica-input"]').clear().type(claveIncorrecta);
  
  cy.get('@proteccionBruto').then((proteccion) => {
    const nuevoIntentos = (proteccion.intentos || 0) + 1;
    cy.wrap({ proteccionActiva: true, intentos: nuevoIntentos }).as('proteccionBruto');
    
    if (nuevoIntentos >= 5) {
      cy.intercept('POST', '**/api/Reservation/validate', {
        statusCode: 429,
        body: { message: 'Demasiados intentos fallidos. Por favor, intente nuevamente en 15 minutos.' }
      }).as('bloqueoPorIntentos');
    } else {
      cy.intercept('POST', '**/api/Reservation/validate', {
        statusCode: 404,
        body: { message: 'La clave pública proporcionada no es válida o no existe' }
      }).as(`intentoFallido${nuevoIntentos}`);
    }
  });
  
  cy.get('[data-cy="validar-btn"]').click();
});

When('la reserva se crea exitosamente', () => {
  cy.get('[data-cy="reservar-btn"]').click();
  cy.wait('@reservaConClave');
});

// ============================================================================
// THEN STEPS
// ============================================================================
Then('el sistema genera automáticamente un par de claves público-privada', () => {
  cy.get('[data-cy="clave-publica-generada"]').should('exist');
  cy.get('[data-cy="clave-privada-almacenada"]').should('exist');
});

Then('la clave pública se muestra al usuario', () => {
  cy.get('[data-cy="clave-publica-display"]').should('be.visible');
  cy.get('[data-cy="clave-publica-display"]').should('not.be.empty');
});

Then('la clave privada se almacena de forma segura en el sistema', () => {
  cy.get('[data-cy="clave-privada-secured"]').should('exist');
});

Then('muestra un mensaje que dice {string}', (mensaje) => {
  cy.get('[data-cy="success-mensaje"]', { timeout: 5000 }).should('be.visible');
  cy.get('[data-cy="success-mensaje"]').should('contain', mensaje);
});

Then('el sistema valida correctamente la clave pública', () => {
  cy.get('[data-cy="validacion-exitosa"]').should('be.visible');
});

Then('muestra la información de la reserva: medicamento, cantidad, cliente', () => {
  cy.get('[data-cy="reserva-medicamento"]').should('be.visible');
  cy.get('[data-cy="reserva-cantidad"]').should('be.visible');
  cy.get('[data-cy="reserva-cliente"]').should('be.visible');
});

Then('el sistema responde con un error de tipo {string}', (tipoError) => {
  cy.get('[data-cy="error-mensaje"]', { timeout: 5000 }).should('be.visible');
  // Verificar que el error sea del tipo esperado (404, 403, 429)
  const codigoError = tipoError.match(/\d+/)?.[0];
  if (codigoError) {
    cy.get('[data-cy="error-codigo"]').should('contain', codigoError);
  }
});

Then('el sistema marca la reserva como {string}', (estado) => {
  cy.get('[data-cy="estado-reserva"]').should('contain', estado);
});

Then('invalida la clave pública para evitar reutilización', () => {
  cy.get('[data-cy="clave-invalidada"]').should('exist');
});

Then('el sistema bloquea temporalmente la validación por seguridad', () => {
  cy.get('[data-cy="bloqueo-temporal"]').should('be.visible');
});

Then('el sistema muestra la clave pública {string}', (clavePublica) => {
  cy.get('[data-cy="clave-publica-display"]').should('be.visible');
  cy.get('[data-cy="clave-publica-display"]').should('contain', clavePublica);
});

Then('muestra instrucciones que dicen {string}', (instrucciones) => {
  cy.get('[data-cy="instrucciones-clave"]').should('be.visible');
  cy.get('[data-cy="instrucciones-clave"]').should('contain', instrucciones);
});

Then('puedo ver el estado de la reserva como {string}', (estado) => {
  cy.get('[data-cy="estado-reserva"]').should('be.visible');
  cy.get('[data-cy="estado-reserva"]').should('contain', estado);
});
