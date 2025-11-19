import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AuthGuard} from "@app/guards/auth.guard";

export const routes: Routes = [
  {
    path: 'users',
    loadChildren: () => import('./user/user.module').then(m => m.UserModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'roles-users',
    loadChildren: () => import('./roles-perms/roles-perms.module').then(m => m.RolesPermsModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'geo-roles-users',
    loadChildren: () => import('./geo-roles-config/geo-roles-config.module').then(m => m.GeoRolesConfigModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'companies',
    loadChildren: () => import('./companies/companies.module').then(m => m.CompaniesModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'terminals',
    loadChildren: () => import('./terminals/terminals.module').then(m => m.TerminalsModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'udfs',
    loadChildren: () => import('./udfs/udfs.module').then(m => m.UdfsModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'frequencies',
    loadChildren: () => import('./frequencies/frequencies.module').then(m => m.FrequenciesModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'activate-customers',
    loadChildren: () => import('./activate-customers/activate-customers.module').then(m => m.ActivateCustomersModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'licenses',
    loadChildren: () => import('./licenses/licenses.module').then(m => m.LicensesModule),
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MaintenanceRoutingModule { }
