import {Injectable} from "@angular/core";
import {LoadingController, ToastController} from "@ionic/angular";
import {TranslateService} from "@ngx-translate/core";
import {Network} from "@ionic-native/network/ngx";
import {EMPTY, forkJoin, from, interval, Observable, of, Subscription, throwError, timer} from "rxjs";
import {
    catchError,
    concatMap,
    filter,
    finalize,
    first,
    map,
    mergeMap,
    reduce,
    switchMap,
    tap,
    toArray
} from "rxjs/operators";
import {Device} from "@ionic-native/device/ngx";
import {IBlanketAgreement, ICurrency, IExchangeRate, IGeoConfig, ILogMobile, ILogSetting, ISetting} from "../models";
import {UserService as ApiUserService} from "./user.service";
import {ConfigurationService as ApiConfigurationService} from "./configuration.service";
import {CustomerService as ApiCustomerService} from "./customer.service";
import {PriceListService as ApiPriceListService} from "./price-list.service";
import {CompanyService as ApiCompanyService} from "./company.service";
import {LocalStorageService} from "./local-storage.service";
import {WarehouseService as ApiWarehouseService} from "./warehouse.service";
import {CardService as ApiCardService} from "./card.service";
import {AccountService as ApiAccountService} from "./account.service";
import {ExRateService as ApiExRateService} from "./ex-rate.service";
import {GeoconfigService as ApiGeoconfigService} from "./geoconfig.service";
import {SeriesService as ApiSerieService} from "./series.service";
import {MeasurementUnitService as ApiMeasurementUnitService} from "./measurement-unit.service";
import {DiscountGroupService as ApiDiscountGroupService} from "./discount-group.service";
import {DiscountHierarchyService as ApiDiscountHierarchyService} from "./discount-hierarchy.service";
import {TaxService as ApiTaxService} from "./tax.service";
import {ProductService as ApiProductService} from "./product.service";
import {RouteService} from "./route.service";
import {AlertType, CheckType, Geoconfigs, RouteStatus,} from "../common";
import {CheckInService as ApiCheckInService} from "./check-in.service";
import {Geolocation} from "@ionic-native/geolocation/ngx";
import {PermissionService as ApiPermissionService} from "./permission.service";
import {RptManagerService} from "./rpt-manager.service";
import {ChartService as ApiChartService} from "./chart.service";
import {
    ChangeElement, DocumentSyncStatus,
    LocalStorageVariables,
    LogEvent,
    PublisherVariables,
    SettingCodes,
    SynchronizedRoutesFrom
} from "../common/enum";
import {LogManagerService} from "./log-manager.service";
import {CommonService} from "./common.service";
import {ICLResponse} from "../models/responses/response";
import {DatePipe} from "@angular/common";
import {PublisherService} from "./publisher.service";
import {Repository} from "./repository.service";
import {DocumentService} from "./document.service";
import {IPriceListInfo} from '../models/db/i-price-list-info';
import {IRoute, IRouteWithLines, ISyncronizedRoutes} from "../models/db/route-model";
import {ICompany} from "../models/db/companys";
import {IUser} from "../models/i-user";
import {IItem} from "../models/i-item";
import {IBusinessPartner} from "../models/i-business-partner";
import {ICard} from "../models/i-card";
import {IPriceList} from "../models/i-price-list";
import {UdfsService} from "./udfs.service";
import {ILogEvent} from "../interfaces/i-log-events";
import {SettingsService} from "./settings.service";
import {IRouteHistory} from "../interfaces/i-route-history";
import {BillOfMaterialsService} from "./bill-of-materials.service";
import {IUdfContext, IUdfDevelopment} from "../interfaces/i-udfs";
import {IBillOfMaterialToSync} from "../interfaces/i-item";
import {IMobileAppConfiguration} from "../interfaces/i-settings";
import {MenuService} from "./menu.service";
import {IMenuMobile} from "../interfaces/i-menu";
import { PrintFormatService } from "./print-format.service";
import { PayTermsService } from "./pay-terms.service";

@Injectable({
    providedIn: "root",
})
export class SyncService {
    activeRouteId: number;
    automaticCheckInterval: any;
    automaticCheckSynchronization$: Subscription;
    automaticVerificationOfClosedRoutes$: Subscription;
    private _synchronizationsCounter: number = 0;
    private _totalToSynchronize: number = 0;
    constructor(
        private datePipe: DatePipe,
        private translateService: TranslateService,
        private loadingController: LoadingController,
        private toastCtrl: ToastController,
        private network: Network,
        private device: Device,
        private geolocation: Geolocation,
        private localStorageService: LocalStorageService,
        private apiUserService: ApiUserService,
        private repositoryUser: Repository.User,
        private repositoryConfiguration: Repository.Configuration,
        private apiConfigService: ApiConfigurationService,
        private repositoryCustomer: Repository.Customer,
        private customerService: ApiCustomerService,
        private repositoryProduct: Repository.Product,
        private productService: ApiProductService,
        private repositoryPriceList: Repository.PriceList,
        private priceService: ApiPriceListService,
        private repositoryCompany: Repository.Company,
        private apiCompanyService: ApiCompanyService,
        private repositoryWarehouse: Repository.Warehouse,
        private apiWarehouseService: ApiWarehouseService,
        private repositoryCard: Repository.Card,
        private apiCardService: ApiCardService,
        private repositoryAccount: Repository.Account,
        private apiAccountService: ApiAccountService,
        private repositoryExchangeRate: Repository.ExchangeRate,
        private apiExrateService: ApiExRateService,
        private repositoryGeoConfiguration: Repository.GeoConfiguration,
        private apiGeoconfigService: ApiGeoconfigService,
        private repositorySerie: Repository.Serie,
        private apiserieService: ApiSerieService,
        private repositoryMeasurementUnit: Repository.MeasurementUnit,
        private ApimUnitService: ApiMeasurementUnitService,
        private repositoryDiscountGroup: Repository.DiscountGroup,
        private discountService: ApiDiscountGroupService,
        private repositoryDiscountHierarchy: Repository.DiscountHierarchy,
        private apiDiscHierarchyService: ApiDiscountHierarchyService,
        private repositoryTax: Repository.Tax,
        private apiTaxService: ApiTaxService,
        private routeService: RouteService,
        private repositoryRoute: Repository.Route,
        private repositoryRouteHistory: Repository.RouteHistory,
        private routeHistoryService: ApiCheckInService,
        private repositoryPermission: Repository.Permission,
        private apiPermissionService: ApiPermissionService,
        private rptManagerService: RptManagerService,
        private repositoryDocument: Repository.Document,
        private apiChartService: ApiChartService,
        private repositoryChart: Repository.Chart,
        private commonService: CommonService,
        private logManagerService: LogManagerService,
        private repositoryLog: Repository.Log,
        private publisherService: PublisherService,
        private documentService: DocumentService,
        private udfService: UdfsService,
        private settingsService: SettingsService,
        private repositoryCurrency: Repository.Currency,
        private billOfMaterialsService: BillOfMaterialsService,
        private menuService: MenuService,
        private repositoryMenu: Repository.Menu,
        private printFormatService: PrintFormatService,
        private repositoryPrintFormat: Repository.PrintFormatZPLOffline,
        private payTermsService: PayTermsService,
        private repositoryPayTerms: Repository.PayTerms
    ) {
    }

    /**
     * Set the total quantity of records to synchronize
     * @param pTotalSynchronizations Quantity of synchronizations that will be executed
     * @constructor
     */
    SetTotalSynchronizations(pTotalSynchronizations: number): void
    {
        if(!pTotalSynchronizations)
        {
            return;
        }
        
        this._synchronizationsCounter = 0;
        
        this._totalToSynchronize = pTotalSynchronizations;
    }

    /**
     * Increment the counter of synchronizations finalized
     * @constructor
     */
    IncrementSynchronizationsCompleted(): void
    {
        this._synchronizationsCounter += 1;
    }

    /**
     * Indicates if the synchronization is completed
     * @constructor
     */
    IsSynchronizationCompleted(): boolean
    {
        return this._synchronizationsCounter >= this._totalToSynchronize;
    }
    
    async toast(mensaje: string, duracion: number = 3000) {
        let toast = await this.toastCtrl.create({
            message: mensaje,
            duration: duracion,
            position: "bottom",
        });

        toast.present();
    }

    /**
     * Retrieves all users of the application and store it in the SQL Lite database
     * @constructor
     */
    async SyncUsers() {
        let usersRetrieved = true;
        
        let users: IUser[];
        
        let overlay = await this.loadingController.create({
            message: this.commonService.Translate("Obteniendo usuarios...", "Requesting users...")
        });
        
        overlay.present();

        await this.apiUserService
            .GetUsers()
            .toPromise()
            .then((response: ICLResponse<IUser[]>) => {
                usersRetrieved = !!response.Data;

                if (response.Data) 
                {
                    users = response.Data;
                }
                else 
                {
                    this.commonService.Alert(
                        AlertType.INFO,
                        response.Message,
                        response.Message
                    );
                    usersRetrieved = false;
                }
            })
            .catch((error) => {
                usersRetrieved = false;
                this.commonService.Alert(AlertType.ERROR, error, error);
            });

        if (usersRetrieved) 
        {
            await this.repositoryUser.DeleteUsers();

            let syncedUsersCounter = 0;
            
            let progressCounter = 0;
            
            let progress = 0;
            
            users.forEach((user) => {
                this.repositoryUser
                    .AddUser(user)
                    .then(() => {
                        syncedUsersCounter++;
                        
                        progressCounter = syncedUsersCounter / users.length;
                        
                        progress = progressCounter * 100;
                        
                        overlay.message = 
                            `${this.commonService.Translate("Sincronizando usuarios", "Synchronizing users")}: ${Math.round(progress)}`
                        
                        if (syncedUsersCounter === users.length) 
                        {
                            this.toast(this.commonService.Translate("Usuarios sincronizados", "Synchronized users"));
                            
                            overlay.dismiss();
                        }
                    });
            });
        } 
        else 
        {
            this.commonService.alert(
                AlertType.INFO,
                this.translateService.currentLang === "es"
                    ? "No se pudieron obtener los datos de usuarios"
                    : "Unable to obtain user data"
            );
            
            overlay.dismiss();
        }
    }

