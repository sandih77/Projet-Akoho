import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LotsServices } from '../../services/lots-services';
import { AtodyService } from '../../services/atody.service';
import { Lots } from '../../models/lot.models';
import { Atody } from '../../models/atody.model';

@Component({
  selector: 'app-atody-form',
  templateUrl: './atody-form.html',
  styleUrls: ['./atody-form.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class AtodyForm implements OnInit {
  lots: Lots[] = [];
  atodyForm: FormGroup;

  @Output() atodyCreated = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private lotsService: LotsServices,
    private atodyService: AtodyService
  ) {
    this.atodyForm = this.fb.group({
      lot_id: [0, Validators.required],
      date_production: ['', Validators.required],
      nombre_atody: [0, Validators.required]
    });
  }

  ngOnInit(): void {
    this.lotsService.getAllLots().subscribe({
      next: (data: Lots[]) => this.lots = data,
      error: (err: any) => console.error('Erreur récupération lots', err)
    });
  }

  onSubmit(): void {
    if (this.atodyForm.valid) {
      this.atodyService.create(this.atodyForm.value as Atody).subscribe({
        next: (res: any) => {
          console.log('Atody créé:', res);
          this.atodyForm.reset({
            lot_id: 0,
            date_production: '',
            nombre_atody: 0
          });
          this.atodyCreated.emit();
        },
        error: (err: any) => console.error('Erreur création atody:', err)
      });
    } else {
      console.log('Formulaire invalide !');
    }
  }
}
