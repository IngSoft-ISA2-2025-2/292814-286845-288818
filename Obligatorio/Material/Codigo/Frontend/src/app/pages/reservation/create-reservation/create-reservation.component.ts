import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

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

  constructor() {}

  reserve() {
    if (!this.email || !this.secret) {
      this.errorMessage = 'Debe ingresar un email y secret para reservar medicamentos.';
      return;
    }
    this.errorMessage = '';
  }
}