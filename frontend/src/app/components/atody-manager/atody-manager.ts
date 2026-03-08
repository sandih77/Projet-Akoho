import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Atody } from '../../models/atody.model';
import { AtodyService } from '../../services/atody.service';
import { CommonModule } from '@angular/common';
import { AtodyForm } from '../atody-form/atody-form';

@Component({
  selector: 'app-atody-manager',
  imports: [CommonModule, AtodyForm],
  templateUrl: './atody-manager.html',
  styleUrl: './atody-manager.css',
})
export class AtodyManager implements OnInit {
  atodyList: Atody[] = [];
  message = '';

  constructor(private atodyService: AtodyService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadAtody();
  }

  loadAtody(): void {
    this.atodyService.getAll().subscribe({
      next: (data) => {
        this.atodyList = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur récupération atody:', err);
        this.cdr.detectChanges();
      }
    });
  }

  onAtodyCreated(): void {
    this.loadAtody();
  }
}
