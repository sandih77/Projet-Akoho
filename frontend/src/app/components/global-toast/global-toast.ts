import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiFeedbackKind, UiFeedbackService } from '../../services/ui-feedback.service';

@Component({
  selector: 'app-global-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './global-toast.html',
  styleUrl: './global-toast.css'
})
export class GlobalToast {
  constructor(public feedback: UiFeedbackService) {}

  dismiss(id: number): void {
    this.feedback.dismiss(id);
  }

  trackById(_index: number, item: { id: number }): number {
    return item.id;
  }

  getTitle(kind: UiFeedbackKind): string {
    if (kind === 'success') {
      return 'Succes';
    }

    if (kind === 'info') {
      return 'Information';
    }

    return 'Erreur';
  }

  getIcon(kind: UiFeedbackKind): string {
    if (kind === 'success') {
      return 'fa-check-circle';
    }

    if (kind === 'info') {
      return 'fa-circle-info';
    }

    return 'fa-triangle-exclamation';
  }
}
