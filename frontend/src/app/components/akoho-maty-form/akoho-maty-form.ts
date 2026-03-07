import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LotsServices } from '../../services/lots-services';
import { AkohoMatyService } from '../../services/akoho-maty.service';
import { Lots } from '../../models/lot.models';
import { AkohoMaty } from '../../models/akoho-maty.model';

@Component({
  selector: 'app-akoho-maty-form',
  templateUrl: './akoho-maty-form.html',
  styleUrls: ['./akoho-maty-form.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class AkohoMatyForm implements OnInit {
  lots: Lots[] = [];
  akohoMatyForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';

  @Output() akohoMatyCreated = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private lotsService: LotsServices,
    private akohoMatyService: AkohoMatyService
  ) {
    this.akohoMatyForm = this.fb.group({
      lot_id: [0, Validators.required],
      date_maty: ['', Validators.required],
      nombre: [0, Validators.required]
    });
  }

  ngOnInit(): void {
    this.lotsService.getAllLots().subscribe({
      next: (data: Lots[]) => this.lots = data,
      error: (err: any) => console.error('Erreur récupération lots', err)
    });
  }

  onSubmit(): void {
    if (this.akohoMatyForm.valid) {
      this.errorMessage = '';
      this.successMessage = '';
      
      this.akohoMatyService.create(this.akohoMatyForm.value as AkohoMaty).subscribe({
        next: (res: any) => {
          console.log('Akoho Maty créé:', res);
          this.successMessage = res.message || 'Akoho Maty créé avec succès !';
          this.akohoMatyForm.reset({
            lot_id: 0,
            date_maty: '',
            nombre: 0
          });
          this.akohoMatyCreated.emit();
          
          // Effacer le message de succès après 3 secondes
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (err: any) => {
          console.error('Erreur création akoho maty:', err);
          
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
              this.errorMessage = 'Erreur lors de la création de l\'akoho maty.';
            }
          } else if (err.message) {
            this.errorMessage = err.message;
          } else {
            this.errorMessage = 'Erreur lors de la création de l\'akoho maty.';
          }
        }
      });
    } else {
      this.errorMessage = 'Veuillez remplir tous les champs requis.';
    }
  }
}
