import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AuthGuard} from "@app/guards/auth.guard";

export const routes: Routes = [
  {
    path: 'business-partners',
    loadChildren: () => import('./business-partners/business-partners.module').then(m => m.BusinessPartnersModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'items',
    loadChildren: () => import('./items/items.module').then(m => m.ItemsModule),
    canActivate: [AuthGuard],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MasterDataRoutingModule { }