    //#endregion

    //#region Permissions
    async SyncPermissions() {
        let conta = 0;
        let contaProgress = 0;
        let progress = 0;

        let loading = await this.loadingController.create({
            message:
                this.translateService.currentLang === "es"
                    ? "Procesando..."
                    : "Processing...",
        });
        loading.present();

        this.apiPermissionService.GetPermissionsByUserMobile()
            .subscribe(
                {
                    next: async (callback) => {
                        if (callback.Data) {

                            await this.repositoryPermission.DeletePermission();

                            callback.Data.forEach((element) => {
                                this.repositoryPermission
                                    .StorePermission(element)
                                    .then(() => {
                                        conta++;
                                        contaProgress = conta / callback.Data.length;
                                        progress = contaProgress * 100;
                                        loading.message = `${
                                            this.translateService.currentLang === "es"
                                                ? "Sincronizando"
                                                : "Synchronizing"
                                        }: ${Math.round(progress)}%`;
                                        if (conta === callback.Data.length) {
                                            this.toast(
                                                this.translateService.currentLang === "es"
                                                    ? "Sincronizado correctamente"
                                                    : "Synchronized correctly"
                                            );
                                            loading.dismiss();
                                        }
                                    })
                                    .catch((error: any) => {
                                        loading.dismiss();
                                        console.error(error);
                                    });
                            });

                            this.publisherService.publish({
                                Data: callback.Data,
                                Target: PublisherVariables.Permissions
                            });
                            //this.localStorageService.set(LocalStorageVariables.PermList, callback.PermissionsList, true);
                        } else {
                            loading.dismiss();
                            this.commonService.Alert(
                                AlertType.ERROR,
                                callback.Message,
                                callback.Message
                            );
                        }
                    },
                    error: (error) => {
                        loading.dismiss();
                        console.error(error);
                        this.commonService.Alert(AlertType.ERROR, error, error);
                    }
                }
            );
    }

    //#endregion

    //#region Customers
    async syncCustomers() {
        let syncDate = new Date();
        let conte = this.translateService.currentLang === 'es' ? 'Procesando...' : 'Processing...';
        let correct = true;
        let customers: IBusinessPartner[];
        let loading = await this.loadingController.create({message: conte});
        loading.present();

        let lastSyncDate = this.localStorageService.GetSyncDate(ChangeElement.BusinessPartners)?.SyncDate || new Date(0);

        this.customerService.GetCustomers(lastSyncDate).subscribe(
            async (next) => {
                if (next.Data) 
                {
                    customers = next?.Data ?? [];
                    
                    if (customers?.length > 0) 
                    {
                        let conta = 0;
                        let contaProgress = 0;
                        let progress = 0;

                        from(customers).pipe(concatMap(
                            (value) => from(this.repositoryCustomer.StoreCustomer(value))
                        ), finalize(() => loading.dismiss()))
                            .subscribe({
                                next: (next) => {
                                    conta++;
                                    contaProgress = conta / customers.length;
                                    progress = contaProgress * 100;
                                    loading.message = `${
                                        this.translateService.currentLang === "es"
                                            ? "Sincronizando"
                                            : "Synchronizing"
                                    }: ${Math.round(progress)}%`;
                                },
                                complete: () => {
                                    this.localStorageService.SetSyncDate({
                                        Type: ChangeElement.BusinessPartners,
                                        Count: 0,
                                        SyncDate: this.datePipe.transform(syncDate, 'yyyy-MM-dd HH:mm:ss')
                                    });
                                    
                                    this.toast(
                                        this.translateService.currentLang === "es" ? "Sincronizado correctamente" : "Synchronized correctly"
                                    );
                                },
                                error: (error) => {
                                    conta++;
                                    console.log(error);
                                }
                            });
                    } 
                    else 
                    {
                        this.localStorageService.SetSyncDate({
                            Type: ChangeElement.BusinessPartners,
                            Count: 0,
                            SyncDate: this.datePipe.transform(syncDate, 'yyyy-MM-dd HH:mm:ss')
                        });
                        
                        this.toast(
                            this.translateService.currentLang === "es"
                                ? "Sincronizado correctamente"
                                : "Synchronized correctly"
                        );
                        
                        loading.dismiss();
                    }
                } 
                else 
                {
                    this.commonService.alert(
                        AlertType.INFO,
                        this.translateService.currentLang === "es"
                            ? "No se pudieron obtener los datos de clientes"
                            : "Failed to obtain customers data"
                    );
                    
                    loading.dismiss();
                }
            },
            (error) => {
                loading.dismiss();
                
                this.commonService.Alert(AlertType.ERROR, error, error);
            }
        );
    }

    /**
     * Retrieves all blanket agreements and store them in the SQL Lite database
     * @constructor
     */
    async SyncBlanketAgreement(): Promise<void> 
    {
        let syncDate = new Date();
        
        let records: IBlanketAgreement[];

        let loading: HTMLIonLoadingElement = await this.loadingController.create({message: this.commonService.Translate("Procesando...", "Processing...")});
        
        loading.present();

        let lastSyncDate = this.localStorageService.GetSyncDate(ChangeElement.Agreements)?.SyncDate || new Date(0);

        this.customerService.GetBlanketAgreement(lastSyncDate)
            .subscribe(async (response: ICLResponse<IBlanketAgreement[]>) => {
                try {
                    if (response && response.Data) 
                    {
                        if (response.Data.length > 0) 
                        {
                            let synchronizedBlanketAgreementCounter = 0;
                            
                            let progressCounter = 0;
                            
                            let progressPercent = 0;
                            
                            records = response.Data;
                            
                            from(records)
                                .pipe(
                                    concatMap((value) => {
                                        return from(this.repositoryCustomer.AddBlanketAgreementRecord(value))
                                    }), 
                                    finalize(() => loading.dismiss())
                                )
                                .subscribe({
                                    next: (result) => {
                                        synchronizedBlanketAgreementCounter++;

                                        progressCounter = synchronizedBlanketAgreementCounter / records.length;

                                        progressPercent = progressCounter * 100;

                                        loading.message = `${this.commonService.Translate("Sincronizando", "Synchronizing")}: ${Math.round(progressPercent)}%`;
                                    },
                                    complete: () => {
                                        this.localStorageService.SetSyncDate({
                                            Type: ChangeElement.Agreements,
                                            Count: 0,
                                            SyncDate: this.datePipe.transform(syncDate, 'yyyy-MM-dd HH:mm:ss')
                                        });

                                        this.toast(this.commonService.Translate("Sincronizado correctamente", "Synchronized correctly"));
                                    },
                                    error: (error) => {
                                        loading.dismiss();

                                        console.error(error);

                                        synchronizedBlanketAgreementCounter++;
                                    }
                                });
                        } 
                        else 
                        {
                            this.localStorageService.SetSyncDate({
                                Type: ChangeElement.Agreements,
                                Count: 0,
                                SyncDate: this.datePipe.transform(syncDate, 'yyyy-MM-dd HH:mm:ss')
                            });
                            
                            this.toast(this.commonService.Translate("Sincronizado correctamente", "Synchronized correctly"));
                            
                            loading.dismiss();
                        }
                    } 
                    else 
                    {
                        loading.dismiss();
                        
                        this.commonService.Alert(
                            AlertType.ERROR,
                            response.Message,
                            response.Message
                        );
                    }
                } 
                catch (exception) 
                {
                    loading.dismiss();
                    
                    this.commonService.Alert(AlertType.ERROR, exception, exception);
                }
            },
            (error) => {
                loading.dismiss();
                
                this.commonService.Alert(AlertType.ERROR, error, error);
            }
        );
    }

    //#endregion

    //#region Products
    /**
     * Retrieves all products and store them in the SQL Lite database
     * @constructor
     */
    async SyncProducts() : Promise<void>
    {
        let syncDate = new Date();
        
        let products: IItem[];
        
        let loading = await this.loadingController.create({message: this.commonService.Translate("Procesando...", "Processing...")});
        
        loading.present();

        let lastSyncDate = this.localStorageService.GetSyncDate(ChangeElement.Items)?.SyncDate || new Date(0);

        this.productService.GetProducts(lastSyncDate)
            .subscribe(async (response) => {
                if (response.Data) 
                {
                    products = response.Data;
                    
                    if (products.length > 0) 
                    {
                        let conta = 0;
                        let contaProgress = 0;
                        let progress = 0;

                        from(products)
                            .pipe(
                                concatMap((value) => from(this.repositoryProduct.UpdateOrCreateProduct(value))), 
                                finalize(() => loading.dismiss())
                            )
                            .subscribe({
                                next: (next) => {
                                    conta++;
                                    contaProgress = conta / products.length;
                                    progress = contaProgress * 100;
                                    loading.message = `${this.translateService.currentLang === 'es' ? 'Sincronizando' : 'Synchronizing'}: ${Math.round(progress)}%`;
                                },
                                complete: () => {
                                    this.localStorageService.SetSyncDate({
                                        Type: ChangeElement.Items,
                                        Count: 0,
                                        SyncDate: this.datePipe.transform(syncDate, 'yyyy-MM-dd HH:mm:ss')
                                    });

                                    this.toast(this.commonService.Translate("Sincronizado correctamente", "Synchronized correctly"));
                                },
                                error: (error) => {
                                    conta++;
                                    console.log(error);
                                }
                            })
                    } 
                    else 
                    {
                        this.localStorageService.SetSyncDate({
                            Type: ChangeElement.Items,
                            Count: 0,
                            SyncDate: this.datePipe.transform(syncDate, 'yyyy-MM-dd HH:mm:ss')
                        });
                        
                        this.toast(this.translateService.currentLang === 'es' ? 'Sincronizado correctamente' : 'Synchronized correctly');
                        
                        loading.dismiss();
                    }
                } 
                else 
                {
                    loading.dismiss();
                    
                    this.commonService.alert(AlertType.INFO, this.translateService.currentLang === 'es' ? 'No se pudieron obtener los datos de productos' : 'Failed to obtain products data');
                }
            },
            (error) => {
                loading.dismiss();
                
                this.commonService.Alert(AlertType.ERROR, error, error);
            }
        );
    }

