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
  hasConsulted: boolean = false;  // Nueva propiedad para rastrear si se consultó

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
    this.hasConsulted = false;

    this.reservationService.getReservations(this.email, this.secret)
      .subscribe({
        next: (reservations) => {
          this.reservations = reservations;
          this.loading = false;
          this.hasConsulted = true;
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'El secret no coincide con el registrado para este email';
          this.loading = false;
          this.hasConsulted = false;
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

    // Filter by status (convertir el estado español a inglés para comparar)
    if (this.statusFilter && this.statusFilter !== 'Todos' && this.statusFilter !== '') {
      const statusMap: any = {
        'Pendiente': 'Pending',
        'Confirmada': 'Confirmed',
        'Expirada': 'Expired',
        'Cancelada': 'Canceled',
        'Retirada': 'Withdrawal'
      };
      const englishStatus = statusMap[this.statusFilter] || this.statusFilter;
      filtered = filtered.filter(r => r.status === englishStatus);
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
      new Date(b.fechaCreacion || 0).getTime() - 
      new Date(a.fechaCreacion || 0).getTime()
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
    const statusMap: any = {
      'Pending': 'Reserva pendiente de confirmación por la farmacia',
      'Confirmed': 'Presenta este ID en la farmacia para retirar tu medicamento',
      'Expired': 'Esta reserva ha expirado',
      'Canceled': 'Reserva cancelada',
      'Withdrawal': 'Reserva retirada exitosamente'
    };
    return statusMap[reservation.status] || '';
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
    
    // Construir mensaje de detalles
    const drugs = reservation.reservedDrugs?.map((d: any) => 
      `${d.drugName} (Cantidad: ${d.quantity})`
    ).join('\n') || 'Sin medicamentos';
    
    const details = `
DETALLES DE LA RESERVA #${reservation.id}

Estado: ${this.translateStatus(reservation.status)}
Farmacia: ${reservation.pharmacyName}
Medicamentos:
${drugs}

${reservation.idReferencia ? `ID de Referencia: ${reservation.idReferencia}` : ''}
${reservation.fechaLimiteConfirmacion ? `Fecha Límite: ${this.formatDate(reservation.fechaLimiteConfirmacion)}` : ''}
${reservation.fechaExpiracion ? `Fecha Expiración: ${this.formatDate(reservation.fechaExpiracion)}` : ''}
${reservation.fechaCancelacion ? `Fecha Cancelación: ${this.formatDate(reservation.fechaCancelacion)}` : ''}
${reservation.fechaRetiro ? `Fecha Retiro: ${this.formatDate(reservation.fechaRetiro)}` : ''}
    `;
    
    alert(details.trim());
  }
  
  // Método auxiliar para traducir estados (público para usar en el template)
  translateStatus(status: string): string {
    const translations: any = {
      'Pending': 'Pendiente',
      'Confirmed': 'Confirmada',
      'Expired': 'Expirada',
      'Canceled': 'Cancelada',
      'Withdrawal': 'Retirada'
    };
    return translations[status] || status;
  }

  // Method to clear filters
  clearFilters(): void {
    this.statusFilter = '';
    this.drugFilter = '';
    this.pharmacyFilter = '';
  }
}