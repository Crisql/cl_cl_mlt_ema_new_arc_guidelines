import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {LoginContainerRoutingModule} from './login-container-routing.module';
import {LoginContainerComponent} from './login-container.component';
import {LoginModule} from '@clavisco/login';
import {LinkerService} from '@clavisco/linker';
import {OverlayService} from '@clavisco/overlay';
import {AlertsService} from '@clavisco/alerts';

@NgModule({
  declarations: [
    LoginContainerComponent
  ],
  imports: [
    CommonModule,
    LoginContainerRoutingModule,
    LoginModule
  ],
  providers: [
    {
      provide: 'OverlayService',
      useClass: OverlayService
    },
    {
      provide: 'LinkerService',
      useClass: LinkerService
    },
    {
      provide: 'AlertsService',
      useClass: AlertsService
    }
  ]
})
export class LoginContainerModule {
}
