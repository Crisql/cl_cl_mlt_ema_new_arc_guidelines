import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AuthGuard} from "@app/guards/auth.guard";

export const routes: Routes = [
  {
    path: 'pos',
    loadChildren: () => import('./pos-offline/pos-offline.module').then(m => m.PosOfflineModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'mobile',
    loadChildren: () => import('./mobile-offline/mobile-offline.module').then(m => m.MobileOfflineModule),
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OfflineRoutingModule { }
