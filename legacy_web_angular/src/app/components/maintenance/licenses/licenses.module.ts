import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LicensesRoutingModule } from './licenses-routing.module';
import { LicensesComponent } from './licenses.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { TableModule } from '@clavisco/table';
import { LinkerService } from '@clavisco/linker';
import { LicensesEditComponent } from './licenses-edit/licenses-edit.component';
import { OverlayService } from '@clavisco/overlay';


@NgModule({
  declarations: [
    LicensesComponent,
    LicensesEditComponent
  ],
  imports: [
    CommonModule,
    LicensesRoutingModule,
    SharedModule,
    TableModule
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
export class LicensesModule { }
