import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AuthGuard} from "@app/guards/auth.guard";

export const routes: Routes = [
  {
    path: 'entry',
    loadChildren: () => import('./entry-output/inventory-output.module').then(m => m.InventoryOutputModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'output',
    loadChildren: () => import('./entry-output/inventory-output.module').then(m => m.InventoryOutputModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'search-transfers',
    loadChildren: () => import('./search-transfers/search-inventory-transfers.module').then(m => m.SearchInventoryTransfersModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'transfer-request',
    loadChildren: () => import('./transfer-request/inventory-transfer-request.module').then(m => m.InventoryTransferRequestModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'transfer',
    loadChildren: () => import('./transfer/inventory-transfer.module').then(m => m.InventoryTransferModule),
    canActivate: [AuthGuard],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventoryRoutingModule { }
