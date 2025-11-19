import { NgModule } from '@angular/core';
import {RouterModule, Routes} from "@angular/router";
import {PPStoredTransactionResolver} from "@app/resolvers/ppstored-transaction.resolver";
import { PpstoredTransactionsComponent} from "@Component/terminals/ppstored-transactions/ppstored-transactions.component";


export const routes: Routes = [
  {
    path: '',
    component: PpstoredTransactionsComponent,
    resolve: {resolvedData: PPStoredTransactionResolver}
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PpstoredTransactionsRoutingModule { }
