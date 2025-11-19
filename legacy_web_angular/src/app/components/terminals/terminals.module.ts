import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TerminalsRoutingModule } from './terminals-routing.module';
import {SharedModule} from "@app/shared/shared.module";
import {TableModule} from "@clavisco/table";


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    TerminalsRoutingModule,
    SharedModule,
    TableModule
  ]
})
export class TerminalsModule { }
