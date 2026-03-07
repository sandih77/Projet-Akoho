import { Component, OnInit } from '@angular/core';
import { AkohoMaty } from '../../models/akoho-maty.model';
import { AkohoMatyService } from '../../services/akoho-maty.service';
import { CommonModule } from '@angular/common';
import { AkohoMatyForm } from '../akoho-maty-form/akoho-maty-form';

@Component({
  selector: 'app-akoho-maty-manager',
  imports: [CommonModule, AkohoMatyForm],
  templateUrl: './akoho-maty-manager.html',
  styleUrl: './akoho-maty-manager.css',
})
export class AkohoMatyManager implements OnInit {
  akohoMatyList: AkohoMaty[] = [];
  message = '';

  constructor(private akohoMatyService: AkohoMatyService) { }

  ngOnInit(): void {
    this.loadAkohoMaty();
  }

  loadAkohoMaty(): void {
    this.akohoMatyService.getAll().subscribe({
      next: (data) => {
        this.akohoMatyList = data;
      },
      error: (err) => {
        console.error('Erreur récupération akoho maty:', err);
      }
    });
  }

  onAkohoMatyCreated(): void {
    this.message = 'Mortalité enregistrée avec succès !';
    this.loadAkohoMaty();
    setTimeout(() => {
      this.message = '';
    }, 3000);
  }
}
