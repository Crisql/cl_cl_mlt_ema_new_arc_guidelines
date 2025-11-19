import { NgModule } from '@angular/core';
import { ActivatedRouteSnapshot, RouterModule, Routes } from '@angular/router';
import { ItemsResolver } from 'src/app/resolvers/items.resolver';
import { ItemsComponent } from './items.component';

export const routes: Routes = [
  {
    path: '',
    component: ItemsComponent,
    resolve: { resolvedData: ItemsResolver },
    runGuardsAndResolvers: (curr: ActivatedRouteSnapshot, future: ActivatedRouteSnapshot) => {
      return !future.queryParamMap.keys.length;
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ItemsRoutingModule { }
