import { Component, OnInit } from '@angular/core';
import { Lots } from '../../models/lot.models';
import { LotsServices } from '../../services/lots-services';
import { CommonModule } from '@angular/common';
import { LotsForm } from '../lots-form/lots-form';

@Component({
  selector: 'app-lots-manager',
  imports: [CommonModule, LotsForm],
  templateUrl: './lots-manager.html',
  styleUrl: './lots-manager.css',
})
export class LotsManager implements OnInit {
  lots: Lots[] = [];
  message = '';

  constructor(private lotsService: LotsServices) { }

  ngOnInit(): void {
    this.loadLots();
  }

  loadLots(): void {
    this.lotsService.getAllLots().subscribe({
      next: (data) => {
        this.lots = data;
      },
      error: (err) => {
        console.error('Erreur récupération lots:', err);
      }
    });
  }

  onLotCreated(): void {
    this.message = 'Lot créé avec succès !';
    // Recharger la liste pour avoir les IDs corrects
    this.loadLots();
    // Effacer le message après 3 secondes
    setTimeout(() => {
      this.message = '';
    }, 3000);
  }
}