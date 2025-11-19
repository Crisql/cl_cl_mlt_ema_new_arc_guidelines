import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AuthGuard} from "@app/guards/auth.guard";

export const routes: Routes = [
  {
    path: 'search-docs',
    loadChildren: () => import('./search-docs/purchase-search-docs.module').then(m => m.PurchaseSearchDocsModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'good-receipt',
    loadChildren: () => import('./document/purchases-document.module').then(m => m.PurchasesDocumentModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'return-good',
    loadChildren: () => import('./document/purchases-document.module').then(m => m.PurchasesDocumentModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'order',
    loadChildren: () => import('./document/purchases-document.module').then(m => m.PurchasesDocumentModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'invoice',
    loadChildren: () => import('./invoice/purchase-invoice.module').then(m => m.PurchaseInvoiceModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'down-payments',
    loadChildren: () => import('./invoice/purchase-invoice.module').then(m => m.PurchaseInvoiceModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'approvals',
    loadChildren: () => import('./purchases-approvals/purchases-approvals.module').then(m => m.PurchasesApprovalsModule),
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PurchasesRoutingModule { }
