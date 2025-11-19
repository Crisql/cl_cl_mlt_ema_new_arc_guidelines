import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PaymentCancelPageRoutingModule } from './payment-cancel-routing.module';

import { PaymentCancelPage } from './payment-cancel.page';
import {TranslateModule} from "@ngx-translate/core";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    IonicModule,
    PaymentCancelPageRoutingModule
  ],
  declarations: [PaymentCancelPage]
})
export class PaymentCancelPageModule {}
