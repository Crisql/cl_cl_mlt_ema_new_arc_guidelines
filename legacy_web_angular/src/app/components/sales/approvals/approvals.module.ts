import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ApprovalsComponent} from "@Component/sales/approvals/approvals.component";
import { ApprovalsRoutingModule } from './approvals-routing.module';
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatOptionModule} from "@angular/material/core";
import {MatSelectModule} from "@angular/material/select";
import {ReactiveFormsModule} from "@angular/forms";
import {SharedModule} from "@app/shared/shared.module";
import {TableModule} from "@clavisco/table";

@NgModule({
  declarations: [
    ApprovalsComponent
  ],
    imports: [
        CommonModule,
        ApprovalsRoutingModule,
        MatAutocompleteModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatInputModule,
        MatOptionModule,
        MatSelectModule,
        ReactiveFormsModule,
        SharedModule,
        TableModule
    ]
})
export class ApprovalsModule { }
