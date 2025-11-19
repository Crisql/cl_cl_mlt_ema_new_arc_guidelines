import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TableModule} from '@clavisco/table';
import {DynamicsUdfsPresentationModule} from '@clavisco/dynamics-udfs-presentation';

import {SalesDocumentRoutingModule} from './sales-document-routing.module';
import {SalesDocumentComponent} from './sales-document.component';
import {SharedModule} from "@app/shared/shared.module";
import {FlexModule} from "@angular/flex-layout";
import {LocationComponent} from './location/location.component';
import {LotComponent} from './lot/lot.component';
import {FeComponent} from "@Component/sales/document/fe/fe.component";
import {ItemComponent} from './item/item.component';
import { SuccessSalesModalComponent } from './success-sales-modal/success-sales-modal.component';
import { InventoyEntryComponent } from './inventoy-entry/inventoy-entry.component';
import { SeriesItemsComponent } from './series-items/series-items.component';
import { DownPaymentComponent } from './down-payment/down-payment.component';
import { AuthorizationComponent } from './authorization/authorization.component';
import { DimensionsComponent } from './dimensions/dimensions.component';
import { ModalAppliedRetentionsComponent } from './modal-applied-retentions/modal-applied-retentions/modal-applied-retentions.component';
import { LogisticsComponent } from './logistics/logistics.component';
import { AddressDatailsComponent } from './logistics/address-datails/address-datails.component';


@NgModule({
  declarations: [
    SalesDocumentComponent,
    LocationComponent,
    LotComponent,
    FeComponent,
    ItemComponent,
    SuccessSalesModalComponent,
    InventoyEntryComponent,
    SeriesItemsComponent,
    DownPaymentComponent,
    AuthorizationComponent,
    DimensionsComponent,
    ModalAppliedRetentionsComponent,
    LogisticsComponent,
    AddressDatailsComponent
  ],
  imports: [
    CommonModule,
    SalesDocumentRoutingModule,
    SharedModule,
    TableModule,
    FlexModule,
    DynamicsUdfsPresentationModule
  ],
  exports: [
    LotComponent,
    ItemComponent,
    LogisticsComponent
  ]
})
export class SalesDocumentModule {
}
