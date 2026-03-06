import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-lots-form',
  templateUrl: './lots-form.html',
  styleUrls: ['./lots-form.css']
})
export class LotsForm {
  lotsForm: FormGroup;

  constructor(private fb: FormBuilder) {
    // Initialisation du formulaire avec des champs et validation simple
    this.lotsForm = this.fb.group({
      'date-achat': ['', Validators.required],
      'nbr-akoho': [0, Validators.required],
      age: [0, Validators.required],
      'prix-achat': [0, Validators.required]
    });
  }

  onSubmit() {
    if (this.lotsForm.valid) {
      console.log('Données du formulaire:', this.lotsForm.value);
      // Ici, tu peux appeler ton API Node.js pour envoyer les données
    } else {
      console.log('Formulaire invalide !');
    }
  }
}