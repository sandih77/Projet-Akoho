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
      this.akohoMatyService.create(this.akohoMatyForm.value as AkohoMaty).subscribe({
        next: (res: any) => {
          console.log('Akoho Maty créé:', res);
          this.akohoMatyForm.reset({
            lot_id: 0,
            date_maty: '',
            nombre: 0
          });
          this.akohoMatyCreated.emit();
        },
        error: (err: any) => console.error('Erreur création akoho maty:', err)
      });
    } else {
      console.log('Formulaire invalide !');
    }
  }
}
