import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ItemsRoutingModule } from './items-routing.module';
import { ItemsComponent } from './items.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { TableModule } from '@clavisco/table';
import { FlexLayoutModule } from '@angular/flex-layout';
import {DynamicsUdfsPresentationModule} from "@clavisco/dynamics-udfs-presentation";


@NgModule({
  declarations: [
    ItemsComponent

  ],
    imports: [
        CommonModule,
        ItemsRoutingModule,
        SharedModule,
        TableModule,
        FlexLayoutModule,
        DynamicsUdfsPresentationModule
    ]
})
export class ItemsModule { }
