import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CheckoutSessionResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly apiUrl = `${environment.apiUrl}/payment`;

  constructor(private http: HttpClient) {}

  createCheckoutSession(): Observable<CheckoutSessionResponse> {
    return this.http.post<CheckoutSessionResponse>(`${this.apiUrl}/checkout`, {});
  }

  getPaymentStatus(): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/status`);
  }
}
