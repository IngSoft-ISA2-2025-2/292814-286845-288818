import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReservationService } from '../../../services/reservation.service';
import { CommonService } from '../../../services/CommonService';

@Component({
  selector: 'app-cancel-reservation',
  templateUrl: './cancel-reservation.component.html',
  styleUrls: ['./cancel-reservation.component.css']
})
export class CancelReservationComponent implements OnInit {
  
  cancelForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private reservationService: ReservationService,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.cancelForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      secret: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.cancelForm.invalid) {
      return;
    }

    const { email, secret } = this.cancelForm.value;

    this.reservationService.cancelReservation(email, secret).subscribe({
      next: (response) => {
        this.commonService.updateToastData(
          'Reserva cancelada correctamente',
          'success',
          'Éxito'
        );
        this.cancelForm.reset();
      },
      error: (error) => {
        const errorMessage = error.error?.message || 'Error al cancelar la reserva';
        this.commonService.updateToastData(
          errorMessage,
          'danger',
          'Error'
        );
      }
    });
  }
}
