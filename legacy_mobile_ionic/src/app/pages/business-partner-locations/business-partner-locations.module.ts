import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { BusinessPartnerLocationsPageRoutingModule } from "./business-partner-locations-routing.module";

import { BusinessPartnerLocationsPage } from "./business-partner-locations.page";
import { TranslateModule } from "@ngx-translate/core";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    BusinessPartnerLocationsPageRoutingModule,
    TranslateModule,
  ],
  declarations: [BusinessPartnerLocationsPage],
})
export class BusinessPartnerLocationsPageModule {}
