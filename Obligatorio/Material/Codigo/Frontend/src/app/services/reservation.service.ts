import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { CommonService } from './CommonService';
import { StorageManager } from '../utils/storage-manager';
import { ReservationRequest, ReservationResponse, ConsultReservationResponse } from '../interfaces/reservation';

@Injectable({ providedIn: 'root' })
export class ReservationService {

  private url = environment.apiUrl + '/api/Reservation';

  constructor(
    private http: HttpClient,
    private commonService: CommonService,
    private storageManager: StorageManager) { }

  getHttpHeaders(): HttpHeaders {
    let login = JSON.parse(this.storageManager.getLogin());
    let token = login ? login.token : "";

    return new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', token);
  }

  /** GET: Consult reservations by user */
  getReservations(email: string, secret: string): Observable<ConsultReservationResponse[]> {
    const encodedEmail = encodeURIComponent(email);
    const encodedSecret = encodeURIComponent(secret);
    return this.http.get<ConsultReservationResponse[]>(`${this.url}?email=${encodedEmail}&secret=${encodedSecret}`, { headers: this.getHttpHeaders() })
      .pipe(
        tap()
        // NO capturamos el error aquí - dejamos que llegue al componente
      );
  }

  /** POST: crear una nueva reserva */
  createReserva(reserva: ReservationRequest): Observable<ReservationResponse> {
    return this.http.post<ReservationResponse>(this.url, reserva, { headers: this.getHttpHeaders() })
      .pipe(
        tap()
        // NO capturamos el error aquí - dejamos que llegue al componente
      );
  }

  /** GET: validar una reserva con clave pública */
  validateReservation(publicKey: string): Observable<any> {
    const encodedPublicKey = encodeURIComponent(publicKey);
    return this.http.get<any>(`${this.url}/validate/${encodedPublicKey}`, { headers: this.getHttpHeaders() })
      .pipe(
        tap()
        // NO capturamos el error aquí - dejamos que llegue al componente
      );
  }

  /** DELETE: cancelar una reserva existente */
  cancelReservation(email: string, secret: string): Observable<ReservationResponse> {
    const encodedEmail = encodeURIComponent(email);
    const encodedSecret = encodeURIComponent(secret);
    return this.http.delete<ReservationResponse>(`${this.url}?email=${encodedEmail}&secret=${encodedSecret}`, { headers: this.getHttpHeaders() })
      .pipe(
        tap()
        // NO capturamos el error aquí - dejamos que llegue al componente
      );
  }

  /** PUT: confirmar una reserva por referenceId */
  confirmReservation(referenceId: string): Observable<ReservationResponse> {
    const encodedReferenceId = encodeURIComponent(referenceId);
    return this.http.put<ReservationResponse>(`${this.url}/confirmar?referenceId=${encodedReferenceId}`, {}, { headers: this.getHttpHeaders() })
      .pipe(
        tap()
        // NO capturamos el error aquí - dejamos que llegue al componente
      );
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   *
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      this.log(`${operation} failed: ${error.error?.message || error.message}`);
      return of(result as T);
    };
  }

  /** Log a ReservationService error with the MessageService */
  private log(message: string) {
    this.commonService.updateToastData(message, "danger", "Error");
  }
}
