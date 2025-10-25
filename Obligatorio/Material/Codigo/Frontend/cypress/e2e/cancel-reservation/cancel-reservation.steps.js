import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// ------------------------
// BACKGROUND
// ------------------------
Given('que el formulario de cancelación solicita "correo" y "secret"', () => {
	cy.visit('/cancel-reservation');
	cy.get('[data-cy="cancel-email-input"]').should('exist');
	cy.get('[data-cy="cancel-secret-input"]').should('exist');
	cy.get('[data-cy="cancel-btn"]').should('exist');
});

// ------------------------
// GIVEN STEPS
// ------------------------
Given('existe una reserva para el correo {string} con el secret {string}', (email, secret) => {
	// Interceptamos la llamada de cancelación. Asumimos POST /api/reservas/cancel con body { email, secret }
	cy.intercept('POST', '**/api/reservas/cancel', (req) => {
		const body = req.body || {};
		if (body.email === email && body.secret === secret) {
			req.reply({
				statusCode: 200,
				body: { message: 'Reserva cancelada correctamente', email, estado: 'cancelada' }
			});
		}
	}).as('cancelSuccess');
});

Given('no existe ninguna reserva para el correo {string}', (email) => {
	cy.intercept('POST', '**/api/reservas/cancel', (req) => {
		const body = req.body || {};
		if (body.email === email) {
			req.reply({
				statusCode: 404,
				body: { message: 'No existe una reserva asociada a ese correo' }
			});
		}
	}).as('cancelNotFound');
});

Given('existe una reserva para el correo {string} con el secret {string} y su estado es {string}', (email, secret, estado) => {
	cy.intercept('POST', '**/api/reservas/cancel', (req) => {
		const body = req.body || {};
		if (body.email === email && body.secret === secret) {
			if (estado === 'cancelada') {
				// idempotente: devolveremos 200 con mensaje indicando que ya estaba cancelada
				req.reply({
					statusCode: 200,
					body: { message: 'La reserva ya está cancelada', email, estado: 'cancelada' }
				});
			} else if (estado === 'expirada') {
				req.reply({
					statusCode: 410,
					body: { message: 'No se puede cancelar una reserva expirada', email, estado: 'expirada' }
				});
			} else {
				req.reply({ statusCode: 200, body: { message: 'Reserva cancelada correctamente', email, estado: 'cancelada' } });
			}
		}
	}).as('cancelState');
});

Given('existen dos reservas para el correo {string}:', (email, table) => {
	// table is a DataTable object; build a simple map of secret->estado
	const rows = table.hashes();
	cy.intercept('POST', '**/api/reservas/cancel', (req) => {
		const body = req.body || {};
		if (body.email === email) {
			const found = rows.find(r => r.secret === body.secret);
			if (found) {
				// respond cancel only for the matching secret
				if (found.estado === 'activa') {
					req.reply({ statusCode: 200, body: { message: `Reserva con secret ${found.secret} cancelada`, secret: found.secret, estado: 'cancelada' } });
				} else if (found.estado === 'cancelada') {
					req.reply({ statusCode: 200, body: { message: 'La reserva ya está cancelada', secret: found.secret, estado: 'cancelada' } });
				} else {
					req.reply({ statusCode: 400, body: { message: 'Estado de reserva no manejado' } });
				}
			} else {
				// secret no encontrado para ese email
				req.reply({ statusCode: 403, body: { message: 'Secret inválido para ese correo' } });
			}
		}
	}).as('cancelMulti');
});

// ------------------------
// WHEN STEPS
// ------------------------
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

	// wait for any cancel alias we might have set up
	cy.get('@cancelSuccess', { timeout: 2000 }).then(() => {}, () => {});
	cy.get('@cancelNotFound', { timeout: 2000 }).then(() => {}, () => {});
	cy.get('@cancelState', { timeout: 2000 }).then(() => {}, () => {});
	cy.get('@cancelMulti', { timeout: 2000 }).then(() => {}, () => {});
});

When('el visitante envía el formulario de cancelación sin proporcionar correo', () => {
	cy.get('[data-cy="cancel-email-input"]').clear();
	cy.get('[data-cy="cancel-secret-input"]').clear().type('cualquier');
	cy.get('[data-cy="cancel-btn"]').click();
});

// ------------------------
// THEN STEPS
// ------------------------
Then('la reserva para {string} debe quedar marcada como cancelada', (email) => {
	// Preferimos verificar mediante mensajes de UI y/o la respuesta interceptada
	cy.get('[data-cy="success-mensaje"]', { timeout: 5000 }).should('be.visible').and('contain', 'Reserva cancelada correctamente');
	cy.get('[data-cy="estado-reserva"]').should('contain', 'cancelada');
});

Then('la reserva no debe ser cancelada', () => {
	cy.get('[data-cy="error-mensaje"]', { timeout: 5000 }).should('be.visible');
});

Then('el sistema responde con un error indicando "No existe una reserva asociada a ese correo"', () => {
	cy.get('[data-cy="error-mensaje"]', { timeout: 5000 }).should('be.visible').and('contain', 'No existe una reserva asociada a ese correo');
});

Then('el sistema crea una reserva asociada a {string} con secret {string}', (email, secret) => {
	// Este step corresponde al escenario de creación implícita (contexto). Simulamos que el sistema crea la reserva.
	cy.get('[data-cy="success-mensaje"]', { timeout: 5000 }).should('be.visible').and('contain', 'Reserva creada');
});

Then('el sistema muestra el mensaje {string} como precondición para operaciones posteriores', (mensaje) => {
	cy.get('[data-cy="success-mensaje"]', { timeout: 5000 }).should('be.visible').and('contain', mensaje);
});

Then('el sistema no debe cambiar el estado de la reserva (sigue "cancelada")', () => {
	cy.get('[data-cy="estado-reserva"]').should('contain', 'cancelada');
});

Then('el sistema muestra el mensaje {string} o una respuesta idempotente apropiada', (mensaje) => {
	cy.get('[data-cy="success-mensaje"]', { timeout: 5000 }).should('be.visible').and('contain', mensaje);
});

Then('el sistema responde con un error indicando "Se requiere un correo válido"', () => {
	cy.get('[data-cy="error-mensaje"]', { timeout: 5000 }).should('be.visible').and('contain', 'Se requiere un correo válido');
});

Then('solo la reserva con secret "{string}" debe quedar marcada como cancelada', (secret) => {
	// Verificamos el mensaje de éxito que incluye el secret cancelado
	cy.get('[data-cy="success-mensaje"]', { timeout: 5000 }).should('be.visible').and('contain', `Reserva con secret ${secret} cancelada`);
});

Then('la reserva con secret "{string}" debe permanecer en estado "activa"', (secret) => {
	// Comprobación orientativa: la UI debería mostrar la otra reserva activa
	cy.get('[data-cy="estado-reserva"]', { timeout: 5000 }).should('contain', 'activa');
});

Then('el sistema no debe permitir la cancelación', () => {
	cy.get('[data-cy="error-mensaje"]', { timeout: 5000 }).should('be.visible');
});

Then('devuelve el mensaje "No se puede cancelar una reserva expirada"', () => {
	cy.get('[data-cy="error-mensaje"]', { timeout: 5000 }).should('be.visible').and('contain', 'No se puede cancelar una reserva expirada');
});

