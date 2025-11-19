import {Component, OnInit} from '@angular/core';
import {ICompany} from "../../models/db/companys";
import {
    CheckRouteService,
    CommonService, ExRateService,
    LocalStorageService, LogManagerService,
    PermissionService,
    PublisherService,
    Repository,
    UserService
} from "../../services";
import {AlertType, LocalStorageVariables, LogEvent, PublisherVariables} from "../../common/enum";
import {catchError, concatMap, finalize, tap} from "rxjs/operators";
import {LoadingController, ModalController, ToastController} from "@ionic/angular";
import {EMPTY, forkJoin, from, of} from "rxjs";
import {SyncService} from "../../services/sync.service";
import {ICLResponse} from "../../models/responses/response";
import {IExchangeRate} from "../../models";
import {IUserAssign} from "../../models/db/user-model";

@Component({
    selector: 'app-company-selection',
    templateUrl: './company-selection.component.html',
    styleUrls: ['./company-selection.component.scss'],
})
export class CompanySelectionComponent implements OnInit {

    companies: ICompany[];

    constructor(
        private localStorageService: LocalStorageService,
        private commonService: CommonService,
        private userService: UserService,
        private modalController: ModalController,
        private exchangeRateService:ExRateService
    ) {
    }

    ngOnInit() {
        this.GetUserCompanies();
    }

    async GetUserCompanies(): Promise<void> {
        let loader = await this.commonService.Loader();
        loader.present();

        this.userService.GetCompanies()
            .pipe(finalize(() => loader.dismiss()))
            .subscribe({
                next: (response) => {
                    if (response.Data) {
                        this.companies = response.Data;
                    } else {
                        this.commonService.Alert(AlertType.INFO, response.Message, response.Message);
                    }
                },
                error: (err) => {
                    this.commonService.Alert(AlertType.INFO, err, err);
                }
            });
    }

    async OnClickCompany(_company: ICompany) {
        this.localStorageService.set(LocalStorageVariables.SelectedCompany, _company, true);

        //Emito compania para que el app.component.ts la obtenga y muestre el nombre en el menu
        this.localStorageService.OnSelectCompany$.next(_company);

        let loader = await this.commonService.Loader();
        loader.present();

        forkJoin({
            Userssing: this.userService.GetUserAssign().pipe(catchError(error => of({
                Data: null,
                Message: error
            } as ICLResponse<IUserAssign>))),
            ExhangeRate: this.exchangeRateService.GetExchangeRate().pipe(catchError(error => of({
                Data: null,
                Message: error
            } as ICLResponse<IExchangeRate>)))
        }).pipe(
            finalize(() => {
                loader.dismiss();
                this.modalController.dismiss(_company, 'Confirm');
            })
        ).subscribe({
                next: (response) => {
                    
                    let message: string;
                    
                    if (response.Userssing.Data) {
                        this.localStorageService.set(LocalStorageVariables.UserAssignment, response.Userssing.Data, true);
                    } else if (response.Userssing.Message) {
                        message = this.commonService.Translate(`Error al obtener el usuario asignado, Detalle: ${response.Userssing.Message}.`,
                            `Error getting assigned user, Detail: ${response.Userssing.Message}`);
                    }

                    if (response.ExhangeRate.Message) {
                        message = this.commonService.Translate(`Error al obtener el usuario asignado, Detalle: ${response.Userssing.Message}`,
                            `Error getting assigned user, Detail: ${response.Userssing.Message}.`);
                    }else if(!response.ExhangeRate.Data){
                        message = this.commonService.Translate(`No se ha definido el tipo de cambio.`,
                            `The exchange rate has not been defined.`);
                    }

                    if (message) {
                        this.commonService.Alert(AlertType.ERROR, message, message);
                    }
                    
                },
                error: (err) => {
                    this.commonService.Alert(AlertType.ERROR, err, err);
                }
            });
    }
}
