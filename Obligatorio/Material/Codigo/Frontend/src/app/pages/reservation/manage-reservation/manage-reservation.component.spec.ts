import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageReservationComponent } from './manage-reservation.component';
import { By } from '@angular/platform-browser';

describe('ManageReservationComponent', () => {
  let component: ManageReservationComponent;
  let fixture: ComponentFixture<ManageReservationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageReservationComponent],
      // Agrega aquí los providers/mocks necesarios si los usas
    }).compileComponents();

    fixture = TestBed.createComponent(ManageReservationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería mostrar el listado de reservas del usuario autenticado', () => {
    // Simula reservas (esto se reemplazará por mocks/servicio en el ciclo GREEN)
    component.reservas = [
      { id: 1, medicamentos: [{ nombre: 'Aspirina' }], farmacia: 'Farmashop', estado: 'Pendiente' },
      { id: 2, medicamentos: [{ nombre: 'Paracetamol' }], farmacia: 'Farmacia Central', estado: 'Confirmada' }
    ];
    fixture.detectChanges();

    const items = fixture.debugElement.queryAll(By.css('[data-cy="reserva-item"]'));
    expect(items.length).toBe(2); // Espera que se muestren dos reservas
    expect(items[0].nativeElement.textContent).toContain('Aspirina');
    expect(items[1].nativeElement.textContent).toContain('Paracetamol');
  });
});