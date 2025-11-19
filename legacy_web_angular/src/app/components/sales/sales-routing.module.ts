import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from "@app/guards/auth.guard";
import {PendingTransactionGuard} from "@app/guards/pending-transaction.guard";

export const routes: Routes = [
  {
    path: 'documents/quotations',
    loadChildren: () => import('./document/sales-document.module').then(m => m.SalesDocumentModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'documents/orders',
    loadChildren: () => import('./document/sales-document.module').then(m => m.SalesDocumentModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'search-docs',
    loadChildren: () => import('./search-docs/search-docs.module').then(m => m.SearchDocsModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'documents/down-payments',
    loadChildren: () => import('./document/sales-document.module').then(m => m.SalesDocumentModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'documents/invoices',
    loadChildren: () => import('./document/sales-document.module').then(m => m.SalesDocumentModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'documents/delivery',
    loadChildren: () => import('./document/sales-document.module').then(m => m.SalesDocumentModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'documents/reserve-invoice',
    loadChildren: () => import('./document/sales-document.module').then(m => m.SalesDocumentModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'credit-memo',
    loadChildren: () => import('./credit-memo/credit-memo.module').then(m => m.CreditMemoModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'cash-flow',
    loadChildren: () => import('./cash-flow/cash-flow.module').then(m => m.CashFlowModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'cash-closing',
    loadChildren: () => import('./cash-closing/cash-closing.module').then(m => m.CashClosingModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'approvals',
    loadChildren: () => import('./approvals/approvals.module').then(m => m.ApprovalsModule),
    canActivate: [AuthGuard],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalesRoutingModule {
}
