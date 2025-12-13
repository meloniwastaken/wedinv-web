import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InvitoPubblicoResponse, ConfermaInvitoRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class InvitoPubblicoService {
  private readonly apiUrl = `${environment.apiUrl}/pubblico/invito`;

  constructor(private http: HttpClient) {}

  getInvito(id: string): Observable<InvitoPubblicoResponse> {
    return this.http.get<InvitoPubblicoResponse>(`${this.apiUrl}/${id}`);
  }

  confermaInvito(id: string, request: ConfermaInvitoRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/conferma`, request);
  }
}
