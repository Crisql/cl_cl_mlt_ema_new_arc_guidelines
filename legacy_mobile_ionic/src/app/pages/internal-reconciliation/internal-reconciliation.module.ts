import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InternalReconciliationPageRoutingModule } from './internal-reconciliation-routing.module';

import { InternalReconciliationPage } from './internal-reconciliation.page';
import {TranslateModule} from "@ngx-translate/core";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        InternalReconciliationPageRoutingModule,
        TranslateModule
    ],
  declarations: [InternalReconciliationPage]
})
export class InternalReconciliationPageModule {}
