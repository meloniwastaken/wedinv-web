import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InvitoPubblicoResponse, ConfermaInvitoRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class InvitoPubblicoService {
  private readonly apiUrl = `${environment.apiUrl}/pubblico/invito`;

  // Cache per i dati dell'invito
  private cachedInvito = signal<InvitoPubblicoResponse | null>(null);
  private cachedInvitoId: string | null = null;

  constructor(private http: HttpClient) {}

  /**
   * Ottiene i dati dell'invito. Usa la cache se disponibile per lo stesso ID.
   */
  getInvito(id: string, forceRefresh = false): Observable<InvitoPubblicoResponse> {
    // Se abbiamo i dati in cache per lo stesso ID e non forziamo il refresh, usiamo la cache
    if (!forceRefresh && this.cachedInvitoId === id && this.cachedInvito()) {
      return of(this.cachedInvito()!);
    }

    return this.http.get<InvitoPubblicoResponse>(`${this.apiUrl}/${id}`).pipe(
      tap(invito => {
        this.cachedInvito.set(invito);
        this.cachedInvitoId = id;
      })
    );
  }

  /**
   * Ottiene i dati dell'invito dalla cache (senza chiamata API).
   * Ritorna null se non ci sono dati in cache.
   */
  getCachedInvito(): InvitoPubblicoResponse | null {
    return this.cachedInvito();
  }

  /**
   * Ottiene l'ID dell'invito in cache
   */
  getCachedInvitoId(): string | null {
    return this.cachedInvitoId;
  }

  /**
   * Pulisce la cache
   */
  clearCache(): void {
    this.cachedInvito.set(null);
    this.cachedInvitoId = null;
  }

  confermaInvito(id: string, request: ConfermaInvitoRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/conferma`, request).pipe(
      tap(() => {
        // Invalida la cache dopo la conferma per forzare il refresh
        if (this.cachedInvitoId === id) {
          this.cachedInvito.set(null);
        }
      })
    );
  }

  /**
   * Costruisce l'URL per la foto dell'invito
   */
  getFotoInvitoUrl(matrimonioId: string): string {
    return `${this.apiUrl}/matrimonio/${matrimonioId}/foto`;
  }
}
