import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { TranslateModule } from "@ngx-translate/core";

import { AccountPaymentPageRoutingModule } from "./account-payment-routing.module";

import { AccountPaymentPage } from "./account-payment.page";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AccountPaymentPageRoutingModule,
    TranslateModule,
  ],
  declarations: [AccountPaymentPage],
})
export class AccountPaymentPageModule {}
