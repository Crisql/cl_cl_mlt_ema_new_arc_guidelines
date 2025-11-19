import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';


import {TranslateModule} from "@ngx-translate/core";
import {UdfPresentationModule} from "../../../components/udf-presentation/udf-presentation.module";
import {InventoryTransferRoutingModule} from "./inventory-transfer-routing.module";
import {InventoryTransferPage} from "./inventory-transfer.page";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        InventoryTransferRoutingModule,
        TranslateModule,
        ReactiveFormsModule,
        UdfPresentationModule,
    ],
  declarations: [InventoryTransferPage]
})
export class InventoryTransferPageModule {}
