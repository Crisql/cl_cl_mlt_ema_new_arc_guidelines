import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { PaymentSearchPageRoutingModule } from "./payment-search-routing.module";

import { PaymentSearchPage } from "./payment-search.page";
import { TranslateModule } from "@ngx-translate/core";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    IonicModule,
    PaymentSearchPageRoutingModule,
  ],
  declarations: [PaymentSearchPage],
})
export class PaymentSearchPageModule {}
