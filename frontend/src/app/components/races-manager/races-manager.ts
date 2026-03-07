import { Component } from '@angular/core';
import { Race } from '../../models/race.model';
import { RaceService } from '../../services/race.services';
import { CommonModule } from '@angular/common';
import { RaceForm } from '../race-form/race-form';

@Component({
  selector: 'app-races-manager',
  imports: [CommonModule, RaceForm],
  templateUrl: './races-manager.html',
  styleUrl: './races-manager.css',
})
export class RacesManager {
  races: Race[] = [];
  loading = true;
  message = '';

  constructor(private raceService: RaceService) { }

  ngOnInit(): void {
    this.loadRaces();
  }

  loadRaces(): void {
    this.loading = true;
    this.raceService.getAllRaces().subscribe({
      next: (data) => {
        this.races = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur récupération races:', err);
        this.loading = false;
      }
    });
  }

  onRaceCreated(): void {
    this.message = 'Race créée avec succès !';
    this.loadRaces(); // rafraîchir la liste après création
  }
}
