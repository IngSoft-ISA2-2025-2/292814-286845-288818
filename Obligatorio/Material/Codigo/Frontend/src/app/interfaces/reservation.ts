export interface ReservationRequest {
  email: string;
  secret: string;
  pharmacyName: string;
  drugsReserved: Array<{
    drugName: string;
    drugQuantity: number;
  }>;
}

export interface ReservationResponse {
  pharmacyName?: string;
  publicKey?: string;
  drugsReserved?: Array<{
    drugName: string;
    drugQuantity: number;
  }>;
  status?: string;
}

export interface ConsultReservationResponse {
  pharmacyName?: string;
  status?: string;
  reservedDrugs?: Array<{
    drugName: string;
    quantity: number;
  }>;
  fechaLimiteConfirmacion?: string;
  idReferencia?: string;
  fechaExpiracion?: string;
  fechaCancelacion?: string;
  fechaRetiro?: string;
}