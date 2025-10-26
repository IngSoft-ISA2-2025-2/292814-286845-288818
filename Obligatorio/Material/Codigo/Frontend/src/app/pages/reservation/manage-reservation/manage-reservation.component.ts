import { Component, OnInit } from '@angular/core';
import { ReservationService } from '../../../services/reservation.service';

@Component({
  selector: 'app-manage-reservation',
  templateUrl: './manage-reservation.component.html',
  styleUrls: ['./manage-reservation.component.css']
})
export class ManageReservationComponent implements OnInit {

  email: string = '';
  secret: string = '';
  reservas: any[] = [];
  errorMessage: string = '';
  loading: boolean = false;

  // Filtros
  estadoFiltro: string = '';
  filtroMedicamento: string = '';
  filtroFarmacia: string = '';

  constructor(private reservationService: ReservationService) { }

  ngOnInit(): void {
  }

  consultarReservas(): void {
    if (!this.email || !this.secret) {
      this.errorMessage = 'Debe ingresar un email y secret para consultar reservas.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.reservationService.getReservations(this.email, this.secret)
      .subscribe({
        next: (reservas) => {
          this.reservas = reservas;
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'El secret no coincide con el registrado para este email';
          this.loading = false;
        }
      });
  }

  // Método para aplicar filtro por estado
  aplicarFiltroPorEstado(): void {
    // Este método se ejecuta cuando se cambia el filtro de estado
  }

  // Getter para obtener las reservas filtradas aplicando TODOS los filtros
  get reservasFiltradas(): any[] {
    let filtered = [...this.reservas];

    // Filtro por estado
    if (this.estadoFiltro && this.estadoFiltro !== 'Todos' && this.estadoFiltro !== '') {
      filtered = filtered.filter(r => r.status === this.estadoFiltro);
    }

    // Filtro por medicamento
    if (this.filtroMedicamento) {
      filtered = filtered.filter(r =>
        r.reservedDrugs?.some((drug: any) =>
          drug.drugName?.toLowerCase().includes(this.filtroMedicamento.toLowerCase())
        )
      );
    }

    // Filtro por farmacia
    if (this.filtroFarmacia) {
      filtered = filtered.filter(r =>
        r.pharmacyName?.toLowerCase().includes(this.filtroFarmacia.toLowerCase())
      );
    }

    return filtered;
  }

  // Método para ordenar reservas por fecha de creación descendente
  ordenarPorFechaDesc(): void {
    this.reservas.sort((a, b) =>
      new Date(b.fechaCreacion || b.createdAt || 0).getTime() - 
      new Date(a.fechaCreacion || a.createdAt || 0).getTime()
    );
  }

  // Método para filtrar reservas por medicamento
  reservasFiltradasPorMedicamento(): any[] {
    if (!this.filtroMedicamento) return this.reservas;
    return this.reservas.filter(r =>
      r.reservedDrugs?.some((drug: any) =>
        drug.drugName?.toLowerCase().includes(this.filtroMedicamento.toLowerCase())
      )
    );
  }

  // Método para filtrar reservas por farmacia
  reservasFiltradasPorFarmacia(): any[] {
    if (!this.filtroFarmacia) return this.reservas;
    return this.reservas.filter(r =>
      r.pharmacyName?.toLowerCase().includes(this.filtroFarmacia.toLowerCase())
    );
  }

  // Método para obtener el mensaje según el estado de la reserva
  getMensajePorEstado(reserva: any): string {
    switch (reserva.status) {
      case 'Pendiente':
        return 'Reserva pendiente de confirmación por la farmacia';
      case 'Confirmada':
        return 'Presenta este ID en la farmacia para retirar tu medicamento';
      case 'Expirada':
        return 'Esta reserva ha expirado';
      case 'Cancelada':
        return 'Reserva cancelada';
      case 'Retirada':
        return 'Reserva retirada exitosamente';
      default:
        return '';
    }
  }

  // Método para formatear fechas
  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  // Método para cancelar reserva (botón en reservas pendientes)
  cancelarReserva(reservaId: number): void {
    // Implementación futura para cancelar reservas
    console.log('Cancelar reserva:', reservaId);
  }

  // Método para ver detalles de reserva
  verDetallesReserva(reservaId: number): void {
    const reserva = this.reservas.find(r => r.id === reservaId);
    if (!reserva) {
      this.errorMessage = 'Reserva no encontrada';
      return;
    }
    // Implementación futura para mostrar detalles
    console.log('Ver detalles de reserva:', reserva);
  }

  // Método para limpiar filtros
  limpiarFiltros(): void {
    this.estadoFiltro = '';
    this.filtroMedicamento = '';
    this.filtroFarmacia = '';
  }

  // Método para verificar si no hay reservas
  get noTieneReservas(): boolean {
    return this.reservas.length === 0;
  }

  // Método para obtener el mensaje cuando no hay reservas
  get mensajeSinReservas(): string {
    return 'No tienes reservas creadas';
  }
}