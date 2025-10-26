import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { CancelReservationComponent } from './cancel-reservation.component';
import { ReservationService } from '../../../services/reservation.service';
import { CommonService } from '../../../services/CommonService';

describe('CancelReservationComponent', () => {
  let component: CancelReservationComponent;
  let fixture: ComponentFixture<CancelReservationComponent>;
  let reservationService: jasmine.SpyObj<ReservationService>;
  let commonService: jasmine.SpyObj<CommonService>;

  beforeEach(async () => {
    const reservationServiceSpy = jasmine.createSpyObj('ReservationService', ['cancelReservation']);
    const commonServiceSpy = jasmine.createSpyObj('CommonService', ['updateToastData']);

    await TestBed.configureTestingModule({
      declarations: [ CancelReservationComponent ],
      imports: [ ReactiveFormsModule, HttpClientTestingModule ],
      providers: [
        { provide: ReservationService, useValue: reservationServiceSpy },
        { provide: CommonService, useValue: commonServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CancelReservationComponent);
    component = fixture.componentInstance;
    reservationService = TestBed.inject(ReservationService) as jasmine.SpyObj<ReservationService>;
    commonService = TestBed.inject(CommonService) as jasmine.SpyObj<CommonService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ============================
  // TDD RED: Escenario 1 - No existe reserva
  // ============================
  
  it('should show error message when reservation does not exist', () => {
    // Arrange
    const email = 'sinreserva@example.com';
    const secret = 'cualquiera';
    const errorResponse = { message: 'No existe una reserva asociada a ese correo' };
    
    reservationService.cancelReservation.and.returnValue(
      throwError(() => ({ error: errorResponse }))
    );

    component.cancelForm.patchValue({ email, secret });

    // Act
    component.onSubmit();

    // Assert
    expect(reservationService.cancelReservation).toHaveBeenCalledWith(email, secret);
    expect(commonService.updateToastData).toHaveBeenCalledWith(
      'No existe una reserva asociada a ese correo',
      'danger',
      'Error'
    );
  });

  // ============================
  // TDD RED: Escenario 2 - Secret incorrecto
  // ============================

  it('should show error message when secret is invalid', () => {
    // Arrange
    const email = 'cliente@example.com';
    const secret = 'equivocado';
    const errorResponse = { message: 'Secret inválido para ese correo' };
    
    reservationService.cancelReservation.and.returnValue(
      throwError(() => ({ error: errorResponse }))
    );

    component.cancelForm.patchValue({ email, secret });

    // Act
    component.onSubmit();

    // Assert
    expect(reservationService.cancelReservation).toHaveBeenCalledWith(email, secret);
    expect(commonService.updateToastData).toHaveBeenCalledWith(
      'Secret inválido para ese correo',
      'danger',
      'Error'
    );
  });

  // ============================
  // TDD RED: Escenario 3 - Validación correo vacío
  // ============================

  it('should not submit when email is empty', () => {
    // Arrange
    component.cancelForm.patchValue({ email: '', secret: 'abc123' });

    // Act
    component.onSubmit();

    // Assert
    expect(reservationService.cancelReservation).not.toHaveBeenCalled();
    expect(component.cancelForm.invalid).toBeTruthy();
  });

  it('should not submit when secret is empty', () => {
    // Arrange
    component.cancelForm.patchValue({ email: 'test@example.com', secret: '' });

    // Act
    component.onSubmit();

    // Assert
    expect(reservationService.cancelReservation).not.toHaveBeenCalled();
    expect(component.cancelForm.invalid).toBeTruthy();
  });

  // ============================
  // TDD RED: Escenario 4 - Reserva expirada
  // ============================

  it('should show error message when reservation is expired', () => {
    // Arrange
    const email = 'vencida@example.com';
    const secret = 'oldSecret';
    const errorResponse = { message: 'No se puede cancelar una reserva expirada' };
    
    reservationService.cancelReservation.and.returnValue(
      throwError(() => ({ error: errorResponse }))
    );

    component.cancelForm.patchValue({ email, secret });

    // Act
    component.onSubmit();

    // Assert
    expect(reservationService.cancelReservation).toHaveBeenCalledWith(email, secret);
    expect(commonService.updateToastData).toHaveBeenCalledWith(
      'No se puede cancelar una reserva expirada',
      'danger',
      'Error'
    );
  });

  // ============================
  // TDD RED: Escenario 5 - Cancelación exitosa
  // ============================

  it('should successfully cancel reservation and show success message', () => {
    // Arrange
    const email = 'cliente@example.com';
    const secret = 'abc123';
    const mockResponse = {
      mensaje: 'Reserva cancelada correctamente',
      pharmacyName: 'Farmashop',
      drugsReserved: [
        { drugName: 'Aspirina', drugQuantity: 2 }
      ]
    };
    
    reservationService.cancelReservation.and.returnValue(of(mockResponse));

    component.cancelForm.patchValue({ email, secret });

    // Act
    component.onSubmit();

    // Assert
    expect(reservationService.cancelReservation).toHaveBeenCalledWith(email, secret);
    expect(commonService.updateToastData).toHaveBeenCalledWith(
      'Reserva cancelada correctamente',
      'success',
      'Éxito'
    );
    expect(component.cancelForm.value.email).toBeNull();
    expect(component.cancelForm.value.secret).toBeNull();
  });

  // ============================
  // TDD RED: Escenario 6 - Idempotencia
  // ============================

  it('should handle already cancelled reservation idempotently', () => {
    // Arrange
    const email = 'cliente@example.com';
    const secret = 'abc123';
    const mockResponse = {
      mensaje: 'Reserva cancelada correctamente',
      pharmacyName: 'Farmashop',
      drugsReserved: []
    };
    
    reservationService.cancelReservation.and.returnValue(of(mockResponse));

    component.cancelForm.patchValue({ email, secret });

    // Act
    component.onSubmit();

    // Assert
    expect(reservationService.cancelReservation).toHaveBeenCalledWith(email, secret);
    expect(commonService.updateToastData).toHaveBeenCalledWith(
      'Reserva cancelada correctamente',
      'success',
      'Éxito'
    );
  });
});
