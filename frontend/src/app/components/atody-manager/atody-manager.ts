import { Component, OnInit } from '@angular/core';
import { Atody } from '../../models/atody.model';
import { AtodyService } from '../../services/atody.service';
import { CommonModule } from '@angular/common';
import { AtodyForm } from '../atody-form/atody-form';

@Component({
  selector: 'app-atody-manager',
  imports: [CommonModule, AtodyForm],
  templateUrl: './atody-manager.html',
  styleUrl: './atody-manager.css',
})
export class AtodyManager implements OnInit {
  atodyList: Atody[] = [];
  message = '';

  constructor(private atodyService: AtodyService) { }

  ngOnInit(): void {
    this.loadAtody();
  }

  loadAtody(): void {
    this.atodyService.getAll().subscribe({
      next: (data) => {
        this.atodyList = data;
      },
      error: (err) => {
        console.error('Erreur récupération atody:', err);
      }
    });
  }

  onAtodyCreated(): void {
    this.message = 'Production d\'œufs enregistrée avec succès !';
    this.loadAtody();
    setTimeout(() => {
      this.message = '';
    }, 3000);
  }
}