    //#endregion

    //#region Precios
    async SyncPriceLists(): Promise<void> {
        let syncDate = new Date();
        
        let priceLists: IPriceListInfo[] = [];
        
        let loading: HTMLIonLoadingElement = await this.loadingController.create({message: this.commonService.Translate("Procesando...", "Processing...")});
        
        loading.present();

        let lastSyncDate = this.localStorageService.GetSyncDate(ChangeElement.PriceLists)?.SyncDate || new Date(0);

        this.priceService.GetPriceListsInfo(lastSyncDate)
            .subscribe(async (response: ICLResponse<IPriceListInfo[]>)=>{
                if (response.Data) {
                    priceLists = response.Data;

                    if (priceLists.length > 0) {
                        let conta = 0;
                        let contaProgress = 0;
                        let progress = 0;

                        from(priceLists)
                            .pipe(
                                concatMap((value) => from(this.repositoryPriceList.UpdateOrCreatPriceListsInfo(value))),
                                finalize(() => loading.dismiss())
                            )
                            .subscribe({
                                next: (next) => {
                                    conta++;
                                    contaProgress = conta / priceLists.length;
                                    progress = contaProgress * 100;
                                    loading.message = `${this.translateService.currentLang === 'es' ? 'Sincronizando' : 'Synchronizing'}: ${Math.round(progress)}%`;
                                },
                                complete: () => {
                                    this.localStorageService.SetSyncDate({
                                        Type: ChangeElement.PriceLists,
                                        Count: 0,
                                        SyncDate: this.datePipe.transform(syncDate, 'yyyy-MM-dd HH:mm:ss')
                                    });

                                    this.toast(this.commonService.Translate("Sincronizado correctamente", "Synchronized correctly"));
                                },
                                error: (error) => {
                                    conta++;
                                    console.log(error);
                                }
                            })
                    }else{
                        this.localStorageService.SetSyncDate({
                            Type: ChangeElement.PriceLists,
                            Count: 0,
                            SyncDate: this.datePipe.transform(syncDate, 'yyyy-MM-dd HH:mm:ss')
                        });

                        this.toast(this.translateService.currentLang === 'es' ? 'Sincronizado correctamente' : 'Synchronized correctly');

                        loading.dismiss();
                    }
                }else{
                    loading.dismiss();

                    this.commonService.alert(AlertType.INFO, this.translateService.currentLang === 'es' ? 'No se pudieron obtener los datos de listas de precios' : 'Price lists was not obtained');
                }
            },
        (error) => {
                loading.dismiss();

                this.commonService.Alert(AlertType.ERROR, error, error);
            })
    }

    /**
     * Retrives all item prices and store them in the SQL Lite database
     * @constructor
     */
    async SyncPrices(): Promise<void> {
        let syncDate = new Date();
        
        let prices: IPriceList[] = [];
        
        let loading = await this.loadingController.create({message: this.commonService.Translate("Procesando...", "Processing...")});
        
        loading.present();

        let lastSyncDate = this.localStorageService.GetSyncDate(ChangeElement.Prices)?.SyncDate || new Date(0);

        this.priceService.GetPriceList(lastSyncDate)
            .subscribe(async (response: ICLResponse<IPriceList[]>) => {
                if (response.Data) {
                    prices = response.Data;

                    if (prices.length > 0) {
                        let conta = 0;
                        let contaProgress = 0;
                        let progress = 0;
                        
                        from(prices)
                            .pipe(
                                concatMap((value) => from(this.repositoryPriceList.UpdateOrInsertPriceList(value))),
                                finalize(() => loading.dismiss())
                            )
                            .subscribe({
                                next: (next) => {
                                    conta++;
                                    contaProgress = conta / prices.length;
                                    progress = contaProgress * 100;
                                    loading.message = `${this.translateService.currentLang === 'es' ? 'Sincronizando' : 'Synchronizing'}: ${Math.round(progress)}%`;
                                },
                                complete: () => {
                                    this.localStorageService.SetSyncDate({
                                        Type: ChangeElement.Prices,
                                        Count: 0,
                                        SyncDate: this.datePipe.transform(syncDate, 'yyyy-MM-dd HH:mm:ss')
                                    });

                                    this.toast(this.commonService.Translate("Sincronizado correctamente", "Synchronized correctly"));
                                },
                                error: (error) => {
                                    conta++;
                                    console.log(error);
                                }
                            })
                    }else{
                        this.localStorageService.SetSyncDate({
                            Type: ChangeElement.Prices,
                            Count: 0,
                            SyncDate: this.datePipe.transform(syncDate, 'yyyy-MM-dd HH:mm:ss')
                        });

                        this.toast(this.translateService.currentLang === 'es' ? 'Sincronizado correctamente' : 'Synchronized correctly');

                        loading.dismiss();
                    }
                }else{
                    loading.dismiss();

                    this.commonService.alert(AlertType.INFO, this.translateService.currentLang === 'es' ? 'No se pudieron obtener los datos de precios': "Price data could not be obtained");
                }
            },
            (error) => {
                loading.dismiss();

                this.commonService.Alert(AlertType.ERROR, error, error);
            })
    }

    //#endregion

    //#region Company
    /**
     * Retrieves current user company information and store it in the SQL Lite database
     * @constructor
     */
    async SyncCompanyInformation() : Promise<void>
    {
        let loading = await this.loadingController
            .create({message: this.commonService.Translate("Procesando...", "Processing...")});

        loading.present();

        this.apiCompanyService.GetCompanyInformation()
            .subscribe(
            (response) => {
                if (response) 
                {
                    this.repositoryCompany
                        .DeleteCompanyInformation()
                        .then(() => {
                            this.repositoryCompany
                                .StoreCompanyInformation(response.Data)
                                .then((data: any) => {
                                    loading.dismiss();
                                    this.toast(this.commonService.Translate("Sincronizado correctamente", "Synchronized correctly"));
                                })
                                .catch((error: any) => {
                                    loading.dismiss();
                                    console.error(error);
                                });
                        })
                        .catch((error: any) => {
                            loading.dismiss();
                            console.error(error);
                        });
                } 
                else 
                {
                    loading.dismiss();
                    this.commonService.alert(
                        AlertType.ERROR,
                        this.commonService.Translate(
                            "La información de la compañía no se obtuvo",
                            "Company information was not obtained."
                        )
                    );
                }
            },
            (error: any) => {
                loading.dismiss();
                console.error(error);
                this.commonService.Alert(AlertType.ERROR, error, error);
            }
        );
    }
    //#endregion

    //#region Almacenes
    async syncWarehouses() {
        let conte =
            this.translateService.currentLang === "es"
                ? "Procesando..."
                : "Processing...";
        let conta = 0;
        let contaProgress = 0;
        let progress = 0;
        let loading = await this.loadingController.create({message: conte});
        loading.present();

        this.apiWarehouseService.GetWarehouses().subscribe(
            async (dataWareHouse) => {
                if (dataWareHouse.Data) {
                    await this.repositoryWarehouse.DeleteWarehouses();
                    dataWareHouse.Data.forEach((element) => {
                        this.repositoryWarehouse
                            .AddWarehouse(element.WhsCode, element.WhsName)
                            .then((data: any) => {
                                conta++;
                                contaProgress = conta / dataWareHouse.Data.length;
                                progress = contaProgress * 100;
                                loading.message = `${
                                    this.translateService.currentLang === "es"
                                        ? "Sincronizando"
                                        : "Synchronizing"
                                }: ${Math.round(progress)}%`;
                                if (conta === dataWareHouse.Data.length) {
                                    this.toast(
                                        this.translateService.currentLang === "es"
                                            ? "Sincronizado correctamente"
                                            : "Synchronized correctly"
                                    );
                                    loading.dismiss();
                                }
                            })
                            .catch((error: any) => {
                                loading.dismiss();
                                console.error(error);
                            });
                    });

                } else {
                    loading.dismiss();
                    this.commonService.alert(
                        AlertType.ERROR,
                        dataWareHouse.Message
                    );
                }
            },
            (error: any) => {
                loading.dismiss();
                console.error(error);
                this.commonService.Alert(AlertType.ERROR, error, error);
            }
        );
    }

    //#endregion

    //#region Cards
    async syncCards() {
        let conte =
            this.translateService.currentLang === 'es'
                ? 'Procesando...'
                : 'Processing...';
        let correct = true;
        let cards: ICard[];
        let loading = await this.loadingController.create({message: conte});
        loading.present();

        await this.apiCardService
            .GetCards()
            .toPromise()
            .then((response) => {
                if (response.Data && response.Data.length) {
                    cards = response.Data;
                } else {
                    correct = false;
                    console.error(response.Data);
                }
            })
            .catch((error) => {
                correct = false;
                this.commonService.Alert(AlertType.ERROR, error, error);
            });

        if (correct) {
            //eliminar tarjetas de credito
            this.repositoryCard.DeleteCards();

            //añadir tarjetas
            let conta = 0;
            let contaProgress = 0;
            let progress = 0;
            cards.forEach((element) => {
                this.repositoryCard
                    .StoreCard(element)
                    .then(() => {
                        conta++;
                        contaProgress = conta / cards.length;
                        progress = contaProgress * 100;
                        loading.message = `${
                            this.translateService.currentLang === "es"
                                ? "Sincronizando"
                                : "Synchronizing"
                        }: ${Math.round(progress)}%`;
                        if (conta === cards.length) {
                            this.toast(
                                this.translateService.currentLang === "es"
                                    ? "Sincronizado correctamente"
                                    : "Synchronized correctly"
                            );
                            loading.dismiss();
                        }
                    });
            });
        } else {
            this.commonService.alert(
                AlertType.INFO,
                this.translateService.currentLang === "es"
                    ? "No se pudieron obtener los datos de tarjetas"
                    : "Failed to obtain cards data"
            );
            loading.dismiss();
        }
    }

