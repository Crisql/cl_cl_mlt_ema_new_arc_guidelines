import { NgModule } from '@angular/core';
import { ActivatedRouteSnapshot, RouterModule, Routes } from '@angular/router';
import { BusinessPartnersResolver } from 'src/app/resolvers/business-partners.resolver';
import { BusinessPartnersComponent } from './business-partners.component';

export const routes: Routes = [
  {
    path: '',
    component: BusinessPartnersComponent,
    resolve: { resolvedData: BusinessPartnersResolver },
    runGuardsAndResolvers: (curr: ActivatedRouteSnapshot, future: ActivatedRouteSnapshot) => {
      return !future.queryParamMap.keys.length;
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BusinessPartnersRoutingModule { }
