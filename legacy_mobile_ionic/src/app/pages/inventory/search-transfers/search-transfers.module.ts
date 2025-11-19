import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SearchTransfersPageRoutingModule } from './search-transfers-routing.module';

import { SearchTransfersPage } from './search-transfers.page';
import {TranslateModule} from "@ngx-translate/core";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SearchTransfersPageRoutingModule,
    TranslateModule,
    ReactiveFormsModule,
  ],
  declarations: [SearchTransfersPage]
})
export class SearchTransfersPageModule {}
