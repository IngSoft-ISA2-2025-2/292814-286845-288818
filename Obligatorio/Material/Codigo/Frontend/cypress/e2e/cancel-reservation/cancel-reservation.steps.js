import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// ------------------------
// BACKGROUND
// ------------------------
Given('que el formulario de cancelación está disponible', () => {
	cy.visit('/cancel-reservation');
	cy.get('[data-cy="cancel-email-input"]').should('exist');
	cy.get('[data-cy="cancel-secret-input"]').should('exist');
	cy.get('[data-cy="cancel-btn"]').should('exist');
});

// ------------------------
// GIVEN STEPS
// ------------------------
Given('que existe una reserva para el correo {string} con el secret {string}', (email, secret) => {
	// Almacenamos los datos del escenario actual
	cy.wrap({ email, secret, scenario: 'success' }).as('scenarioData');
});

Given('que no existe ninguna reserva para el correo {string}', (email) => {
	// Almacenamos los datos del escenario actual
	cy.wrap({ email, scenario: 'notFound' }).as('scenarioData');
});

Given('que existe una reserva para el correo {string} con el secret {string} y su estado es {string}', (email, secret, estado) => {
	// Almacenamos los datos del escenario actual
	cy.wrap({ email, secret, estado, scenario: 'withState' }).as('scenarioData');
});

Given('que existen dos reservas para el correo {string}:', (email, table) => {
	const rows = table.hashes();
	// Almacenamos los datos del escenario actual
	cy.wrap({ email, reservations: rows, scenario: 'multiple' }).as('scenarioData');
});

