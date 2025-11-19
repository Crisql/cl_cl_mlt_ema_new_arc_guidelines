import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MobileOfflineComponent } from './mobile-offline.component';

export const routes: Routes = [
  {
    path: '',
    component: MobileOfflineComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MobileOfflineRoutingModule { }
