import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CashFlowRoutingModule } from './cash-flow-routing.module';
import { CashFlowComponent } from './cash-flow.component';
import {SharedModule} from "@app/shared/shared.module";
import {ReactiveFormsModule} from "@angular/forms";


@NgModule({
  declarations: [
    CashFlowComponent
  ],
  imports: [
    CommonModule,
    CashFlowRoutingModule,
    SharedModule,
    ReactiveFormsModule
  ]
})
export class CashFlowModule { }
