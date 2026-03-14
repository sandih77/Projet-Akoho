import { HttpErrorResponse } from '@angular/common/http';

export function extractHttpErrorMessage(
  error: unknown,
  fallback = 'Une erreur est survenue pendant la communication avec le serveur.'
): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'Impossible de joindre le serveur. Verifiez que le backend est demarre.';
    }

    if (typeof error.error === 'string' && error.error.trim()) {
      return error.error.trim();
    }

    if (error.error && typeof error.error === 'object') {
      const payload = error.error as Record<string, unknown>;
      const details = payload['details'];
      const apiError = payload['error'];
      const message = payload['message'];

      if (typeof details === 'string' && details.trim()) {
        return details.trim();
      }

      if (typeof apiError === 'string' && apiError.trim()) {
        return apiError.trim();
      }

      if (typeof message === 'string' && message.trim()) {
        return message.trim();
      }
    }

    if (typeof error.message === 'string' && error.message.trim()) {
      return error.message.trim();
    }
  }

  if (typeof error === 'string' && error.trim()) {
    return error.trim();
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const maybeMessage = (error as { message?: unknown }).message;
    if (typeof maybeMessage === 'string' && maybeMessage.trim()) {
      return maybeMessage.trim();
    }
  }

  return fallback;
}
