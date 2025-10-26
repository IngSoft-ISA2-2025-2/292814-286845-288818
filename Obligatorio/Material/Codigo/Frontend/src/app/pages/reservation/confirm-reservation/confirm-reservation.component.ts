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

    // TODO: Implementar servicio de confirmación
    this.commonService.updateToastData(
      'Funcionalidad en desarrollo',
      'info',
      'Información'
    );
  }
}
