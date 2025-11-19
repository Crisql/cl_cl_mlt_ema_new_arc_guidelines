import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AuthGuard} from "@app/guards/auth.guard";

export const routes: Routes = [
  {
    path: 'incoming-payment',
    loadChildren: () => import('./incoming-payment/incoming-payment.module').then(m => m.IncomingPaymentsModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'outgoing-payment',
    loadChildren: () => import('./outgoing-payment/outgoing-payment.module').then(m => m.OutgoingPaymentModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'cancel-payment',
    loadChildren: () => import('./cancel-payment/cancel-payment.module').then(m => m.CancelPaymentModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'internal-reconciliation',
    loadChildren: () => import('./internal-reconciliation/internal-reconciliation.module').then(m => m.InternalReconciliationModule),
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BanksManagementRoutingModule { }
