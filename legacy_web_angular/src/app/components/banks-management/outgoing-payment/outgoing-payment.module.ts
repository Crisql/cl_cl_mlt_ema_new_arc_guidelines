import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OutgoingPaymentRoutingModule } from './outgoing-payment-routing.module';
import { OutgoingPaymentComponent } from './outgoing-payment.component';
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatOptionModule} from "@angular/material/core";
import {MatSelectModule} from "@angular/material/select";
import {ReactiveFormsModule} from "@angular/forms";
import {SharedModule} from "@app/shared/shared.module";
import {TableModule} from "@clavisco/table";
import {DynamicsUdfsPresentationModule} from "@clavisco/dynamics-udfs-presentation";


@NgModule({
  declarations: [
    OutgoingPaymentComponent
  ],
    imports: [
        CommonModule,
        OutgoingPaymentRoutingModule,
        MatAutocompleteModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        MatOptionModule,
        MatSelectModule,
        ReactiveFormsModule,
        SharedModule,
        TableModule,
        DynamicsUdfsPresentationModule
    ]
})
export class OutgoingPaymentModule { }
