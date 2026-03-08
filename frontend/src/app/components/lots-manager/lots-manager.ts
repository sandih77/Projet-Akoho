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
            next: (data) => {
                this.lots = data;
                this.cdr.detectChanges();
            },
            error: (err) => {
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
}