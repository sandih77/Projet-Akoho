import { Routes } from '@angular/router';
import { LotsForm } from './components/lots-form/lots-form';
import { RacesManager } from './components/races-manager/races-manager';

export const routes: Routes = [
    { path: 'race-manager', component: RacesManager },
    { path: 'lots-form', component: LotsForm }
];
