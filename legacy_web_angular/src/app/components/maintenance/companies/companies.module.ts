import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CompaniesRoutingModule } from './companies-routing.module';
import { CompaniesComponent } from './companies.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { TableModule } from '@clavisco/table';
import { DbResourcesEditComponent } from './db-resources-edit/db-resources-edit.component';
import { LinkerService } from '@clavisco/linker';
import { SerieEditComponent } from './serie-edit/serie-edit.component';
import { MarginEditComponent } from './margin-edit/margin-edit.component';
import { DiscountHierarchiesComponent } from './discount-hierarchies/discount-hierarchies.component';
import {ExtendedModule} from "@angular/flex-layout";
import {DateSelectorModule} from "@clavisco/core";
import { DbResourcesAddComponent } from './db-resources-add/db-resources-add.component';


@NgModule({
  declarations: [
    CompaniesComponent,
    DbResourcesEditComponent,
    SerieEditComponent,
    MarginEditComponent,
    DiscountHierarchiesComponent,
    DbResourcesAddComponent
  ],
    imports: [
        CommonModule,
        CompaniesRoutingModule,
        SharedModule,
        TableModule,
        ExtendedModule,
      DateSelectorModule
    ],
  providers: [
    {
      provide: 'LinkerService',
      useExisting: LinkerService
    }
  ]
})
export class CompaniesModule { }
