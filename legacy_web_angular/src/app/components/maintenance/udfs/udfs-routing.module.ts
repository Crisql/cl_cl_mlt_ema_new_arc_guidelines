import { NgModule } from '@angular/core';
import {ActivatedRouteSnapshot, RouterModule, Routes} from '@angular/router';
import { UdfsComponent } from './udfs.component';
import {UdfResolver} from "../../../resolvers/udf.resolver";

export const routes: Routes = [
  {
    path: '',
    component: UdfsComponent,
    resolve: {UdfResolverData: UdfResolver}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UdfsRoutingModule { }
