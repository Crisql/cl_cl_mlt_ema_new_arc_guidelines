import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrincipalComponent } from './principal.component';

export const routes: Routes = [
  {
    path: '',
    component: PrincipalComponent,
    children: [
      {
        path: 'home',
        loadChildren: () => import('./home/home.module').then(m => m.HomeModule),
      },
      {
        path: 'maintenance',
        loadChildren: () => import('./maintenance/maintenance.module').then(m => m.MaintenanceModule)
      },
      {
        path: 'banks',
        loadChildren: () => import('./banks-management/banks-management.module').then(m => m.BanksManagementModule)
      },
      {
        path: 'inventory',
        loadChildren: () => import('./inventory/inventory.module').then(m => m.InventoryModule)
      },
      {
        path: 'master-data',
        loadChildren: () => import('./master-data/master-data.module').then(m => m.MasterDataModule)
      },
      {
        path: 'purchases',
        loadChildren: () => import('./purchases/purchases.module').then(m => m.PurchasesModule)

      },
      {
        path: 'sales',
        loadChildren: () => import('./sales/sales.module').then(m => m.SalesModule)
      },
      {
        path: 'terminals',
        loadChildren: () => import('./terminals/terminals.module').then(m => m.TerminalsModule)
      },
      {
        path: 'offline',
        loadChildren: () => import('./offline/offline.module').then(m => m.OfflineModule)
      },
      {
        path: 'route',
        loadChildren: () => import('./route/route.module').then(m => m.RouteModule)
      },
      {
        path: 'event-viewer',
        loadChildren: () => import('./event-viewer/event-viewer.module').then(m => m.EventViewerModule)
      },
      {
        path: 'local-printer',
        loadChildren: () => import('./local-printer/local-printer.module').then(m => m.LocalPrinterModule)
      },
      {
        path: 'activities',
        loadChildren: () => import('./document-activities/document-activities.module').then(m => m.DocumentActivitiesModule)
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrincipalRoutingModule { }
