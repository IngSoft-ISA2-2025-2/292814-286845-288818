import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrearReservaComponent } from './crear-reserva.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';

describe('CrearReservaComponent', () => {
  let component: CrearReservaComponent;
  let fixture: ComponentFixture<CrearReservaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CrearReservaComponent],
      imports: [FormsModule, ReactiveFormsModule, HttpClientTestingModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearReservaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have medicamento nombre, cantidad, farmacia inputs and reservar button', () => {
    expect(fixture.debugElement.query(By.css('[data-cy="email-input"]'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('[data-cy="secret-input"]'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('[data-cy="medicamento-nombre-input"]'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('[data-cy="medicamento-cantidad-input"]'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('[data-cy="farmacia-input"]'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('[data-cy="reservar-btn"]'))).not.toBeNull();
  });

  it('should show error message when errorMessage is set', () => {
    component.errorMessage = 'Debe ingresar un email y secret para reservar medicamentos.';
    fixture.detectChanges();
    const errorMsg = fixture.debugElement.query(By.css('[data-cy="error-mensaje"]'));
    expect(errorMsg.nativeElement.textContent).toContain('Debe ingresar un email y secret para reservar medicamentos.');
  });
});