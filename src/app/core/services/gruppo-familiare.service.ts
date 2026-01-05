import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  GruppoFamiliareDTO,
  CreaGruppoFamiliareRequest,
  AggiornaGruppoFamiliareRequest
} from '../models';
import { IdResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class GruppoFamiliareService {
  private readonly apiUrl = `${environment.apiUrl}/gruppo-familiare`;

  constructor(private http: HttpClient) {}

  getGruppiFamiliari(): Observable<GruppoFamiliareDTO[]> {
    return this.http.get<GruppoFamiliareDTO[]>(this.apiUrl);
  }

  getGruppoFamiliare(id: string): Observable<GruppoFamiliareDTO> {
    return this.http.get<GruppoFamiliareDTO>(`${this.apiUrl}/${id}`);
  }

  creaGruppoFamiliare(request: CreaGruppoFamiliareRequest): Observable<IdResponse> {
    return this.http.post<IdResponse>(this.apiUrl, request);
  }

  aggiornaGruppoFamiliare(id: string, request: AggiornaGruppoFamiliareRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }

  eliminaGruppoFamiliare(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
