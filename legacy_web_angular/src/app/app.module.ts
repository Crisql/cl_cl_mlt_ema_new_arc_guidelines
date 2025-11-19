import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { LoginComponent, LoginModule } from '@clavisco/login';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { UrlInterceptor } from './interceptors/url.interceptor';
import { SharedModule } from './shared/shared.module';
import { AlertsModule, AlertsService } from '@clavisco/alerts';
import { HeadersInterceptor } from './interceptors/headers.interceptor';
import { LinkerService } from '@clavisco/linker';
import { Miscellaneous } from '@clavisco/core';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { OverlayService } from '@clavisco/overlay';
import {RECAPTCHA_V3_SITE_KEY} from "ng-recaptcha";
import {environment} from "@Environment/environment";
import {ActionCenterPushInterceptor} from "@app/interceptors/action-center-push.interceptor";
import {RoutingInterceptor} from "@app/interceptors/routing.interceptor";
import {PendingTransactionInterceptor} from "@app/interceptors/pending-transaction.interceptor";

@NgModule({
  declarations: [
    AppComponent],
  imports: [
    BrowserModule,
    SharedModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AlertsModule,
    LoginModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: UrlInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HeadersInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: Miscellaneous.Interceptors.HttpAlertInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ActionCenterPushInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    },
    {
      provide: 'OverlayService',
      useClass: OverlayService
    },
    {
      provide: 'AlertsService',
      useClass: AlertsService
    },
    {
      provide: 'LinkerService',
      useClass: LinkerService
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: Miscellaneous.Interceptors.HttpAlertInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: Miscellaneous.Interceptors.PagedRequestInterceptor,
      multi: true
    },
    {
      provide: RECAPTCHA_V3_SITE_KEY,
      useValue: environment.recatchaSiteKey
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RoutingInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
