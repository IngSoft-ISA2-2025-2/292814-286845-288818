import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageReservationComponent } from '../manage-reservation/manage-reservation.component';
import { ReservationService } from '../../../services/reservation.service';
import { CommonService } from '../../../services/CommonService';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('ManageReservationComponent - State Management', () => {
  let component: ManageReservationComponent;
  let fixture: ComponentFixture<ManageReservationComponent>;
  let mockReservationService: jasmine.SpyObj<ReservationService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ReservationService', ['createReservation', 'getReservations']);

    await TestBed.configureTestingModule({
      declarations: [ManageReservationComponent],
      imports: [FormsModule, HttpClientTestingModule],
      providers: [
        { provide: ReservationService, useValue: spy },
        CommonService
      ]
    }).compileComponents();

    mockReservationService = TestBed.inject(ReservationService) as jasmine.SpyObj<ReservationService>;
    fixture = TestBed.createComponent(ManageReservationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería asignar el estado "Pendiente" a una reserva recién creada y mostrarla en el listado', () => {
    // Arrange
    component.email = 'usuario@test.com';
    component.secret = 'secret123';

    // Simula la respuesta del backend al consultar reservas con una reserva Pendiente
    const reservaCreada = {
      id: 1,
      reservedDrugs: [{ drugName: 'Aspirina', quantity: 1 }],
      pharmacyName: 'Farmashop',
      status: 'Pendiente',
      fechaCreacion: '2023-10-01T10:00:00Z'
    };
    mockReservationService.getReservations.and.returnValue(of([reservaCreada]));

    // Act
    component.consultarReservas();
    fixture.detectChanges();

    // Assert
    // Verifica que la reserva se muestra con estado "Pendiente"
    const reservaItem = fixture.debugElement.query(By.css('[data-cy="reserva-card"]'));
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
      idReferencia: 'ABC123',
      fechaConfirmacion: '2023-10-10T12:00:00Z'
    };
    mockReservationService.getReservations.and.returnValue(of([reservaConfirmada]));

    // Act
    component.consultarReservas();
    fixture.detectChanges();

    // Assert
    const reservaItem = fixture.debugElement.query(By.css('[data-cy="reserva-card"]'));
    expect(reservaItem).toBeTruthy();

    const estadoElement = reservaItem.query(By.css('[data-cy="reserva-estado"]'));
    expect(estadoElement.nativeElement.textContent).toContain('Confirmada');

    const referenciaElement = reservaItem.query(By.css('[data-cy="id-referencia"]'));
    expect(referenciaElement).toBeTruthy();
    expect(referenciaElement.nativeElement.textContent).toContain('ABC123');

    const fechaElement = reservaItem.query(By.css('[data-cy="fecha-confirmacion"]'));
    expect(fechaElement).toBeTruthy();
    expect(fechaElement.nativeElement.textContent).toContain('10/10/2023');
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
    const reservaItem = fixture.debugElement.query(By.css('[data-cy="reserva-card"]'));
    expect(reservaItem).toBeTruthy();

    const estadoElement = reservaItem.query(By.css('[data-cy="reserva-estado"]'));
    expect(estadoElement.nativeElement.textContent).toContain('Expirada');

    const mensajeElement = reservaItem.query(By.css('[data-cy="mensaje-estado"]'));
    expect(mensajeElement).toBeTruthy();
    expect(mensajeElement.nativeElement.textContent).toContain('Esta reserva ha expirado');

    const fechaElement = reservaItem.query(By.css('[data-cy="fecha-expiracion"]'));
    expect(fechaElement).toBeTruthy();
    expect(fechaElement.nativeElement.textContent).toContain('15/10/2023');
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
    const reservaItem = fixture.debugElement.query(By.css('[data-cy="reserva-card"]'));
    expect(reservaItem).toBeTruthy();

    const estadoElement = reservaItem.query(By.css('[data-cy="reserva-estado"]'));
    expect(estadoElement.nativeElement.textContent).toContain('Cancelada');

    const mensajeElement = reservaItem.query(By.css('[data-cy="mensaje-estado"]'));
    expect(mensajeElement).toBeTruthy();
    expect(mensajeElement.nativeElement.textContent).toContain('Reserva cancelada');

    const fechaElement = reservaItem.query(By.css('[data-cy="fecha-cancelacion"]'));
    expect(fechaElement).toBeTruthy();
    expect(fechaElement.nativeElement.textContent).toContain('20/10/2023');
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
    const reservaItem = fixture.debugElement.query(By.css('[data-cy="reserva-card"]'));
    expect(reservaItem).toBeTruthy();

    const estadoElement = reservaItem.query(By.css('[data-cy="reserva-estado"]'));
    expect(estadoElement.nativeElement.textContent).toContain('Retirada');

    const mensajeElement = reservaItem.query(By.css('[data-cy="mensaje-estado"]'));
    expect(mensajeElement).toBeTruthy();
    expect(mensajeElement.nativeElement.textContent).toContain('Reserva retirada exitosamente');

    const fechaElement = reservaItem.query(By.css('[data-cy="fecha-retiro"]'));
    expect(fechaElement).toBeTruthy();
    expect(fechaElement.nativeElement.textContent).toContain('25/10/2023');
  });

  it('debería mostrar todas las reservas con diferentes estados y los campos correspondientes', () => {
    // Arrange
    component.email = 'usuario@test.com';
    component.secret = 'secret123';

    const reservas = [
      {
        id: 1,
        reservedDrugs: [{ drugName: 'Aspirina', quantity: 1 }],
        pharmacyName: 'Farmashop',
        status: 'Pendiente'
      },
      {
        id: 2,
        reservedDrugs: [{ drugName: 'Ibuprofeno', quantity: 2 }],
        pharmacyName: 'Farmashop',
        status: 'Confirmada',
        idReferencia: 'CONF123'
      },
      {
        id: 3,
        reservedDrugs: [{ drugName: 'Paracetamol', quantity: 1 }],
        pharmacyName: 'Farmashop',
        status: 'Expirada'
      },
      {
        id: 4,
        reservedDrugs: [{ drugName: 'Amoxicilina', quantity: 1 }],
        pharmacyName: 'Farmashop',
        status: 'Cancelada'
      },
      {
        id: 5,
        reservedDrugs: [{ drugName: 'Loratadina', quantity: 1 }],
        pharmacyName: 'Farmashop',
        status: 'Retirada'
      }
    ];
    mockReservationService.getReservations.and.returnValue(of(reservas));

    // Act
    component.consultarReservas();
    fixture.detectChanges();

    // Assert
    const reservaItems = fixture.debugElement.queryAll(By.css('[data-cy="reserva-card"]'));
    expect(reservaItems.length).toBe(5);

    // Verifica que cada reserva muestra su estado correctamente
    const estados = reservaItems.map(item => item.query(By.css('[data-cy="reserva-estado"]')).nativeElement.textContent.trim());
    expect(estados).toContain('Pendiente');
    expect(estados).toContain('Confirmada');
    expect(estados).toContain('Expirada');
    expect(estados).toContain('Cancelada');
    expect(estados).toContain('Retirada');

    // Verifica que las reservas pendientes NO muestran ID de referencia
    const pendienteItem = reservaItems.find(item => item.query(By.css('[data-cy="reserva-estado"]')).nativeElement.textContent.trim().includes('Pendiente'));
    expect(pendienteItem).toBeTruthy();
    expect(pendienteItem!.query(By.css('[data-cy="id-referencia"]'))).toBeNull();

    // Verifica que las reservas confirmadas SÍ muestran ID de referencia
    const confirmadaItem = reservaItems.find(item => item.query(By.css('[data-cy="reserva-estado"]')).nativeElement.textContent.trim().includes('Confirmada'));
    expect(confirmadaItem).toBeTruthy();
    expect(confirmadaItem!.query(By.css('[data-cy="id-referencia"]'))).toBeTruthy();
  });

  it('debería filtrar y mostrar solo reservas en estado "Pendiente"', () => {
    // Arrange
    component.email = 'usuario@test.com';
    component.secret = 'secret123';

    const reservas = [
      { id: 1, status: 'Pendiente' },
      { id: 2, status: 'Confirmada' },
      { id: 3, status: 'Expirada' },
      { id: 4, status: 'Cancelada' },
      { id: 5, status: 'Retirada' }
    ];
    mockReservationService.getReservations.and.returnValue(of(reservas));

    // Act
    component.consultarReservas();
    fixture.detectChanges();

    component.estadoFiltro = 'Pendiente';
    component.aplicarFiltroPorEstado();
    fixture.detectChanges();

    // Assert
    const reservaItems = fixture.debugElement.queryAll(By.css('[data-cy="reserva-card"]'));
    expect(reservaItems.length).toBe(1);
    const estado = reservaItems[0].query(By.css('[data-cy="reserva-estado"]')).nativeElement.textContent;
    expect(estado).toContain('Pendiente');
  });

  it('debería filtrar y mostrar solo reservas en estado "Confirmada"', () => {
    // Arrange
    component.email = 'usuario@test.com';
    component.secret = 'secret123';

    const reservas = [
      { id: 1, status: 'Pendiente' },
      { id: 2, status: 'Confirmada' },
      { id: 3, status: 'Expirada' },
      { id: 4, status: 'Cancelada' },
      { id: 5, status: 'Retirada' }
    ];
    mockReservationService.getReservations.and.returnValue(of(reservas));

    // Act
    component.consultarReservas();
    fixture.detectChanges();

    component.estadoFiltro = 'Confirmada';
    component.aplicarFiltroPorEstado();
    fixture.detectChanges();

    // Assert
    const reservaItems = fixture.debugElement.queryAll(By.css('[data-cy="reserva-card"]'));
    expect(reservaItems.length).toBe(1);
    const estado = reservaItems[0].query(By.css('[data-cy="reserva-estado"]')).nativeElement.textContent;
    expect(estado).toContain('Confirmada');
  });

  it('debería filtrar y mostrar solo reservas en estado "Expirada"', () => {
    // Arrange
    component.email = 'usuario@test.com';
    component.secret = 'secret123';

    const reservas = [
      { id: 1, status: 'Pendiente' },
      { id: 2, status: 'Confirmada' },
      { id: 3, status: 'Expirada' },
      { id: 4, status: 'Cancelada' },
      { id: 5, status: 'Retirada' }
    ];
    mockReservationService.getReservations.and.returnValue(of(reservas));

    // Act
    component.consultarReservas();
    fixture.detectChanges();

    component.estadoFiltro = 'Expirada';
    component.aplicarFiltroPorEstado();
    fixture.detectChanges();

    // Assert
    const reservaItems = fixture.debugElement.queryAll(By.css('[data-cy="reserva-card"]'));
    expect(reservaItems.length).toBe(1);
    const estado = reservaItems[0].query(By.css('[data-cy="reserva-estado"]')).nativeElement.textContent;
    expect(estado).toContain('Expirada');
  });

  it('debería filtrar y mostrar solo reservas en estado "Cancelada"', () => {
    // Arrange
    component.email = 'usuario@test.com';
    component.secret = 'secret123';

    const reservas = [
      { id: 1, status: 'Pendiente' },
      { id: 2, status: 'Confirmada' },
      { id: 3, status: 'Expirada' },
      { id: 4, status: 'Cancelada' },
      { id: 5, status: 'Retirada' }
    ];
    mockReservationService.getReservations.and.returnValue(of(reservas));

    // Act
    component.consultarReservas();
    fixture.detectChanges();

    component.estadoFiltro = 'Cancelada';
    component.aplicarFiltroPorEstado();
    fixture.detectChanges();

    // Assert
    const reservaItems = fixture.debugElement.queryAll(By.css('[data-cy="reserva-card"]'));
    expect(reservaItems.length).toBe(1);
    const estado = reservaItems[0].query(By.css('[data-cy="reserva-estado"]')).nativeElement.textContent;
    expect(estado).toContain('Cancelada');
  });

  it('debería filtrar y mostrar solo reservas en estado "Retirada"', () => {
    // Arrange
    component.email = 'usuario@test.com';
    component.secret = 'secret123';

    const reservas = [
      { id: 1, status: 'Pendiente' },
      { id: 2, status: 'Confirmada' },
      { id: 3, status: 'Expirada' },
      { id: 4, status: 'Cancelada' },
      { id: 5, status: 'Retirada' }
    ];
    mockReservationService.getReservations.and.returnValue(of(reservas));

    // Act
    component.consultarReservas();
    fixture.detectChanges();

    component.estadoFiltro = 'Retirada';
    component.aplicarFiltroPorEstado();
    fixture.detectChanges();

    // Assert
    const reservaItems = fixture.debugElement.queryAll(By.css('[data-cy="reserva-card"]'));
    expect(reservaItems.length).toBe(1);
    const estado = reservaItems[0].query(By.css('[data-cy="reserva-estado"]')).nativeElement.textContent;
    expect(estado).toContain('Retirada');
  });
});
