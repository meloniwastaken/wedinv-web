import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { PaymentService, AuthService } from '../../core/services';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="success-card text-center">
        @if (loading()) {
          <div class="spinner-border text-primary mb-4" style="width: 4rem; height: 4rem;"></div>
          <h2>Verifica pagamento in corso...</h2>
          <p class="text-muted">Attendere prego</p>
        } @else if (error()) {
          <i class="bi bi-exclamation-circle text-warning" style="font-size: 5rem;"></i>
          <h2 class="mt-4">Verifica in corso</h2>
          <p class="text-muted mb-4">
            Il pagamento potrebbe richiedere qualche istante per essere confermato.
            Se hai completato il pagamento, riprova tra qualche secondo.
          </p>
          <button class="btn btn-primary" (click)="checkStatus()">
            <i class="bi bi-arrow-clockwise me-2"></i>
            Riprova
          </button>
        } @else {
          <i class="bi bi-check-circle-fill text-success" style="font-size: 5rem;"></i>
          <h2 class="mt-4">Pagamento completato!</h2>
          <p class="text-muted mb-4">
            Il tuo account è stato attivato con successo.
            Verrai reindirizzato alla dashboard tra pochi secondi...
          </p>
          <p class="text-muted small mb-4">
            Reindirizzamento in {{ countdown() }} secondi
          </p>
          <a routerLink="/dashboard" class="btn btn-primary btn-lg">
            <i class="bi bi-house me-2"></i>
            Vai alla Dashboard
          </a>
        }
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
    .success-card {
      background: var(--color-surface);
      border-radius: 1rem;
      padding: 3rem;
      max-width: 500px;
      width: 100%;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    }
    h2 {
      font-family: var(--font-display);
      color: var(--color-primary);
    }
  `]
})
export class PaymentSuccessComponent implements OnInit {
  loading = signal(true);
  error = signal(false);
  countdown = signal(3);

  private countdownInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private paymentService: PaymentService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkStatus();
  }

  checkStatus(): void {
    this.loading.set(true);
    this.error.set(false);

    this.paymentService.getPaymentStatus().subscribe({
      next: (isActive) => {
        this.loading.set(false);
        if (isActive) {
          this.authService.updateUserActiveStatus(true);
          this.startCountdownAndRedirect();
        } else {
          this.error.set(true);
        }
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      }
    });
  }

  private startCountdownAndRedirect(): void {
    this.countdown.set(3);
    this.countdownInterval = setInterval(() => {
      const current = this.countdown();
      if (current <= 1) {
        if (this.countdownInterval) {
          clearInterval(this.countdownInterval);
        }
        this.router.navigate(['/dashboard']);
      } else {
        this.countdown.set(current - 1);
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
}
