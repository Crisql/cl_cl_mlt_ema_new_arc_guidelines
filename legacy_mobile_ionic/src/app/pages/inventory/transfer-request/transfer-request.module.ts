import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TransferRequestRoutingModule } from './transfer-request-routing.module';
import {TranslateModule} from "@ngx-translate/core";
import {IonicModule} from "@ionic/angular";
import {TransferRequest} from "./transfer-request.page";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ScannerModule} from "../../../components/scanner/scanner.module";
import {UdfPresentationModule} from "../../../components/udf-presentation/udf-presentation.module";


@NgModule({
  declarations: [TransferRequest],
    imports: [
        CommonModule,
        TransferRequestRoutingModule,
        TranslateModule,
        IonicModule,
        ScannerModule,
        FormsModule,
        ReactiveFormsModule,
        UdfPresentationModule,
    ]
})
export class TransferRequestModule { }
