import { Component, EventEmitter, Output } from '@angular/core';
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

  constructor(private fb: FormBuilder, private raceService: RaceService) {
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
        },
        error: (err) => {
          console.error('Erreur lors de la création:', err);
        }
      });
    } else {
      console.log('Formulaire invalide !');
    }
  }
}
