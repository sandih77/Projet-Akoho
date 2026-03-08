import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Configuration } from '../../models/configuration.model';
import { ConfigurationService } from '../../services/configuration.service';
import { ConfigurationForm } from '../configuration-form/configuration-form';

@Component({
    selector: 'app-configuration-manager',
    templateUrl: './configuration-manager.html',
    styleUrls: ['./configuration-manager.css'],
    standalone: true,
    imports: [CommonModule, ConfigurationForm],
})
export class ConfigurationManager implements OnInit {
    configurations: Configuration[] = [];
    message = '';
    deletingId: number | null = null;

    constructor(private configService: ConfigurationService, private cdr: ChangeDetectorRef) { }

    ngOnInit(): void {
        this.loadConfigurations();
    }

    loadConfigurations(): void {
        this.configService.getAll().subscribe({
            next: (data) => {
                this.configurations = data;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Erreur récupération configurations:', err);
                this.cdr.detectChanges();
            },
        });
    }

    onConfigurationCreated(): void {
        this.loadConfigurations();
    }

    deleteConfiguration(id: number): void {
        if (!confirm('Supprimer cette configuration ?')) return;
        this.deletingId = id;
        this.configService.deleteById(id).subscribe({
            next: () => {
                this.message = 'Configuration supprimée.';
                this.loadConfigurations();
                this.deletingId = null;
                this.cdr.detectChanges();
                setTimeout(() => { this.message = ''; this.cdr.detectChanges(); }, 3000);
            },
            error: (err) => {
                console.error('Erreur suppression:', err);
                this.deletingId = null;
                this.cdr.detectChanges();
            },
        });
    }

    /** Group configurations by lot name for display */
    get groupedByLot(): { lot_nom: string; rows: Configuration[] }[] {
        const map = new Map<string, Configuration[]>();
        for (const c of this.configurations) {
            const key = c.lot_nom ?? `Lot ${c.lot_id}`;
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(c);
        }
        return Array.from(map.entries()).map(([lot_nom, rows]) => ({ lot_nom, rows }));
    }
}
