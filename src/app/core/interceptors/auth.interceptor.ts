import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService, MatrimonioService } from '../services';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const matrimonioService = inject(MatrimonioService);
  const router = inject(Router);

  const token = authService.getToken();

  // Non aggiungere token per le richieste pubbliche
  const isPublicUrl = req.url.includes('/pubblico/') ||
                      req.url.includes('/login') ||
                      req.url.includes('/registrazione');

  let authReq = req;

  if (token && !isPublicUrl) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Gestisci 401 solo per richieste autenticate (non pubbliche)
      if (error.status === 401 && !isPublicUrl) {
        // Pulisci la cache del matrimonio
        matrimonioService.clearCache();
        // Effettua logout (include già il redirect a /login)
        authService.logout();
      }

      // Gestisci 403 (Forbidden) - redirect alla home
      if (error.status === 403) {
        matrimonioService.clearCache();
        authService.logout();
        router.navigate(['/']);
      }

      return throwError(() => error);
    })
  );
};
