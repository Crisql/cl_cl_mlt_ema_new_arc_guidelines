import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {TransferRequest} from "./transfer-request.page";

const routes: Routes = [
  {
    path: '',
    component: TransferRequest
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransferRequestRoutingModule { }
