import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AuthGuard} from "@app/guards/auth.guard";

export const routes: Routes = [
  {
    path: 'preclosing-cards',
    loadChildren: () => import('./preclosing-cards/preclosing-cards.module').then(m => m.PreclosingCardsModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'print-void-cards',
    loadChildren: () => import('./print-void-cards/print-void-cards.module').then(m => m.PrintVoidCardsModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'pendings',
    loadChildren: () => import('./ppstored-transactions/ppstored-transactions.module').then(m => m.PpstoredTransactionsModule),
    canActivate: [AuthGuard],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TerminalsRoutingModule { }
