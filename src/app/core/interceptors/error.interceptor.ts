import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ErrorModalService } from '../services/error-modal.service';

interface ErrorResponse {
  timestamp: string;
  status: number;
  code: number;
  error: string;
  messages: string[];
  path: string;
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorModalService = inject(ErrorModalService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Ignora 401 (gestito da auth interceptor)
      if (error.status === 401) {
        return throwError(() => error);
      }

      // Errori 422 (bloccanti e non bloccanti) - mostra messaggio specifico
      if (error.status === 422) {
        const errorBody = error.error as ErrorResponse;

        if (errorBody && errorBody.messages && errorBody.messages.length > 0) {
          const title = errorBody.error || 'Errore';

          if (errorBody.messages.length === 1) {
            errorModalService.showError(errorBody.messages[0], title);
          } else {
            errorModalService.showErrors(errorBody.messages, title);
          }
        }
      } else {
        // Tutti gli altri errori - mostra messaggio generico
        errorModalService.showError(
          'Errore durante l\'operazione: se il problema persiste, contattare l\'assistenza',
          'Errore'
        );
      }

      return throwError(() => error);
    })
  );
};
