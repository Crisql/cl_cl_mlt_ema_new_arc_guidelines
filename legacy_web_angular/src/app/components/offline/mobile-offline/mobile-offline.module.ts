import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MobileOfflineRoutingModule } from './mobile-offline-routing.module';
import { MobileOfflineComponent } from './mobile-offline.component';
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatOptionModule} from "@angular/material/core";
import {MatSelectModule} from "@angular/material/select";
import {ReactiveFormsModule} from "@angular/forms";
import {SharedModule} from "@app/shared/shared.module";
import {TableModule} from "@clavisco/table";
import { DetailsComponent } from './details/details.component';
import {SyncDocumentStatusNamePipe} from "@app/pipes/sync-document-status-name.pipe";


@NgModule({
  declarations: [
    MobileOfflineComponent,
    DetailsComponent
  ],
    imports: [
        CommonModule,
        MobileOfflineRoutingModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatInputModule,
        MatOptionModule,
        MatSelectModule,
        ReactiveFormsModule,
        SharedModule,
        TableModule
    ],
  providers: [
    SyncDocumentStatusNamePipe
  ]
})
export class MobileOfflineModule { }
