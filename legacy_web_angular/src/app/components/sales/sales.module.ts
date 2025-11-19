import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesRoutingModule } from './sales-routing.module';
import {TableModule} from "@clavisco/table";
import { StockWarehousesComponent } from './stock-warehouses/stock-warehouses.component';
import {SharedModule} from "../../shared/shared.module";

@NgModule({
  declarations: [
    StockWarehousesComponent
  ],
    imports: [
        CommonModule,
        SalesRoutingModule,
        SharedModule,
        TableModule
    ]
})
export class SalesModule { }
