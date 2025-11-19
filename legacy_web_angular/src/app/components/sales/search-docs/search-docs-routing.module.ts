import { NgModule } from '@angular/core';
import {ActivatedRouteSnapshot, RouterModule, Routes} from '@angular/router';
import { SearchDocsComponent } from './search-docs.component';
import {UserComponentResolver} from "../../../resolvers/user-component.resolver";
import {SearchDocsResolver} from "../../../resolvers/search-docs.resolver";

export const routes: Routes = [
  {
    path: '',
    component: SearchDocsComponent,
    resolve: {resolvedData: SearchDocsResolver},
    runGuardsAndResolvers: (curr: ActivatedRouteSnapshot, future: ActivatedRouteSnapshot) => {
      return !future.queryParamMap.keys.length;
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SearchDocsRoutingModule { }
