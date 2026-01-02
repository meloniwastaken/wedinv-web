import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  InvitatoDTO,
  ListaInvitatiResponse,
  CreaInvitatoRequest,
  AggiornaInvitatoRequest,
  InviaInvitiRequest,
  InvioInvitiResponse
} from '../models';
import { IdResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class InvitatoService {
  private readonly apiUrl = `${environment.apiUrl}/invitato`;

  private invitatiSignal = signal<ListaInvitatiResponse | null>(null);
  readonly invitatiRiepilogo = this.invitatiSignal.asReadonly();

  constructor(private http: HttpClient) {}

  getInvitati(): Observable<InvitatoDTO[]> {
    return this.http.get<InvitatoDTO[]>(this.apiUrl);
  }

  getInvitatiRiepilogo(): Observable<ListaInvitatiResponse> {
    return this.http.get<ListaInvitatiResponse>(`${this.apiUrl}/riepilogo`).pipe(
      tap(response => this.invitatiSignal.set(response))
    );
  }

  getInvitato(id: string): Observable<InvitatoDTO> {
    return this.http.get<InvitatoDTO>(`${this.apiUrl}/${id}`);
  }

  creaInvitato(request: CreaInvitatoRequest): Observable<IdResponse> {
    return this.http.post<IdResponse>(this.apiUrl, request);
  }

  aggiornaInvitato(id: string, request: AggiornaInvitatoRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }

  eliminaInvitato(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  inviaInviti(request: InviaInvitiRequest): Observable<InvioInvitiResponse> {
    return this.http.post<InvioInvitiResponse>(`${this.apiUrl}/invia`, request);
  }

  confermaInvioWhatsapp(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/conferma-invio-whatsapp`, {});
  }

  clearCache(): void {
    this.invitatiSignal.set(null);
  }
}
