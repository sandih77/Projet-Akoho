import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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

    constructor(private lotsService: LotsServices, private cdr: ChangeDetectorRef) { }

    ngOnInit(): void {
        this.loadLots();
    }

    loadLots(): void {
        this.lotsService.getAllLots().subscribe({
            next: (data: Lots[]) => {
                this.lots = data;
                this.cdr.detectChanges();
            },
            error: (err: unknown) => {
                console.error('Erreur récupération lots:', err);
                this.cdr.detectChanges();
            }
        });
    }

    onLotCreated(): void {
        this.message = 'Lot créé avec succès !';
        this.loadLots();
        setTimeout(() => {
            this.message = '';
            this.cdr.detectChanges();
        }, 3000);
    }

    get totalLots(): number {
        return this.lots.length;
    }

    get totalAkoho(): number {
        return this.lots.reduce((sum, lot) => sum + (Number(lot.nombre_akoho) || 0), 0);
    }

    get totalInvestissement(): number {
        return this.lots.reduce((sum, lot) => sum + (Number(lot.prix_achat) || 0), 0);
    }

    get totalVavy(): number {
        return this.lots.reduce((sum, lot) => sum + (Number(lot.nombre_vavy) || 0), 0);
    }

    get totalLahy(): number {
        return this.lots.reduce((sum, lot) => sum + (Number(lot.nombre_lahy) || 0), 0);
    }

    get moyenneAge(): number {
        if (this.lots.length === 0) {
            return 0;
        }

        const totalAge = this.lots.reduce((sum, lot) => sum + (Number(lot.age) || 0), 0);
        return totalAge / this.lots.length;
    }

    isEclosionLot(lot: Lots): boolean {
        return typeof lot.name === 'string' && lot.name.startsWith('Eclosion-');
    }

    getPrixUnitaire(lot: Lots): number {
        const count = Number(lot.nombre_akoho) || 0;
        const total = Number(lot.prix_achat) || 0;

        if (count <= 0) {
            return 0;
        }

        return total / count;
    }

    getTauxVavy(lot: Lots): number {
        const total = Number(lot.nombre_akoho) || 0;
        const vavy = Number(lot.nombre_vavy) || 0;

        if (total <= 0) {
            return 0;
        }

        return (vavy * 100) / total;
    }
}