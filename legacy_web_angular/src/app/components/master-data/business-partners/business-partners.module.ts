import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BusinessPartnersRoutingModule } from './business-partners-routing.module';
import { BusinessPartnersComponent } from './business-partners.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import {DynamicsUdfsPresentationModule} from "@clavisco/dynamics-udfs-presentation";
import {TableModule} from "@clavisco/table";


@NgModule({
  declarations: [
    BusinessPartnersComponent
  ],
    imports: [
        CommonModule,
        BusinessPartnersRoutingModule,
        SharedModule,
        FlexLayoutModule,
        DynamicsUdfsPresentationModule,
        TableModule
    ]
})
export class BusinessPartnersModule { }
