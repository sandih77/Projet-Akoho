import { Routes } from '@angular/router';
import { LotsForm } from './components/lots-form/lots-form';
import { LotsManager } from './components/lots-manager/lots-manager';
import { RacesManager } from './components/races-manager/races-manager';

export const routes: Routes = [
    { path: 'race-manager', component: RacesManager },
    { path: 'lots-manager', component: LotsManager },
    { path: 'lots-form', component: LotsForm }
];