    //#endregion

    //#region Accounts
    /**
     * Retrieves all accounts from remote database and store them in the SQL Lite database
     * @constructor
     */
    async SyncAccounts(): Promise<void> 
    {
        let loading = await this.loadingController.create({message: this.commonService.Translate("Procesando...", "Processing...")});
        
        loading.present();

        let synchronizedAccountsCounter: number = 0;

        let syncLength: number = 0;

        this.apiAccountService.GetAccounts()
            .pipe(
                concatMap(response => {
                    if(response && response.Data && response.Data.length > 0)
                    {
                        syncLength = response.Data.length;

                        return of(response.Data)
                    }

                    this.commonService.Alert(AlertType.INFO, "No se encontraron cuentas", "No accounts where found");

                    return EMPTY;
                }),
                concatMap(accounts => this.repositoryAccount.DeleteAccounts()
                    .pipe(
                        concatMap(deleteResult => from(accounts))
                    )
                ),
                concatMap(account => this.repositoryAccount.StoreAccount(account)),
                finalize(() => loading.dismiss())
            )
            .subscribe({
                next: (result) => {
                    synchronizedAccountsCounter++;
                    
                    loading.message = `${this.commonService.Translate("Sincronizando", "Synchronizing")}: ${Math.round(synchronizedAccountsCounter / syncLength * 100)}%`;
                    
                    if (synchronizedAccountsCounter === syncLength) 
                    {
                        this.commonService.toast(this.commonService.Translate("Sincronizado correctamente", "Synchronized correctly"))
                    }
                },
                error: (error) => {
                    loading.dismiss();
                    this.commonService.Alert(AlertType.ERROR, error, error);
                }
            });
    }

    //#endregion

    //#region Exchange Rate
    /**
     * Retrieves the exchange rate and store it in the SQL Lite database
     * @constructor
     */
    async SyncExchangeRate(): Promise<void> {
        
        let exchangeRates: IExchangeRate[];

        let loading = await this.loadingController.create({message: this.commonService.Translate("Procesando...", "Processing...")});

        loading.present();

        this.apiExrateService.GetUpcomingExchangeRate()
            .subscribe(async (response) => {
                    if (response.Data)
                    {
                        exchangeRates = response.Data.map((rate)=>({Rate: rate.Rate, date: rate.RateDate} as IExchangeRate));

                        if (exchangeRates.length > 0)
                        {
                            let conta = 0;
                            let contaProgress = 0;
                            let progress = 0;

                            from(exchangeRates)
                                .pipe(
                                    concatMap((value) => from(this.repositoryExchangeRate.UpdateOrInsertExchangeRate(value))),
                                    finalize(() => loading.dismiss())
                                )
                                .subscribe({
                                    next: (next) => {
                                        conta++;
                                        contaProgress = conta / exchangeRates.length;
                                        progress = contaProgress * 100;
                                        loading.message = `${this.translateService.currentLang === 'es' ? 'Sincronizando' : 'Synchronizing'}: ${Math.round(progress)}%`;
                                    },
                                    complete: () => {
                                        this.toast(this.commonService.Translate("Sincronizado correctamente", "Synchronized correctly"));
                                    },
                                    error: (error) => {
                                        conta++;
                                        console.log(error);
                                    }
                                })
                        }
                        else
                        {
                            this.toast(this.translateService.currentLang === 'es' ? 'Sincronizado correctamente' : 'Synchronized correctly');

                            loading.dismiss();
                        }
                    }
                    else
                    {
                        loading.dismiss();

                        this.commonService.alert(AlertType.INFO, this.translateService.currentLang === 'es' ? 'No se obtuvieron tipos de cambio' : 'No exchange rates were obtained');
                    }
                },
                (error) => {
                    loading.dismiss();

                    this.commonService.Alert(AlertType.ERROR, error, error);
                }
            );
    }

    //#endregion

    //#region Route
    /**
     * Retrieves all user valid routes and store them in the SQL Lite database
     * @param _fromRefresher Indicates if this method was executed from refresh action
     */
    async SyncRoutes(_fromRefresher: boolean = false): Promise<void> 
    {
        
        let loading: HTMLIonLoadingElement = undefined;

        if (!_fromRefresher) 
        {
            loading = await this.loadingController.create({
                message: this.commonService.Translate("Procesando...", "Processing...")
            });

            loading.present();
        }

        let alwaysDownloadRoute = false;

        let localRoutes: IRouteWithLines[] = [];

        let downloadedRoutes: IRouteWithLines[] = [];
        
        let synchronizedRoutesCounter: number = 0;
        
        this.apiGeoconfigService.GetGeoConfigurations()
            .pipe(
                concatMap(geoConfigsResponse => {

                    if (geoConfigsResponse.Data && geoConfigsResponse.Data.find((x) => x.Key == Geoconfigs.AlwaysDownloadRoute))
                    {
                        alwaysDownloadRoute = true;
                    }

                    return from(this.repositoryRoute.GetRoutes());
                }),
                concatMap(lRoutes => {
                    localRoutes = lRoutes;

                    if (!alwaysDownloadRoute)
                    {
                        if (localRoutes.find((route) => [RouteStatus.Active, RouteStatus.Inactive, RouteStatus.NotStarted].includes(route.Route.Status)))
                        {
                            this.commonService.alert(
                                AlertType.WARNING,
                                this.commonService.Translate("Existen rutas sin finalizar", "There are unfinished routes"));

                            return EMPTY;
                        }

                        return this.repositoryRouteHistory.GetUnsynchronizedRoutesHistories()
                            .pipe(
                                concatMap(rHistories => {
                                    if(rHistories && rHistories.length > 0)
                                    {
                                        this.commonService.alert(
                                            AlertType.WARNING,
                                            this.commonService.Translate("Hay checks pendientes de sincronizar", "There are pending checks to synchronize."));

                                        return EMPTY;
                                    }

                                    return this.routeService.GetUserRoutes(this.device.uuid);
                                })
                            );
                    }

                    return this.routeService.GetUserRoutes(this.device.uuid);
                }),
                concatMap(routesResponse => {
                    if (routesResponse.Data && routesResponse.Data.length)
                    {
                        downloadedRoutes = routesResponse.Data;
                        
                        return of(routesResponse.Data)
                    }
                    else
                    {
                        return EMPTY;
                    }
                }),
                concatMap(routes => this.repositoryRoute.DeleteDueRoutes()
                    .pipe(
                        concatMap(deleteResult => this.repositoryRouteHistory.DeleteSynchronizedRoutesHistories()),
                        concatMap(deleteResult => from(routes))
                    )),
                concatMap(route => from(this.repositoryRoute.SaveRoute(route))),
                finalize(() => {
                    loading?.dismiss();

                    let syncronizedRoutes: ISyncronizedRoutes = {
                        ActionFrom: _fromRefresher ? SynchronizedRoutesFrom.Refresher : SynchronizedRoutesFrom.Menu,
                        NewRoutesQty: downloadedRoutes.length,
                        MessageInfo: !downloadedRoutes.length ? this.commonService.Translate('No hay rutas nuevas', 'There are no new routes') : ''
                    };

                    this.routeService.SynchronizedRoutes$.next(syncronizedRoutes);
                })
            ).subscribe({
                next: (result) => {
                    if(!_fromRefresher)
                    {
                        synchronizedRoutesCounter++;

                        loading.message = `${this.commonService.Translate("Sincronizando", "Synchronizing")}: ${Math.round(synchronizedRoutesCounter / downloadedRoutes.length * 100)}%`;

                        if (synchronizedRoutesCounter === downloadedRoutes.length)
                        {
                            this.commonService.toast(this.commonService.Translate("Sincronizado correctamente", "Synchronized correctly"));
                        }
                    }
                },
                error: (error) => {
                    loading.dismiss();
                    this.commonService.Alert(AlertType.ERROR, error, error);
                }
            });
    }

    //#endregion

    //#region Checks
    /**
     * Take all route histories from SQL Lite database and send them to the remote database
     * @param _showUIMessages Indicates if should show all messages and loaders
     * @constructor
     */
    async SyncChecks(_showUIMessages: boolean = false) : Promise<void>
    {
        let loader: HTMLIonLoadingElement;

        if ([this.network.Connection.NONE, this.network.Connection.UNKNOWN].includes(this.network.type)) 
        {
            if (_showUIMessages) 
            {
                this.commonService.toast(this.commonService.Translate("No tienes conexión a Internet", "You don't have connection to Internet"));
            }
            
            return;
        }

        if (_showUIMessages) 
        {
            loader = await this.commonService.Loader(this.commonService.Translate("Procesando...", "Processing..."));

            loader.present();
        }

        this.repositoryRouteHistory.GetUnsynchronizedRoutesHistories()
            .pipe(
                concatMap(routeHistories => {
                    if(routeHistories && routeHistories.length)
                    {
                        return this.routeHistoryService.CreateCheckList(routeHistories)
                            .pipe(
                                concatMap((createdResponse) => from(routeHistories))
                            );
                    }
                    
                    if(_showUIMessages)
                    {
                        this.commonService.toast(this.commonService.Translate("No hay checks para sincronizar", "There's no checks to synchronize"));
                    }
                    
                    return EMPTY;
                }),
                concatMap(routeHistory => this.repositoryRouteHistory.UpdateRouteHistorySyncStatus(routeHistory.Id, true)),
                catchError(()=>EMPTY),
                finalize(() => loader?.dismiss())
            )
            .subscribe({
                next: (result) => {
                    if(_showUIMessages)
                    {
                        this.commonService.toast(this.commonService.Translate("Sincronizado correctamente", "Correctly synchronized"));
                    }
                },
                error: (err) => {
                    if(_showUIMessages)
                    {
                        loader.dismiss();
                        this.commonService.toast(err);
                    }
                }
            });
    }

    //#endregion

