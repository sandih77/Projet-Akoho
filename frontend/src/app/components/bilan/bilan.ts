import { Component, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { Lots } from '../../models/lot.models';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LotsServices } from '../../services/lots-services';
import { BilanService, BilanData } from '../../services/bilan.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bilan',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './bilan.html',
  styleUrl: './bilan.css',
})
export class Bilan {
  lots: Lots[] = [];
  bilanForm: FormGroup;
  bilanData: BilanData | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';
  @Output() bilanOut = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private lotsService: LotsServices,
    private bilanService: BilanService,
    private cdr: ChangeDetectorRef
  ) {
    this.bilanForm = this.fb.group({
      lot_id: [0, Validators.required],
      date_bilan:['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.lotsService.getAllLots().subscribe({
      next: (data : Lots[]) => { this.lots = data; this.cdr.detectChanges(); },
      error: (err: any) => { console.error('Erreur récupération lots', err); this.cdr.detectChanges(); }
    });
  }

  onSubmit(): void {
    if (this.bilanForm.valid) {
      const formValue = this.bilanForm.value;
      
      if (formValue.lot_id === 0) {
        this.errorMessage = 'Veuillez sélectionner un lot';
        return;
      }

      this.isLoading = true;
      this.errorMessage = '';
      this.bilanData = null;

      this.bilanService.getBilanByLotAndDate(formValue.lot_id, formValue.date_bilan).subscribe({
        next: (data: BilanData) => {
          this.bilanData = data;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error('Erreur récupération bilan', err);
          
          // Extraire le message d'erreur du backend
          let errorMsg = 'Erreur lors de la récupération du bilan. Veuillez réessayer.';
          
          if (err.error) {
            if (typeof err.error === 'string') {
              errorMsg = err.error;
            } else if (err.error.details) {
              errorMsg = err.error.details;
            } else if (err.error.error) {
              errorMsg = err.error.error;
            } else if (err.error.message) {
              errorMsg = err.error.message;
            }
          } else if (err.message) {
            errorMsg = err.message;
          }
          
          this.errorMessage = errorMsg;
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.errorMessage = 'Veuillez remplir tous les champs requis';
    }
  }
}
