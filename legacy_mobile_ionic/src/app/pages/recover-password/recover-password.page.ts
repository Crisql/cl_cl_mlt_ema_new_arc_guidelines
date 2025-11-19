import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { LoadingController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { first } from "rxjs/operators";
import { AlertType } from "src/app/common";
import {
  AccountService,
  CommonService,
  PasswordValidatorService,
} from "src/app/services";

@Component({
  selector: "app-recover-password",
  templateUrl: "./recover-password.page.html",
  styleUrls: ["./recover-password.page.scss"],
})
export class RecoverPasswordPage implements OnInit {
  recoverForm: FormGroup;
  verificationCodeForm: FormGroup;
  verifyCode: boolean;
  recoverPassword: boolean;
  sendCode: boolean;
  user: string;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private loadingController: LoadingController,
    private translateService: TranslateService,
    private accountService: AccountService,
    private commonService: CommonService
  ) {}

  ngOnInit() {
    this.verificationCodeForm = this.formBuilder.group({
      code: ["", Validators.required],
    });
    this.recoverForm = this.formBuilder.group({
      user: ["", Validators.required],
    });
    this.sendCode = true;
    this.verifyCode = false;
    this.recoverPassword = false;
  }

    SetVerificationCodeMode(): void {
    this.verifyCode = true;
    this.sendCode = false;
    this.recoverPassword = false;
  }

    SetRecoverPasswordMode(): void {
    this.verifyCode = false;
    this.sendCode = false;
    this.recoverPassword = true;
    this.recoverForm = this.formBuilder.group(
      {
        user: [
          {
            value: this.user,
            disabled: true,
          },
          Validators.required,
        ],
        pass: ["", Validators.required],
        passConfirmation: ["", Validators.required],
      },
      {
        validator: PasswordValidatorService.MatchPassword,
      }
    );
  }

  async SendRecoveryEmail(): Promise<void> {
    let loading = await this.loadingController.create({
      message: this.commonService.Translate('Enviando correo...', 'Sending email...')
    });
    loading.present();

    this.accountService
      .SendVerificationCode(this.recoverForm.get("user").value)
      .pipe(first())
      .subscribe(
        (data: any) => {
          loading.dismiss();

          if (data && data.result) {
            this.user = this.recoverForm.get("user").value;
            this.SetVerificationCodeMode();
          } else {
              this.commonService.Alert(
                  AlertType.ERROR,
                  `Error enviando el correo ${data.errorInfo.Message}`,
                  `Error sending email ${data.errorInfo.Message}`
              );
          }
        },
        (error) => {
          loading.dismiss();
          this.commonService.alert(
            AlertType.ERROR,
            error
          );
        }
      );
  }

  async RecoverPass() {
    let loading = await this.loadingController.create({
      message: this.commonService.Translate('Cambiando contraseña', 'Changing password')
    });
    loading.present();

    this.accountService
      .RecoverPassMobile(
        this.recoverForm.get("user").value,
        this.recoverForm.get("pass").value
      )
      .pipe(first())
      .subscribe(
        (data: any) => {
          loading.dismiss();

          if (data && data.result) {
            this.router.navigateByUrl("login");
          } else {
              this.commonService.Alert(
                  AlertType.ERROR,
                  `Error cambiando contraseña ${data.errorInfo.Message}`,
                  `Error changing password ${data.errorInfo.Message}`
              );
          }
        },
        (error) => {
          loading.dismiss();
          this.commonService.alert(
            AlertType.ERROR,
            error
          );
        }
      );
  }

    async ValidateCode(): Promise<void> {
      let loading = await this.loadingController.create({
          message: this.commonService.Translate('Verificando código...', 'Verifying code')
      });
    loading.present();

    this.accountService
      .VerifyCode(this.user, this.verificationCodeForm.get("code").value)
      .pipe(first())
      .subscribe(
        (data: any) => {
          loading.dismiss();

          if (data && data.result) {
            this.SetRecoverPasswordMode();
          } else {
              this.commonService.Alert(
                  AlertType.ERROR,
                  `Código inválido`,
                  `Invalid code`
              )
          }
        },
        (error) => {
          loading.dismiss();
          this.commonService.alert(
            AlertType.ERROR,
            error
          );
        }
      );
  }
}
