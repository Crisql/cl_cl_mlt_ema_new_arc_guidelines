import {NgModule} from '@angular/core';
import {ActivatedRouteSnapshot, RouterModule, Routes} from '@angular/router';
import {
  InventoryTransferRequestComponent
} from '@Component/inventory/transfer-request/inventory-transfer-request.component';
import {TransferRequestResolver} from "@app/resolvers/transfer-request.resolver";

export const routes: Routes = [
  {
    path: '',
    component: InventoryTransferRequestComponent,
    resolve: {resolvedData: TransferRequestResolver},
    runGuardsAndResolvers: (curr: ActivatedRouteSnapshot, future: ActivatedRouteSnapshot) => {
      return !future.queryParamMap.keys.length;
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventoryTransferRequestRoutingModule {
}
