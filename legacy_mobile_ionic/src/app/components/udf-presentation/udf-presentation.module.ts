import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {UdfPresentationComponent} from "./udf-presentation.component";
import {TranslateModule} from "@ngx-translate/core";
import {ReactiveFormsModule} from "@angular/forms";
import {IonicModule} from "@ionic/angular";

@NgModule({
  declarations: [UdfPresentationComponent],
  imports: [
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    IonicModule
  ],
  exports: [UdfPresentationComponent]
})
export class UdfPresentationModule { }
