import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Eclosion } from '../../models/eclosion.model';
import { EclosionService } from '../../services/eclosion.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-eclosion-manager',
  imports: [CommonModule],
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
      next: (data: Eclosion[]) => {
        this.eclosionList = data;
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        console.error('Erreur récupération eclosion:', err);
        this.cdr.detectChanges();
      }
    });
  }

  onEclosionCreated(): void {
    this.loadEclosion();
  }

  get totalEclosions(): number {
    return this.eclosionList.length;
  }

  get totalFoy(): number {
    return this.eclosionList.reduce((sum, item) => sum + (Number(item.nombre_foy) || 0), 0);
  }

  get totalTsyFoy(): number {
    return this.eclosionList.reduce((sum, item) => sum + (Number(item.nombre_tsy_foy) || 0), 0);
  }

  get totalIncubes(): number {
    return this.eclosionList.reduce((sum, item) => sum + this.getTotalIncubes(item), 0);
  }

  get tauxMoyenEclosion(): number {
    const total = this.totalIncubes;
    if (total <= 0) {
      return 0;
    }

    return (this.totalFoy * 100) / total;
  }

  getTotalIncubes(item: Eclosion): number {
    const total = Number(item.total_incubes);
    if (!Number.isNaN(total) && total > 0) {
      return total;
    }

    return (Number(item.nombre_foy) || 0) + (Number(item.nombre_tsy_foy) || 0);
  }

  getTauxEclosion(item: Eclosion): number {
    const raw = Number(item.taux_eclosion);
    if (!Number.isNaN(raw) && raw >= 0) {
      return raw;
    }

    const total = this.getTotalIncubes(item);
    if (total <= 0) {
      return 0;
    }

    return ((Number(item.nombre_foy) || 0) * 100) / total;
  }
}
