import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services';

@Component({
  selector: 'app-verifica-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="verification-card text-center">
        @if (loading()) {
          <div class="spinner-border text-primary mb-4" style="width: 4rem; height: 4rem;"></div>
          <h2>Verifica in corso...</h2>
          <p class="text-muted">Attendere prego</p>
        } @else if (success()) {
          <i class="bi bi-check-circle-fill text-success" style="font-size: 5rem;"></i>
          <h2 class="mt-4">Email verificata!</h2>
          <p class="text-muted mb-4">
            Il tuo indirizzo email è stato confermato con successo.
            Ora puoi accedere al tuo account.
          </p>
          <a routerLink="/login" class="btn btn-primary btn-lg">
            <i class="bi bi-box-arrow-in-right me-2"></i>
            Vai al Login
          </a>
        } @else {
          <i class="bi bi-exclamation-circle text-danger" style="font-size: 5rem;"></i>
          <h2 class="mt-4">Verifica fallita</h2>
          <p class="text-muted mb-4">
            {{ errorMessage() }}
          </p>
          <a routerLink="/login" class="btn btn-outline-primary">
            <i class="bi bi-arrow-left me-2"></i>
            Torna al Login
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
      background: linear-gradient(135deg, var(--color-background) 0%, var(--color-surface) 100%);
    }
    .verification-card {
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
export class VerificaEmailComponent implements OnInit {
  loading = signal(true);
  success = signal(false);
  errorMessage = signal('Il link di verifica non è valido o è scaduto.');

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');

    if (!token) {
      this.loading.set(false);
      this.errorMessage.set('Token di verifica mancante.');
      return;
    }

    this.authService.verificaEmail(token).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
      },
      error: () => {
        this.loading.set(false);
        this.success.set(false);
      }
    });
  }
}
