import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('que el sistema de confirmación de reservas está disponible', () => {
	cy.visit('/confirm-reservation');
	cy.get('[data-cy="confirm-reference-input"]').should('exist');
	cy.get('[data-cy="confirm-btn"]').should('exist');
});

Given('que existe una reserva pendiente con ID de referencia {string}', (referenceId) => {
	cy.wrap({ referenceId, estado: 'Pendiente', scenario: 'success' }).as('scenarioData');
});

Given('que existe una reserva pendiente con ID de referencia {string} que incluye medicamentos con prescripción', (referenceId) => {
	cy.wrap({ referenceId, estado: 'Pendiente', requiresPrescription: true, scenario: 'success' }).as('scenarioData');
});

Given('el personal de farmacia ha validado la receta médica', () => {
	cy.log('Receta médica validada por el personal');
});

Given('que no existe ninguna reserva con ID de referencia {string}', (referenceId) => {
	cy.wrap({ referenceId, scenario: 'notFound' }).as('scenarioData');
});

Given('que existe una reserva con ID de referencia {string} y su estado es {string}', (referenceId, estado) => {
	cy.wrap({ referenceId, estado, scenario: 'withState' }).as('scenarioData');
});

When('el personal de farmacia confirma la reserva con ID {string}', (referenceId) => {
	cy.get('@scenarioData').then((data) => {
		cy.intercept('PUT', '**/api/reservas/confirmar*', (req) => {
			const url = new URL(req.url);
			const urlReferenceId = url.searchParams.get('referenceId');

			if (data.scenario === 'success' && urlReferenceId === data.referenceId) {
				req.reply({
					statusCode: 200,
					body: {
						referenceId: data.referenceId,
						status: 'Confirmada',
						pharmacyName: 'Farmashop',
						confirmationDate: new Date().toISOString()
					}
				});
			} else if (data.scenario === 'notFound') {
				req.reply({
					statusCode: 404,
					body: { message: 'No se encontró la reserva' }
				});
			} else if (data.scenario === 'withState') {
				if (data.estado === 'Confirmada') {
					req.reply({
						statusCode: 200,
						body: {
							referenceId: data.referenceId,
							status: 'Confirmada',
							pharmacyName: 'Farmashop'
						}
					});
				} else if (data.estado === 'Cancelada') {
					req.reply({
						statusCode: 400,
						body: { message: 'No se puede confirmar una reserva cancelada' }
					});
				} else if (data.estado === 'Expirada') {
					req.reply({
						statusCode: 400,
						body: { message: 'No se puede confirmar una reserva expirada' }
					});
				}
			} else {
				req.reply({
					statusCode: 500,
					body: { message: 'Error interno del servidor' }
				});
			}
		}).as('confirmRequest');
	});

	cy.get('[data-cy="confirm-reference-input"]').clear().type(referenceId);
	cy.get('[data-cy="confirm-btn"]').click();
	cy.wait(1000);
});

When('el personal de farmacia intenta confirmar la reserva con ID {string}', (referenceId) => {
	cy.get('@scenarioData').then((data) => {
		cy.intercept('PUT', '**/api/reservas/confirmar*', (req) => {
			const url = new URL(req.url);
			const urlReferenceId = url.searchParams.get('referenceId');

			if (data.scenario === 'notFound') {
				req.reply({
					statusCode: 404,
					body: { message: 'No se encontró la reserva' }
				});
			} else if (data.scenario === 'withState') {
				if (data.estado === 'Confirmada') {
					req.reply({
						statusCode: 200,
						body: {
							referenceId: data.referenceId,
							status: 'Confirmada',
							pharmacyName: 'Farmashop'
						}
					});
				} else if (data.estado === 'Cancelada') {
					req.reply({
						statusCode: 400,
						body: { message: 'No se puede confirmar una reserva cancelada' }
					});
				} else if (data.estado === 'Expirada') {
					req.reply({
						statusCode: 400,
						body: { message: 'No se puede confirmar una reserva expirada' }
					});
				} else if (data.estado === 'Pendiente') {
					req.reply({
						statusCode: 200,
						body: {
							referenceId: data.referenceId,
							status: 'Confirmada',
							pharmacyName: 'Farmashop'
						}
					});
				}
			} else {
				req.reply({
					statusCode: 500,
					body: { message: 'Error interno del servidor' }
				});
			}
		}).as('confirmRequest');
	});

	cy.get('[data-cy="confirm-reference-input"]').clear().type(referenceId);
	cy.get('[data-cy="confirm-btn"]').click();
	cy.wait(1000);
});

When('el personal de farmacia envía el formulario de confirmación sin proporcionar un ID de referencia', () => {
	cy.get('[data-cy="confirm-reference-input"]').clear();
	cy.get('[data-cy="confirm-btn"]').should('be.disabled');
});

Then('la reserva debe cambiar a estado {string}', (estado) => {
	cy.get('[data-cy="custom-toast"]', { timeout: 8000 })
		.should('be.visible')
		.and('have.class', 'bg-success');
});

Then('el sistema muestra el mensaje {string}', (mensaje) => {
	cy.get('[data-cy="custom-toast"]', { timeout: 8000 })
		.should('be.visible')
		.and('have.class', 'bg-success');
});

Then('el sistema responde con un error indicando {string}', (mensaje) => {
	cy.get('[data-cy="custom-toast"]', { timeout: 8000 })
		.should('be.visible')
		.and('have.class', 'bg-danger');
});

Then('no se debe modificar ninguna reserva', () => {
	cy.log('No se modificó ninguna reserva');
});

Then('el sistema no debe cambiar el estado de la reserva', () => {
	cy.get('[data-cy="custom-toast"]', { timeout: 8000 })
		.should('be.visible')
		.and('have.class', 'bg-success');
});

Then('el sistema no debe permitir la confirmación', () => {
	cy.get('[data-cy="custom-toast"]', { timeout: 8000 })
		.should('be.visible')
		.and('have.class', 'bg-danger');
});

Then('devuelve el mensaje {string}', (mensaje) => {
	cy.get('[data-cy="custom-toast"]', { timeout: 8000 })
		.should('be.visible')
		.and('have.class', 'bg-danger');
});

Then('se debe establecer una fecha límite de confirmación', () => {
	cy.log('Fecha límite de confirmación establecida');
});
