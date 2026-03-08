import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Eclosion } from '../../models/eclosion.model';
import { EclosionService } from '../../services/eclosion.service';
import { CommonModule } from '@angular/common';
import { EclosionForm } from '../eclosion-form/eclosion-form';

@Component({
  selector: 'app-eclosion-manager',
  imports: [CommonModule, EclosionForm],
  templateUrl: './eclosion-manager.html',
  styleUrl: './eclosion-manager.css',
})
export class EclosionManager implements OnInit {
  eclosionList: Eclosion[] = [];
  message = '';

  constructor(private eclosionService: EclosionService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadEclosion();
  }

  loadEclosion(): void {
    this.eclosionService.getAll().subscribe({
      next: (data) => {
        this.eclosionList = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur récupération eclosion:', err);
        this.cdr.detectChanges();
      }
    });
  }

  onEclosionCreated(): void {
    this.loadEclosion();
  }
}
