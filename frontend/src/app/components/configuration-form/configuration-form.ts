import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LotsServices } from '../../services/lots-services';
import { ConfigurationService } from '../../services/configuration.service';
import { Lots } from '../../models/lot.models';
import { Configuration } from '../../models/configuration.model';

@Component({
    selector: 'app-configuration-form',
    templateUrl: './configuration-form.html',
    styleUrls: ['./configuration-form.css'],
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule],
})
export class ConfigurationForm implements OnInit {
    lots: Lots[] = [];
    configForm: FormGroup;
    errorMessage: string = '';
    successMessage: string = '';

    @Output() configurationCreated = new EventEmitter<void>();

    constructor(
        private fb: FormBuilder,
        private lotsService: LotsServices,
        private configService: ConfigurationService
    ) {
        this.configForm = this.fb.group({
            lot_id: [0, Validators.required],
            semaine: [0, [Validators.required, Validators.min(0)]],
            variation_poids: [0, [Validators.required, Validators.min(0)]],
            sakafo_semaine: [0, [Validators.required, Validators.min(0)]],
        });
    }

    ngOnInit(): void {
        this.lotsService.getAllLots().subscribe({
            next: (data: Lots[]) => this.lots = data,
            error: (err: any) => console.error('Erreur récupération lots', err),
        });
    }

    onSubmit(): void {
        if (this.configForm.valid) {
            this.errorMessage = '';
            this.successMessage = '';

            this.configService.create(this.configForm.value as Configuration).subscribe({
                next: () => {
                    this.successMessage = 'Configuration enregistrée avec succès !';
                    this.configForm.reset({ lot_id: 0, semaine: 0, variation_poids: 0, sakafo_semaine: 0 });
                    this.configurationCreated.emit();
                    setTimeout(() => this.successMessage = '', 3000);
                },
                error: (err: any) => {
                    this.errorMessage =
                        err?.error?.details ||
                        err?.error?.error ||
                        err?.error?.message ||
                        err?.message ||
                        'Une erreur est survenue.';
                },
            });
        }
    }
}
