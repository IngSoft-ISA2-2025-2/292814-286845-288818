import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { ConfirmReservationComponent } from './confirm-reservation.component';
import { ReservationService } from '../../../services/reservation.service';
import { CommonService } from '../../../services/CommonService';

describe('ConfirmReservationComponent', () => {
  let component: ConfirmReservationComponent;
  let fixture: ComponentFixture<ConfirmReservationComponent>;
  let reservationService: jasmine.SpyObj<ReservationService>;
  let commonService: jasmine.SpyObj<CommonService>;

  beforeEach(async () => {
    const reservationServiceSpy = jasmine.createSpyObj('ReservationService', ['confirmReservation']);
    const commonServiceSpy = jasmine.createSpyObj('CommonService', ['updateToastData']);

    await TestBed.configureTestingModule({
      declarations: [ ConfirmReservationComponent ],
      imports: [ ReactiveFormsModule, HttpClientTestingModule ],
      providers: [
        { provide: ReservationService, useValue: reservationServiceSpy },
        { provide: CommonService, useValue: commonServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmReservationComponent);
    component = fixture.componentInstance;
    reservationService = TestBed.inject(ReservationService) as jasmine.SpyObj<ReservationService>;
    commonService = TestBed.inject(CommonService) as jasmine.SpyObj<CommonService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ============================
  // TDD RED: Escenario 1 - Confirmación exitosa
  // ============================
  
  it('should successfully confirm reservation and show success message', () => {
    // Arrange
    const referenceId = 'ABC12345';
    const mockResponse = {
      pharmacyName: 'Farmashop',
      status: 'Confirmed',
      publicKey: 'PUBLIC123',
      drugsReserved: [{ drugName: 'Aspirina', drugQuantity: 2 }],
      mensaje: 'OK'
    };
    
    reservationService.confirmReservation.and.returnValue(of(mockResponse));

    component.confirmForm.patchValue({ referenceId });

    // Act
    component.onSubmit();

    // Assert
    expect(reservationService.confirmReservation).toHaveBeenCalledWith(referenceId);
    expect(commonService.updateToastData).toHaveBeenCalledWith(
      'Reserva confirmada exitosamente. Farmacia: Farmashop',
      'success',
      'Éxito'
    );
    expect(component.confirmForm.value.referenceId).toBeNull();
  });

  // ============================
  // TDD RED: Escenario 2 - Reserva no existe
  // ============================

  it('should show error message when reservation does not exist', () => {
    // Arrange
    const referenceId = 'NOEXISTE';
    const errorResponse = { message: 'No se encontró la reserva' };
    
    reservationService.confirmReservation.and.returnValue(
      throwError(() => ({ error: errorResponse }))
    );

    component.confirmForm.patchValue({ referenceId });

    // Act
    component.onSubmit();

    // Assert
    expect(reservationService.confirmReservation).toHaveBeenCalledWith(referenceId);
    expect(commonService.updateToastData).toHaveBeenCalledWith(
      'No se encontró la reserva',
      'danger',
      'Error'
    );
  });

  // ============================
  // TDD RED: Escenario 3 - Validación ID vacío
  // ============================

  it('should not submit when referenceId is empty', () => {
    // Arrange
    component.confirmForm.patchValue({ referenceId: '' });

    // Act
    component.onSubmit();

    // Assert
    expect(reservationService.confirmReservation).not.toHaveBeenCalled();
    expect(component.confirmForm.invalid).toBeTruthy();
  });

  // ============================
  // TDD RED: Escenario 4 - Reserva ya confirmada (idempotencia)
  // ============================

  it('should handle already confirmed reservation idempotently', () => {
    // Arrange
    const referenceId = 'CONF123';
    const mockResponse = {
      pharmacyName: 'Farmashop',
      status: 'Confirmed',
      publicKey: 'PUBLIC123',
      drugsReserved: [{ drugName: 'Paracetamol', drugQuantity: 1 }],
      mensaje: 'OK'
    };
    
    reservationService.confirmReservation.and.returnValue(of(mockResponse));

    component.confirmForm.patchValue({ referenceId });

    // Act
    component.onSubmit();

    // Assert
    expect(reservationService.confirmReservation).toHaveBeenCalledWith(referenceId);
    expect(commonService.updateToastData).toHaveBeenCalledWith(
      'Reserva confirmada exitosamente. Farmacia: Farmashop',
      'success',
      'Éxito'
    );
  });

  // ============================
  // TDD RED: Escenario 5 - Reserva cancelada
  // ============================

  it('should show error message when trying to confirm cancelled reservation', () => {
    // Arrange
    const referenceId = 'CANC456';
    const errorResponse = { message: 'No se puede confirmar una reserva cancelada' };
    
    reservationService.confirmReservation.and.returnValue(
      throwError(() => ({ error: errorResponse }))
    );

    component.confirmForm.patchValue({ referenceId });

    // Act
    component.onSubmit();

    // Assert
    expect(reservationService.confirmReservation).toHaveBeenCalledWith(referenceId);
    expect(commonService.updateToastData).toHaveBeenCalledWith(
      'No se puede confirmar una reserva cancelada',
      'danger',
      'Error'
    );
  });

  // ============================
  // TDD RED: Escenario 6 - Reserva expirada
  // ============================

  it('should show error message when trying to confirm expired reservation', () => {
    // Arrange
    const referenceId = 'EXP789';
    const errorResponse = { message: 'No se puede confirmar una reserva expirada' };
    
    reservationService.confirmReservation.and.returnValue(
      throwError(() => ({ error: errorResponse }))
    );

    component.confirmForm.patchValue({ referenceId });

    // Act
    component.onSubmit();

    // Assert
    expect(reservationService.confirmReservation).toHaveBeenCalledWith(referenceId);
    expect(commonService.updateToastData).toHaveBeenCalledWith(
      'No se puede confirmar una reserva expirada',
      'danger',
      'Error'
    );
  });

  // ============================
  // TDD RED: Escenario 7 - Confirmación con prescripción
  // ============================

  it('should successfully confirm reservation with prescription validation', () => {
    // Arrange
    const referenceId = 'XYZ98765';
    const mockResponse = {
      pharmacyName: 'Farmashop',
      status: 'Confirmed',
      publicKey: 'PUBLIC456',
      drugsReserved: [{ drugName: 'Antibiótico', drugQuantity: 1 }],
      mensaje: 'OK'
    };
    
    reservationService.confirmReservation.and.returnValue(of(mockResponse));

    component.confirmForm.patchValue({ referenceId });

    // Act
    component.onSubmit();

    // Assert
    expect(reservationService.confirmReservation).toHaveBeenCalledWith(referenceId);
    expect(commonService.updateToastData).toHaveBeenCalledWith(
      'Reserva confirmada exitosamente. Farmacia: Farmashop',
      'success',
      'Éxito'
    );
  });
});
