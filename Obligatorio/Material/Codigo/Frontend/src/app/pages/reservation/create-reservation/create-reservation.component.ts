import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReservationService } from '../../../services/reservation.service';
import { ReservationRequest } from '../../../interfaces/reservation';

@Component({
  selector: 'app-create-reservation',
  templateUrl: './create-reservation.component.html',
  styleUrls: ['./create-reservation.component.css']
})
export class CreateReservationComponent {
  email: string = '';
  secret: string = '';
  medicamentoNombre: string = '';
  medicamentoCantidad: number | null = null;
  farmacia: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  estadoReserva: string = '';
  stockActualizado: boolean = false;

  medicamentos: Array<{ nombre: string; cantidad: number }> = [];

  constructor(private reservationService: ReservationService) {}

  agregarMedicamento() {
    if (!this.medicamentoNombre || !this.medicamentoCantidad) {
      this.errorMessage = 'Debe ingresar nombre y cantidad del medicamento.';
      return;
    }
    this.medicamentos.push({
      nombre: this.medicamentoNombre,
      cantidad: this.medicamentoCantidad
    });
    // Limpiar campos
    this.medicamentoNombre = '';
    this.medicamentoCantidad = null;
    this.errorMessage = '';
  }

  eliminarMedicamento(index: number) {
    this.medicamentos.splice(index, 1);
  }

  reserve() {
    this.errorMessage = '';
    this.successMessage = '';
    this.estadoReserva = '';
    this.stockActualizado = false;

    if (!this.email || !this.secret) {
      this.errorMessage = 'Debe ingresar un email y secret para reservar medicamentos.';
      return;
    }
    if (!this.farmacia) {
      this.errorMessage = 'Debe ingresar una farmacia.';
      return;
    }
    if (this.medicamentos.length === 0) {
      this.errorMessage = 'Debe agregar al menos un medicamento.';
      return;
    }

    // Crear el objeto de request según la interfaz
    const reservationRequest: ReservationRequest = {
      email: this.email,
      secret: this.secret,
      pharmacyName: this.farmacia,
      drugsReserved: this.medicamentos.map(m => ({
        drugName: m.nombre,
        drugQuantity: m.cantidad
      }))
    };

    // Llamar al servicio para crear la reserva
    this.reservationService.createReserva(reservationRequest).subscribe({
      next: (response) => {
        if (response) {
          this.estadoReserva = response.status || 'Pendiente';
          this.stockActualizado = true;
          
          // Mensaje de éxito genérico
          this.successMessage = `Reserva creada exitosamente en ${response.pharmacyName}. Clave pública: ${response.publicKey}`;
          
          // Limpiar lista de medicamentos
          this.medicamentos = [];
        }
      },
      error: (error) => {
        // Extraer el mensaje de error del backend (puede venir como 'message' o 'error')
        this.errorMessage = error.error?.message || error.error?.error || error.message || 'Error al crear la reserva';
      }
    });
  }
}