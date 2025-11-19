import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActivateCustomersComponent } from './activate-customers.component';

export const routes: Routes = [
  {
    path: '',
    component: ActivateCustomersComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ActivateCustomersRoutingModule { }
