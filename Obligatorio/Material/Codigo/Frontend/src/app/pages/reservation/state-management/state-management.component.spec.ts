import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StateManagementComponent } from './state-management.component';
import { ReservationService } from '../../../services/reservation.service';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('StateManagementComponent', () => {
  let component: StateManagementComponent;
  let fixture: ComponentFixture<StateManagementComponent>;
  let mockReservationService: jasmine.SpyObj<ReservationService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ReservationService', ['createReserva', 'getReservations']);

    await TestBed.configureTestingModule({
      declarations: [StateManagementComponent],
      imports: [FormsModule],
      providers: [
        { provide: ReservationService, useValue: spy }
      ]
    }).compileComponents();

    mockReservationService = TestBed.inject(ReservationService) as jasmine.SpyObj<ReservationService>;
    fixture = TestBed.createComponent(StateManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería asignar el estado "Pendiente" a una reserva recién creada y mostrarla en el listado', () => {
    // Arrange
    component.email = 'usuario@test.com';
    component.secret = 'secret123';
    component.medicamentos = [{ drugName: 'Aspirina', quantity: 1 }];
    component.farmacia = 'Farmashop';

    // Simula la respuesta del backend al crear la reserva
    const reservaCreada = {
      id: 1,
      reservedDrugs: [{ drugName: 'Aspirina', quantity: 1 }],
      pharmacyName: 'Farmashop',
      status: 'Pendiente',
      fechaCreacion: '2023-10-01T10:00:00Z'
    };
    mockReservationService.createReserva.and.returnValue(of(reservaCreada));
    mockReservationService.getReservations.and.returnValue(of([reservaCreada]));

    // Act
    component.crearReserva();
    fixture.detectChanges();

    // Assert
    // Verifica que la reserva se muestra con estado "Pendiente"
    const reservaItem = fixture.debugElement.query(By.css('[data-cy="reserva-item"]'));
    expect(reservaItem).toBeTruthy();

    const estadoElement = reservaItem.query(By.css('[data-cy="reserva-estado"]'));
    expect(estadoElement.nativeElement.textContent).toContain('Pendiente');
  });

  it('debería mostrar una reserva en estado "Confirmada" con ID de referencia y fecha de confirmación', () => {
    // Arrange
    component.email = 'usuario@test.com';
    component.secret = 'secret123';

    const reservaConfirmada = {
      id: 42,
      reservedDrugs: [{ drugName: 'Aspirina', quantity: 1 }],
      pharmacyName: 'Farmashop',
      status: 'Confirmada',
      referencia: 'ABC123',
      fechaConfirmacion: '2023-10-10T12:00:00Z'
    };
    mockReservationService.getReservations.and.returnValue(of([reservaConfirmada]));

    // Act
    component.consultarReservas();
    fixture.detectChanges();

    // Assert
    const reservaItem = fixture.debugElement.query(By.css('[data-cy="reserva-item"]'));
    expect(reservaItem).toBeTruthy();

    const estadoElement = reservaItem.query(By.css('[data-cy="reserva-estado"]'));
    expect(estadoElement.nativeElement.textContent).toContain('Confirmada');

    const referenciaElement = reservaItem.query(By.css('[data-cy="id-referencia"]'));
    expect(referenciaElement.nativeElement.textContent).toContain('ABC123');

    const fechaElement = reservaItem.query(By.css('[data-cy="fecha-confirmacion"]'));
    expect(fechaElement.nativeElement.textContent).toContain('2023-10-10');
  });
  
  it('debería mostrar una reserva en estado "Expirada" con mensaje y fecha de expiración', () => {
    // Arrange
    component.email = 'usuario@test.com';
    component.secret = 'secret123';

    const reservaExpirada = {
      id: 99,
      reservedDrugs: [{ drugName: 'Aspirina', quantity: 1 }],
      pharmacyName: 'Farmashop',
      status: 'Expirada',
      fechaExpiracion: '2023-10-15T18:00:00Z'
    };
    mockReservationService.getReservations.and.returnValue(of([reservaExpirada]));

    // Act
    component.consultarReservas();
    fixture.detectChanges();

    // Assert
    const reservaItem = fixture.debugElement.query(By.css('[data-cy="reserva-item"]'));
    expect(reservaItem).toBeTruthy();

    const estadoElement = reservaItem.query(By.css('[data-cy="reserva-estado"]'));
    expect(estadoElement.nativeElement.textContent).toContain('Expirada');

    const mensajeElement = reservaItem.query(By.css('[data-cy="mensaje-expirada"]'));
    expect(mensajeElement.nativeElement.textContent).toContain('Esta reserva ha expirado');

    const fechaElement = reservaItem.query(By.css('[data-cy="fecha-expiracion"]'));
    expect(fechaElement.nativeElement.textContent).toContain('2023-10-15');
  });

  it('debería mostrar una reserva en estado "Cancelada" con mensaje y fecha de cancelación', () => {
    // Arrange
    component.email = 'usuario@test.com';
    component.secret = 'secret123';

    const reservaCancelada = {
      id: 77,
      reservedDrugs: [{ drugName: 'Aspirina', quantity: 1 }],
      pharmacyName: 'Farmashop',
      status: 'Cancelada',
      fechaCancelacion: '2023-10-20T09:30:00Z'
    };
    mockReservationService.getReservations.and.returnValue(of([reservaCancelada]));

    // Act
    component.consultarReservas();
    fixture.detectChanges();

    // Assert
    const reservaItem = fixture.debugElement.query(By.css('[data-cy="reserva-item"]'));
    expect(reservaItem).toBeTruthy();

    const estadoElement = reservaItem.query(By.css('[data-cy="reserva-estado"]'));
    expect(estadoElement.nativeElement.textContent).toContain('Cancelada');

    const mensajeElement = reservaItem.query(By.css('[data-cy="mensaje-cancelada"]'));
    expect(mensajeElement.nativeElement.textContent).toContain('Reserva cancelada');

    const fechaElement = reservaItem.query(By.css('[data-cy="fecha-cancelacion"]'));
    expect(fechaElement.nativeElement.textContent).toContain('2023-10-20');
  });

  it('debería mostrar una reserva en estado "Retirada" con mensaje y fecha de retiro', () => {
    // Arrange
    component.email = 'usuario@test.com';
    component.secret = 'secret123';

    const reservaRetirada = {
      id: 88,
      reservedDrugs: [{ drugName: 'Aspirina', quantity: 1 }],
      pharmacyName: 'Farmashop',
      status: 'Retirada',
      fechaRetiro: '2023-10-25T14:00:00Z'
    };
    mockReservationService.getReservations.and.returnValue(of([reservaRetirada]));

    // Act
    component.consultarReservas();
    fixture.detectChanges();

    // Assert
    const reservaItem = fixture.debugElement.query(By.css('[data-cy="reserva-item"]'));
    expect(reservaItem).toBeTruthy();

    const estadoElement = reservaItem.query(By.css('[data-cy="reserva-estado"]'));
    expect(estadoElement.nativeElement.textContent).toContain('Retirada');

    const mensajeElement = reservaItem.query(By.css('[data-cy="mensaje-retirada"]'));
    expect(mensajeElement.nativeElement.textContent).toContain('Reserva retirada exitosamente');

    const fechaElement = reservaItem.query(By.css('[data-cy="fecha-retiro"]'));
    expect(fechaElement.nativeElement.textContent).toContain('2023-10-25');
  });
});