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
  reservations: any[] = [];
  errorMessage: string = '';
  loading: boolean = false;

  // Filters
  statusFilter: string = '';
  drugFilter: string = '';
  pharmacyFilter: string = '';

  constructor(private reservationService: ReservationService) { }

  ngOnInit(): void {
  }

  consultReservations(): void {
    if (!this.email || !this.secret) {
      this.errorMessage = 'Debe ingresar un email y secret para consultar reservas.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.reservationService.getReservations(this.email, this.secret)
      .subscribe({
        next: (reservations) => {
          this.reservations = reservations;
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'El secret no coincide con el registrado para este email';
          this.loading = false;
        }
      });
  }

  // Method to apply filter by status
  applyStatusFilter(): void {
    // This method is triggered when the status filter changes
  }

  // Getter to obtain filtered reservations applying ALL filters
  get filteredReservations(): any[] {
    let filtered = [...this.reservations];

    // Filter by status
    if (this.statusFilter && this.statusFilter !== 'Todos' && this.statusFilter !== '') {
      filtered = filtered.filter(r => r.status === this.statusFilter);
    }

    // Filter by drug
    if (this.drugFilter) {
      filtered = filtered.filter(r =>
        r.reservedDrugs?.some((drug: any) =>
          drug.drugName?.toLowerCase().includes(this.drugFilter.toLowerCase())
        )
      );
    }

    // Filter by pharmacy
    if (this.pharmacyFilter) {
      filtered = filtered.filter(r =>
        r.pharmacyName?.toLowerCase().includes(this.pharmacyFilter.toLowerCase())
      );
    }

    return filtered;
  }

  // Method to sort reservations by creation date descending
  sortByCreationDateDesc(): void {
    this.reservations.sort((a, b) =>
      new Date(b.fechaCreacion || b.createdAt || 0).getTime() - 
      new Date(a.fechaCreacion || a.createdAt || 0).getTime()
    );
  }

  // Method to filter reservations by drug
  filteredByDrug(): any[] {
    if (!this.drugFilter) return this.reservations;
    return this.reservations.filter(r =>
      r.reservedDrugs?.some((drug: any) =>
        drug.drugName?.toLowerCase().includes(this.drugFilter.toLowerCase())
      )
    );
  }

  // Method to filter reservations by pharmacy
  filteredByPharmacy(): any[] {
    if (!this.pharmacyFilter) return this.reservations;
    return this.reservations.filter(r =>
      r.pharmacyName?.toLowerCase().includes(this.pharmacyFilter.toLowerCase())
    );
  }

  // Method to get the message according to the reservation status
  getStatusMessage(reservation: any): string {
    switch (reservation.status) {
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

  // Method to format dates
  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-ES');
  }

  // Method to cancel reservation (button in pending reservations)
  cancelReservation(reservationId: number): void {
    // Future implementation to cancel reservations
    console.log('Cancel reservation:', reservationId);
  }

  // Method to view reservation details
  viewReservationDetails(reservationId: number): void {
    const reservation = this.reservations.find(r => r.id === reservationId);
    if (!reservation) {
      this.errorMessage = 'Reserva no encontrada';
      return;
    }
    // Future implementation to show details
    console.log('View reservation details:', reservation);
  }

  // Method to clear filters
  clearFilters(): void {
    this.statusFilter = '';
    this.drugFilter = '';
    this.pharmacyFilter = '';
  }

  // Method to check if there are no reservations
  get hasNoReservations(): boolean {
    return this.reservations.length === 0;
  }

  // Method to get the message when there are no reservations
  get noReservationsMessage(): string {
    return 'No tienes reservas creadas';
  }
}