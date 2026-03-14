import { Component, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RaceService } from '../../services/race.services';
import { extractHttpErrorMessage } from '../../utils/http-error-message';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-race-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './race-form.html',
  styleUrls: ['./race-form.css'],
})

export class RaceForm {
  raceForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  @Output() raceCreated = new EventEmitter<void>();

  constructor(private fb: FormBuilder, private raceService: RaceService, private cdr: ChangeDetectorRef) {
    this.raceForm = this.fb.group({
      'nom': ['', Validators.required],
      'pu_sakafo_par_gramme': [0, Validators.required],
      'pv_par_gramme': [0, Validators.required],
      'pu_atody': [0, Validators.required],
      'pourcentage_vavy': [0, Validators.required],
      'pourcentage_lamokany': [0, Validators.required],
      'capacite_pondre': [0, Validators.required],
      'duree_incubation': [0, Validators.required],
      'prix_achat': [0, Validators.required],
    });
  }

  onSubmit() {
    if (this.raceForm.valid) {
      this.errorMessage = '';
      this.successMessage = '';

      this.raceService.createRace(this.raceForm.value).subscribe({
        next: (res) => {
          this.successMessage = res?.message || 'Race creee avec succes !';
          this.raceForm.reset();
          this.raceCreated.emit();
          this.cdr.detectChanges();

          setTimeout(() => {
            this.successMessage = '';
            this.cdr.detectChanges();
          }, 3000);
        },
        error: (err) => {
          this.errorMessage = extractHttpErrorMessage(err, 'Erreur lors de la creation de la race.');
          this.cdr.detectChanges();
        }
      });
    } else {
      this.errorMessage = 'Veuillez remplir tous les champs requis.';
      this.cdr.detectChanges();
    }
  }
}
