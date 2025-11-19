import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RouteDestinationsPageRoutingModule } from './route-destinations-routing.module';

import { RouteDestinationsPage } from './route-destinations.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouteDestinationsPageRoutingModule,
    TranslateModule
  ],
  declarations: [RouteDestinationsPage]
})
export class RouteDestinationsPageModule {}
