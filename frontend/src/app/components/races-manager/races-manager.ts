import { Component, OnInit } from '@angular/core';
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
export class RacesManager implements OnInit {
  races: Race[] = [];
  message = '';

  constructor(private raceService: RaceService) { }

  ngOnInit(): void {
    this.loadRaces();
  }

  loadRaces(): void {
    this.raceService.getAllRaces().subscribe({
      next: (data) => {
        this.races = data;
      },
      error: (err) => {
        console.error('Erreur récupération races:', err);
      }
    });
  }

  onRaceCreated(): void {
    this.message = 'Race créée avec succès !';
    // Recharger la liste pour avoir les IDs corrects
    this.loadRaces();
    // Effacer le message après 3 secondes
    setTimeout(() => {
      this.message = '';
    }, 3000);
  }
}
