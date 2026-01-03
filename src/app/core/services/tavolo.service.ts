import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  TavoloDTO,
  PersonaTavoloDTO,
  CreaTavoloRequest,
  AggiornaTavoloRequest,
  AssegnaPersonaTavoloRequest,
  ListaTavoliResponse,
  SuggerimentoTavoloDTO
} from '../models';
import { IdResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class TavoloService {
  private readonly apiUrl = `${environment.apiUrl}/tavolo`;

  private tavoliSignal = signal<TavoloDTO[]>([]);
  private personeAssegnabiliSignal = signal<PersonaTavoloDTO[]>([]);

  readonly tavoli = this.tavoliSignal.asReadonly();
  readonly personeAssegnabili = this.personeAssegnabiliSignal.asReadonly();

  constructor(private http: HttpClient) {}

  getTavoli(): Observable<ListaTavoliResponse> {
    return this.http.get<ListaTavoliResponse>(this.apiUrl).pipe(
      tap(response => this.tavoliSignal.set(response.tavoli || []))
    );
  }

  getTavolo(id: string): Observable<TavoloDTO> {
    return this.http.get<TavoloDTO>(`${this.apiUrl}/${id}`);
  }

  creaTavolo(request: CreaTavoloRequest): Observable<IdResponse> {
    return this.http.post<IdResponse>(this.apiUrl, request);
  }

  aggiornaTavolo(id: string, request: AggiornaTavoloRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }

  aggiornaPosizioneTavolo(id: string, posX: number, posY: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/posizione`, null, {
      params: { posX: posX.toString(), posY: posY.toString() }
    });
  }

  aggiornaDimensioneTavolo(id: string, larghezza: number, altezza: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/dimensione`, null, {
      params: { larghezza: larghezza.toString(), altezza: altezza.toString() }
    });
  }

  eliminaTavolo(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  assegnaPersonaATavolo(tavoloId: string, request: AssegnaPersonaTavoloRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${tavoloId}/persona`, request);
  }

  rimuoviPersonaDaTavolo(tavoloId: string, personaId: string, accompagnatore: boolean): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${tavoloId}/persona/${personaId}`, {
      params: { accompagnatore: accompagnatore.toString() }
    });
  }

  aggiornaPosizionePersonaSuTavolo(tavoloId: string, personaId: string, accompagnatore: boolean, posX: number, posY: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${tavoloId}/persona/${personaId}/posizione`, null, {
      params: {
        accompagnatore: accompagnatore.toString(),
        posX: posX.toString(),
        posY: posY.toString()
      }
    });
  }

  getPersoneAssegnabili(): Observable<PersonaTavoloDTO[]> {
    return this.http.get<PersonaTavoloDTO[]>(`${this.apiUrl}/persone/assegnabili`).pipe(
      tap(response => this.personeAssegnabiliSignal.set(response))
    );
  }

  getTutteLePersone(): Observable<PersonaTavoloDTO[]> {
    return this.http.get<PersonaTavoloDTO[]>(`${this.apiUrl}/persone/tutte`);
  }

  suggerisciDisposizione(redistribuireTutti: boolean = false): Observable<SuggerimentoTavoloDTO[]> {
    return this.http.get<SuggerimentoTavoloDTO[]>(`${this.apiUrl}/suggerisci-disposizione`, {
      params: { redistribuireTutti: redistribuireTutti.toString() }
    });
  }

  clearCache(): void {
    this.tavoliSignal.set([]);
    this.personeAssegnabiliSignal.set([]);
  }
}
