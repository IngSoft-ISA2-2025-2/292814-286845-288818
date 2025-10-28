import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReservationService } from '../../../services/reservation.service';
import { CommonService } from '../../../services/CommonService';

@Component({
  selector: 'app-confirm-reservation',
  templateUrl: './confirm-reservation.component.html',
  styleUrls: ['./confirm-reservation.component.css']
})
export class ConfirmReservationComponent implements OnInit {
  
  confirmForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private reservationService: ReservationService,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.confirmForm = this.fb.group({
      referenceId: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.confirmForm.invalid) {
      return;
    }

    const { referenceId } = this.confirmForm.value;

    this.reservationService.confirmReservation(referenceId).subscribe({
      next: (response) => {
        const pharmacyName = response.pharmacyName || 'N/A';
        this.commonService.updateToastData(
          `Reserva confirmada exitosamente. Farmacia: ${pharmacyName}`,
          'success',
          'Éxito'
        );
        this.confirmForm.reset();
      },
      error: (error) => {
        const errorMessage = error.error?.message || error.message || 'Error al confirmar la reserva';
        this.commonService.updateToastData(
          errorMessage,
          'danger',
          'Error'
        );
      }
    });
  }
}
