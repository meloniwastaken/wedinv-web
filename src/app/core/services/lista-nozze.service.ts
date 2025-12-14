import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ElementoListaNozzeDTO,
  CreaElementoListaNozzeRequest,
  AggiornaElementoListaNozzeRequest,
  ListaNozzePubblicoResponse,
  PrenotaElementiListaNozzeRequest
} from '../models';
import { IdResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ListaNozzeService {
  private readonly apiUrl = `${environment.apiUrl}/lista-nozze`;
  private readonly apiUrlPubblico = `${environment.apiUrl}/pubblico/invito`;

  private elementiSignal = signal<ElementoListaNozzeDTO[]>([]);
  readonly elementi = this.elementiSignal.asReadonly();

  constructor(private http: HttpClient) {}

  // API per sposi (autenticati)
  getElementi(): Observable<ElementoListaNozzeDTO[]> {
    return this.http.get<ElementoListaNozzeDTO[]>(this.apiUrl).pipe(
      tap(response => this.elementiSignal.set(response))
    );
  }

  getElemento(id: string): Observable<ElementoListaNozzeDTO> {
    return this.http.get<ElementoListaNozzeDTO>(`${this.apiUrl}/${id}`);
  }

  creaElemento(request: CreaElementoListaNozzeRequest): Observable<IdResponse> {
    return this.http.post<IdResponse>(this.apiUrl, request);
  }

  aggiornaElemento(id: string, request: AggiornaElementoListaNozzeRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }

  eliminaElemento(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // API per invitati (pubbliche)
  getListaNozzePubblica(invitatoId: string): Observable<ListaNozzePubblicoResponse> {
    return this.http.get<ListaNozzePubblicoResponse>(`${this.apiUrlPubblico}/${invitatoId}/lista-nozze`);
  }

  aggiornaPrenotazioni(invitatoId: string, request: PrenotaElementiListaNozzeRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrlPubblico}/${invitatoId}/lista-nozze/prenotazioni`, request);
  }

  clearCache(): void {
    this.elementiSignal.set([]);
  }
}