    /**
     * Retrieves all settins of the application and store it in the SQL Lite database
     * @constructor
     */
    async SyncSettings() {
        let settingRetrieved = true;

        let settings: ISetting[];

        let overlay = await this.loadingController.create({
            message: this.commonService.Translate("Obteniendo configuraciones...", "Requesting configurations...")
        });

        overlay.present();

        await this.settingsService.GetSettings().toPromise()
            .then((response: ICLResponse<ISetting[]>) => {
                settingRetrieved = !!response.Data;

                if (response.Data)
                {
                    settings = response.Data;
                }
                else
                {
                    this.commonService.Alert(
                        AlertType.INFO,
                        response.Message,
                        response.Message
                    );
                    settingRetrieved = false;
                }
            })
            .catch((error) => {
                settingRetrieved = false;
                this.commonService.Alert(AlertType.ERROR, error, error);
            });

        if (settingRetrieved)
        {
            await this.repositoryConfiguration.DeleteConfigurations();

            let syncedSettingCounter = 0;

            let progressCounter = 0;

            let progress = 0;

            settings.forEach((setting) => {
                this.repositoryConfiguration
                    .StoreConfiguration(setting.Code, setting.Json, setting.IsActive)
                    .then(() => {
                        syncedSettingCounter++;

                        progressCounter = syncedSettingCounter / settings.length;

                        progress = progressCounter * 100;

                        overlay.message =
                            `${this.commonService.Translate("Sincronizando configuraciones", "Synchronizing configurations")}: ${Math.round(progress)}`

                        if (syncedSettingCounter === settings.length)
                        {
                            this.toast(this.commonService.Translate("Configuraciones sincronizadas", "Synchronized configurations"));

                            overlay.dismiss();
                        }
                    });
            });
        }
        else
        {
            this.commonService.alert(
                AlertType.INFO,
                this.translateService.currentLang === "es"
                    ? "No se pudieron obtener los datos de las configuraciones"
                    : "Unable to obtain the configurations data"
            );

            overlay.dismiss();
        }
    }

    //#endregion

    //#region Geo configs
    async syncGeo() {
        let conta = 0;
        let progress = 0;
        let loading = await this.loadingController.create({
            message:
                this.translateService.currentLang === "es"
                    ? "Procesando..."
                    : "Processing...",
        });
        loading.present();

        this.apiGeoconfigService.GetGeoConfigurations().subscribe(
            async (resp: ICLResponse<IGeoConfig[]>) => {
                if (resp.Data.length>0) {
                    // if (resp.Message) {
                    //   this.commonService.Alert(
                    //     AlertType.INFO,
                    //     geoConfigs.errorInfo.Message,
                    //     geoConfigs.errorInfo.Message
                    //   );
                    //   loading.dismiss();
                    // } else {
                    let userMapp =
                        this.localStorageService.data.get("Session").userMappId;
                    await this.repositoryGeoConfiguration.DeleteGeoConfigurations();
                    resp.Data.forEach((x) => {
                        this.repositoryGeoConfiguration
                            .AddGeoConfiguration(x, userMapp)
                            .then(() => {
                                conta++;
                                progress = (conta / resp.Data.length) * 100;
                                loading.message = `${
                                    this.translateService.currentLang === "en"
                                        ? "Synchronizing: "
                                        : "Sincronizando: "
                                }${Math.round(progress)}%`;

                                if (conta === resp.Data.length) {
                                    loading.dismiss();
                                    this.toast(
                                        `${
                                            this.translateService.currentLang === "en"
                                                ? "Synchronized correctly"
                                                : "Sincronizado correctamente"
                                        }`
                                    );
                                }
                            })
                            .catch((err) => console.log(err));
                    });
                    // }
                } else {
                    loading.dismiss();
                    let error: string =
                        resp?.Message || JSON.stringify(resp);
                    this.commonService.Alert(AlertType.ERROR, error, error);
                }
            },
            (error) => {
                loading.dismiss();
                this.commonService.Alert(AlertType.ERROR, error, error);
            }
        );
    }

    //#endregion

    //#region Series
    /**
     * Retrieves all user series from remote database and store them in the SQL Lite database
     * @constructor
     */
    async SyncSeries() : Promise<void>
    {
        let loading = await this.loadingController.create({message: this.commonService.Translate('Procesando...', 'Processing...')});

        let synchronizedSeriesCounter: number = 0;

        let syncLength: number = 0;

        this.repositoryDocument.GetAllDocuments()
            .pipe(
                concatMap(documents => {
                    if (documents && documents.length > 0 && documents.some((x) => x.TransactionStatus === DocumentSyncStatus.NotSynchronized))
                    {
                        this.commonService.Alert(AlertType.ERROR, 'Documentos offline pendientes de respaldar', 'Offline documents pending synchonization');

                        return EMPTY;
                    }

                    return this.apiserieService.GetSeriesByUser();
                }),
                concatMap(seriesResponse => {
                    if(seriesResponse && seriesResponse.Data && !!seriesResponse.Data.length)
                    {
                        return this.repositorySerie.DeleteSeries()
                            .pipe(
                                concatMap(deleteResult => {
                                    syncLength = seriesResponse.Data.length;

                                    return from(seriesResponse.Data);
                                })
                            );
                    }

                    this.commonService.Alert(AlertType.ERROR, 'No se obtuvieron series', 'No series obtained');

                    return EMPTY;
                }),
                concatMap(series => this.repositorySerie.StoreSeries(series)),
                finalize(() => loading.dismiss())
            )
            .subscribe({
                next:  async (response) => {
                    synchronizedSeriesCounter++;
                    
                    loading.message = `${this.commonService.Translate('Sincronizando', 'Synchronizing')}: ${Math.round(synchronizedSeriesCounter / syncLength * 100)}%`;
                    
                    if (synchronizedSeriesCounter === syncLength) 
                    {
                        this.commonService.toast(this.commonService.Translate('Sincronizado correctamente', 'Synchronized correctly'));
                    }
                },
                error: (error) => {
                    loading.dismiss();
                    this.commonService.Alert(AlertType.ERROR, error, error);
                }
            });
    }

    //#endregion

    //#region Measurement units
    /**
     * Asynchronously synchronizes Units of Measurement (UoM).
     * This method is used to synchronize Units of Measurement data.
     */
    async syncUoM() {
        let conta = 0;
        let progress = 0;
        let loading = await this.loadingController.create({
            message:
                this.translateService.currentLang === "es"
                    ? "Procesando..."
                    : "Processing...",
        });
        loading.present();

        this.ApimUnitService.GetMeasurementUnits().subscribe(
            async (next) => {
                if (next.Data) {
                    await this.repositoryMeasurementUnit.DeleteMeasurementUnits();
                    next.Data.forEach((mUnit) => {
                        this.repositoryMeasurementUnit
                            .AddMeasurementUnit(mUnit)
                            .then(async () => {
                                conta++;
                                progress = (conta / next.Data.length) * 100;
                                loading.message = `${
                                    this.translateService.currentLang === "en"
                                        ? "Synchronizing: "
                                        : "Sincronizando: "
                                }${Math.round(progress)}%`;

                                if (conta === next.Data.length) {
                                    loading.dismiss();
                                    this.toast(
                                        `${
                                            this.translateService.currentLang === "en"
                                                ? "Synchronized correctly"
                                                : "Sincronizado correctamente"
                                        }`
                                    );
                                }
                            })
                            .catch((err) => console.log(err));
                    });
                } else {
                    console.error(next);
                    loading.dismiss();
                    this.commonService.Alert(
                        AlertType.INFO,
                        next.Message,
                        next.Message
                    );
                }
            },
            (error) => {
                console.error(error);
                loading.dismiss();
                this.commonService.Alert(AlertType.INFO, error, error);
            }
        );
    }

    //#endregion

    //#region Discounts
    async syncDiscountGroups() {
        let syncDate = new Date();
        let discounts = [];
        let loading = await this.loadingController.create({message: this.translateService.currentLang === 'es' ? 'Procesando...' : 'Processing...',});
        loading.present();

        let lastSyncDate = this.localStorageService.GetSyncDate(ChangeElement.Discounts)?.SyncDate || new Date(0);

        this.discountService.GetDiscountGroups(lastSyncDate)
            .subscribe({
                next: (response) => {
                    if (response?.Data) 
                    {
                        if(response?.Data.length > 0)
                        {
                            discounts = response.Data;

                            let conta = 0;

                            let progress = 0;

                            let contaProgress = 0;

                            from(response.Data)
                                .pipe(
                                    concatMap((value) => {
                                        return from(this.repositoryDiscountGroup.StoreDiscountGroup(value))
                                    }),
                                    finalize(() => loading.dismiss())
                                )
                                .subscribe({
                                    next: (next) => {
                                        conta++;
                                        contaProgress = conta / discounts.length;
                                        progress = contaProgress * 100;
                                        loading.message = `${this.translateService.currentLang === 'es' ? 'Sincronizando' : 'Synchronizing'}: ${Math.round(progress)}%`;
                                    },
                                    complete: () => {
                                        this.localStorageService.SetSyncDate({
                                            Type: ChangeElement.Discounts,
                                            Count: 0,
                                            SyncDate: this.datePipe.transform(syncDate, 'yyyy-MM-dd HH:mm:ss')
                                        });
                                        
                                        this.toast(this.translateService.currentLang === 'es' ? 'Sincronizado correctamente' : 'Synchronized correctly');
                                    },
                                    error: (error) => {
                                        conta++;
                                        console.log(error);
                                    }
                                });
                        }
                        else
                        {
                            this.localStorageService.SetSyncDate({
                                Type: ChangeElement.Discounts,
                                Count: 0,
                                SyncDate: this.datePipe.transform(syncDate, 'yyyy-MM-dd HH:mm:ss')
                            });
                            
                            this.toast(this.translateService.currentLang === 'es' ? 'Sincronizado correctamente' : 'Synchronized correctly');
                            
                            loading.dismiss();
                        }
                    } 
                    else 
                    {
                        loading.dismiss();
                        
                        this.toast(response.Message);
                    }
                },
                error: (error) => {
                    loading.dismiss();
                    
                    this.commonService.Alert(AlertType.ERROR, error, error);
                }
            });
    }

    //#endregion

