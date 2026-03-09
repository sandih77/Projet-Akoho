import { Routes } from '@angular/router';
import { LotsForm } from './components/lots-form/lots-form';
import { LotsManager } from './components/lots-manager/lots-manager';
import { RacesManager } from './components/races-manager/races-manager';
import { AtodyManager } from './components/atody-manager/atody-manager';
import { AkohoMatyManager } from './components/akoho-maty-manager/akoho-maty-manager';
import { EclosionManager } from './components/eclosion-manager/eclosion-manager';
import { Bilan } from './components/bilan/bilan';
import { ConfigurationManager } from './components/configuration-manager/configuration-manager';

export const routes: Routes = [
    { path: '', component: RacesManager }, 
    { path: 'race-manager', component: RacesManager },
    { path: 'lots-manager', component: LotsManager },
    { path: 'lots-form', component: LotsForm },
    { path: 'configuration-manager', component: ConfigurationManager },
    { path: 'atody-manager', component: AtodyManager },
    { path: 'akoho-maty-manager', component: AkohoMatyManager },
    { path: 'eclosion-manager', component: EclosionManager },
    { path: 'bilan', component: Bilan },
];
