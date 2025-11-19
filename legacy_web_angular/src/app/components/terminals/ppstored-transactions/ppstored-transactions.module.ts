import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ReactiveFormsModule} from "@angular/forms";
import {SharedModule} from "@app/shared/shared.module";
import {TableModule} from "@clavisco/table";
import {LinkerService} from "@clavisco/linker";
import {
  PpstoredTransactionsComponent
} from "@Component/terminals/ppstored-transactions/ppstored-transactions.component";
import {
  PpstoredTransactionsRoutingModule
} from "@Component/terminals/ppstored-transactions/ppstored-transactions-routing.module";



@NgModule({
  declarations: [
    PpstoredTransactionsComponent
  ],
  imports: [
    CommonModule,
    PpstoredTransactionsRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    TableModule,
  ],
  providers: [
    {
      provide: 'LinkerService',
      useExisting: LinkerService
    }
  ]
})
export class PpstoredTransactionsModule { }
