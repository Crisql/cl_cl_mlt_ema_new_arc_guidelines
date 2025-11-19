import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EventViewerRoutingModule } from './event-viewer-routing.module';
import { EventViewerComponent } from './event-viewer.component';
import {SharedModule} from "@app/shared/shared.module";
import {TableModule} from "@clavisco/table";


@NgModule({
  declarations: [
    EventViewerComponent
  ],
  imports: [
    CommonModule,
    EventViewerRoutingModule,
    SharedModule,
    TableModule
  ]
})
export class EventViewerModule { }