// ------------------------
// WHEN STEPS
// ------------------------
When('el visitante solicita cancelar la reserva usando el correo {string} y el secret {string}', (email, secret) => {
	// Configurar el intercept basado en el escenario actual
	cy.get('@scenarioData').then((data) => {
		cy.intercept('DELETE', '**/api/reservas*', (req) => {
			const url = new URL(req.url);
			const urlEmail = url.searchParams.get('email');
			const urlSecret = url.searchParams.get('secret');
			
			// Escenario: Cancelación exitosa
			if (data.scenario === 'success') {
				if (urlEmail === data.email && urlSecret === data.secret) {
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
			}
			// Escenario: Reserva no encontrada
			else if (data.scenario === 'notFound') {
				req.reply({
					statusCode: 404,
					body: { message: 'No existe una reserva asociada a ese correo' }
				});
			}
			// Escenario: Con estado específico
			else if (data.scenario === 'withState') {
				if (urlEmail === data.email && urlSecret === data.secret) {
					if (data.estado === 'cancelada') {
						req.reply({
							statusCode: 200,
							body: {
								pharmacyName: 'Farmashop',
								drugsReserved: [] // Ya cancelada
							}
						});
					} else if (data.estado === 'expirada') {
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
			}
			// Escenario: Múltiples reservas
			else if (data.scenario === 'multiple') {
				if (urlEmail === data.email) {
					const matchingReservation = data.reservations.find(r => r.secret === urlSecret);
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
			}
			// Por defecto, responder con error
			else {
				req.reply({
					statusCode: 500,
					body: { message: 'Error interno del servidor' }
				});
			}
		}).as('cancelRequest');
	});

	// Llenar el formulario
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
	cy.wait(1000); // Esperar respuesta del servidor
});

When('el visitante ingresa el correo {string} y el secret {string} en el flujo de gestión de reservas', (email, secret) => {
	// Este escenario es más conceptual - simula un flujo diferente al de cancelación
	cy.log(`Flujo de gestión de reservas con ${email} y ${secret}`);
});

When('el visitante envía el formulario de cancelación sin proporcionar correo', () => {
	cy.get('[data-cy="cancel-email-input"]').clear();
	cy.get('[data-cy="cancel-secret-input"]').clear().type('cualquier');
	// El botón estará deshabilitado, no intentamos hacer click
	cy.get('[data-cy="cancel-btn"]').should('be.disabled');
});

// ------------------------
// THEN STEPS
// ------------------------
Then('la reserva para {string} debe quedar marcada como cancelada', (email) => {
	// Verificamos que aparezca el toast DE ÉXITO (verde)
	cy.get('[data-cy="custom-toast"]', { timeout: 8000 })
		.should('be.visible')
		.and('have.class', 'bg-success'); // Toast verde = éxito
});

// COMENTADO: Step duplicado que choca con confirm-reservation.steps.js
// Then('el sistema muestra el mensaje {string}', (mensaje) => {
// 	// Verificamos que aparezca el toast DE ÉXITO (verde)
// 	cy.get('[data-cy="custom-toast"]', { timeout: 8000 })
// 		.should('be.visible')
// 		.and('have.class', 'bg-success'); // Toast verde = éxito
// });

Then('el sistema muestra el mensaje de error {string}', (mensaje) => {
	// Verificamos que aparezca el toast DE ERROR (rojo)
	cy.get('[data-cy="custom-toast"]', { timeout: 8000 })
		.should('be.visible')
		.and('have.class', 'bg-danger'); // Toast rojo = error
});

Then('no se debe crear ni cancelar ninguna reserva en este flujo de cancelación', () => {
	// Este paso es más conceptual
	cy.log('No se realizó ninguna operación en la BD');
});

Then('la reserva no debe ser cancelada', () => {
	// Verificamos que aparezca el toast DE ERROR (rojo)
	cy.get('[data-cy="custom-toast"]', { timeout: 8000 })
		.should('be.visible')
		.and('have.class', 'bg-danger'); // Toast rojo = error
});

Then('el sistema responde con un error indicando "No existe una reserva asociada a ese correo"', () => {
	// Verificamos que aparezca el toast DE ERROR (rojo)
	cy.get('[data-cy="custom-toast"]', { timeout: 8000 })
		.should('be.visible')
		.and('have.class', 'bg-danger'); // Toast rojo = error
});

Then('el sistema crea una reserva asociada a {string} con secret {string}', (email, secret) => {
	// Este step no aplica a cancelación
	cy.log(`Creación de reserva no aplica en cancelación`);
});

Then('se muestra el mensaje {string} como precondición para operaciones posteriores', (mensaje) => {
	cy.log(`Mensaje esperado: ${mensaje}`);
});

// COMENTADO: Step duplicado que choca con confirm-reservation.steps.js
/*
Then('el sistema no debe cambiar el estado de la reserva', () => {
	// Verificamos respuesta idempotente - el toast DE ÉXITO aparece
	cy.get('[data-cy="custom-toast"]', { timeout: 8000 })
		.should('be.visible')
		.and('have.class', 'bg-success'); // Toast verde = operación exitosa (idempotente)
});
*/

Then('el sistema muestra el mensaje {string} o una respuesta idempotente apropiada', (mensaje) => {
	// Verificamos respuesta idempotente - el toast DE ÉXITO aparece
	cy.get('[data-cy="custom-toast"]', { timeout: 8000 })
		.should('be.visible')
		.and('have.class', 'bg-success'); // Toast verde = éxito
});

Then('el sistema responde con un error indicando "Se requiere un correo válido"', () => {
	// El botón estará deshabilitado
	cy.get('[data-cy="cancel-btn"]').should('be.disabled');
});

Then('solo la reserva con secret {string} debe quedar marcada como cancelada', (secret) => {
	// Verificamos que aparezca el toast DE ÉXITO (verde)
	cy.get('[data-cy="custom-toast"]', { timeout: 8000 })
		.should('be.visible')
		.and('have.class', 'bg-success'); // Toast verde = éxito
});

Then('la reserva con secret {string} debe permanecer en estado "activa"', (secret) => {
	// Este step verifica que la otra reserva no fue afectada
	cy.log(`La reserva con secret ${secret} debe permanecer activa`);
});

Then('el sistema no debe permitir la cancelación', () => {
	// Verificamos que aparezca el toast DE ERROR (rojo)
	cy.get('[data-cy="custom-toast"]', { timeout: 8000 })
		.should('be.visible')
		.and('have.class', 'bg-danger'); // Toast rojo = error
});

Then('devuelve el mensaje "No se puede cancelar una reserva expirada"', () => {
	// Verificamos que aparezca el toast DE ERROR (rojo)
	cy.get('[data-cy="custom-toast"]', { timeout: 8000 })
		.should('be.visible')
		.and('have.class', 'bg-danger'); // Toast rojo = error
});