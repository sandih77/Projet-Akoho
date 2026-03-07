import { Component, OnInit } from '@angular/core';
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

  constructor(private eclosionService: EclosionService) { }

  ngOnInit(): void {
    this.loadEclosion();
  }

  loadEclosion(): void {
    this.eclosionService.getAll().subscribe({
      next: (data) => {
        this.eclosionList = data;
      },
      error: (err) => {
        console.error('Erreur récupération eclosion:', err);
      }
    });
  }

  onEclosionCreated(): void {
    this.message = 'Éclosion enregistrée avec succès !';
    this.loadEclosion();
    setTimeout(() => {
      this.message = '';
    }, 3000);
  }
}
