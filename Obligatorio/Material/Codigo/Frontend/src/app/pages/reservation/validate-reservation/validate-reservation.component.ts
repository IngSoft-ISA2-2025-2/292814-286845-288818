import { Component } from '@angular/core';
import { ReservationService } from '../../../services/reservation.service';

@Component({
  selector: 'app-validate-reservation',
  templateUrl: './validate-reservation.component.html',
  styleUrls: ['./validate-reservation.component.css'],
})
export class ValidateReservationComponent {
  clavePublica: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  errorCodigo: string = '';
  estadoReserva: string = '';
  validacionExitosa: boolean = false;
  claveInvalidada: boolean = false;

  reservaInfo: {
    medicamento?: string;
    cantidad?: number;
    cliente?: string;
    farmacia?: string;
  } = {};

  constructor(private reservationService: ReservationService) {}

  validar() {
    this.errorMessage = '';
    this.successMessage = '';
    this.errorCodigo = '';
    this.validacionExitosa = false;
    this.claveInvalidada = false;

    if (!this.clavePublica) {
      this.errorMessage = 'Debe ingresar una clave pública.';
      this.errorCodigo = '400';
      return;
    }

    // Llamar al servicio para validar y completar la reserva en un solo paso
    this.reservationService.validateReservation(this.clavePublica).subscribe({
      next: (response) => {
        if (response) {
          this.validacionExitosa = true;
          this.estadoReserva = 'Retirada';
          this.claveInvalidada = true;
          this.successMessage =
            response.mensaje ||
            'Entrega completada exitosamente. La reserva ha sido cerrada.';

          // Guardar información de la reserva
          this.reservaInfo = {
            medicamento: response.medicamento,
            cantidad: response.cantidad,
            cliente: response.cliente,
            farmacia: response.farmacia,
          };
        }
      },
      error: (error) => {
        // Extraer código de error
        const statusCode = error.status?.toString() || '500';
        this.errorCodigo = statusCode;

        // Extraer el mensaje de error del backend
        this.errorMessage =
          error.error?.message ||
          error.error?.error ||
          error.message ||
          'Error al validar la reserva';
      },
    });
  }
}
