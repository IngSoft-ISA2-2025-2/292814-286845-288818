import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ValidateReservationComponent } from './validate-reservation.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';

describe('ValidateReservationComponent', () => {
  let component: ValidateReservationComponent;
  let fixture: ComponentFixture<ValidateReservationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ValidateReservationComponent],
      imports: [FormsModule, ReactiveFormsModule, HttpClientTestingModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ValidateReservationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have clave publica input and validar button', () => {
    expect(fixture.debugElement.query(By.css('[data-cy="clave-publica-input"]'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('[data-cy="validar-btn"]'))).not.toBeNull();
  });

  it('should show error message when errorMessage is set', () => {
    component.errorMessage = 'La clave pública proporcionada no es válida o no existe';
    fixture.detectChanges();
    const errorMsg = fixture.debugElement.query(By.css('[data-cy="error-mensaje"]'));
    expect(errorMsg).not.toBeNull();
    expect(errorMsg.nativeElement.textContent).toContain('La clave pública proporcionada no es válida o no existe');
  });

  it('should show success message when successMessage is set', () => {
    component.successMessage = 'Reserva validada exitosamente. Puede proceder con la entrega del medicamento.';
    fixture.detectChanges();
    const successMsg = fixture.debugElement.query(By.css('[data-cy="success-mensaje"]'));
    expect(successMsg).not.toBeNull();
    expect(successMsg.nativeElement.textContent).toContain('Reserva validada exitosamente');
  });

  it('should display reservation information when validacionExitosa is true', () => {
    component.validacionExitosa = true;
    component.reservaInfo = {
      medicamento: 'Aspirina',
      cantidad: 2,
      cliente: 'usuario@test.com',
      farmacia: 'Farmashop'
    };
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('[data-cy="validacion-exitosa"]'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('[data-cy="reserva-medicamento"]'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('[data-cy="reserva-cantidad"]'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('[data-cy="reserva-cliente"]'))).not.toBeNull();
  });

  it('should show confirmar entrega button when validation is successful', () => {
    component.validacionExitosa = true;
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('[data-cy="confirmar-entrega-btn"]'))).not.toBeNull();
  });

  it('should show estado reserva when estadoReserva is set', () => {
    component.estadoReserva = 'Confirmada';
    fixture.detectChanges();
    const estadoDiv = fixture.debugElement.query(By.css('[data-cy="estado-reserva"]'));
    expect(estadoDiv).not.toBeNull();
    expect(estadoDiv.nativeElement.textContent).toContain('Confirmada');
  });

  it('should show error codigo when errorCodigo is set', () => {
    component.errorCodigo = '404';
    fixture.detectChanges();
    const errorCodigoDiv = fixture.debugElement.query(By.css('[data-cy="error-codigo"]'));
    expect(errorCodigoDiv).not.toBeNull();
    expect(errorCodigoDiv.nativeElement.textContent).toContain('404');
  });

  it('should show clave invalidada message when claveInvalidada is true', () => {
    component.claveInvalidada = true;
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('[data-cy="clave-invalidada"]'))).not.toBeNull();
  });
});
