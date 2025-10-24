import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { CommonService } from './CommonService';
import { ReservationRequest, ReservationResponse } from '../interfaces/reservation';

@Injectable({ providedIn: 'root' })
export class ReservationService {

  private url = environment.apiUrl + '/api/reservas';

  constructor(
    private http: HttpClient,
    private commonService: CommonService) { }

  getHttpHeaders(): HttpHeaders {
    return new HttpHeaders()
      .set('Content-Type', 'application/json');
  }

  /** POST: crear una nueva reserva */
  createReserva(reserva: ReservationRequest): Observable<ReservationResponse> {
    return this.http.post<ReservationResponse>(this.url, reserva, { headers: this.getHttpHeaders() })
      .pipe(
        tap(),
        catchError(this.handleError<ReservationResponse>('Create Reserva'))
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

  /** Log a ReservaService error with the MessageService */
  private log(message: string) {
    this.commonService.updateToastData(message, "danger", "Error");
  }
}
