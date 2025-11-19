import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ModalController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";

import { CommonService } from "src/app/services";
import { CustomModalController } from "src/app/services/custom-modal-controller.service";

@Component({
  selector: "app-send-email-report",
  templateUrl: "./send-email-report.component.html",
  styleUrls: ["./send-email-report.component.scss"],
})
export class SendEmailReportComponent implements OnInit, OnDestroy {
  emailForm: FormGroup;
  recipients: string[];

  constructor(
    private modalController: CustomModalController,
    private formBuilder: FormBuilder,
    private translateService: TranslateService,
    private commonService: CommonService
  ) {}
  ngOnDestroy(): void {
    this.modalController.DismissAll();
  }

  ngOnInit() {
    this.recipients = [];
    this.emailForm = this.formBuilder.group({
      To: [
        "",
        [
          Validators.required,
          Validators.pattern("[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,3}$"),
        ],
      ],
      Header: ["", Validators.required],
      Body: ["", Validators.required],
    });
  }

  async onClickAccept() {
    if (
      this.emailForm.get("Body").invalid ||
      this.emailForm.get("Header").invalid
    ) {
      this.commonService.toast(
        this.translateService.currentLang === "es"
          ? "Datos del correo faltantes"
          : "Missing email data",
        "dark",
        "bottom"
      );

      return;
    } else {
      this.accept();
    }
  }

  accept() {
    let email = {
      Body: this.emailForm.get("Body").value,
      Recipients: this.recipients,
      Subject: this.emailForm.get("Header").value,
    };

    this.modalController.dismiss(email);
  }

  dismiss() {
    this.modalController.dismiss();
  }

  onKeyUpAddRecipient() {
    if (this.emailForm.get("To").invalid) return;

    this.recipients.push(this.emailForm.get("To").value);
    this.emailForm.get("To").reset();
  }

  onClickDeleteRecipient(index: number) {
    this.recipients.splice(index, 1);
  }
}
