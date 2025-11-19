import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouteListRoutingModule } from './route-list-routing.module';
import { RouteListComponent } from './route-list.component';
import {SharedModule} from "@app/shared/shared.module";
import {TableModule} from "@clavisco/table";
import {LinkerService} from "@clavisco/linker";
import {RouteAssignmentComponent} from "@Component/route/route-list/route-assignment/route-assignment.component";
import { RouteAdministratorsComponent } from './route-administrators/route-administrators.component';
import { RouteHistoryComponent } from './route-history/route-history.component';
import { RouteLoadsComponent } from './route-loads/route-loads.component';
import { HistoryFiltersComponent } from './route-history/history-filters/history-filters.component';
import { HistoryDetailsComponent } from './route-history/history-details/history-details.component';
import { AngularImageViewerModule } from 'angular-x-image-viewer';
import {RouteCalculationsPipe} from "@app/pipes/route-calculations.pipe";
import { RouteCloseComponent } from './route-close/route-close.component';

@NgModule({
  declarations: [
    RouteListComponent,
    RouteAssignmentComponent,
    RouteAdministratorsComponent,
    RouteHistoryComponent,
    RouteLoadsComponent,
    HistoryFiltersComponent,
    HistoryDetailsComponent,
    RouteCloseComponent
  ],
  imports: [
    CommonModule,
    RouteListRoutingModule,
    SharedModule,
    TableModule,
    AngularImageViewerModule
  ],
  providers: [
    {
      provide: 'LinkerService',
      useExisting: LinkerService
    }
  ]
})
export class RouteListModule { }
