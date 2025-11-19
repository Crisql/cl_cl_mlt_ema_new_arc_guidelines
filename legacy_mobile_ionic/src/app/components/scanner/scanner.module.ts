import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ScannerComponent} from "./scanner.component";
import {IonicModule} from "@ionic/angular";



@NgModule({
  declarations: [ScannerComponent],
  exports: [
    ScannerComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
  ]
})
export class ScannerModule { }
