import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BusinessPartnerMasterDataPageRoutingModule } from './business-partner-master-data-routing.module';

import { BusinessPartnerMasterDataPage } from './business-partner-master-data.page';
import { TranslateModule } from '@ngx-translate/core';
import {UdfPresentationModule} from "../../../components/udf-presentation/udf-presentation.module";
import { AttachmentFilesModule } from 'src/app/components/attachment-files/attachment-files.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    BusinessPartnerMasterDataPageRoutingModule,
    TranslateModule,
    UdfPresentationModule,
    AttachmentFilesModule
  ],
  declarations: [
      BusinessPartnerMasterDataPage
  ]
})
export class BusinessPartnerMasterDataPageModule {}
