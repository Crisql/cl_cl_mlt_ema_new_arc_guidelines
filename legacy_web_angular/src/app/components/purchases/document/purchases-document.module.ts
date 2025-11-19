import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {PurchasesDocumentComponent} from "./purchases-document.component";
import {PurchasesDocumentRoutingModule} from "./purchases-document-routing.module";
import {ReactiveFormsModule} from "@angular/forms";
import {SharedModule} from "../../../shared/shared.module";
import {TableModule} from "@clavisco/table";
import {SalesDocumentModule} from "@Component/sales/document/sales-document.module";
import { ItemDetailsComponent } from './item-details/item-details.component';
import {FlexModule} from "@angular/flex-layout";
import {LinkerService} from "@clavisco/linker";
import { CreateItemComponent } from './create-item/create-item.component';
import {DynamicsUdfsPresentationModule} from "@clavisco/dynamics-udfs-presentation";


@NgModule({
  declarations: [
    PurchasesDocumentComponent,
    ItemDetailsComponent,
    CreateItemComponent
  ],
    imports: [
        CommonModule,
        PurchasesDocumentRoutingModule,
        ReactiveFormsModule,
        SharedModule,
        TableModule,
        SalesDocumentModule,
        FlexModule,
        DynamicsUdfsPresentationModule
    ], providers:[{provide:"LinkerService",useExisting:LinkerService}]
})
export class PurchasesDocumentModule { }
