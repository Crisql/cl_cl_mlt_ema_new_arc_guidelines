import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { DevicesPageRoutingModule } from "./devices-routing.module";

import { DevicesPage } from "./devices.page";
import { TranslateModule } from "@ngx-translate/core";

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    DevicesPageRoutingModule,
    TranslateModule,
  ],
  declarations: [DevicesPage],
})
export class DevicesPageModule {}
