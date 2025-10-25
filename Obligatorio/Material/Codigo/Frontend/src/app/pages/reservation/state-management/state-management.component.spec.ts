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
});