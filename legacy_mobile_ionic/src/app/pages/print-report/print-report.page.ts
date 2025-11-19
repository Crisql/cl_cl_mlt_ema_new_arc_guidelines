import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { forkJoin, Subscription } from "rxjs";
import { filter, first } from "rxjs/operators";

import { RptManagerService } from 'src/app/services/rpt-manager.service';

import { Email, Parameter, Report, ReportParameter } from "src/app/models";
import { CommonService, FileService } from "src/app/services";
import { ModalController } from "@ionic/angular";
import { SendEmailReportComponent } from "src/app/components";
import { AlertType } from "src/app/common";
import { CustomModalController } from "src/app/services/custom-modal-controller.service";

@Component({
  selector: "app-print-report",
  templateUrl: "./print-report.page.html",
  styleUrls: ["./print-report.page.scss"],
})
export class PrintReportPage implements OnInit, OnDestroy {
  routerEventsSubs: Subscription;
  parameters: ReportParameter[];
  parametersForm: FormGroup;
  reportKeys: Parameter[];
  reportId: number;
  report: Report;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private translateService: TranslateService,
    private modalController: CustomModalController,
    private rptManagerService: RptManagerService,
    private commonService: CommonService,
    private fileService: FileService
  ) {}

  ngOnInit() {
    this.parametersForm = this.formBuilder.group({});
    this.routerEventsSubs = this.router.events
      .pipe(
        filter(
          (event$) =>
            event$ instanceof NavigationEnd &&
            event$.url.search("print-report") > -1
        )
      )
      .subscribe(() => this.InitApp());
  }

  ngOnDestroy() {
    if (this.routerEventsSubs) this.routerEventsSubs.unsubscribe();

    this.modalController.DismissAll();
  }

  InitApp() {
    this.reportId = Number(
      this.activatedRoute.snapshot.paramMap.get("reportId")
    );
    this.parametersForm.reset();
    this.reportKeys = [];

    this.RequiredDataLoad();
  }

  async RequiredDataLoad(): Promise<void> {
    this.report = {} as Report;
    this.parameters = [];
    const loading = await this.commonService.loading(
        this.commonService.Translate('Procesando...', 'Processing...')
    );
    loading.present();

    forkJoin({
      parameters: this.rptManagerService.GetParameters(this.reportId),
      report: this.rptManagerService.GetReport(this.reportId),
    }).subscribe(
      (response) => {
        loading.dismiss();

        if (response.parameters.Result) {
          this.parameters = response.parameters.Parameters;
          this.SetFormControls();
        }
        if (response.report.Result) {
          this.report = response.report.Report;
        }
      },
      (err) => {
        loading.dismiss();
      }
    );
  }

  ResetParameterForm(): void {
    for (const control in this.parametersForm.controls) {
      this.parametersForm.get(control).reset();
    }
  }

  async OnClickPrintReport(): Promise<void> {
    const loading = await this.commonService.loading(
        this.commonService.Translate('Procesando...', 'Processing...')
    );
    loading.present();

    const parameters: Parameter[] = this.GetParametersForReportPrint();
    this.rptManagerService
      .PrintReport(parameters, this.reportId)
      .pipe(first())
      .subscribe(
        (response) => {
          loading.dismiss();

          if (response.Result) {
            this.fileService
              .writeFile(response.Print, this.report.DisplayName)
              .then((result) => {
                this.fileService.openPDF(result.nativeURL).then((result) => {
                  this.parametersForm.reset();
                });
              });
          } else {
            this.commonService.alert(AlertType.ERROR, response.ErrorInfo.Message);
          }
        },
        (err) => {
          loading.dismiss();
          this.commonService.alert(AlertType.ERROR, err);
        }
      );
  }

  SetFormControls(): void {
    this.parameters.forEach((x) => {
      this.parametersForm.addControl(
        x.Name,
        !x.Required
          ? new FormControl("")
          : new FormControl("", {
              validators: Validators.required,
            })
      );
    });
  }

  GetParametersForReportPrint(): Parameter[] {
    let parameters: Parameter[] = [];
    if (this.parameters) {
      this.parameters.forEach((x) => {
        let parameter: Parameter = {
          Key: x.Name,
          Type: x.Type,
          Value: this.parametersForm.get(x.Name).value,
        };

        parameters.push(parameter);
      });
    }

    return parameters;
  }

  async OnClickSendEmail(): Promise<void> {
    let modal = await this.modalController.create({
      component: SendEmailReportComponent,
    });

    modal.present();

    modal.onDidDismiss().then(async (result) => {
      if (result.data) {
        let email: Email = {
          ...result.data,
          Parameters: this.GetParametersForReportPrint(),
        };
        let loading = await this.commonService.loading(
          this.translateService.currentLang === "es"
            ? "Procesando..."
            : "Processing..."
        );

        loading.present();

        this.rptManagerService
          .SendEmail(email, this.reportId)
          .pipe(first())
          .subscribe(
            (response: any) => {
              loading.dismiss();

              if (response.Result) {
                this.commonService.toast(
                  `${
                    this.translateService.currentLang === "es"
                      ? "Correo enviado exitosamente"
                      : "Email succesfully sent"
                  }`,
                  "dark"
                );
              } else {
                this.commonService.alert(AlertType.ERROR, response.ErrorInfo.Message);
              }
            },
            (err) => {
              loading.dismiss();
              this.commonService.alert(AlertType.ERROR, err);
            }
          );
      }
    });
  }
}
