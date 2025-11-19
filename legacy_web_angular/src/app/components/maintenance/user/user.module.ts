import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRoutingModule } from './user-routing.module';
import { UserComponent } from './user.component';
import { TableModule } from '@clavisco/table';
import { SharedModule } from 'src/app/shared/shared.module';
import { LinkerService } from '@clavisco/linker';
import { UserEditComponent } from './user-edit/user-edit.component';
import { UserAssignEditComponent } from './user-assign-edit/user-assign-edit.component';
import { SeriesEditComponent } from './series-edit/series-edit.component';
import { LocalPrinterEditComponent } from './local-printer-edit/local-printer-edit/local-printer-edit.component';

@NgModule({
  declarations: [
    UserComponent,
    UserEditComponent,
    UserAssignEditComponent,
    SeriesEditComponent,
    LocalPrinterEditComponent

  ],
    imports: [
        CommonModule,
        UserRoutingModule,
        SharedModule,
        TableModule,
    ],
  providers:  [
    {
      provide: 'LinkerService',
      useExisting: LinkerService
    }
  ]
})
export class UserModule { }
