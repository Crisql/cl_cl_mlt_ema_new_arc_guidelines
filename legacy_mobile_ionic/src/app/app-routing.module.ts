import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
import {InventoryTransferPageModule} from "./pages/inventory/transfer/inventory-transfer.module";
import {SearchTransfersPageModule} from "./pages/inventory/search-transfers/search-transfers.module";

const routes: Routes = [
  {
    path: "home",
    loadChildren: () =>
      import("./pages/home/home.module").then((m) => m.HomePageModule),
  },
  {
    path: "login",
    loadChildren: () =>
      import("./pages/login/login.module").then((m) => m.LoginPageModule),
  },
  {
    path: "sync",
    loadChildren: () =>
      import("./pages/sync/sync.module").then((m) => m.SyncPageModule),
  },
  {
    path: "documents",
    loadChildren: () =>
        import("./pages/documents/documents.module").then(
            (m) => m.DocumentsPageModule
        ),
    runGuardsAndResolvers: "always",
  },
  {
    path: "delivery",
    loadChildren: () =>
        import("./pages/documents/documents.module").then(
            (m) => m.DocumentsPageModule
        ),
    runGuardsAndResolvers: "always",
  },
  {
    path: "quotations",
    loadChildren: () =>
        import("./pages/documents/documents.module").then(
            (m) => m.DocumentsPageModule
        ),
    runGuardsAndResolvers: "always",
  },
  {
    path: "order",
    loadChildren: () =>
        import("./pages/documents/documents.module").then(
            (m) => m.DocumentsPageModule
        ),
    runGuardsAndResolvers: "always",
  },
  {
    path: "invoice",
    loadChildren: () =>
        import("./pages/documents/documents.module").then(
            (m) => m.DocumentsPageModule
        ),
    runGuardsAndResolvers: "always",
  },
  {
    path: "reserveInvoice",
    loadChildren: () =>
        import("./pages/documents/documents.module").then(
            (m) => m.DocumentsPageModule
        ),
    runGuardsAndResolvers: "always",
  },
  {
    path: "credit-notes",
    loadChildren: () =>
        import("./pages/documents/documents.module").then(
            (m) => m.DocumentsPageModule
        ),
    runGuardsAndResolvers: "always",
  },
  {
    path: "devices",
    loadChildren: () =>
      import("./pages/devices/devices.module").then((m) => m.DevicesPageModule),
  },
  {
    path: "received-payment",
    loadChildren: () =>
      import("./pages/received-payment/received-payment.module").then(
        (m) => m.ReceivedPaymentPageModule
      ),
  },
  {
    path: "payment-cancel",
    loadChildren: () =>
      import("./pages/payment-cancel/payment-cancel-routing.module").then(
        (m) => m.PaymentCancelPageRoutingModule
      ),
  },
  {
    path: "payment-search",
    loadChildren: () =>
      import("./pages/payment-search/payment-search.module").then(
        (m) => m.PaymentSearchPageModule
      ),
  },
  {
    path: 'internal-reconciliation',
    loadChildren: () => import('./pages/internal-reconciliation/internal-reconciliation.module').then( m => m.InternalReconciliationPageModule)
  },
  {
    path: "account-payment",
    loadChildren: () =>
      import("./pages/account-payment/account-payment.module").then(
        (m) => m.AccountPaymentPageModule
      ),
  },
  {
    path: "business-partner-master-data",
    loadChildren: () =>
      import(
        "./pages/master-data/business-partner-master-data/business-partner-master-data.module"
      ).then((m) => m.BusinessPartnerMasterDataPageModule),
  },
  {
    path: "routes",
    loadChildren: () =>
      import("./pages/routes/routes.module").then((m) => m.RoutesPageModule),
  },
  {
    path: "route-destinations/:routeId",
    loadChildren: () =>
      import("./pages/route-destinations/route-destinations.module").then(
        (m) => m.RouteDestinationsPageModule
      ),
  },
  {
    path: "route-map/:routeId",
    loadChildren: () =>
      import("./pages/route-map/route-map.module").then(
        (m) => m.RouteMapPageModule
      ),
  },
  {
    path: "language",
    loadChildren: () =>
      import("./pages/language/language.module").then(
        (m) => m.LanguagePageModule
      ),
  },
  {
    path: "change-password",
    loadChildren: () =>
      import("./pages/change-password/change-password.module").then(
        (m) => m.ChangePasswordPageModule
      ),
  },
  {
    path: "recover-password",
    loadChildren: () =>
      import("./pages/recover-password/recover-password.module").then(
        (m) => m.RecoverPasswordPageModule
      ),
  },
  {
    path: "about-us",
    loadChildren: () =>
      import("./pages/about-us/about-us.module").then(
        (m) => m.AboutUsPageModule
      ),
  },
  {
    path: "business-partner-locations",
    loadChildren: () =>
      import(
        "./pages/business-partner-locations/business-partner-locations.module"
      ).then((m) => m.BusinessPartnerLocationsPageModule),
  },
  {
    path: "document-upload",
    loadChildren: () =>
      import("./pages/document-upload/document-upload.module").then(
        (m) => m.DocumentUploadPageModule
      ),
  },
  {
    path: "document-search",
    loadChildren: () =>
      import("./pages/document-search/document-search.module").then(
        (m) => m.DocumentSearchPageModule
      ),
  },
  {
    path: "print-report/:reportId",
    loadChildren: () =>
      import("./pages/print-report/print-report.module").then(
        (m) => m.PrintReportPageModule
      ),
  },
  {
    path: "payment-search",
    loadChildren: () =>
      import("./pages/payment-search/payment-search.module").then(
        (m) => m.PaymentSearchPageModule
      ),
  },
  {
    path: 'logs',
    loadChildren: () => import('./pages/logs/logs.module').then( m => m.LogsPageModule)
  },
  {
    path: "",
    redirectTo: "login",
    pathMatch: "full",
  },
  {
    path: "transfer-request",
    loadChildren: () =>
        import("./pages/inventory/transfer-request/transfer-request.module").then(
            (m) => m.TransferRequestModule
        ),
  },
  {
    path: 'inventory-transfer',
    loadChildren: () => import('./pages/inventory/transfer/inventory-transfer.module').then( m => InventoryTransferPageModule)
  },
  {
    path: 'search-transfers',
    loadChildren: () => import('./pages/inventory/search-transfers/search-transfers.module').then( m =>SearchTransfersPageModule)
  },
  {
    path: 'cash-flow',
    loadChildren: () => import('./pages/cash-flow/cash-flow.module').then( m =>m.CashFlowPageModule)
  },
  {
    path: 'cash-reserve-Invoice',
    loadChildren: () => import("./pages/documents/documents.module").then((m) => m.DocumentsPageModule),
    runGuardsAndResolvers: "always",
  },
  {
    path: 'payment-cancel',
    loadChildren: () => import('./pages/payment-cancel/payment-cancel.module').then( m => m.PaymentCancelPageModule)
  },
  {
    path: 'items-master-data',
    loadChildren: () => import('./pages/master-data/items/items.module').then( m => m.ItemsPageModule)
  },
  {
    path: 'cash-down-invoice',
    loadChildren: () => import("./pages/documents/documents.module").then((m) => m.DocumentsPageModule),
    runGuardsAndResolvers: "always",
  },
  {
    path: 'credit-down-invoice',
    loadChildren: () => import("./pages/documents/documents.module").then((m) => m.DocumentsPageModule),
    runGuardsAndResolvers: "always",
  },


];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      onSameUrlNavigation: "reload",
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
