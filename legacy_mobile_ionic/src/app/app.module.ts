import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {RouteReuseStrategy} from "@angular/router";

import {IonicModule, IonicRouteStrategy} from "@ionic/angular";
import {SplashScreen} from "@ionic-native/splash-screen/ngx";
import {StatusBar} from "@ionic-native/status-bar/ngx";

import {AppComponent} from "./app.component";
import {AppRoutingModule} from "./app-routing.module";
import {HttpClient, HttpClientModule, HTTP_INTERCEPTORS} from "@angular/common/http";
import {TranslateHttpLoader} from "@ngx-translate/http-loader";
import {TranslateModule, TranslateLoader} from "@ngx-translate/core";
import {Network} from "@ionic-native/network/ngx";
import {Device} from "@ionic-native/device/ngx";
import {SQLite} from "@ionic-native/sqlite/ngx";
import {Geolocation} from "@ionic-native/geolocation/ngx";
import {BluetoothSerial} from "@ionic-native/bluetooth-serial/ngx";
import {DatePicker} from "@ionic-native/date-picker/ngx";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {Ng2SearchPipeModule} from "ng2-search-filter";
import {GoogleMaps} from "@ionic-native/google-maps/ngx";
import {LaunchNavigator} from "@ionic-native/launch-navigator/ngx";
import {Camera} from "@ionic-native/camera/ngx";
import {PhotoViewer} from "@ionic-native/photo-viewer/ngx";
import {File} from "@ionic-native/file/ngx";
import {FileOpener} from "@ionic-native/file-opener/ngx";

import {
    CustomerSearchComponent,
    ProductSearchComponent,
    DocumentCreatedComponent,
    PaymentComponent,
    EditDocumentLineComponent,
    CheckComponent,
    NavigationAppsComponent,
    DocumentsApplyPayment,
    DocumentCurrencyComponent,
    SendEmailReportComponent,
    CashDeskClosingComponent,
    ItemToBatchComponent,
    UdfPresentationComponent, 
    DownPaymentComponent,
    InventoryDetailsComponent
} from "./components";

import {AllowedCurrenciesPipe} from "./pipes/allowed-currencies.pipe";
import {LocationAccuracy} from "@ionic-native/location-accuracy/ngx";
import {ReverseListPipe} from './pipes/reverse-list.pipe';
import {DatePipe, DecimalPipe} from '@angular/common';
import {SelectBinAllocationsComponent} from "./components/select-bin-allocations/select-bin-allocations.component";
import { PaginateInterceptor } from "./interceptors/paginate.interceptor";
import {UrlInterceptor} from "./interceptors/url.interceptor";
import {RequestInterceptor} from "./interceptors/request.interceptor";
import {ErrorInterceptor} from "./interceptors/error.interceptor";
import {UdfPresentationModule} from "./components/udf-presentation/udf-presentation.module";
import {QRScanner} from "@ionic-native/qr-scanner/ngx";
import {ScannerModule} from "./components/scanner/scanner.module";
import {FilterDataComponent} from "./components/filter-data/filter-data.component";
import {
    TransferItemSearchComponent
} from "./components/inventory/transfer-request/transfer-item-search/transfer-item-search.component";
import {
    EditTransferItemComponent
} from "./components/inventory/transfer-request/edit-transfer-item/edit-transfer-item.component";
import {
    EditInventoryTransferItemComponent
} from "./components/inventory/inventory-transfer/edit-inventory-transfer-item/edit-inventory-transfer-item.component";
import {
    SelectBatchItemsComponent
} from "./components/inventory/inventory-transfer/select-batch-items/select-batch-items.component";
import {
    SelectBatchLocationItemsComponent
} from "./components/inventory/inventory-transfer/select-batch-location-items/select-batch-location-items.component";
import {
    EditReconciliationLineComponent
} from "./components/edit-reconciliation-line/edit-reconciliation-line.component";
import {ScrollingModule} from "@angular/cdk/scrolling";
import { SimpleSignatureComponent } from "./components/simple-signature/simple-signature.component";

export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}

@NgModule({
    declarations: [
        AppComponent,
        CustomerSearchComponent,
        ProductSearchComponent,
        DocumentCreatedComponent,
        PaymentComponent,
        EditDocumentLineComponent,
        DocumentsApplyPayment,
        AllowedCurrenciesPipe,
        DocumentCurrencyComponent,
        NavigationAppsComponent,
        CheckComponent,
        SendEmailReportComponent,
        CashDeskClosingComponent,
        ReverseListPipe,
        ItemToBatchComponent,
        SelectBinAllocationsComponent,
        FilterDataComponent,
        TransferItemSearchComponent,
        EditTransferItemComponent,
        EditInventoryTransferItemComponent,
        SelectBatchItemsComponent,
        SelectBatchLocationItemsComponent,
        EditReconciliationLineComponent,
        DownPaymentComponent, 
        InventoryDetailsComponent,
        SimpleSignatureComponent
    ],
    entryComponents: [
        CustomerSearchComponent,
        ProductSearchComponent,
        DocumentCreatedComponent,
        PaymentComponent,
        EditDocumentLineComponent,
        DocumentsApplyPayment,
        DocumentCurrencyComponent,
        NavigationAppsComponent,
        CheckComponent,
        SendEmailReportComponent,
        CashDeskClosingComponent,
        FilterDataComponent,
        TransferItemSearchComponent,
        EditTransferItemComponent,
        EditInventoryTransferItemComponent,
        SelectBatchItemsComponent,
        SelectBatchLocationItemsComponent,
        EditReconciliationLineComponent,
        PaymentComponent,
        InventoryDetailsComponent,
        SimpleSignatureComponent
    ],
    imports: [
        BrowserModule,
        IonicModule.forRoot(),
        AppRoutingModule,
        HttpClientModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient],
            },
        }),
        FormsModule,
        ReactiveFormsModule,
        Ng2SearchPipeModule,
        UdfPresentationModule,
        ScannerModule,
        ScrollingModule
    ],
    providers: [
        StatusBar,
        SplashScreen,
        {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
        Network,
        Device,
        SQLite,
        Geolocation,
        BluetoothSerial,
        DatePicker,
        GoogleMaps,
        LaunchNavigator,
        Camera,
        PhotoViewer,
        File,
        FileOpener,
        LocationAccuracy,
        { provide: HTTP_INTERCEPTORS, useClass: UrlInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: RequestInterceptor, multi: true,},
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: PaginateInterceptor, multi: true },
        DecimalPipe,
        DatePipe,
        QRScanner
    ],
    bootstrap: [AppComponent],
})
export class AppModule {
}
