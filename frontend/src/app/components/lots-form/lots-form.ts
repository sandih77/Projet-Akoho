import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RaceService } from '../../services/race.services';
import { LotsServices } from '../../services/lots-services';
import { Race } from '../../models/race.model';
import { Lots } from '../../models/lot.models';
import { extractHttpErrorMessage } from '../../utils/http-error-message';

@Component({
  selector: 'app-lots-form',
  templateUrl: './lots-form.html',
  styleUrls: ['./lots-form.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class LotsForm implements OnInit {
  races: Race[] = [];
  lotsForm: FormGroup;
  errorMessage = '';
  successMessage = '';

  @Output() lotCreated = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private raceService: RaceService,
    private lotService: LotsServices, // ← correspond à ton service
    private cdr: ChangeDetectorRef
  ) {
    this.lotsForm = this.fb.group({
      name: ['', Validators.required],
      race_id: [0, Validators.required],
      date_achat: ['', Validators.required],
      nombre_akoho: [0, Validators.required],
      age: [0, Validators.required],
      prix_achat: [0, Validators.required],
      poids_initial: [0, Validators.required],
      nombre_lahy: [0, Validators.required],
      nombre_vavy: [0, Validators.required]
    });
  }

  ngOnInit(): void {
    this.raceService.getAllRaces().subscribe({
      next: (data: Race[]) => { this.races = data; this.cdr.detectChanges(); },
      error: (err: any) => {
        this.errorMessage = extractHttpErrorMessage(err, 'Impossible de charger les races.');
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit(): void {
    if (this.lotsForm.valid) {
      this.errorMessage = '';
      this.successMessage = '';

      this.lotService.create(this.lotsForm.value as Lots).subscribe({
        next: (res: any) => {
          this.successMessage = res?.message || 'Lot cree avec succes !';
          this.lotsForm.reset({
            name: '',
            race_id: 0,
            date_achat: '',
            nombre_akoho: 0,
            age: 0,
            prix_achat: 0,
            poids_initial: 0,
            nombre_lahy: 0,
            nombre_vavy: 0
          });
          this.lotCreated.emit();
          this.cdr.detectChanges();

          setTimeout(() => {
            this.successMessage = '';
            this.cdr.detectChanges();
          }, 3000);
        },
        error: (err: any) => {
          this.errorMessage = extractHttpErrorMessage(err, 'Erreur lors de la creation du lot.');
          this.cdr.detectChanges();
        }
      });
    } else {
      this.errorMessage = 'Veuillez remplir tous les champs requis.';
      this.cdr.detectChanges();
    }
  }
}