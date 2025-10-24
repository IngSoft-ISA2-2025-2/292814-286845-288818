import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageReservationComponent } from './manage-reservation.component';
import { By } from '@angular/platform-browser';

describe('ManageReservationComponent', () => {
  let component: ManageReservationComponent;
  let fixture: ComponentFixture<ManageReservationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageReservationComponent],
    }).compileComponents();

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
    component.reservas = [
      { 
        id: 1, 
        medicamentos: [{ nombre: 'Aspirina' }], 
        farmacia: 'Farmashop', 
        estado: 'Pendiente',
        fechaCreacion: '2023-10-01T10:00:00Z'
      },
      { 
        id: 2, 
        medicamentos: [{ nombre: 'Paracetamol' }], 
        farmacia: 'Farmacia Central', 
        estado: 'Confirmada',
        fechaCreacion: '2023-10-02T11:00:00Z'
      }
    ];
    
    fixture.detectChanges();

    // Assert: Verifica que las reservas se muestran correctamente
    const listadoReservas = fixture.debugElement.query(By.css('[data-cy="listado-reservas"]'));
    expect(listadoReservas).toBeTruthy();

    const reservaItems = fixture.debugElement.queryAll(By.css('[data-cy="reserva-item"]'));
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
    fixture.detectChanges();

    // Act: simula click en el botón de consultar reservas
    const consultarBtn = fixture.debugElement.query(By.css('[data-cy="consultar-reservas-btn"]'));
    consultarBtn.triggerEventHandler('click');
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
    component.reservas = []; // Simula que no hay reservas
    fixture.detectChanges();

    // Act: simula click en el botón de consultar reservas
    const consultarBtn = fixture.debugElement.query(By.css('[data-cy="consultar-reservas-btn"]'));
    consultarBtn.triggerEventHandler('click');
    fixture.detectChanges();

    // Assert: verifica que el listado está vacío y se muestra el mensaje
    const listadoReservas = fixture.debugElement.query(By.css('[data-cy="listado-reservas"]'));
    expect(listadoReservas).toBeTruthy();

    const reservaItems = fixture.debugElement.queryAll(By.css('[data-cy="reserva-item"]'));
    expect(reservaItems.length).toBe(0);

    const mensajeVacio = fixture.debugElement.query(By.css('[data-cy="mensaje-sin-reservas"]'));
    expect(mensajeVacio).toBeTruthy();
    expect(mensajeVacio.nativeElement.textContent).toContain('No tienes reservas creadas');
  });
});