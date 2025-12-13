import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentService, AuthService } from '../../core/services';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent {
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private paymentService: PaymentService,
    private authService: AuthService
  ) {}

  proceedToCheckout(): void {
    this.loading.set(true);
    this.error.set(null);

    this.paymentService.createCheckoutSession().subscribe({
      next: (response) => {
        // Redirect to Stripe Checkout
        window.location.href = response.checkoutUrl;
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Errore durante la creazione del pagamento');
        this.loading.set(false);
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
