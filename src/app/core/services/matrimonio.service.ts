import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  MatrimonioDTO,
  CreaMatrimonioRequest,
  AggiornaMatrimonioRequest,
  AggiornaStileRequest
} from '../models';
import { IdResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class MatrimonioService {
  private readonly apiUrl = `${environment.apiUrl}/matrimonio`;

  private matrimonioSignal = signal<MatrimonioDTO | null>(null);
  readonly matrimonio = this.matrimonioSignal.asReadonly();

  constructor(private http: HttpClient) {}

  getMatrimonio(): Observable<MatrimonioDTO | null> {
    return this.http.get<MatrimonioDTO | null>(this.apiUrl).pipe(
      tap(matrimonio => this.matrimonioSignal.set(matrimonio))
    );
  }

  creaMatrimonio(request: CreaMatrimonioRequest): Observable<IdResponse> {
    return this.http.post<IdResponse>(this.apiUrl, request);
  }

  aggiornaMatrimonio(request: AggiornaMatrimonioRequest): Observable<void> {
    return this.http.put<void>(this.apiUrl, request).pipe(
      tap(() => {
        const current = this.matrimonioSignal();
        if (current) {
          this.matrimonioSignal.set({ ...current, ...request });
        }
      })
    );
  }

  eliminaMatrimonio(): Observable<void> {
    return this.http.delete<void>(this.apiUrl).pipe(
      tap(() => this.matrimonioSignal.set(null))
    );
  }

  clearCache(): void {
    this.matrimonioSignal.set(null);
  }

  aggiornaStile(request: AggiornaStileRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/stile`, request).pipe(
      tap(() => {
        const current = this.matrimonioSignal();
        if (current) {
          this.matrimonioSignal.set({ ...current, stileCodice: request.stileCodice });
        }
      })
    );
  }
}
