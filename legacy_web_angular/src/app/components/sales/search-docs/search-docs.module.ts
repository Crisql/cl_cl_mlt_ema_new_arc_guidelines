import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SearchDocsRoutingModule } from './search-docs-routing.module';
import { SearchDocsComponent } from './search-docs.component';
import {SharedModule} from "../../../shared/shared.module";
import {TableModule} from "@clavisco/table";
import {LinkerService} from "@clavisco/linker";
import { DocPreviewComponent } from './doc-preview/doc-preview.component';
import {MatTooltip, MatTooltipModule } from '@angular/material/tooltip';


@NgModule({
  declarations: [
    SearchDocsComponent,
    DocPreviewComponent
  ],
    imports: [
        CommonModule,
        SearchDocsRoutingModule,
        SharedModule,
        TableModule,
        MatTooltipModule
    ],
  providers: [
    {
      provide: 'LinkerService',
      useExisting: LinkerService
    }
  ]
})
export class SearchDocsModule { }
