import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DocumentsPageRoutingModule } from './documents-routing.module';

import { DocumentsPage } from './documents.page';
import { TranslateModule } from '@ngx-translate/core';
import {UdfPresentationModule} from "../../components/udf-presentation/udf-presentation.module";
import {ScannerModule} from "../../components/scanner/scanner.module";
import {ScrollingModule} from "@angular/cdk/scrolling";
import { AttachmentFilesModule } from 'src/app/components/attachment-files/attachment-files.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        IonicModule,
        DocumentsPageRoutingModule,
        TranslateModule,
        UdfPresentationModule,
        ScannerModule,
        ScrollingModule,
        AttachmentFilesModule,
        
    ],
  declarations: [DocumentsPage]
})
export class DocumentsPageModule {}