    //#region Discount hierarchy
    async syncDiscountHierarchy() {
        let conta = 0;
        let progress = 0;
        let loading = await this.loadingController.create({
            message:
                this.translateService.currentLang === "es"
                    ? "Procesando..."
                    : "Processing...",
        });
        loading.present();

        this.apiDiscHierarchyService.GetDiscountHierarchies().subscribe(
            async (next) => {
                try {
                    // if (next.result) {
                    //   if (next.errorInfo) {
                    //     loading.dismiss();
                    //     this.commonService.Alert(
                    //       AlertType.INFO,
                    //       next.errorInfo.Message,
                    //       next.errorInfo.Message
                    //     );
                    //   } else {
                    if (next && next.Data) {
                        await this.repositoryDiscountHierarchy.DeleteDiscHierarchies();

                        next.Data.forEach((disc) => {
                            this.repositoryDiscountHierarchy
                                .StoreDiscountHierarchy(disc)
                                .then(async () => {
                                    conta++;
                                    progress = (conta / next.Data.length) * 100;
                                    loading.message = `${
                                        this.translateService.currentLang === "en"
                                            ? "Synchronizing: "
                                            : "Sincronizando: "
                                    }${Math.round(progress)}%`;

                                    if (conta === next.Data.length) {
                                        loading.dismiss();
                                        this.toast(
                                            `${
                                                this.translateService.currentLang === "en"
                                                    ? "Synchronized correctly"
                                                    : "Sincronizado correctamente"
                                            }`
                                        );
                                    }
                                })
                                .catch((err) => console.log(err));
                        });
                    }
                    else
                    {
                        loading.dismiss();
                        this.toast(next.Message);
                    }
                } catch (error) {
                    loading.dismiss();
                    console.warn(error);
                }
            },
            (error) => {
                console.warn(error);
                loading.dismiss();
                this.commonService.Alert(AlertType.INFO, error, error);
            }
        );
    }

    //#endregion

    //#region Taxes
    /**
     * Asynchronously synchronizes tax data.
     * This method is used to synchronize tax-related data.
     */
    async syncTax() {
        let conta = 0;
        let progress = 0;
        let loading = await this.loadingController.create({
            message:
                this.translateService.currentLang === "es"
                    ? "Procesando..."
                    : "Processing...",
        });
        loading.present();

        this.apiTaxService.GetTaxes().subscribe(
            async (taxes) => {
                if (taxes.Data) {
                    await this.repositoryTax.DeleteTaxes();
                    taxes.Data.forEach((tax) => {
                        this.repositoryTax
                            .StoreTax(tax)
                            .then(() => {
                                conta++;
                                progress = (conta / taxes.Data.length) * 100;
                                loading.message = `${
                                    this.translateService.currentLang === "en"
                                        ? "Synchronizing: "
                                        : "Sincronizando: "
                                }${Math.round(progress)}%`;

                                if (conta === taxes.Data.length) {
                                    loading.dismiss();
                                    this.toast(
                                        `${
                                            this.translateService.currentLang === "en"
                                                ? "Correctly synchronized"
                                                : "Sincronizado correctamente"
                                        }`
                                    );
                                }
                            });
                    });
                } else {
                    loading.dismiss();
                    let error = taxes.Message || JSON.stringify(taxes);
                    this.commonService.Alert(AlertType.ERROR, error, error);
                }
            },
            (error) => {
                loading.dismiss();
                this.commonService.Alert(AlertType.ERROR, error, error);
            }
        );
    }

    //#endregion

    //#region Tipo de conexion
    checkNetwork() {
        this.commonService.alert(
            AlertType.INFO,
            `${
                this.translateService.currentLang === "es"
                    ? "Tipo de conexión: "
                    : "Connection type: "
            }` + this.network.type
        );
    }

    //#endregion

    //#region Checks automaticos
    StartAutomaticCheckProcess() : void
    {
        from(this.repositoryConfiguration.GetConfiguration("CheckInTime"))
            .pipe(
                concatMap(checkInTimeConfig => {
                    if(checkInTimeConfig)
                    {
                        let checkInTimeValue = (JSON.parse(checkInTimeConfig?.Json || '') as IMobileAppConfiguration)?.CheckInTime
                        this.createAutomaticCheckInterval(+checkInTimeValue);
                        return of(1);
                    }

                    this.commonService.Alert(
                        AlertType.INFO,
                        "Por favor, sincronice tiempo de check-in", 
                        "Please synchronize check-in time"
                    );
                    
                    return of(-1)
                }),
            );
    }

    /**
     * Update the local route status
     * @param _routeToDeactivate The route information to update
     * @constructor
     */
    StopAutomaticCheckProcess(_routeToDeactivate: IRoute) : Observable<number>
    {
        return from(this.repositoryRoute.UpdateRouteStatus(_routeToDeactivate.Id,_routeToDeactivate.Status))
            .pipe(
                map(deleteResult => {
                    this.stopAutomaticCheckInterval();
                    
                    this.activeRouteId = null;
                    
                    return 1;
                })
            );
    }

    createAutomaticCheckInterval(time: number) {
        this.automaticCheckInterval = setInterval(() => {
            this.AutomaticCheckRoutine();
            this.SyncChecks();
        }, time * 60000);
    }

    stopAutomaticCheckInterval() {
        if (this.automaticCheckInterval) clearInterval(this.automaticCheckInterval);
    }

    async AutomaticCheckRoutine(): Promise<void> 
    {
        let resp = await this.geolocation.getCurrentPosition();

        if (this.activeRouteId) 
        {
            let routeHistory = {
                Longitude: resp.coords.longitude,
                Latitude: resp.coords.latitude,
                RouteId: this.activeRouteId,
                CreatedBy: this.localStorageService.get("Session").UserEmail,
                UpdatedBy: this.localStorageService.get("Session").UserEmail,
                CheckType: CheckType.CheckAuto,
                Comments: "Check automático",
                CreatedDate: new Date(),
                UpdateDate: new Date(),
                IsSynchronized: false,
                CardCode: "",
                RouteLineId: 0,
                Address: "",
                AddressType: 0,
                CardName: "",
                Photos: ""
            } as IRouteHistory;


            if (![this.network.Connection.NONE, this.network.Connection.UNKNOWN].includes(this.network.type)) 
            {
                this.routeHistoryService.CreateCheckList([routeHistory])
                    .pipe(
                        catchError(error => {
                            return this.repositoryRouteHistory.StoreRouteHistory(routeHistory);
                        })
                    )
                    .subscribe({
                        error: (error) => {
                            console.error(error);
                        }
                    });
            } 
            else 
            {
                this.repositoryRouteHistory.StoreRouteHistory(routeHistory).subscribe();
            }
        }
    }

    /**
     * Create an automatic check in the route
     * @param _latitude The current position latitude
     * @param _longitude The current position longitude
     * @param _routeId The active route id
     * @constructor
     */
    CreateLocalAutomaticCheck(_routeHistory: IRouteHistory) : void
    {
        this.repositoryRouteHistory.StoreRouteHistory(_routeHistory).subscribe();
    }

    VerifyAutomaticCheckProcessToStart() : void
    {
        this.repositoryRoute.GetActiveRoute()
            .subscribe({
               next: (route) => {
                   if(route)
                   {
                       this.activeRouteId = route.Route.Id;
                       
                       this.StartAutomaticCheckProcess();
                   }
                   else
                   {
                       this.SyncChecks()
                   }
               } 
            });
    }

    //#endregion

    //#region UDFs
    /**
     * Retrieves all configured UDFs and store them in the SQL Lite database
     * @constructor
     */
    async SyncUDFs(): Promise<void> 
    {
        let loading: HTMLIonLoadingElement = await this.loadingController.create({message: this.commonService.Translate('Procesando...', 'Processing...')});
        
        loading.present();

        let synchronizedUDFsCounter: number = 0;
        
        let udfsLength: number = 1;

        this.udfService.GetCategoriesUdfs()
            .pipe(
                concatMap(categoriesResponse => of(this.repositoryCompany.DeleteUdfs())
                    .pipe(
                        map(deleteResult => categoriesResponse)
                    )
                ),
                concatMap(categoriesResponse => of(...(categoriesResponse.Data || []))),
                concatMap(category =>
                    forkJoin([
                        this.udfService.Get(category.Name, false, true, true)
                            .pipe(
                                catchError(error => of(null))
                            ), 
                        this.udfService.GetUdfsDevelopment(category.Name, true)
                            .pipe(
                                catchError(error => of(null))
                            )
                        ]
                    )
                    .pipe(
                        map((udfsResponse: [ICLResponse<IUdfContext[]> | null, ICLResponse<IUdfDevelopment[]> | null]) => {
                            const contextUdfs = udfsResponse[0]?.Data?.map(udf => ({
                                ...udf,
                                MappedValues: JSON.parse(udf.Values),
                                IsForDevelopment: false
                            } as IUdfContext)) ?? [];

                            const devUdfs = udfsResponse[1]?.Data?.map(udf =>
                                this.commonService.MapUdfDevelopmentToUdfContext(udf)
                            ) ?? [];

                            return [...contextUdfs, ...devUdfs] as IUdfContext[];
                        }),
                        concatMap(mappedUdfs => {
                            udfsLength += mappedUdfs.length;
                            return of(mappedUdfs);
                        }),
                        catchError(error => {
                            return of([] as IUdfContext[]);
                        })
                    )),
                toArray(),
                concatMap(udfs => from(udfs)),
                reduce((acc, val) => acc.concat(val), [] as IUdfContext[]),
                concatMap(udfs => from(udfs)),
                concatMap(udf => {
                    synchronizedUDFsCounter++;
                    return from(this.repositoryCompany.StoreUdfs(udf));
                }),
            )
            .subscribe(
                result => {
                    loading.message = `${this.commonService.Translate('Sincronizando: ', 'Synchronizing: ')}${Math.round((synchronizedUDFsCounter / udfsLength) * 100)}%`;
                },
                (err) => {
                    loading.dismiss();
                    this.commonService.Alert(AlertType.ERROR, err, err);
                },
                () => {
                    loading.dismiss();
                    this.toast(this.commonService.Translate('Sincronizado correctamente', 'Synchronized correctly'));
                }
            );
    }

