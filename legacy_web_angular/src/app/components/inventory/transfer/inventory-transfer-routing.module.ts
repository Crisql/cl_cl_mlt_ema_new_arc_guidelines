import {NgModule} from '@angular/core';
import {ActivatedRouteSnapshot, RouterModule, Routes} from '@angular/router';
import {InventoryTransferComponent} from './inventory-transfer.component';
import {TransferInventoryResolver} from "@app/resolvers/transfer-inventory.resolver";

export const routes: Routes = [
  {
    path: '',
    component: InventoryTransferComponent,
    resolve: {resolvedData: TransferInventoryResolver},
    runGuardsAndResolvers: (curr: ActivatedRouteSnapshot, future: ActivatedRouteSnapshot) => {
      return !future.queryParamMap.keys.length;
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventoryTransferRoutingModule {
}
