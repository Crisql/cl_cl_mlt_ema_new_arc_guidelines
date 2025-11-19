import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SearchInventoryTransfersComponent} from './search-inventory-transfers.component';
import {SearchTransferRequestResolver} from "@app/resolvers/search-transfer-request.resolver";

export const routes: Routes = [
  {
    path: '',
    component: SearchInventoryTransfersComponent,
    resolve: {resolvedData: SearchTransferRequestResolver}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SearchInventoryTransfersRoutingModule {
}
