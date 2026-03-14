import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ConfigurationService } from '../../services/configuration.service';
import { Configuration } from '../../models/configuration.model';
import { Race } from '../../models/race.model';
import { RaceService } from '../../services/race.services';
import { extractHttpErrorMessage } from '../../utils/http-error-message';

@Component({
    selector: 'app-configuration-form',
    templateUrl: './configuration-form.html',
    styleUrls: ['./configuration-form.css'],
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule],
})
export class ConfigurationForm implements OnInit {
    races: Race[] = [];
    configForm: FormGroup;
    errorMessage: string = '';
    successMessage: string = '';

    @Output() configurationCreated = new EventEmitter<void>();

    constructor(
        private fb: FormBuilder,
        private racesServices: RaceService,
        private configService: ConfigurationService,
        private cdr: ChangeDetectorRef
    ) {
        this.configForm = this.fb.group({
            race_id: [0, Validators.required],
            semaine: [0, [Validators.required, Validators.min(0)]],
            variation_poids: [0, [Validators.required, Validators.min(0)]],
            sakafo_semaine: [0, [Validators.required, Validators.min(0)]],
        });
    }

    ngOnInit(): void {
        this.racesServices.getAllRaces().subscribe({
            next: (data: Race[]) => { this.races = data; this.cdr.detectChanges(); },
            error: (err: any) => {
                this.errorMessage = extractHttpErrorMessage(err, 'Impossible de charger les races.');
                this.cdr.detectChanges();
            },
        });
    }

    onSubmit(): void {
        if (this.configForm.valid) {
            this.errorMessage = '';
            this.successMessage = '';

            this.configService.create(this.configForm.value as Configuration).subscribe({
                next: () => {
                    this.successMessage = 'Configuration enregistrée avec succès !';
                    this.configForm.reset({ race_id: 0, semaine: 0, variation_poids: 0, sakafo_semaine: 0 });
                    this.configurationCreated.emit();
                    this.cdr.detectChanges();
                    setTimeout(() => { this.successMessage = ''; this.cdr.detectChanges(); }, 3000);
                },
                error: (err: any) => {
                    this.errorMessage = extractHttpErrorMessage(err, 'Une erreur est survenue.');
                    this.cdr.detectChanges();
                },
            });
        }
    }
}
