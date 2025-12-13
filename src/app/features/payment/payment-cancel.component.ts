import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-payment-cancel',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="container">
        <div class="cancel-card text-center">
          <i class="bi bi-x-circle text-secondary" style="font-size: 5rem;"></i>
          <h2 class="mt-4">Pagamento annullato</h2>
          <p class="text-muted mb-4">
            Il pagamento è stato annullato. Non ti è stato addebitato nulla.
          </p>
          <a routerLink="/pagamento" class="btn btn-primary">
            <i class="bi bi-arrow-left me-2"></i>
            Torna al pagamento
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    .cancel-card {
      background: var(--color-surface);
      border-radius: 1rem;
      padding: 3rem;
      max-width: 500px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    }
    h2 {
      font-family: var(--font-display);
      color: var(--color-text);
    }
  `]
})
export class PaymentCancelComponent {}
