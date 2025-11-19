import { NgModule } from '@angular/core';
import { ActivatedRouteSnapshot, RouterModule, Routes } from '@angular/router';
import { CompanyAccountResolver } from 'src/app/resolvers/company-account.resolver';
import { CompanyComponentResolver } from 'src/app/resolvers/company-component.resolver';
import { CompanyConfigurationsResolver } from 'src/app/resolvers/company-configurations.resolver';
import { CompanyGeneralResolver } from 'src/app/resolvers/company-general.resolver';
import { ConectionsResolver } from 'src/app/resolvers/conections.resolver';
import { DbResourcesResolver } from 'src/app/resolvers/db-resources.resolver';
import { SeriesResolver } from 'src/app/resolvers/series.resolver';
import { CompaniesComponent } from './companies.component';
import {FieldsConfiguredSapResolver} from "../../../resolvers/fields-configured-sap.resolver";
import {DiscountHierarchiesResolver} from "@app/resolvers/discount-hierarchies.resolver";
import {LoyaltyPlanResolver} from "@app/resolvers/loyalty-plan.resolver";


export const routes: Routes = [
  {
    path: '',
    component: CompaniesComponent,
    resolve: { resolvedData: CompanyComponentResolver },
    runGuardsAndResolvers: (curr: ActivatedRouteSnapshot, future: ActivatedRouteSnapshot) => {
      return !future.queryParamMap.keys.length;
    },

  },

  {
    path: 'general/:Id',
    component: CompaniesComponent,
    resolve: { resolvedDataGeneral: CompanyGeneralResolver },
    runGuardsAndResolvers: (curr: ActivatedRouteSnapshot, future: ActivatedRouteSnapshot) => {
      return !future.queryParamMap.keys.length;
    }
  },
  {
    path: 'print-format/:Id',
    component: CompaniesComponent,
    resolve: { resolvedDataPrintFormat: CompanyAccountResolver },
    runGuardsAndResolvers: (curr: ActivatedRouteSnapshot, future: ActivatedRouteSnapshot) => {
      return !future.queryParamMap.keys.length;
    }
  },
  {
    path: 'account/:Id',
    component: CompaniesComponent,
    resolve: { resolvedDataAccount: CompanyAccountResolver },
    runGuardsAndResolvers: (curr: ActivatedRouteSnapshot, future: ActivatedRouteSnapshot) => {
      return !future.queryParamMap.keys.length;
    }
  },
  {
    path: 'create',
    component: CompaniesComponent,
    resolve:{ resolvedDataConection :ConectionsResolver},
    runGuardsAndResolvers: (curr: ActivatedRouteSnapshot, future: ActivatedRouteSnapshot) => {
      return !future.queryParamMap.keys.length;
    }
  },
  {
    path: 'db-resources/:Id',
    component: CompaniesComponent,
    resolve:{dbResourcesResolvedData: DbResourcesResolver},
    runGuardsAndResolvers: (curr: ActivatedRouteSnapshot, future: ActivatedRouteSnapshot) => {
      return !future.queryParamMap.keys.length;
    }
  },
  {
    path: 'configurations/:Id',
    component: CompaniesComponent,
    resolve:{Configurations: CompanyConfigurationsResolver},
    runGuardsAndResolvers: (curr: ActivatedRouteSnapshot, future: ActivatedRouteSnapshot) => {
      return !future.queryParamMap.keys.length;
    },
  },
  {
    path: 'loyaltyPlan/:Id',
    component: CompaniesComponent,
    resolve:{loyaltyPlanResolveData: LoyaltyPlanResolver},
    runGuardsAndResolvers: (curr: ActivatedRouteSnapshot, future: ActivatedRouteSnapshot) => {
      return !future.queryParamMap.keys.length;
    }
  },
  {
    path: 'configurations-fields/:Id',
    component: CompaniesComponent,
    resolve:{ConfigurationsFields: FieldsConfiguredSapResolver},
    runGuardsAndResolvers: (curr: ActivatedRouteSnapshot, future: ActivatedRouteSnapshot) => {
      return !future.queryParamMap.keys.length;
    },
  },
  {
    path: 'discount-hierarchies/:Id',
    component: CompaniesComponent,
    resolve:{discountHierarchiesResolvedData: DiscountHierarchiesResolver},
    runGuardsAndResolvers: (curr: ActivatedRouteSnapshot, future: ActivatedRouteSnapshot) => {
      return !future.queryParamMap.keys.length;
    },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CompaniesRoutingModule { }
