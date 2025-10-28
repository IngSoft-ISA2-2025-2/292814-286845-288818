import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageReservationComponent } from './manage-reservation.component';
import { By } from '@angular/platform-browser';
import { ReservationService } from '../../../services/reservation.service';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

describe('ManageReservationComponent', () => {
  let component: ManageReservationComponent;
  let fixture: ComponentFixture<ManageReservationComponent>;
  let mockReservationService: jasmine.SpyObj<ReservationService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ReservationService', ['getReservations']);

    await TestBed.configureTestingModule({
      declarations: [ManageReservationComponent],
      imports: [FormsModule],
      providers: [
        { provide: ReservationService, useValue: spy }
      ]
    }).compileComponents();

    mockReservationService = TestBed.inject(ReservationService) as jasmine.SpyObj<ReservationService>;

    fixture = TestBed.createComponent(ManageReservationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería mostrar inputs de email y secret para consultar reservas', () => {
    const emailInput = fixture.debugElement.query(By.css('[data-cy="email-input"]'));
    const secretInput = fixture.debugElement.query(By.css('[data-cy="secret-input"]'));
    const consultarBtn = fixture.debugElement.query(By.css('[data-cy="consultar-reservas-btn"]'));

    expect(emailInput).toBeTruthy();
    expect(secretInput).toBeTruthy();
    expect(consultarBtn).toBeTruthy();
  });

  it('debería consultar y mostrar reservas cuando se proporcionan email y secret válidos', () => {
    // Arrange: Configura email y secret válidos
    component.email = 'usuario@test.com';
    component.secret = 'miSecret123';
    
    // Simula el resultado exitoso de consultar reservas
    component.reservations = [
      { 
        id: 1, 
        reservedDrugs: [{ drugName: 'Aspirina', quantity: 2 }], 
        pharmacyName: 'Farmashop', 
        status: 'Pendiente',
        fechaCreacion: '2023-10-01T10:00:00Z'
      },
      { 
        id: 2, 
        reservedDrugs: [{ drugName: 'Paracetamol', quantity: 1 }], 
        pharmacyName: 'Farmacia Central', 
        status: 'Confirmada',
        fechaCreacion: '2023-10-02T11:00:00Z'
      }
    ];
    
    fixture.detectChanges();

    // Assert: Verifica que las reservas se muestran correctamente
    const listadoReservas = fixture.debugElement.query(By.css('[data-cy="listado-reservas"]'));
    expect(listadoReservas).toBeTruthy();

    const reservaItems = fixture.debugElement.queryAll(By.css('[data-cy="reserva-card"]'));
    expect(reservaItems.length).toBe(2);

    // Verifica información básica de cada reserva
    const medicamentosElements = fixture.debugElement.queryAll(By.css('[data-cy="reserva-medicamento"]'));
    const farmaciasElements = fixture.debugElement.queryAll(By.css('[data-cy="reserva-farmacia"]'));
    const estadosElements = fixture.debugElement.queryAll(By.css('[data-cy="reserva-estado"]'));

    expect(medicamentosElements[0].nativeElement.textContent).toContain('Aspirina');
    expect(farmaciasElements[0].nativeElement.textContent).toContain('Farmashop');
    expect(estadosElements[0].nativeElement.textContent).toContain('Pendiente');

    expect(medicamentosElements[1].nativeElement.textContent).toContain('Paracetamol');
    expect(farmaciasElements[1].nativeElement.textContent).toContain('Farmacia Central');
    expect(estadosElements[1].nativeElement.textContent).toContain('Confirmada');

    // Verifica que cada reserva tiene botón para ver detalles
    const verDetallesBtns = fixture.debugElement.queryAll(By.css('[data-cy="ver-detalles-btn"]'));
    expect(verDetallesBtns.length).toBe(2);
  });

  it('debería mostrar error si email y secret están vacíos al consultar reservas', () => {
    // Arrange
    component.email = '';
    component.secret = '';

    // Act: simula la función consultReservations directamente
    component.consultReservations();
    fixture.detectChanges();

    // Assert: verifica que se muestre el mensaje de error
    const errorMsg = fixture.debugElement.query(By.css('[data-cy="error-message"]'));
    expect(errorMsg).toBeTruthy();
    expect(errorMsg.nativeElement.textContent).toContain('Debe ingresar un email y secret para consultar reservas.');
  });

  it('debería mostrar mensaje y listado vacío si el usuario no tiene reservas', () => {
    // Arrange
    component.email = 'usuario@test.com';
    component.secret = 'miSecret123';
    component.reservations = []; // Simula que no hay reservas
    component.loading = false; // Asegura que no esté cargando
    component.errorMessage = ''; // Asegura que no hay error
    mockReservationService.getReservations.and.returnValue(of([]));
    fixture.detectChanges();

    // Act: simula la función consultReservations
    component.consultReservations();
    fixture.detectChanges();

    // Assert: verifica que se muestra el mensaje sin reservas
    const mensajeVacio = fixture.debugElement.query(By.css('[data-cy="mensaje-sin-reservas"]'));
    expect(mensajeVacio).toBeTruthy();
    expect(mensajeVacio.nativeElement.textContent).toContain('No tienes reservas creadas');
  });

  it('debería mostrar todas las reservas del usuario con información básica y botón de detalles', () => {
    // Arrange
    component.email = 'usuario@test.com';
    component.secret = 'miSecret123';
    component.reservations = [
      { id: 1, reservedDrugs: [{ drugName: 'Aspirina', quantity: 2 }], pharmacyName: 'Farmashop', status: 'Pendiente', fechaCreacion: '2023-10-01T10:00:00Z' },
      { id: 2, reservedDrugs: [{ drugName: 'Paracetamol', quantity: 1 }], pharmacyName: 'Farmacia Central', status: 'Confirmada', fechaCreacion: '2023-10-02T11:00:00Z' },
      { id: 3, reservedDrugs: [{ drugName: 'Ibuprofeno', quantity: 3 }], pharmacyName: 'Farmacia Sur', status: 'Expirada', fechaCreacion: '2023-10-03T12:00:00Z' },
      { id: 4, reservedDrugs: [{ drugName: 'Amoxicilina', quantity: 1 }], pharmacyName: 'Farmacia Norte', status: 'Cancelada', fechaCreacion: '2023-10-04T13:00:00Z' },
      { id: 5, reservedDrugs: [{ drugName: 'Diclofenac', quantity: 2 }], pharmacyName: 'Farmacia Este', status: 'Retirada', fechaCreacion: '2023-10-05T14:00:00Z' }
    ];
    fixture.detectChanges();

    // Act: simula click en el botón de consultar reservas
    const consultarBtn = fixture.debugElement.query(By.css('[data-cy="consultar-reservas-btn"]'));
    consultarBtn.triggerEventHandler('click');
    fixture.detectChanges();

    // Assert: verifica que el listado muestra todas las reservas
    const reservaItems = fixture.debugElement.queryAll(By.css('[data-cy="reserva-card"]'));
    expect(reservaItems.length).toBe(5);

    // Verifica información básica de cada reserva
    const medicamentosElements = fixture.debugElement.queryAll(By.css('[data-cy="reserva-medicamento"]'));
    const farmaciasElements = fixture.debugElement.queryAll(By.css('[data-cy="reserva-farmacia"]'));
    const estadosElements = fixture.debugElement.queryAll(By.css('[data-cy="reserva-estado"]'));

    expect(medicamentosElements[0].nativeElement.textContent).toContain('Aspirina');
    expect(farmaciasElements[0].nativeElement.textContent).toContain('Farmashop');
    expect(estadosElements[0].nativeElement.textContent).toContain('Pendiente');

    expect(medicamentosElements[1].nativeElement.textContent).toContain('Paracetamol');
    expect(farmaciasElements[1].nativeElement.textContent).toContain('Farmacia Central');
    expect(estadosElements[1].nativeElement.textContent).toContain('Confirmada');

    expect(medicamentosElements[2].nativeElement.textContent).toContain('Ibuprofeno');
    expect(farmaciasElements[2].nativeElement.textContent).toContain('Farmacia Sur');
    expect(estadosElements[2].nativeElement.textContent).toContain('Expirada');

    expect(medicamentosElements[3].nativeElement.textContent).toContain('Amoxicilina');
    expect(farmaciasElements[3].nativeElement.textContent).toContain('Farmacia Norte');
    expect(estadosElements[3].nativeElement.textContent).toContain('Cancelada');

    expect(medicamentosElements[4].nativeElement.textContent).toContain('Diclofenac');
    expect(farmaciasElements[4].nativeElement.textContent).toContain('Farmacia Este');
    expect(estadosElements[4].nativeElement.textContent).toContain('Retirada');

    // Verifica que cada reserva tiene botón para ver detalles
    const verDetallesBtns = fixture.debugElement.queryAll(By.css('[data-cy="ver-detalles-btn"]'));
    expect(verDetallesBtns.length).toBe(5);
  });

  it('debería filtrar y mostrar solo las reservas en el estado seleccionado', () => {
    // Arrange
    const estadoFiltro = 'Confirmada';
    component.email = 'usuario@test.com';
    component.secret = 'miSecret123';
    component.reservations = [
      { id: 1, reservedDrugs: [{ drugName: 'Aspirina', quantity: 2 }], pharmacyName: 'Farmashop', status: 'Pendiente', fechaCreacion: '2023-10-01T10:00:00Z' },
      { id: 2, reservedDrugs: [{ drugName: 'Paracetamol', quantity: 1 }], pharmacyName: 'Farmacia Central', status: 'Confirmada', fechaCreacion: '2023-10-02T11:00:00Z' },
      { id: 3, reservedDrugs: [{ drugName: 'Ibuprofeno', quantity: 3 }], pharmacyName: 'Farmacia Sur', status: 'Expirada', fechaCreacion: '2023-10-03T12:00:00Z' },
      { id: 4, reservedDrugs: [{ drugName: 'Amoxicilina', quantity: 1 }], pharmacyName: 'Farmacia Norte', status: 'Cancelada', fechaCreacion: '2023-10-04T13:00:00Z' },
      { id: 5, reservedDrugs: [{ drugName: 'Diclofenac', quantity: 2 }], pharmacyName: 'Farmacia Este', status: 'Retirada', fechaCreacion: '2023-10-05T14:00:00Z' }
    ];
    fixture.detectChanges();

    // Act: simula seleccionar el filtro por estado
    component.statusFilter = estadoFiltro;
    component.applyStatusFilter();
    fixture.detectChanges();

    // Assert: solo se muestran las reservas en el estado filtrado
    const reservaItems = fixture.debugElement.queryAll(By.css('[data-cy="reserva-card"]'));
    expect(reservaItems.length).toBe(1);

    const estadoElement = fixture.debugElement.query(By.css('[data-cy="reserva-estado"]'));
    expect(estadoElement.nativeElement.textContent).toContain(estadoFiltro);
  });

  it('debería mostrar un error si el secret es incorrecto para el email ingresado', () => {
    // Arrange
    component.email = 'usuario@test.com';
    component.secret = 'secretIncorrecto';
    // Simula que el backend responde con error de secret incorrecto
    component.errorMessage = 'El secret no coincide con el registrado para este email';
    fixture.detectChanges();

    // Act: simula click en el botón de consultar reservas
    const consultarBtn = fixture.debugElement.query(By.css('[data-cy="consultar-reservas-btn"]'));
    consultarBtn.triggerEventHandler('click');
    fixture.detectChanges();

    // Assert: verifica que se muestre el mensaje de error
    const errorMsg = fixture.debugElement.query(By.css('[data-cy="error-message"]'));
    expect(errorMsg).toBeTruthy();
    expect(errorMsg.nativeElement.textContent).toContain('El secret no coincide con el registrado para este email');
  });

  it('debería mostrar correctamente una reserva pendiente con opciones y mensajes', () => {
    // Arrange
    component.email = 'usuario@test.com';
    component.secret = 'miSecret123';
    component.reservations = [
      {
        id: 1,
        reservedDrugs: [{ drugName: 'Aspirina', quantity: 2 }],
        pharmacyName: 'Farmashop',
        status: 'Pendiente',
        fechaCreacion: '2023-10-01T10:00:00Z',
        fechaLimiteConfirmacion: '2023-10-05T23:59:59Z',
        idReferencia: null // No debe mostrarse
      }
    ];
    fixture.detectChanges();

    // Act: simula click en el botón de consultar reservas
    const consultarBtn = fixture.debugElement.query(By.css('[data-cy="consultar-reservas-btn"]'));
    consultarBtn.triggerEventHandler('click');
    fixture.detectChanges();

    // Assert: verifica que la reserva pendiente se muestra correctamente
    const reservaItem = fixture.debugElement.query(By.css('[data-cy="reserva-card"]'));
    expect(reservaItem).toBeTruthy();

    const estadoElement = reservaItem.query(By.css('[data-cy="reserva-estado"]'));
    expect(estadoElement.nativeElement.textContent).toContain('Pendiente');

    const mensajePendiente = reservaItem.query(By.css('[data-cy="mensaje-pendiente"]'));
    expect(mensajePendiente).toBeTruthy();
    expect(mensajePendiente.nativeElement.textContent).toContain('Reserva pendiente de confirmación por la farmacia');

    const cancelarBtn = reservaItem.query(By.css('[data-cy="cancelar-reserva-btn"]'));
    expect(cancelarBtn).toBeTruthy();

    const fechaLimite = reservaItem.query(By.css('[data-cy="fecha-limite-confirmacion"]'));
    expect(fechaLimite).toBeTruthy();
    expect(fechaLimite.nativeElement.textContent).toContain('5/10/2023');

    const idReferencia = reservaItem.query(By.css('[data-cy="id-referencia"]'));
    expect(idReferencia).toBeNull(); // No debe mostrarse hasta que sea confirmada
  });

  it('debería mostrar el ID de referencia y mensaje para una reserva confirmada', () => {
    // Arrange
    component.email = 'usuario@test.com';
    component.secret = 'miSecret123';
    component.reservations = [
      {
        id: 2,
        reservedDrugs: [{ drugName: 'Paracetamol', quantity: 1 }],
        pharmacyName: 'Farmacia Central',
        status: 'Confirmada',
        fechaCreacion: '2023-10-02T11:00:00Z',
        idReferencia: 'ABC12345'
      }
    ];
    fixture.detectChanges();

    // Act: simula click en el botón de consultar reservas
    const consultarBtn = fixture.debugElement.query(By.css('[data-cy="consultar-reservas-btn"]'));
    consultarBtn.triggerEventHandler('click');
    fixture.detectChanges();

    // Assert: verifica que la reserva confirmada muestra el ID de referencia y el mensaje
    const reservaItem = fixture.debugElement.query(By.css('[data-cy="reserva-card"]'));
    expect(reservaItem).toBeTruthy();

    const estadoElement = reservaItem.query(By.css('[data-cy="reserva-estado"]'));
    expect(estadoElement.nativeElement.textContent).toContain('Confirmada');

    const idReferencia = reservaItem.query(By.css('[data-cy="id-referencia"]'));
    expect(idReferencia).toBeTruthy();
    expect(idReferencia.nativeElement.textContent).toContain('ABC12345');

    const mensajeConfirmada = reservaItem.query(By.css('[data-cy="mensaje-estado"]'));
    expect(mensajeConfirmada).toBeTruthy();
    expect(mensajeConfirmada.nativeElement.textContent).toContain('Presenta este ID en la farmacia para retirar tu medicamento');
  });

  it('debería mostrar correctamente una reserva expirada con mensaje e indicaciones', () => {
    // Arrange
    component.email = 'usuario@test.com';
    component.secret = 'miSecret123';
    component.reservations = [
      {
        id: 3,
        reservedDrugs: [{ drugName: 'Ibuprofeno', quantity: 3 }],
        pharmacyName: 'Farmacia Sur',
        status: 'Expirada',
        fechaCreacion: '2023-10-03T12:00:00Z',
        fechaExpiracion: '2023-10-10T23:59:59Z'
      }
    ];
    fixture.detectChanges();

    // Act: simula click en el botón de consultar reservas
    const consultarBtn = fixture.debugElement.query(By.css('[data-cy="consultar-reservas-btn"]'));
    consultarBtn.triggerEventHandler('click');
    fixture.detectChanges();

    // Assert: verifica que la reserva expirada se muestra correctamente
    const reservaItem = fixture.debugElement.query(By.css('[data-cy="reserva-card"]'));
    expect(reservaItem).toBeTruthy();

    const estadoElement = reservaItem.query(By.css('[data-cy="reserva-estado"]'));
    expect(estadoElement.nativeElement.textContent).toContain('Expirada');

    const mensajeExpirada = reservaItem.query(By.css('[data-cy="mensaje-estado"]'));
    expect(mensajeExpirada).toBeTruthy();
    expect(mensajeExpirada.nativeElement.textContent).toContain('Esta reserva ha expirado');

    const fechaExpiracion = reservaItem.query(By.css('[data-cy="fecha-expiracion"]'));
    expect(fechaExpiracion).toBeTruthy();
    expect(fechaExpiracion.nativeElement.textContent).toContain('10/10/2023');
  });

  it('debería mostrar correctamente una reserva cancelada con mensaje y fecha de cancelación', () => {
    // Arrange
    component.email = 'usuario@test.com';
    component.secret = 'miSecret123';
    component.reservations = [
      {
        id: 4,
        reservedDrugs: [{ drugName: 'Amoxicilina', quantity: 1 }],
        pharmacyName: 'Farmacia Norte',
        status: 'Cancelada',
        fechaCreacion: '2023-10-04T13:00:00Z',
        fechaCancelacion: '2023-10-08T10:00:00Z'
      }
    ];
    fixture.detectChanges();

    // Act: simula click en el botón de consultar reservas
    const consultarBtn = fixture.debugElement.query(By.css('[data-cy="consultar-reservas-btn"]'));
    consultarBtn.triggerEventHandler('click');
    fixture.detectChanges();

    // Assert: verifica que la reserva cancelada se muestra correctamente
    const reservaItem = fixture.debugElement.query(By.css('[data-cy="reserva-card"]'));
    expect(reservaItem).toBeTruthy();

    const estadoElement = reservaItem.query(By.css('[data-cy="reserva-estado"]'));
    expect(estadoElement.nativeElement.textContent).toContain('Cancelada');

    const mensajeCancelada = reservaItem.query(By.css('[data-cy="mensaje-estado"]'));
    expect(mensajeCancelada).toBeTruthy();
    expect(mensajeCancelada.nativeElement.textContent).toContain('Reserva cancelada');

    const fechaCancelacion = reservaItem.query(By.css('[data-cy="fecha-cancelacion"]'));
    expect(fechaCancelacion).toBeTruthy();
    expect(fechaCancelacion.nativeElement.textContent).toContain('8/10/2023');
  });

  it('debería mostrar correctamente una reserva retirada con mensaje y fecha de retiro', () => {
    // Arrange
    component.email = 'usuario@test.com';
    component.secret = 'miSecret123';
    component.reservations = [
      {
        id: 5,
        reservedDrugs: [{ drugName: 'Diclofenac', quantity: 2 }],
        pharmacyName: 'Farmacia Este',
        status: 'Retirada',
        fechaCreacion: '2023-10-05T14:00:00Z',
        fechaRetiro: '2023-10-12T09:30:00Z'
      }
    ];
    fixture.detectChanges();

    // Act: simula click en el botón de consultar reservas
    const consultarBtn = fixture.debugElement.query(By.css('[data-cy="consultar-reservas-btn"]'));
    consultarBtn.triggerEventHandler('click');
    fixture.detectChanges();

    // Assert: verifica que la reserva retirada se muestra correctamente
    const reservaItem = fixture.debugElement.query(By.css('[data-cy="reserva-card"]'));
    expect(reservaItem).toBeTruthy();

    const estadoElement = reservaItem.query(By.css('[data-cy="reserva-estado"]'));
    expect(estadoElement.nativeElement.textContent).toContain('Retirada');

    const mensajeRetirada = reservaItem.query(By.css('[data-cy="mensaje-estado"]'));
    expect(mensajeRetirada).toBeTruthy();
    expect(mensajeRetirada.nativeElement.textContent).toContain('Reserva retirada exitosamente');

    const fechaRetiro = reservaItem.query(By.css('[data-cy="fecha-retiro"]'));
    expect(fechaRetiro).toBeTruthy();
    expect(fechaRetiro.nativeElement.textContent).toContain('12/10/2023');
  });

  it('debería ordenar las reservas por fecha de creación descendente', () => {
    component.reservations = [
      { id: 1, fechaCreacion: '2023-10-01T10:00:00Z' },
      { id: 2, fechaCreacion: '2023-10-03T10:00:00Z' },
      { id: 3, fechaCreacion: '2023-10-02T10:00:00Z' }
    ];
    // Act
    component.sortByCreationDateDesc();
    // Assert
    expect(component.reservations[0].id).toBe(2);
    expect(component.reservations[1].id).toBe(3);
    expect(component.reservations[2].id).toBe(1);
  });

  it('debería filtrar las reservas por nombre de medicamento', () => {
    component.reservations = [
      { id: 1, reservedDrugs: [{ drugName: 'Paracetamol', quantity: 1 }] },
      { id: 2, reservedDrugs: [{ drugName: 'Ibuprofeno', quantity: 2 }] }
    ];
    component.drugFilter = 'Paracetamol';
    // Act
    const filtradas = component.filteredByDrug();
    // Assert
    expect(filtradas.length).toBe(1);
    expect(filtradas[0].id).toBe(1);
  });

  it('debería filtrar las reservas por nombre de farmacia', () => {
    component.reservations = [
      { id: 1, pharmacyName: 'Farmacia Central' },
      { id: 2, pharmacyName: 'Farmashop' }
    ];
    component.pharmacyFilter = 'Farmacia Central';
    // Act
    const filtradas = component.filteredByPharmacy();
    // Assert
    expect(filtradas.length).toBe(1);
    expect(filtradas[0].id).toBe(1);
  });

});