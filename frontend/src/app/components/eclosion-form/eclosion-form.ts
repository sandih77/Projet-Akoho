import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LotsServices } from '../../services/lots-services';
import { EclosionService } from '../../services/eclosion.service';
import { Lots } from '../../models/lot.models';
import { Eclosion } from '../../models/eclosion.model';

@Component({
  selector: 'app-eclosion-form',
  templateUrl: './eclosion-form.html',
  styleUrls: ['./eclosion-form.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class EclosionForm implements OnInit {
  lots: Lots[] = [];
  eclosionForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';

  @Output() eclosionCreated = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private lotsService: LotsServices,
    private eclosionService: EclosionService
  ) {
    this.eclosionForm = this.fb.group({
      lot_id: [0, Validators.required],
      date_eclosion: ['', Validators.required],
      nombre_foy: [0, Validators.required],
      nombre_tsy_foy: [0, Validators.required]
    });
  }

  ngOnInit(): void {
    this.lotsService.getAllLots().subscribe({
      next: (data: Lots[]) => this.lots = data,
      error: (err: any) => console.error('Erreur récupération lots', err)
    });
  }

  onSubmit(): void {
    if (this.eclosionForm.valid) {
      this.errorMessage = '';
      this.successMessage = '';
      
      this.eclosionService.create(this.eclosionForm.value as Eclosion).subscribe({
        next: (res: any) => {
          console.log('Eclosion créée:', res);
          this.successMessage = res.message || 'Eclosion créée avec succès !';
          this.eclosionForm.reset({
            lot_id: 0,
            date_eclosion: '',
            nombre_foy: 0,
            nombre_tsy_foy: 0
          });
          this.eclosionCreated.emit();
          
          // Effacer le message de succès après 3 secondes
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (err: any) => {
          console.error('Erreur création eclosion:', err);
          
          // Extraire le message d'erreur du backend
          if (err.error) {
            if (typeof err.error === 'string') {
              this.errorMessage = err.error;
            } else if (err.error.details) {
              this.errorMessage = err.error.details;
            } else if (err.error.error) {
              this.errorMessage = err.error.error;
            } else if (err.error.message) {
              this.errorMessage = err.error.message;
            } else {
              this.errorMessage = 'Erreur lors de la création de l\'eclosion.';
            }
          } else if (err.message) {
            this.errorMessage = err.message;
          } else {
            this.errorMessage = 'Erreur lors de la création de l\'eclosion.';
          }
        }
      });
    } else {
      this.errorMessage = 'Veuillez remplir tous les champs requis.';
    }
  }
}
