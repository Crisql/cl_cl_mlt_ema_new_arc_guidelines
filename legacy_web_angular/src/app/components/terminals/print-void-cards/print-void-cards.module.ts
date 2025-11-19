import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PrintVoidCardsRoutingModule } from './print-void-cards-routing.module';
import { PrintVoidCardsComponent } from './print-void-cards.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatOptionModule} from "@angular/material/core";
import {MatSelectModule} from "@angular/material/select";
import {SharedModule} from "@app/shared/shared.module";
import {TableModule} from "@clavisco/table";


@NgModule({
  declarations: [
    PrintVoidCardsComponent
  ],
    imports: [
        CommonModule,
        PrintVoidCardsRoutingModule,
        FormsModule,
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
export class PrintVoidCardsModule { }
