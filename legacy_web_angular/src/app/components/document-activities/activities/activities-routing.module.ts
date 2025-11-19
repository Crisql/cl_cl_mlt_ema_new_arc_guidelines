import {NgModule} from '@angular/core';
import {ActivatedRouteSnapshot, RouterModule, Routes} from "@angular/router";
import {ActivitiesComponent} from "@Component/document-activities/activities/activities.component";
import {ActivitiesResolver} from "@app/resolvers/activities.resolver";

export const routes: Routes = [
  {
    path: '',
    component: ActivitiesComponent,
    resolve: {resolvedData: ActivitiesResolver},
    runGuardsAndResolvers: (curr: ActivatedRouteSnapshot, future: ActivatedRouteSnapshot) => {
      return !future.queryParamMap.keys.length;
    }
  }
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ActivitiesRoutingModule {
}
