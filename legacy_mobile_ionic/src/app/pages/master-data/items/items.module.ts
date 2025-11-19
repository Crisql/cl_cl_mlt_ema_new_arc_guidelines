import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ItemsPageRoutingModule } from './items-routing.module';

import { ItemsPage } from './items.page';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { UdfPresentationModule } from 'src/app/components/udf-presentation/udf-presentation.module';
import { TranslateModule } from '@ngx-translate/core';
import { SimpleScannerComponent } from 'src/app/components/simple-scanner/simple-scanner.component';
import { QRScanner } from '@ionic-native/qr-scanner/ngx';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ItemsPageRoutingModule,
    ScrollingModule,
    UdfPresentationModule,
    ReactiveFormsModule,
    TranslateModule,
  ],
  declarations: [
    ItemsPage,
    SimpleScannerComponent
  ],
  providers:[
    QRScanner
  ]
})
export class ItemsPageModule {}
