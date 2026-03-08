import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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

  constructor(private raceService: RaceService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadRaces();
  }

  loadRaces(): void {
    this.raceService.getAllRaces().subscribe({
      next: (data) => {
        this.races = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur récupération races:', err);
        this.cdr.detectChanges();
      }
    });
  }

  onRaceCreated(): void {
    this.message = 'Race créée avec succès !';
    this.loadRaces();
    setTimeout(() => {
      this.message = '';
      this.cdr.detectChanges();
    }, 3000);
  }
}
