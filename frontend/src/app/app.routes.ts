import { Routes } from '@angular/router';
import { RaceForm } from './components/race-form/race-form';
import { LotsForm } from './components/lots-form/lots-form';

export const routes: Routes = [
    { path: 'race-form', component: RaceForm },
    { path: 'lots-form', component: LotsForm }
];
