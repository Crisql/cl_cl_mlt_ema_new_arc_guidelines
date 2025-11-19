import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DocumentActivitiesRoutingModule } from './document-activities-routing.module';
import { SearchActivitiesComponent } from './search-activities/search-activities.component';


@NgModule({
  declarations: [

  ],
  imports: [
    CommonModule,
    DocumentActivitiesRoutingModule
  ]
})
export class DocumentActivitiesModule { }
