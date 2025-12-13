import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services';

/**
 * Guard per route protette: richiede autenticazione E account attivo
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  if (!authService.isActive()) {
    router.navigate(['/pagamento']);
    return false;
  }

  return true;
};

/**
 * Guard per route guest (login/registrazione): blocca utenti già autenticati
 */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  // Se autenticato ma non attivo, vai a pagamento
  if (!authService.isActive()) {
    router.navigate(['/pagamento']);
    return false;
  }

  router.navigate(['/dashboard']);
  return false;
};

/**
 * Guard per pagina pagamento: richiede autenticazione ma NON account attivo
 */
export const paymentGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // Se già attivo, vai alla dashboard
  if (authService.isActive()) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
