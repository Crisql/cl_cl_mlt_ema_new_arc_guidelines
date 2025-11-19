import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatTabsModule} from '@angular/material/tabs';
import {MatGridListModule} from '@angular/material/grid-list';
import { RolesPermsRoutingModule } from './roles-perms-routing.module';
import { RolesPermsComponent } from './roles-perms.component';
import { TableModule } from '@clavisco/table';
import { SharedModule } from 'src/app/shared/shared.module';
import { LinkerService } from '@clavisco/linker';
import { RoleEditComponent } from './role-edit/role-edit.component';

@NgModule({
  declarations: [
    RolesPermsComponent,
    RoleEditComponent
  ],
  imports: [
    CommonModule,
    RolesPermsRoutingModule,
    SharedModule,
    TableModule,
    MatTabsModule,
    MatGridListModule
  ],
  providers:  [
    {
      provide: 'LinkerService',
      useExisting: LinkerService
    }
  ]
})
export class RolesPermsModule { }
