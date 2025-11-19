import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { LoadingController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import jsSHA from "jssha";
import { AlertType } from "src/app/common";

// Services
import {
  AccountService,
  CommonService,
  LocalStorageService,
  PasswordValidatorService,
  Repository
} from "src/app/services";
import { SyncService } from "src/app/services/sync.service";

@Component({
  selector: "app-change-password",
  templateUrl: "./change-password.page.html",
  styleUrls: ["./change-password.page.scss"],
})
export class ChangePasswordPage implements OnInit {
  passForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private loadingController: LoadingController,
    private translateService: TranslateService,
    private localStorageService: LocalStorageService,
    private syncService: SyncService,
    private accountService: AccountService,
    private commonService: CommonService,
    private repositoryUser: Repository.User
  ) {}

  ngOnInit() {
    this.passForm = this.formBuilder.group(
      {
        user: [
          {
            value: this.localStorageService.data.get("Session").UserName,
            disabled: true,
          },
          Validators.required,
        ],
        currPass: ["", Validators.required],
        pass: ["", Validators.required],
        passConfirmation: ["", Validators.required],
      },
      {
        validator: PasswordValidatorService.MatchPassword,
      }
    );
  }

  Hash256(word: string): string {
    let shaObj = new jsSHA("SHA-256", "TEXT");
    shaObj.update(word);
    let hash = shaObj.getHash("HEX");
    return hash;
  }

  InitApp(): void {
    this.passForm.reset({
      user: "",
      currPass: "",
      pass: "",
      passConfirmation: "",
    });
  }

  async ChangePass(): Promise<void> {
    let loading = await this.loadingController.create({
      message: this.commonService.Translate('Cambiando contraseña', 'Changing password')
    });
    loading.present();

    let pass = this.Hash256(this.passForm.get("currPass").value);
    let user = await this.repositoryUser.GetUserLogin(
      this.passForm.get("user").value.toUpperCase(),
      pass
    );

    if (!user || user.length === 0) {
      loading.dismiss();
      this.commonService.alert(
        AlertType.ERROR,
        this.translateService.currentLang === "en"
          ? "Incorrect username and/or password"
          : "Usuario y/o contraseña incorrecto"
      );

      return;
    }

    this.accountService
      .ChangePass(
        this.passForm.get("user").value,
        this.passForm.get("pass").value
      )
      .subscribe(
        (data) => {
          loading.dismiss();

          if (data.result) {
            this.commonService.alert(
              AlertType.SUCCESS,
              this.translateService.currentLang === "en"
                ? "Password changed successfully"
                : "Contraseña cambiada con éxito"
            );

            this.syncService.SyncUsers();
            this.InitApp();
          } else {
            this.commonService.alert(
              AlertType.ERROR,
              this.translateService.currentLang === "en"
                ? "Error while changing password"
                : "Error cambiando la contraseña"
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
}
