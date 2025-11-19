import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SearchActivitiesComponent} from "@Component/document-activities/search-activities/search-activities.component";

export const routes: Routes = [
  {
    path: '',
    component: SearchActivitiesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SearchActivitiesRoutingModule {
}
