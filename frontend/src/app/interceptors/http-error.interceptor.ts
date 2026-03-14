import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { UiFeedbackService } from '../services/ui-feedback.service';
import { extractHttpErrorMessage } from '../utils/http-error-message';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const feedback = inject(UiFeedbackService);
  const skipGlobalNotification = req.headers.get('x-skip-global-error') === 'true';

  return next(req).pipe(
    catchError((error: unknown) => {
      if (!skipGlobalNotification) {
        const message = extractHttpErrorMessage(error);
        feedback.error(message);
      }

      return throwError(() => error);
    })
  );
};
