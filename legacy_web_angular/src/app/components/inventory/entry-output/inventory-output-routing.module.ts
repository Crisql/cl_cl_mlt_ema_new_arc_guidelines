import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {InventoryOutputComponent} from './inventory-output.component';
import {InventoryOuputResolver} from "@app/resolvers/inventory-ouput.resolver";

export const routes: Routes = [
  {
    path: '',
    component: InventoryOutputComponent,
    resolve: {resolvedData: InventoryOuputResolver}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventoryOutputRoutingModule {
}
