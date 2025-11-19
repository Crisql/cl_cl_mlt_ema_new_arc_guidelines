import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UdfsRoutingModule } from './udfs-routing.module';
import { UdfsComponent } from './udfs.component';
import {LinkerService} from "@clavisco/linker";
import {SharedModule} from "../../../shared/shared.module";
import {FlexModule} from "@angular/flex-layout";
import {TableModule} from "@clavisco/table";
import { DynamicsUdfsConsoleModule } from "@clavisco/dynamics-udfs-console";

@NgModule({
  declarations: [
    UdfsComponent
  ],
  imports: [
    CommonModule,
    UdfsRoutingModule,
    SharedModule,
    FlexModule,
    TableModule,
    DynamicsUdfsConsoleModule
  ],
  providers: [
    {
      provide: 'LinkerService',
      useExisting: LinkerService
    }
  ]
})
export class UdfsModule { }