    //#endregion

    //#region Reports
    /**
     * Retrieves application reports based on the default menu option.
     *
     * @param defaultMenuOption The default menu option to fetch reports for.
     */
    async getAppReports(defaultMenuOption: any) {
        const loading = await this.loadingController.create({
            message:
                this.translateService.currentLang === "en"
                    ? "Processing..."
                    : "Procesando...",
        });
        loading.present();

        this.rptManagerService
            .GetReports()
            .pipe(first())
            .subscribe(
                (response) => {
                    if (response.Result) {
                        this.rptManagerService.AddReportsToMenu(
                            response.Reports,
                            defaultMenuOption
                        );

                        loading.dismiss();
                        this.toast(
                            `${
                                this.translateService.currentLang === "en"
                                    ? "Synchronized correctly"
                                    : "Sincronizado correctamente"
                            }`
                        );
                    } else {
                        loading.dismiss();

                        defaultMenuOption.Sons = null;

                        defaultMenuOption.Open = false;

                        this.toast(response.ErrorInfo?.Message || JSON.stringify(response));
                    }
                },
                (error) => {
                    loading.dismiss();

                    defaultMenuOption.Sons = null;

                    defaultMenuOption.Open = false;

                    this.toast(error);
                }
            );
    }

    //#endregion

    //#region Charts
    async syncCharts() {
        let conta = 0;
        let progress = 0;
        let loading = await this.commonService.Loader(
            "Procesando...",
            "Processing..."
        );
        loading.present();

        this.apiChartService.GetCharts().subscribe(
            (response) => {
                this.repositoryChart
                    .DeleteCharts()
                    .then(() => {
                        response?.Data?.forEach((chart) => {
                            this.repositoryChart
                                .AddChart(chart)
                                .then(() => {
                                    conta++;

                                    progress = (conta / response.Data.length) * 100;

                                    loading.message = `${
                                        this.translateService.currentLang === "en"
                                            ? "Synchronizing: "
                                            : "Sincronizando: "
                                    }${Math.round(progress)}%`;

                                    if (conta === response.Data.length) {
                                        loading.dismiss();

                                        this.toast(
                                            `${
                                                this.translateService.currentLang === "en"
                                                    ? "Synchronized correctly"
                                                    : "Sincronizado correctamente"
                                            }`
                                        );
                                    }
                                })
                                .catch((error) => {
                                    console.error(error);
                                });
                        });
                        if (!response.Data.length) {
                            loading.dismiss();

                            this.commonService.Alert(
                                AlertType.INFO,
                                "No se encontraron gráficas configuradas",
                                "No configured charts found"
                            );
                        }
                    })
                    .catch((error) => {
                        console.error(error);
                        loading.dismiss();
                    });
            },
            (error) => {
                loading.dismiss();
                this.toast(error);
            }
        );
    }

    //#endregion

    /**
     * If there is an internet connection, this method will send all the application logs to the backend to store them in the database.
     * @constructor
     */
    SyncLogsMobile(): void {
        if (this.network.type === 'none') 
        {
            return;
        }
        this.repositoryLog.GetUnsyncLogs()
            .then(next => {
                let unsyncLogs: ILogMobile[] = next;
                if (unsyncLogs && unsyncLogs.length) {
                    this.settingsService.GetSettingByCode(SettingCodes.EventViewer)
                        .pipe(
                            map(callback => {
                                let company: ICompany = this.localStorageService.get(LocalStorageVariables.SelectedCompany);
                                
                                let logSettings: ILogSetting[] = JSON.parse(callback.Data.Json || '');
                                
                                let logSetting = logSettings?.find(x => x.CompanyId === company?.Id);
                                
                                unsyncLogs = unsyncLogs
                                    .filter(x => (logSetting?.Information && x.Event == LogEvent.INFO) ||
                                        (logSetting?.Success && x.Event == LogEvent.SUCCESS) || 
                                        (logSetting?.Warning && x.Event == LogEvent.WARNING) ||
                                        (logSetting?.Error && x.Event == LogEvent.ERROR)
                                );
    
                                return unsyncLogs;
                            }),
                            filter(callback => callback && callback.length > 0),
                            switchMap(callback => this.logManagerService.StoreLogs(callback.map(element => {
                                    return {
                                        Event: element.Event,
                                        View: element.View,
                                        Detail: element.Detail,
                                        DocumentKey: element.DocumentKey
                                    } as ILogEvent
                                }))
                                .pipe(
                                    map(response => callback)
                                )
                            ),
                    ).subscribe({
                        next: (callback) => {
                            if (callback && callback.length) 
                            {
                                unsyncLogs.forEach(log => {
                                    log.SyncStatus = 1;
                                    this.repositoryLog.UpdateLogMobile(log)
                                        .catch(error => {
                                            this.commonService.alert(AlertType.ERROR, error);
                                        });
                                });
                                
                                this.commonService.Alert(AlertType.SUCCESS, 'Eventos sincronizados', 'Events sync');
                            }
                        }, error: (error) => {
                            this.commonService.alert(AlertType.ERROR, error);
                        }
                    });
                } 
                else 
                {
                    this.commonService.Alert(AlertType.SUCCESS, 'No hay eventos para sincronizar', 'No events to sync');
                }
            })
            .catch(error => {
                this.commonService.alert(AlertType.ERROR, error);
            });
    }

    async SyncDocumentTypesLabels(sync: any) {
        let conta = 0;

        let loading = await this.loadingController.create({
            message:
                this.translateService.currentLang === "es"
                    ? "Procesando..."
                    : "Processing...",
        });
        loading.present();

        this.documentService.GetDocumentTypesLabels()
            .subscribe({
                next: async (callback) => {
                    if (callback.Data && callback.Data.length) {
                        let contaProgress = 0;
                        let progress = 0;

                        from(this.repositoryDocument.DeleteDocumentTypeLabels())
                            .pipe(concatMap(x =>
                                from(callback.Data)
                                    .pipe(concatMap(x => from(this.repositoryDocument.AddDocumentTypeLabel(x))))
                            ), finalize(() => {
                                this.toast(
                                    this.commonService.Translate("Sincronizado correctamente", "Synchronized correctly")
                                );
                                loading.dismiss();
                            }))
                            .subscribe({
                                next: () => {
                                    conta++;
                                    contaProgress = conta / callback.Data.length;
                                    progress = contaProgress * 100;
                                    loading.message = `${
                                        this.commonService.Translate("Sincronizando", "Synchronizing")
                                    }: ${Math.round(progress)}%`;
                                },
                                error: (err) => {
                                    conta++;
                                    console.error(err)
                                }
                            });
                    } else {
                        this.toast(this.commonService.Translate("Sincronizado correctamente", "Synchronized correctly"));

                        loading.dismiss();
                    }
                },
                error: (err) => {
                    console.error(err);

                    loading.dismiss();
                }
            });
    }


    /**
     * Retrieves all currencies and store them in the SQL Lite database
     * @param _sync The sync object to show the progress information in the UI
     * @constructor
     */
    async SyncCurrencies(): Promise<void>
    {
        let currencies: ICurrency[] = [];

        let synchronizedCurrenciesCounter: number = 0;

        let loading = await this.loadingController.create({
            message: this.commonService.Translate("Procesando...", "Processing...")
        });
        
        loading.present();

        this.apiCompanyService.GetCurrencies(true)
            .pipe(
                map(response => {
                    if (response.Data)
                    {
                        currencies = response.Data;

                        return response.Data;
                    }
                    else
                    {
                        loading.message = this.commonService.Translate(
                            "No se obtuvieron las monedas",
                            "Currencies not obtained"
                        );

                        console.warn(response);

                        return [] as ICurrency[];
                    }
                }),
                concatMap(currenciesResponse => of(this.repositoryCurrency.DeleteCurrencies())
                    .pipe(
                        concatMap(deleteResult => of(...currenciesResponse))
                    )
                ),
                concatMap(currency => of(this.repositoryCurrency.StoreCurrency(currency)))
            )
            .subscribe((result) => {
                    synchronizedCurrenciesCounter++;
                    loading.message = `${this.commonService.Translate(
                        "Sincronizando: ",
                        "Synchronizing: "
                    )} ${synchronizedCurrenciesCounter / currencies.length * 100}%`
                },
                (error) => {
                    loading.dismiss();
                    this.commonService.Alert(AlertType.ERROR, error, error);
                },
                () => {
                    loading.dismiss();
                    this.commonService.toast(this.commonService.Translate("Sincronización completada", "Synchronization completed"), undefined, "bottom");
                }
            );
    }

    /**
     * Retrieves all route histories from local database and send them to the remote database, if the route of the check does not exist, the check will be deleted
     * @constructor
     */
    StartAutomaticChecksSynchronization(_timeInMinutes?: number): void
    {
        if(this.automaticCheckSynchronization$)
        {
            return;
        }
        
        let intervalTime = _timeInMinutes ? _timeInMinutes * 60 * 1000 : 300000;
        
        this.automaticCheckSynchronization$ = interval(intervalTime)
            .pipe(
                concatMap(interval => this.repositoryRouteHistory.GetUnsynchronizedRoutesHistories()
                    .pipe(
                        catchError(e => of(false))
                    )),
                filter(value => typeof value != 'boolean'),
                concatMap((routeHistories: IRouteHistory[]) => from(routeHistories)),
                concatMap(routeHistory => this.routeHistoryService.CreateCheckList([routeHistory], true)
                    .pipe(
                        map(response => routeHistory),
                        catchError(e => of(false))
                    )
                ),
                filter(value => typeof value != 'boolean'),
                concatMap((routeHistory: IRouteHistory) => from(this.repositoryRouteHistory.UpdateRouteHistorySyncStatus(routeHistory.Id, true))
                    .pipe(
                        map(result => routeHistory),
                        catchError(e => of(false))
                    )
                ),
                filter(value => typeof value != 'boolean'),
                concatMap((routeHistory: IRouteHistory) => this.repositoryRoute.GetRoute(routeHistory.RouteId)
                    .pipe(
                        concatMap(route => {
                            if(!route)
                            {
                                return of(routeHistory);
                            }
                            
                            return of(true);
                        })
                    )
                ),
                filter(value => typeof value != 'boolean'),
                concatMap((routeHistory: IRouteHistory) => this.repositoryRouteHistory.DeleteRouteHistory(routeHistory.Id)
                    .pipe(
                        catchError(error => of(false))
                    )
                ),
                filter(value => typeof value != 'boolean')
            )
            .subscribe();
    }

