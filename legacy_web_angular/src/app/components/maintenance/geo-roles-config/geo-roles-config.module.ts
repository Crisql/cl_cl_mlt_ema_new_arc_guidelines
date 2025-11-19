import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GeoRolesConfigRoutingModule } from './geo-roles-config-routing.module';
import {GeoRolesConfigComponent} from "@Component/maintenance/geo-roles-config/geo-roles-config.component";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatOptionModule} from "@angular/material/core";
import {MatSelectModule} from "@angular/material/select";
import {MatTabsModule} from "@angular/material/tabs";
import {SharedModule} from "@app/shared/shared.module";
import {TableModule} from "@clavisco/table";
import { GeoRoleEditComponent } from './geo-role-edit/geo-role-edit.component';


@NgModule({
  declarations: [
    GeoRolesConfigComponent,
    GeoRoleEditComponent
  ],
    imports: [
        CommonModule,
        GeoRolesConfigRoutingModule,
        MatFormFieldModule,
        MatOptionModule,
        MatSelectModule,
        MatTabsModule,
        SharedModule,
        TableModule
    ]
})
export class GeoRolesConfigModule { }
