import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileContainerComponent } from './profile-container/profile-container.component';
import { MaintenanceComponent } from './maintenance/maintenance.component';

const routes: Routes = [
  { path: '', redirectTo: '/AyushRauniyar', pathMatch: 'full' },
  { path: 'issues', component: MaintenanceComponent },
  { path: 'pulls', component: MaintenanceComponent },
  { path: 'repositories', component: MaintenanceComponent },
  { path: 'projects', component: MaintenanceComponent },
  { path: 'discussions', component: MaintenanceComponent },
  { path: 'codespaces', component: MaintenanceComponent },
  { path: 'copilot', component: MaintenanceComponent },
  { path: 'explore', component: MaintenanceComponent },
  { path: 'marketplace', component: MaintenanceComponent },
  { path: 'mcp', component: MaintenanceComponent },
  { path: ':username', component: ProfileContainerComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
