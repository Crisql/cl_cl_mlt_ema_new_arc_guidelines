import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {LoginPageRoutingModule} from './login-routing.module';

import {LoginPage} from './login.page';
import {TranslateModule} from '@ngx-translate/core';
import {RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module} from "ng-recaptcha";
import {environment} from "../../../environments/environment";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        IonicModule,
        LoginPageRoutingModule,
        TranslateModule,
        RecaptchaV3Module
    ],
    declarations: [LoginPage],
    providers: [
        {
            provide: RECAPTCHA_V3_SITE_KEY,
            useValue: environment.siteKey
        }
    ]
})
export class LoginPageModule {
}
