import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PrincipalRoutingModule } from './principal-routing.module';
import { PrincipalComponent } from './principal.component';
import { MenuModule } from '@clavisco/menu';
import { SharedModule } from '../shared/shared.module';
import { LinkerService } from '@clavisco/linker';
import {RptmngMenuModule, RptmngMenuService} from "@clavisco/rptmng-menu";
import {TableModule} from "@clavisco/table";
import {NotificationPanelModule} from "@clavisco/alerts";
import {PinpadModule} from "@clavisco/pinpad";
import {OverlayService} from "@clavisco/overlay";


@NgModule({
  declarations: [
    PrincipalComponent
  ],
    imports: [
        CommonModule,
        PrincipalRoutingModule,
        SharedModule,
        MenuModule,
        RptmngMenuModule,
        TableModule,
        NotificationPanelModule,
        PinpadModule
    ],
  providers: [
    {
      provide: 'LinkerService',
      useExisting: LinkerService
    },
    {
      provide: 'RptmngMenuService',
      useClass: RptmngMenuService
    }
  ]
})
export class PrincipalModule { }
