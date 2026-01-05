import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FotoEventoListResponse, FotoEventoAdminResponse, UploadFotoEventoRequest, IdResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class FotoEventoService {
  private readonly apiUrl = `${environment.apiUrl}/pubblico/invito`;

  constructor(private http: HttpClient) {}

  /**
   * Recupera tutte le foto dell'evento per l'invitato.
   */
  getFotoEvento(invitatoId: string): Observable<FotoEventoListResponse> {
    return this.http.get<FotoEventoListResponse>(`${this.apiUrl}/${invitatoId}/foto-evento`);
  }

  /**
   * Carica una nuova foto dell'evento.
   */
  uploadFoto(invitatoId: string, request: UploadFotoEventoRequest): Observable<IdResponse> {
    return this.http.post<IdResponse>(`${this.apiUrl}/${invitatoId}/foto-evento`, request);
  }

  /**
   * Elimina una foto dell'evento.
   */
  deleteFoto(invitatoId: string, fotoId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${invitatoId}/foto-evento/${fotoId}`);
  }

  // ==================== ADMIN METHODS ====================

  private readonly adminApiUrl = `${environment.apiUrl}/foto-evento`;

  /**
   * Recupera tutte le foto dell'evento per gli sposi (admin).
   */
  getFotoEventoAdmin(): Observable<FotoEventoAdminResponse> {
    return this.http.get<FotoEventoAdminResponse>(this.adminApiUrl);
  }

  /**
   * Carica una foto come sposi (admin).
   */
  uploadFotoSposi(request: UploadFotoEventoRequest): Observable<IdResponse> {
    return this.http.post<IdResponse>(this.adminApiUrl, request);
  }

  /**
   * Elimina una foto (admin - può eliminare qualsiasi foto).
   */
  deleteFotoAdmin(fotoId: string): Observable<void> {
    return this.http.delete<void>(`${this.adminApiUrl}/${fotoId}`);
  }
}
