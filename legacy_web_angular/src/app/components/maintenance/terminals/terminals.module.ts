import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TerminalsRoutingModule } from './terminals-routing.module';
import { TerminalsComponent } from './terminals.component';
import { TableModule } from '@clavisco/table';
import { SharedModule } from 'src/app/shared/shared.module';
import { LinkerService } from '@clavisco/linker';
import { OverlayService } from '@clavisco/overlay';
import { AddTerminalsComponent } from './add-terminals/add-terminals.component';


@NgModule({
  declarations: [
    TerminalsComponent,
    AddTerminalsComponent
  ],
  imports: [
    CommonModule,
    TerminalsRoutingModule,
    TableModule,
    SharedModule
  ],
  providers: [
    {
      provide: 'LinkerService',
      useExisting: LinkerService
    },
    {
      provide: 'OverlayService',
      useExisting: OverlayService
    }
  ]
})
export class TerminalsModule { }
