import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { CommonService } from './CommonService';
import { StorageManager } from '../utils/storage-manager';

@Injectable({ providedIn: 'root' })
export class ReservationService {

  private url = environment.apiUrl + '/api/reservation';

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

  /** POST: Consult reservations by user */
  getReservations(email: string, secret: string): Observable<any[]> {
    return this.http.post<any[]>(`${this.url}/consult`, { email, secret }, { headers: this.getHttpHeaders() })
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