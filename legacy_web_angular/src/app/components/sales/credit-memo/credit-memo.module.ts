import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {CreditMemoRoutingModule} from './credit-memo-routing.module';
import {CreditMemoComponent} from './credit-memo.component';
import {ReactiveFormsModule} from "@angular/forms";
import {SharedModule} from "@app/shared/shared.module";
import {TableModule} from "@clavisco/table";
import {LinkerService} from "@clavisco/linker";
import {SalesDocumentModule} from "@Component/sales/document/sales-document.module";
import {DynamicsUdfsPresentationModule} from "@clavisco/dynamics-udfs-presentation";
import { LogisticsComponent } from '../document/logistics/logistics.component';


@NgModule({
  declarations: [
    CreditMemoComponent
  ],
    imports: [
        CommonModule,
        CreditMemoRoutingModule,
        ReactiveFormsModule,
        SharedModule,
        TableModule,
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
export class CreditMemoModule {
}
