import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivitiesComponent} from "@Component/document-activities/activities/activities.component";
import {SharedModule} from "@app/shared/shared.module";
import {ActivitiesRoutingModule} from "@Component/document-activities/activities/activities-routing.module";


@NgModule({
  declarations: [
    ActivitiesComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ActivitiesRoutingModule
  ]
})
export class ActivitiesModule {
}
