import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PurchaseInvoiceRoutingModule } from './purchase-invoice-routing.module';
import { PurchaseInvoiceComponent } from './purchase-invoice.component';
import {SharedModule} from "@app/shared/shared.module";
import {TableModule} from "@clavisco/table";
import {LinkerService} from "@clavisco/linker";
import {ReactiveFormsModule} from "@angular/forms";
import {SalesDocumentModule} from "@Component/sales/document/sales-document.module";
import {DynamicsUdfsPresentationModule} from "@clavisco/dynamics-udfs-presentation";


@NgModule({
  declarations: [
    PurchaseInvoiceComponent
  ],
    imports: [
        CommonModule,
        SharedModule,
        TableModule,
        ReactiveFormsModule,
        PurchaseInvoiceRoutingModule,
        SalesDocumentModule,
        DynamicsUdfsPresentationModule,
    ],
  providers: [
    {
      provide: 'LinkerService',
      useExisting: LinkerService
    }
  ]
})
export class PurchaseInvoiceModule { }
