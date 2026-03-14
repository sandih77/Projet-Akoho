import { Injectable, signal } from '@angular/core';

export type UiFeedbackKind = 'error' | 'success' | 'info';

export interface UiFeedbackMessage {
  id: number;
  kind: UiFeedbackKind;
  text: string;
}

@Injectable({
  providedIn: 'root'
})
export class UiFeedbackService {
  private nextId = 1;
  private readonly _messages = signal<UiFeedbackMessage[]>([]);

  readonly messages = this._messages.asReadonly();

  show(kind: UiFeedbackKind, text: string, ttlMs = 7000): void {
    const trimmedText = text?.trim();
    if (!trimmedText) {
      return;
    }

    const message: UiFeedbackMessage = {
      id: this.nextId++,
      kind,
      text: trimmedText
    };

    this._messages.update((current) => [...current, message]);

    if (ttlMs > 0) {
      setTimeout(() => {
        this.dismiss(message.id);
      }, ttlMs);
    }
  }

  error(text: string, ttlMs = 9000): void {
    this.show('error', text, ttlMs);
  }

  success(text: string, ttlMs = 5000): void {
    this.show('success', text, ttlMs);
  }

  info(text: string, ttlMs = 5000): void {
    this.show('info', text, ttlMs);
  }

  dismiss(id: number): void {
    this._messages.update((current) => current.filter((message) => message.id !== id));
  }

  clear(): void {
    this._messages.set([]);
  }
}
