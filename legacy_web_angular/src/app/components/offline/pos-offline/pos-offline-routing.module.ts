import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PosOfflineComponent } from './pos-offline.component';

export const routes: Routes = [
  {
    path: '',
    component: PosOfflineComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PosOfflineRoutingModule { }
