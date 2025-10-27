export interface ReservationRequest {
  email: string;
  secret: string;
  farmacia: string;
  medicamentos: Array<{
    nombre: string;
    cantidad: number;
    requierePrescripcion?: boolean;
  }>;
}

export interface ReservationResponse {
  id?: number;
  estado?: string;
  medicamentos?: Array<any>;
  farmacia?: string;
  pharmacyName?: string;  // Para confirmación
  publicKey?: string;     // Para confirmación
  status?: string;        // Para confirmación
  drugsReserved?: Array<{ // Para confirmación
    drugName: string;
    drugQuantity: number;
  }>;
  mensaje: string;
  error?: string;
}