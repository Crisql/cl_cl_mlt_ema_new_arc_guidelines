import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReceivedPaymentPageRoutingModule } from './received-payment-routing.module';

import { ReceivedPaymentPage } from './received-payment.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReceivedPaymentPageRoutingModule,
    TranslateModule,
    ReactiveFormsModule
  ],
  declarations: [ReceivedPaymentPage]
})
export class ReceivedPaymentPageModule {}
