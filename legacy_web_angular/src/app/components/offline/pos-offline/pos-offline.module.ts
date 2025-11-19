import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PosOfflineRoutingModule } from './pos-offline-routing.module';
import { PosOfflineComponent } from './pos-offline.component';


@NgModule({
  declarations: [
    PosOfflineComponent
  ],
  imports: [
    CommonModule,
    PosOfflineRoutingModule
  ]
})
export class PosOfflineModule { }
