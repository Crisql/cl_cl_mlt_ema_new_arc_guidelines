import { formatDate } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PickerController } from '@ionic/angular';
import { PickerOptions } from "@ionic/core";
import { ICompanyInformation, ISearch } from 'src/app/models';
import { CompanyService, DocumentService, PermissionService, UserService, CommonService, PrintingService, LocalStorageService } from 'src/app/services';
import { CustomModalController } from 'src/app/services/custom-modal-controller.service';
import { AlertType, LocalStorageVariables } from '../../common/enum';
import { ILicenseUser } from 'src/app/interfaces/i-license-user';
import { LiceenseUserService } from 'src/app/services/license.service';
import { finalize } from 'rxjs/operators';
import { ICashDeskclosing } from 'src/app/interfaces/i-cash-closing';
import { FormatDate } from 'src/app/common/function';
import { PrintFormatService } from 'src/app/services/print-format.service';
import { IUserToken } from 'src/app/models/db/user-token';

@Component({
  selector: 'app-cash-desk-closing',
  templateUrl: './cash-desk-closing.component.html',
  styleUrls: ['./cash-desk-closing.component.scss'],
})
export class CashDeskClosingComponent implements OnInit, OnDestroy {
  //varbox
  companyInfo: ICompanyInformation;
  animals;
  animals_back: string[] = ["Tiger", "Lion", "Elephant", "Fox", "Wolf"];
  searchForm: FormGroup;
  users: ILicenseUser[] = [];

  cashclosing: ICashDeskclosing[] = [];

  constructor(
    private modalController: CustomModalController
    , private pickerController: PickerController
    , private formBuilder: FormBuilder
    , private commonService: CommonService
    , private userService: UserService,
    private licenseService: LiceenseUserService,
    private printFormatService: PrintFormatService,
    private printService: PrintingService,
    private permissionService: PermissionService,
    private localStorageService: LocalStorageService
  ) { }
  ngOnDestroy(): void {
    this.modalController.DismissAll();
  }

  ngOnInit() {
    this.InitVariables();
  }


  Dismiss() {
    this.modalController.dismiss();
  }


  InitVariables(): void {
    this.users = [];
    this.ResetSearchForm();
    this.LoadData();
  }

  async LoadData(): Promise<void> {
    let loader = await this.commonService.Loader();
    loader.present();

    this.licenseService.GetLicenseUser().pipe(
      finalize(() => loader.dismiss())
    ).subscribe({
      next: (callback) => {
        if (callback.Data && callback.Data.length > 0) {
          if (callback.Data.length === 1) {
            this.commonService.toast(this.commonService.Translate(`Solo tiene permitido ver su cierre de caja`, "You are only allowed to see your cash closure"), "dark", "bottom");
          }
          this.users = callback.Data;
        } else {
          this.commonService.toast(this.commonService.Translate(`No se encontraron registros`, "No records found"), "dark", "bottom");
        }
      },
      error: (error) => {
        this.commonService.Alert(AlertType.ERROR, error, error);
      }
    });
  }

  ResetSearchForm(): void {
    const CURRENT_DATE = formatDate(new Date(), 'yyyy-MM-dd', 'en');
    this.searchForm = this.formBuilder.group({
      From: [CURRENT_DATE],
      To: [CURRENT_DATE],
      Key: ['', Validators.required]
    });
  }

  async DisplayUsers() {
    let options: PickerOptions = {
      buttons: [
        {
          text: "Cancel",
          role: 'cancel'
        },
        {
          text: 'Ok',
          handler: (value: any) => {
            console.log(value);
          }
        }
      ],
      columns: [{
        name: 'Animals',
        options: this.getColumnOptions()
      }]
    };

    let picker = await this.pickerController.create(options);
    picker.present()
  }

  getColumnOptions() {
    let a = <HTMLIonInputElement>document.getElementById("SearchId");
    let options = [];

    if (a.value.toString() != '') {

      this.animals = this.animals_back.filter(x => x.includes(a.value.toString()));
    }
    else {
      this.animals = [];
      this.animals_back.forEach(x => this.animals.push(x));
    }

    this.animals.forEach(x => {
      options.push({ text: x, value: x });
    });
    return options;
  }

  /**
   * This method is used to get cash desclosing
   */
  async GetCashDeskClousingUsers(): Promise<void> {    
    if(this.localStorageService.get(LocalStorageVariables.Session).UserEmail === this.searchForm.get('Key').value || this.permissionService.Permissions.some(permission => permission.Name === 'M_Sales_CashClosing_SearchCashClosingOfUsers') === true){

      const BASE_SEARCH = { ...this.searchForm.value } as ISearch;

      let from = FormatDate(BASE_SEARCH.From);
      let to = FormatDate(BASE_SEARCH.To);

      let loader = await this.commonService.Loader();
      loader.present();

        this.userService.GetCashDeskClousingUsers(BASE_SEARCH.Key, from, to).pipe(
          finalize(() => loader.dismiss())
        )
          .subscribe({
            next: (callback) => {
              if (callback.Data && callback.Data.length > 0) {
                this.cashclosing = callback.Data;
              } else {
                this.cashclosing = [];
                this.commonService.toast(this.commonService.Translate(`No se encontraron registros`, "No records found"), "dark", "bottom");
              }
            },
            error: (error) => {
              this.cashclosing = [];
              this.commonService.Alert(AlertType.ERROR, error, error);
            }
          });
      }else{
        this.commonService.toast(this.commonService.Translate(`Solo tiene permitido ver su cierre de caja`, "You are only allowed to see your cash closure"), "dark", "bottom");
      }
  }


  /**
   * This method is used to print ZPL
   * @param _report 
   */
  async SelectUser(_report: ICashDeskclosing): Promise<void> {

    let loader = await this.commonService.Loader();
    loader.present();

    this.printFormatService.GetCashClosingPrint(_report.Id).pipe(
      finalize(() => loader.dismiss())
    ).subscribe({
      next: (callback) => {
        if (callback.Data) {
          this.printService.Print(callback.Data.PrintFormat);
        } else {
          this.commonService.toast(this.commonService.Translate(`No se encontraron registros`, "No records found"), "dark", "bottom");
        }
      },
      error: (error) => {
        this.commonService.Alert(AlertType.ERROR, error, error);
      }
    });
  }



}
