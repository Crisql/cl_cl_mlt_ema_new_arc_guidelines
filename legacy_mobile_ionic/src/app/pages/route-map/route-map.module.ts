import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RouteMapPageRoutingModule } from './route-map-routing.module';

import { RouteMapPage } from './route-map.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouteMapPageRoutingModule,
    TranslateModule
  ],
  declarations: [RouteMapPage]
})
export class RouteMapPageModule {}
