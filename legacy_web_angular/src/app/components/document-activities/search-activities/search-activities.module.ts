import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SearchActivitiesRoutingModule } from './search-activities-routing.module';
import {SearchActivitiesComponent} from "@Component/document-activities/search-activities/search-activities.component";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatTooltipModule} from "@angular/material/tooltip";
import {ReactiveFormsModule} from "@angular/forms";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {TableModule} from "@clavisco/table";
import {SharedModule} from "@app/shared/shared.module";


@NgModule({
  declarations: [
    SearchActivitiesComponent
  ],
  imports: [
    CommonModule,
    SearchActivitiesRoutingModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    TableModule,
    SharedModule
  ]
})
export class SearchActivitiesModule { }
