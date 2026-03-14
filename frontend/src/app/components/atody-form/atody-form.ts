import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LotsServices } from '../../services/lots-services';
import { AtodyService } from '../../services/atody.service';
import { Lots } from '../../models/lot.models';
import { Atody } from '../../models/atody.model';
import { extractHttpErrorMessage } from '../../utils/http-error-message';

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
  errorMessage: string = '';
  successMessage: string = '';

  @Output() atodyCreated = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private lotsService: LotsServices,
    private atodyService: AtodyService,
    private cdr: ChangeDetectorRef
  ) {
    this.atodyForm = this.fb.group({
      lot_id: [0, Validators.required],
      date_production: ['', Validators.required],
      nombre_atody: [0, Validators.required]
    });
  }

  ngOnInit(): void {
    this.lotsService.getAllLots().subscribe({
      next: (data: Lots[]) => { this.lots = data; this.cdr.detectChanges(); },
      error: (err: any) => {
        this.errorMessage = extractHttpErrorMessage(err, 'Impossible de charger les lots.');
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit(): void {
    if (this.atodyForm.valid) {
      this.errorMessage = '';
      this.successMessage = '';

      this.atodyService.create(this.atodyForm.value as Atody).subscribe({
        next: (res: any) => {
          console.log('Atody créé:', res);
          this.successMessage = res.message || 'Atody créé avec succès !';
          this.atodyForm.reset({
            lot_id: 0,
            date_production: '',
            nombre_atody: 0
          });
          this.atodyCreated.emit();
          this.cdr.detectChanges();

          // Effacer le message de succès après 3 secondes
          setTimeout(() => {
            this.successMessage = '';
            this.cdr.detectChanges();
          }, 3000);
        },
        error: (err: any) => {
          this.errorMessage = extractHttpErrorMessage(err, 'Erreur lors de la creation de l\'atody.');
          this.cdr.detectChanges();
        }
      });
    } else {
      this.errorMessage = 'Veuillez remplir tous les champs requis.';
    }
  }
}