    /**
     * Verify if the synchronized routes were closed
     * @constructor
     */
    StartAutomaticVerificationOfClosedRoutes(): void
    {
        if(this.automaticVerificationOfClosedRoutes$)
        {
            return;
        }
        
        this.automaticVerificationOfClosedRoutes$ = timer(0, 300000)
            .pipe(
                concatMap(value => from(this.repositoryRoute.GetRoutes())
                    .pipe(
                        catchError(error => of(false))
                    )
                ),
                filter(value => typeof value != 'boolean'),
                concatMap((routes: IRouteWithLines[]) => from(routes)),
                filter(route => ![RouteStatus.Closed, RouteStatus.Finished].includes(route.Route.Status)),
                concatMap(route => this.routeService.GetRoute(route.Route.Id, true)
                    .pipe(
                        catchError(error => of(false))
                    )
                ),
                filter(routesResponse => typeof routesResponse != 'boolean' && routesResponse.Data && routesResponse.Data.Status == RouteStatus.Closed),
                concatMap((routeResponse: ICLResponse<IRoute>) => this.repositoryRoute.UpdateRouteStatus(routeResponse.Data.Id, RouteStatus.Closed)
                    .pipe(
                        map(result => routeResponse.Data),
                        catchError(error => of(false))
                    )
                ),
                filter(value => typeof value != 'boolean')
            ).subscribe({
                next: (value: IRoute) => {
                    this.repositoryRoute.onRouteClosed$.next(value);
                }
            });
    }

    /**
     * Retrieves all bill of materials information and store them in the SQL Lite database
     * @constructor
     */
    async SyncBillOfMaterials(): Promise<void>
    {
        let syncDate = new Date();

        let billOfMaterials : IBillOfMaterialToSync[];
        
        let loading = await this.loadingController.create({
            message: this.commonService.Translate("Procesando...", "Processing...")
        });

        loading.present();

        let lastSyncDate = this.localStorageService.GetSyncDate(ChangeElement.BillOfMaterials)?.SyncDate || new Date(0);
        
        this.billOfMaterialsService.GetBillOfMaterialsToSync(lastSyncDate)
            .subscribe(async (response: ICLResponse<IBillOfMaterialToSync[]>) =>{
                if (response.Data) {
                    billOfMaterials = response.Data;

                    if (billOfMaterials.length > 0) {
                        let conta = 0;
                        let contaProgress = 0;
                        let progress = 0;

                        from(billOfMaterials)
                            .pipe(
                                concatMap((value) => from(this.repositoryProduct.UpdateOrCreateBillOfMaterials(value))),
                                finalize(() => loading.dismiss())
                            )
                            .subscribe({
                                next: (next) => {
                                    conta++;
                                    contaProgress = conta / billOfMaterials.length;
                                    progress = contaProgress * 100;
                                    loading.message = `${this.translateService.currentLang === 'es' ? 'Sincronizando' : 'Synchronizing'}: ${Math.round(progress)}%`;
                                },
                                complete: () => {
                                    this.localStorageService.SetSyncDate({
                                        Type: ChangeElement.BillOfMaterials,
                                        Count: 0,
                                        SyncDate: this.datePipe.transform(syncDate, 'yyyy-MM-dd HH:mm:ss')
                                    });

                                    this.toast(this.commonService.Translate("Sincronizado correctamente", "Synchronized correctly"));
                                },
                                error: (error) => {
                                    conta++;
                                    console.log(error);
                                }
                            })
                    }else {
                        this.localStorageService.SetSyncDate({
                            Type: ChangeElement.BillOfMaterials,
                            Count: 0,
                            SyncDate: this.datePipe.transform(syncDate, 'yyyy-MM-dd HH:mm:ss')
                        });

                        this.toast(this.translateService.currentLang === 'es' ? 'Sincronizado correctamente' : 'Synchronized correctly');

                        loading.dismiss();
                    }
                }else{
                    loading.dismiss();

                    this.commonService.alert(AlertType.INFO, this.commonService.Translate("No se obtuvieron listas de materiales", "No bill of materials were obtained"));

                }
            },
            (error) => {
                loading.dismiss();

                this.commonService.Alert(AlertType.ERROR, error, error);
            })
    }

    /**
     * Synchronizes the application menu by fetching and storing menu data for both Spanish and English languages.
     * This function retrieves the upcoming menu data, deletes the existing menu, and updates it with the new data.
     * It displays a loading message during the process and provides feedback upon completion.
     */
    async SyncMenu() {
        let conte =
            this.translateService.currentLang === "es"
                ? "Procesando..."
                : "Processing...";
        let conta = 0;
        let contaProgress = 0;
        let progress = 0;
        let loading = await this.loadingController.create({message: conte});
        loading.present();
        
        // Create observables for both ES and EN menu requests
        const menuES$ = this.menuService.GetUpcomingMenu("ES");
        const menuEN$ = this.menuService.GetUpcomingMenu("EN");

        // Use forkJoin to wait for both requests to complete
        forkJoin([menuES$, menuEN$]).subscribe(
            async ([dataMenuES, dataMenuEN]: [ICLResponse<IMenuMobile[]>, ICLResponse<IMenuMobile[]>]) => {
                if (dataMenuES.Data && dataMenuEN.Data) {
                    await this.repositoryMenu.DeleteMenu();
                    const combinedData = [...dataMenuES.Data, ...dataMenuEN.Data];
                    combinedData.forEach((element: IMenuMobile) => {
                        this.repositoryMenu
                            .AddMenu(element)
                            .then((data: any) => {
                                conta++;
                                contaProgress = conta / combinedData.length;
                                progress = contaProgress * 100;
                                loading.message = `${
                                    this.translateService.currentLang === "es"
                                        ? "Sincronizando"
                                        : "Synchronizing"
                                }: ${Math.round(progress)}%`;
                                if (conta === combinedData.length) {
                                    this.toast(
                                        this.translateService.currentLang === "es"
                                            ? "Sincronizado correctamente"
                                            : "Synchronized correctly"
                                    );
                                    loading.dismiss();
                                }
                            })
                            .catch((error: any) => {
                                loading.dismiss();
                                console.error(error);
                            });
                    });
                } else {
                    loading.dismiss();
                    this.commonService.alert(
                        AlertType.ERROR,
                        dataMenuES.Message || dataMenuEN.Message
                    );
                }
            },
            (error: any) => {
                loading.dismiss();
                console.error(error);
                this.commonService.Alert(AlertType.ERROR, error, error);
            }
        );
    }

     //#region Print Format
    /**
     * Retrieves printo format to sync
     * @constructor
     */
    async SyncPrintFormatZPL() : Promise<void>
    {
        let loading = await this.loadingController
            .create({message: this.commonService.Translate("Procesando...", "Processing...")});

        loading.present();

        this.printFormatService.GetPrintFormatZPLOffline()
            .subscribe(
            (response) => {
                if (response) 
                {
                    this.repositoryPrintFormat
                        .DeletePrintFormatZPLOffline()
                        .then(() => {
                            this.repositoryPrintFormat
                                .AddPrintFormatZPLOffline(response.Data)
                                .then((data: any) => {
                                    loading.dismiss();
                                    this.toast(this.commonService.Translate("Sincronizado correctamente", "Synchronized correctly"));
                                })
                                .catch((error: any) => {
                                    loading.dismiss();
                                    console.error(error);
                                });
                        })
                        .catch((error: any) => {
                            loading.dismiss();
                            console.error(error);
                        });
                } 
                else 
                {
                    loading.dismiss();
                    this.commonService.alert(
                        AlertType.ERROR,
                        this.commonService.Translate(
                            "La información del formato de impresion no se obtuvo",
                            "The print format information was not obtained"
                        )
                    );
                }
            },
            (error: any) => {
                loading.dismiss();
                console.error(error);
                this.commonService.Alert(AlertType.ERROR, error, error);
            }
        );
    }
    //#endregion

    //#region Pay Terms
     /**
     * Retrieves all accounts from remote database and store them in the SQL Lite database
     * @constructor
     */
    async SyncPayTerms(): Promise<void> 
    {
        let loading = await this.loadingController.create({message: this.commonService.Translate("Procesando...", "Processing...")});
        
        loading.present();

        let synchronizedAccountsCounter: number = 0;

        let syncLength: number = 0;

        this.payTermsService.GetMobilePayTerms()
            .pipe(
                concatMap(response => {
                    if(response && response.Data && response.Data.length > 0)
                    {
                        syncLength = response.Data.length;

                        return of(response.Data)
                    }

                    this.commonService.Alert(AlertType.INFO, "No se encontraron terminos de pago", "No payment terms where found");

                    return EMPTY;
                }),
                concatMap(payTerms => this.repositoryPayTerms.DeletePayTerms()
                    .pipe(
                        concatMap(deleteResult => from(payTerms))
                    )
                ),
                concatMap(payTerms => this.repositoryPayTerms.StorePayTerm(payTerms)),
                finalize(() => loading.dismiss())
            )
            .subscribe({
                next: (result) => {
                    synchronizedAccountsCounter++;
                    
                    loading.message = `${this.commonService.Translate("Sincronizando", "Synchronizing")}: ${Math.round(synchronizedAccountsCounter / syncLength * 100)}%`;
                    
                    if (synchronizedAccountsCounter === syncLength) 
                    {
                        this.commonService.toast(this.commonService.Translate("Sincronizado correctamente", "Synchronized correctly"))
                    }
                },
                error: (error) => {
                    loading.dismiss();
                    this.commonService.Alert(AlertType.ERROR, error, error);
                }
            });
    }
    //#endregion
}
