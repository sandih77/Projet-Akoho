import { Component, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RaceService } from '../../services/race.services';

@Component({
  selector: 'app-race-form',
  imports: [ReactiveFormsModule],
  templateUrl: './race-form.html',
  styleUrls: ['./race-form.css'],
})

export class RaceForm {
  raceForm: FormGroup;
  @Output() raceCreated = new EventEmitter<void>();

  constructor(private fb: FormBuilder, private raceService: RaceService, private cdr: ChangeDetectorRef) {
    this.raceForm = this.fb.group({
      'nom': ['', Validators.required],
      'pu_sakafo_par_gramme': [0, Validators.required],
      'pv_par_gramme': [0, Validators.required],
      'pu_atody': [0, Validators.required]
    });
  }

  onSubmit() {
    if (this.raceForm.valid) {
      this.raceService.createRace(this.raceForm.value).subscribe({
        next: (res) => {
          console.log('Race créée:', res);
          this.raceForm.reset();
          this.raceCreated.emit();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Erreur lors de la création:', err);
          this.cdr.detectChanges();
        }
      });
    } else {
      console.log('Formulaire invalide !');
    }
  }
}
