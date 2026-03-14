import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LotsServices } from '../../services/lots-services';
import { AkohoMatyService } from '../../services/akoho-maty.service';
import { Lots } from '../../models/lot.models';
import { AkohoMaty } from '../../models/akoho-maty.model';
import { extractHttpErrorMessage } from '../../utils/http-error-message';

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
    private akohoMatyService: AkohoMatyService,
    private cdr: ChangeDetectorRef
  ) {
    this.akohoMatyForm = this.fb.group({
      lot_id: [0, Validators.required],
      date_maty: ['', Validators.required],
      nombre: [0, Validators.required],
      nombre_lahy: [0, Validators.required],
      nombre_vavy: [0, Validators.required]
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
            nombre: 0,
            nombre_lahy: 0,
            nombre_vavy: 0
          });
          this.akohoMatyCreated.emit();
          this.cdr.detectChanges();

          // Effacer le message de succès après 3 secondes
          setTimeout(() => {
            this.successMessage = '';
            this.cdr.detectChanges();
          }, 3000);
        },
        error: (err: any) => {
          this.errorMessage = extractHttpErrorMessage(err, 'Erreur lors de la creation de l\'akoho maty.');
          this.cdr.detectChanges();
        }
      });
    } else {
      this.errorMessage = 'Veuillez remplir tous les champs requis.';
    }
  }
}
