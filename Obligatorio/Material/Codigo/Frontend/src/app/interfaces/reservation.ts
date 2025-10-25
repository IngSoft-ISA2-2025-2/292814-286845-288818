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
  mensaje: string;
  error?: string;
}