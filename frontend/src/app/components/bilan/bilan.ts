import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BilanService, BilanData } from '../../services/bilan.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bilan',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './bilan.html',
  styleUrl: './bilan.css',
})
export class Bilan {
  dateForm: FormGroup;
  bilans: BilanData[] = [];
  selectedBilan: BilanData | null = null;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private bilanService: BilanService,
    private cdr: ChangeDetectorRef
  ) {
    const today = new Date().toISOString().split('T')[0];
    this.dateForm = this.fb.group({
      date_bilan: [today, Validators.required]
    });
  }

  onCalculer(): void {
    if (this.dateForm.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.bilans = [];
    this.selectedBilan = null;

    this.bilanService.getAllBilans(this.dateForm.value.date_bilan).subscribe({
      next: (data: BilanData[]) => {
        this.bilans = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        let msg = 'Erreur lors de la récupération des bilans.';
        if (err.error?.details) msg = err.error.details;
        else if (err.error?.error) msg = err.error.error;
        else if (err.message) msg = err.message;
        this.errorMessage = msg;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  voirDetails(bilan: BilanData): void {
    this.selectedBilan = bilan;
  }

  retourTableau(): void {
    this.selectedBilan = null;
  }
}
