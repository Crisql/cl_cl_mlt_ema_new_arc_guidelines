import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {HomeRoutingModule} from './home-routing.module';
import {HomeComponent} from './home.component';
import {SharedModule} from 'src/app/shared/shared.module';
import {TableModule} from '@clavisco/table';
import {LinkerService} from '@clavisco/linker';
import {CompanySelectionComponent} from '../company-selection/company-selection.component';
import {WarehouseSelectionComponent} from "../sales/warehouse-selection/warehouse-selection.component";
import {ShorcutsComponent} from "@Component/home/shorcuts/shorcuts.component";
import {ReactiveFormsModule} from "@angular/forms";


@NgModule({
  declarations: [
    HomeComponent,
    CompanySelectionComponent,
    WarehouseSelectionComponent,
    ShorcutsComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    SharedModule,
    TableModule,
    ReactiveFormsModule
  ],
  providers: [
    {
      provide: 'LinkerService',
      useExisting: LinkerService
    }
  ]
})
export class HomeModule {
}
