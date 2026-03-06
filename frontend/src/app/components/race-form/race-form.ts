import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-race-form',
  imports: [ReactiveFormsModule],
  templateUrl: './race-form.html',
  styleUrl: './race-form.css',
})

export class RaceForm {
  raceForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.raceForm = this.fb.group({
      'nom': ['', Validators.required],
      'pu_sakafo_par_gramme': [0, Validators.required],
      'pv_par_gramme': [0, Validators.required],
      'pu_atody': [0, Validators.required]
    });
  }

  onSubmit() {
    if (this.raceForm.valid) {
      console.log('Données du formulaire:', this.raceForm.value);
      // Ici, tu peux appeler ton API Node.js pour envoyer les données
    } else {
      console.log('Formulaire invalide !');
    }
  }
}
