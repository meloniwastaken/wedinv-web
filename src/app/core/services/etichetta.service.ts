import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  EtichettaDTO,
  CreaEtichettaRequest,
  AggiornaEtichettaRequest
} from '../models';
import { IdResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class EtichettaService {
  private readonly apiUrl = `${environment.apiUrl}/etichetta`;

  private etichetteSignal = signal<EtichettaDTO[]>([]);

  readonly etichette = this.etichetteSignal.asReadonly();

  constructor(private http: HttpClient) {}

  getEtichette(): Observable<EtichettaDTO[]> {
    return this.http.get<EtichettaDTO[]>(this.apiUrl).pipe(
      tap(response => this.etichetteSignal.set(response))
    );
  }

  creaEtichetta(request: CreaEtichettaRequest): Observable<IdResponse> {
    return this.http.post<IdResponse>(this.apiUrl, request);
  }

  aggiornaEtichetta(id: string, request: AggiornaEtichettaRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }

  eliminaEtichetta(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  clearCache(): void {
    this.etichetteSignal.set([]);
  }
}
