import {Component, OnDestroy, OnInit} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {AlertType, Geoconfigs, RouteStatus,} from "src/app/common";
import {
    IBlanketAgreement,
    ICurrency, IExchangeRate,
    IGeoConfig,
    IMeasurementUnit,
    ISetting,
    ITaxCodeDetermination,
} from "src/app/models";
import {
    AccountService,
    CardService,
    ChartService,
    CheckInService,
    CommonService,
    CompanyService,
    ConfigurationService,
    CustomerService,
    DiscountGroupService,
    DiscountHierarchyService,
    DocumentService,
    ExRateService,
    GeoconfigService,
    LocalStorageService,
    MeasurementUnitService, MenuService,
    PermissionService,
    PriceListService,
    ProductService,
    PublisherService,
    Repository,
    RouteService,
    SeriesService,
    TaxService,
    UserService,
    WarehouseService
} from "../../services";
import {IPriceListInfo} from "../../models/db/i-price-list-info";
import {
    ChangeElement,
    DocumentSyncStatus,
    LocalStorageVariables,
    PublisherVariables,
    SynchronizedRoutesFrom
} from "src/app/common/enum";
import {DatePipe} from "@angular/common";
import {catchError, concatMap, finalize, map, reduce, toArray} from "rxjs/operators";
import {EMPTY, forkJoin, from, Observable, of, throwError} from "rxjs";
import {IRouteWithLines, ISyncronizedRoutes} from "src/app/models/db/route-model";
import {ICLResponse} from "../../models/responses/response";
import {ICompany} from "../../models/db/companys";
import {Device} from "@ionic-native/device/ngx";
import {IItem} from "../../models/i-item";
import {IBusinessPartner} from "../../models/i-business-partner";
import {IPriceList} from "../../models/i-price-list";
import {UdfsService} from "../../services/udfs.service";
import {IMobileAppConfiguration, ISettings} from "../../interfaces/i-settings";
import {ISyncInfo} from "../../interfaces/i-sync-info";
import {IUser} from "../../models/i-user";
import {IWarehouses} from "../../interfaces/i-warehouse";
import {ISalesTaxes} from "../../interfaces/i-sales-taxes";
import {IDiscountHierarchy} from "../../models/db/discount-hierarchy";
import {IDiscountGroup} from "../../models/db/discount-group";
import {IChart} from "../../models/db/i-chart";
import {IDocumentTypeLabel} from "../../models/db/Doc-model";
import {BillOfMaterialsService} from "../../services/bill-of-materials.service";
import {IUdfContext, IUdfDevelopment} from "../../interfaces/i-udfs";
import {SyncService} from "../../services/sync.service";
import {IBillOfMaterialToSync} from "../../interfaces/i-item";
import {SettingsService} from "../../services/settings.service";
import {UpcomingExchangeRate} from "../../models/db/i-exchange.rate";
import {IMenuMobile} from "../../interfaces/i-menu";
import { PrintFormatService } from "src/app/services/print-format.service";
import { IPrintFormatZPLOffline } from "src/app/interfaces/i-print";
import { PayTermsService } from "src/app/services/pay-terms.service";

@Component({
    selector: "app-sync",
    templateUrl: "./sync.page.html",
    styleUrls: ["./sync.page.scss"],
})
export class SyncPage implements OnInit, OnDestroy {
    syncList: ISyncInfo[];
    syncLenght: number;
    progressPercent: number;
    syncCustomer = {Func: "SyncCustomers"} as ISyncInfo;
    syncProduct = {Func: "SyncProducts"} as ISyncInfo;
    syncBillOfMaterials = {Func: "SyncBillOfMaterials"} as ISyncInfo;
    syncPrice = {Func: "SyncPrices"} as ISyncInfo;
    syncPriceLists = {Func: "SyncPriceLists"} as ISyncInfo;
    syncUser = {Func: "SyncUsers"} as ISyncInfo;
    syncCard = {Func: "SyncCards"} as ISyncInfo;
    syncAccount = {Func: "SyncAccounts"} as ISyncInfo;
    syncExrate = {Func: "SyncExRate"} as ISyncInfo;
    syncRoute = {Func: "SyncRoutes"} as ISyncInfo;
    syncCheck = {Func: "SyncChecks"} as ISyncInfo;
    syncPerm = {Func: "SyncPermissions"} as ISyncInfo;
    syncCompanyInformation = {Func: "SyncCompanyInformation"} as ISyncInfo;
    syncWarehouse = {Func: "SyncWarehouses"} as ISyncInfo;
    syncTaxes = {Func: "SyncTax"} as ISyncInfo;
    syncGeoconfig = {Func: "SyncGeoConfigs"} as ISyncInfo;
    //syncCheckInTime = {Func: "SyncCheckinTime"} as ISyncInfo;
    syncSetting = {Func: "SyncSettings"} as ISyncInfo;
    syncSeries = {Func: "SyncSeries"} as ISyncInfo;
    syncUDFs = {Func: "SyncUDFs"} as ISyncInfo;
    syncMUnit = {Func: "SyncMeasurementUnits"} as ISyncInfo;
    syncDiscHierarchy = {Func: "SyncDiscountHierarchy"} as ISyncInfo;
    syncDiscGroups = {Func: "SyncDiscountGroups"} as ISyncInfo;
    syncCurrency = {Func: "SyncCurrencies"} as ISyncInfo;
    syncTaxCodesDetermination = {Func: "SyncTaxCodesDetermination"} as ISyncInfo;
    syncCharts = {Func: "SyncCharts"} as ISyncInfo;
    syncBlanketAgreement = {Func: "SyncBlanketAgreement"} as ISyncInfo;
    syncDocumentTypesLabels = {Func: "SyncDocumentTypesLabels"} as ISyncInfo;
    syncMenu = {Func: "SyncMenu"} as ISyncInfo;
    syncPrintFormatZPL = {Func: "SyncPrintFormatZPL"} as ISyncInfo;
    syncPayTerms = {Func: "SyncPayTerms"} as ISyncInfo;
    lang: string;

    constructor(
        private datePipe: DatePipe,
        private translateService: TranslateService,
        private commonService: CommonService,
        private localStorageService: LocalStorageService,
        private customerService: CustomerService,
        private repositoryCustomer: Repository.Customer,
        private productService: ProductService,
        private repositoryProduct: Repository.Product,
        private pricesService: PriceListService,
        private repositoryPriceList: Repository.PriceList,
        private userService: UserService,
        private repositoryUser: Repository.User,
        private cardService: CardService,
        private repositoryCard: Repository.Card,
        private accountService: AccountService,
        private repositoryAccount: Repository.Account,
        private exchangeRateService: ExRateService,
        private repositoryExchangeRate: Repository.ExchangeRate,
        private routeService: RouteService,
        private repositoryRoute: Repository.Route,
        private geoconfigService: GeoconfigService,
        private repositoryGeoConfiguration: Repository.GeoConfiguration,
        private checkinService: CheckInService,
        private repositoryRouteHistory: Repository.RouteHistory,
        private permissionService: PermissionService,
        private repositoryPermission: Repository.Permission,
        private companyService: CompanyService,
        private repositoryCompany: Repository.Company,
        private repositoryCurrency: Repository.Currency,
        private warehouseService: WarehouseService,
        private repositoryWarehouse: Repository.Warehouse,
        private taxesService: TaxService,
        private repositoryTax: Repository.Tax,
        private configService: ConfigurationService,
        private repositoryConfiguration: Repository.Configuration,
        private serieService: SeriesService,
        private repositorySerie: Repository.Serie,
        private munitService: MeasurementUnitService,
        private repositoryMeasurementUnit: Repository.MeasurementUnit,
        private discountHierarchyService: DiscountHierarchyService,
        private repositoryDiscountHierarchy: Repository.DiscountHierarchy,
        private discountGroupService: DiscountGroupService,
        private repositoryDiscountGroup: Repository.DiscountGroup,
        private repositoryDocument: Repository.Document,
        private repositoryChart: Repository.Chart,
        private chartService: ChartService,
        private publisherService: PublisherService,
        private documentService: DocumentService,
        private device: Device,
        private udfsService: UdfsService,
        private billOfMaterialsService: BillOfMaterialsService,
        private syncService: SyncService,
        private settingsService: SettingsService,
        private repositoryMenu: Repository.Menu,
        private menuService: MenuService,
        private repositoryPrintFormat: Repository.PrintFormatZPLOffline,
        private printFormatService: PrintFormatService,
        private payTermsService: PayTermsService,
        private repositoryPayTerms: Repository.PayTerms
    ) {
    }

    ngOnDestroy(): void {
        this.localStorageService.set('isOnSyncMode', false, true);
    }

    ngOnInit(): void
    {
        this.localStorageService.set('isOnSyncMode', true, true);
        this.InitProperties();
        this.FillSyncList();
        this.StartSynchronizationProcess();
    }

    /**
     * Initialize global variables
     * @constructor
     */
    InitProperties(): void
    {
        this.syncList = [];

        this.syncLenght = 0;

        this.progressPercent = 0;

        this.lang = this.translateService.currentLang;
    }

    /**
     * Fill the synchronization list with the process to run
     * @constructor
     */
    FillSyncList(): void
    {
        //#region Llenar lista de sincronizaciones segun permisos

        if (!this.permissionService.Permissions) return;

        this.syncList.push(this.syncCustomer);
        this.syncList.push(this.syncProduct);
        this.syncList.push(this.syncBillOfMaterials);
        this.syncList.push(this.syncPrice);
        this.syncList.push(this.syncUser);
        this.syncList.push(this.syncPriceLists);
        this.syncList.push(this.syncCard);
        this.syncList.push(this.syncAccount);
        this.syncList.push(this.syncExrate);
        this.syncList.push(this.syncTaxes);

        if (this.permissionService.Permissions.some((x) => x.Name === 'M_Sync_Routes_Sync'))
            this.syncList.push(this.syncRoute);

        this.syncList.push(this.syncCheck);
        this.syncList.push(this.syncWarehouse);
        this.syncList.push(this.syncGeoconfig);
        this.syncList.push(this.syncSetting);
        this.syncList.push(this.syncSeries);
        this.syncList.push(this.syncUDFs);
        this.syncList.push(this.syncMUnit);
        this.syncList.push(this.syncDiscHierarchy);
        this.syncList.push(this.syncDiscGroups);

        this.syncList.push(this.syncPerm);
        this.syncList.push(this.syncCompanyInformation);
        this.syncList.push(this.syncCurrency);
        this.syncList.push(this.syncTaxCodesDetermination);
        this.syncList.push(this.syncCharts);
        this.syncList.push(this.syncBlanketAgreement);
        this.syncList.push(this.syncDocumentTypesLabels);
        this.syncList.push(this.syncMenu);
        this.syncList.push(this.syncPrintFormatZPL);
        this.syncList.push(this.syncPayTerms);
        //#endregion

        this.syncList.forEach((e, index) => {
            e.Id = index;
            e.Result = false;
            e.Finished = false;
            e.Progress = 0;
        });

        //#region Nombre de las sincronizaciones
        if (this.translateService.currentLang === 'en') 
        {
            this.syncCustomer.Name = 'Customers';
            this.syncProduct.Name = 'Products';
            this.syncBillOfMaterials.Name = 'Bill of materials';
            this.syncPrice.Name = 'Prices';
            this.syncPriceLists.Name = 'Price Lists';
            this.syncUser.Name = 'Users';
            this.syncCard.Name = 'Cards';
            this.syncAccount.Name = 'Accounts';
            this.syncExrate.Name = 'Exchange rate';
            this.syncRoute.Name = 'Routes';
            this.syncCheck.Name = 'Checks';
            this.syncPerm.Name = 'Permissions';
            this.syncCompanyInformation.Name = 'Company';
            this.syncWarehouse.Name = 'Warehouses';
            this.syncTaxes.Name = 'Impuestos';
            this.syncGeoconfig.Name = 'Geoconfigurations';
            this.syncSetting.Name = 'Configurations';
            this.syncSeries.Name = 'Numbering series';
            this.syncUDFs.Name = 'UDFs';
            this.syncMUnit.Name = 'Measurement units';
            this.syncDiscHierarchy.Name = 'Discount hierarchies';
            this.syncDiscGroups.Name = 'Discount groups';
            this.syncCurrency.Name = 'Currencies';
            this.syncTaxCodesDetermination.Name = 'Taxcodes determination';
            this.syncCharts.Name = 'Charts';
            this.syncBlanketAgreement.Name = 'Blank agreement';
            this.syncDocumentTypesLabels.Name = 'Document tags';
            this.syncMenu.Name = 'Menu';
            this.syncPrintFormatZPL.Name = 'Print format';
            this.syncPayTerms.Name = 'Payment terms';
        } 
        else 
        {
            this.syncCustomer.Name = 'Clientes';
            this.syncProduct.Name = 'Productos';
            this.syncBillOfMaterials.Name = "Listas de materiales";
            this.syncPrice.Name = 'Precios';
            this.syncPriceLists.Name = 'Listas de precios';
            this.syncUser.Name = 'Usuarios';
            this.syncCard.Name = 'Tarjetas';
            this.syncAccount.Name = 'Cuentas';
            this.syncExrate.Name = 'Tipo de cambio';
            this.syncRoute.Name = 'Rutas';
            this.syncCheck.Name = 'Checks';
            this.syncPerm.Name = 'Permisos';
            this.syncCompanyInformation.Name = 'Compañía';
            this.syncWarehouse.Name = 'Almacenes';
            this.syncTaxes.Name = 'Impuestos';
            this.syncGeoconfig.Name = 'Geoconfiguraciones';
            this.syncSetting.Name = 'Configuraciones';
            this.syncSeries.Name = 'Series de numeración';
            this.syncUDFs.Name = 'UDFs';
            this.syncMUnit.Name = 'Unidades de medida';
            this.syncDiscHierarchy.Name = 'Jerarquía de descuentos';
            this.syncDiscGroups.Name = 'Grupos de descuentos';
            this.syncCurrency.Name = 'Monedas';
            this.syncTaxCodesDetermination.Name = 'Determinación de impuestos';
            this.syncCharts.Name = 'Gráficos';
            this.syncBlanketAgreement.Name = 'Acuerdo global';
            this.syncDocumentTypesLabels.Name = 'Etiquetas documentos';
            this.syncMenu.Name = 'Menu';
            this.syncPrintFormatZPL.Name = 'Formato de impresión';
            this.syncPayTerms.Name = 'Terminos de pago';
        }
        //#endregion
    }

    /**
     * Run all process that need be synchronized
     * @constructor
     */
    StartSynchronizationProcess(): void 
    {
        this.syncService.SetTotalSynchronizations(this.syncList.length);

        this.syncList.forEach((x) => {
            if (this[x.Func]) this[x.Func](x);
        });
    }

    /**
     * Raise a modal with the information of the completed process
     * @param _sync Sync object with the completed process information
     * @constructor
     */
    ShowSyncInformation(_sync: ISyncInfo): void
    {
        this.commonService.alert(
            AlertType.INFO,
            _sync.Info,
            _sync.Name
        );
    }

    /**
     * Update the synchronization information to show in the UI
     * @param _sync Synchronization information object
     * @param _totalSyncLength Total count of object to synchronize
     * @param _synchronized Count of object synchronized in the process
     * @constructor
     */
    UpdateSyncInformation(_sync: ISyncInfo, _totalSyncLength: number, _synchronized: number): void
    {
        _sync.Progress = (_synchronized / _totalSyncLength) * 100;

        if (_synchronized === _totalSyncLength) 
        {
            _sync.Finished = true;

            this.syncService.IncrementSynchronizationsCompleted();

            if (_sync.Info) 
            {
                _sync.Result = false;
            } 
            else 
            {
                _sync.Result = true;
            }
        }
    }

    /**
     * Retrieves all customers and store them in the SQL Lite database
     * @param _sync The sync object to show the progress information in the UI
     * @constructor
     */
    async SyncCustomers(_sync: ISyncInfo): Promise<void> 
    {
        let syncDate = new Date();
        
        let customers: IBusinessPartner[] = [];
        
        let synchronizedCustomerCounter: number = 0;

        let lastSyncDate = this.localStorageService.GetSyncDate(ChangeElement.BusinessPartners)?.SyncDate || new Date(0);

        this.customerService.GetCustomers(lastSyncDate)
            .subscribe(
            async (response) => {

                if (!response?.Data) 
                {
                    _sync.Info = this.commonService.Translate('No se obtuvieron clientes', 'No clientes obtained');
                    this.UpdateSyncInformation(_sync, 0, 0);
                    return;
                }

                if (response.Data.length > 0) 
                {
                    customers = response.Data;
                    
                    from(customers)
                        .pipe(
                            concatMap((value) => from(this.repositoryCustomer.StoreCustomer(value))
                        ))
                        .subscribe({
                            next: (response) => {
                                synchronizedCustomerCounter++;
                                
                                this.UpdateSyncInformation(_sync, customers.length, synchronizedCustomerCounter);
                            },
                            complete: () => {
                                this.localStorageService.SetSyncDate({
                                    Type: ChangeElement.BusinessPartners,
                                    Count: 0,
                                    SyncDate: this.datePipe.transform(syncDate, 'yyyy-MM-dd HH:mm:ss')
                                });
                            },
                            error: (error) => {
                                synchronizedCustomerCounter++;
                                
                                _sync.Info = error;
                                
                                this.UpdateSyncInformation(_sync, customers.length, synchronizedCustomerCounter);
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
                    
                    this.UpdateSyncInformation(_sync, 0, 0);
                }
            },
            (err) => {
                console.error(err);
                _sync.Info = err;
                this.UpdateSyncInformation(_sync, 0, 0);
            }
        );
    }

    /**
     * Retrieves all products and store them in the SQL Lite database
     * @param _sync The sync object to show the progress information in the UI
     * @constructor
     */
    async SyncProducts(_sync: ISyncInfo): Promise<void> 
    {
        let syncDate = new Date();
        
        let products: IItem[];
        
        let synchronizedProductCounter: number = 0;

        let lastSyncDate = this.localStorageService.GetSyncDate(ChangeElement.Items)?.SyncDate || new Date(0);

        this.productService.GetProducts(lastSyncDate)
            .subscribe(async (response: ICLResponse<IItem[]>) => {
                if (response.Data) 
                {
                    products = response.Data;
                    
                    if (products.length > 0) 
                    {
                        from(products)
                            .pipe(
                                concatMap((element) => from(this.repositoryProduct.UpdateOrCreateProduct(element)))
                            )
                            .subscribe({
                                next: (response) => {
                                    synchronizedProductCounter++;

                                    this.UpdateSyncInformation(_sync, products.length, synchronizedProductCounter);
                                },
                                complete: () => {
                                    this.localStorageService.SetSyncDate({
                                        Type: ChangeElement.Items,
                                        Count: 0,
                                        SyncDate: this.datePipe.transform(syncDate, 'yyyy-MM-dd HH:mm:ss')
                                    });
                                },
                                error: (error) => {
                                    _sync.Info = error;

                                    synchronizedProductCounter++;

                                    this.UpdateSyncInformation(_sync, products.length, synchronizedProductCounter);
                                }
                            });
                    } 
                    else 
                    {
                        this.localStorageService.SetSyncDate({
                            Type: ChangeElement.Items,
                            Count: 0,
                            SyncDate: this.datePipe.transform(syncDate, 'yyyy-MM-dd HH:mm:ss')
                        });
                        
                        this.UpdateSyncInformation(_sync, products.length, products.length);
                    }
                } 
                else 
                {
                    _sync.Info = this.commonService.Translate('No se obtuvieron productos', 'No products obtained');
                    
                    this.UpdateSyncInformation(_sync, 0, 0);
                }
            },
            (error) => {
                _sync.Info = error;
                
                this.UpdateSyncInformation(_sync, 0, 0);
            }
        );
    }

    /**
     * Retrieves all price lists and store them in the SQL Lite database
     * @param _sync The sync object to show the progress information in the UI
     * @constructor
     */
    async SyncPriceLists(_sync: ISyncInfo): Promise<void>
    {
        let syncDate = new Date();
        
        let priceListInfo: IPriceListInfo[];
        
        let conta: number = 0;

        let lastSyncDate = this.localStorageService.GetSyncDate(ChangeElement.PriceLists)?.SyncDate || new Date(0);

        // obtener listas de precios
        this.pricesService.GetPriceListsInfo(lastSyncDate)
            .subscribe(async (response: ICLResponse<IPriceListInfo[]>) => {
                if (response.Data) {
                    priceListInfo = response.Data;
                    if (priceListInfo.length > 0) {
                        from(priceListInfo)
                            .pipe(
                                concatMap((element) => from(this.repositoryPriceList.UpdateOrCreatPriceListsInfo(element)))
                            )
                            .subscribe({
                                next: (response) => {
                                    conta++;

                                    this.UpdateSyncInformation(_sync, priceListInfo.length, conta);
                                },
                                complete: () => {
                                    this.localStorageService.SetSyncDate({
                                        Type: ChangeElement.PriceLists,
                                        Count: 0,
                                        SyncDate: this.datePipe.transform(syncDate, 'yyyy-MM-dd HH:mm:ss')
                                    });
                                },
                                error: (error) => {
                                    _sync.Info = error;

                                    conta++;

                                    this.UpdateSyncInformation(_sync, priceListInfo.length, conta);
                                }
                            });
                    }else{
                        this.localStorageService.SetSyncDate({
                            Type: ChangeElement.PriceLists,
                            Count: 0,
                            SyncDate: this.datePipe.transform(syncDate, 'yyyy-MM-dd HH:mm:ss')
                        });

                        this.UpdateSyncInformation(_sync, priceListInfo.length, priceListInfo.length);
                    }

                }else{
                    _sync.Info = this.commonService.Translate('No se obtuvieron listas de precios', 'No price lists obtained');

                    this.UpdateSyncInformation(_sync, 0, 0);
                }
            },
        error => {
            _sync.Info = error;

            this.UpdateSyncInformation(_sync, 0, 0);
            }
        )
    }

    /**
     * Retrieves all items prices and store them in the SQL Lite database
     * @param _sync The sync object to show the progress information in the UI
     * @constructor
     */
    SyncPrices(_sync: ISyncInfo): void
    {
        let syncDate = new Date()
        let priceList: IPriceList[] = [];
        let conta: number = 0;

        let lastSyncDate = this.localStorageService.GetSyncDate(ChangeElement.Prices)?.SyncDate || new Date(0);

        this.pricesService.GetPriceList(lastSyncDate)
            .subscribe(async (response: ICLResponse<IPriceList[]>)=>{
                if (response.Data) {
                    priceList = response.Data;

                    if (priceList.length > 0) {
                        from(priceList)
                            .pipe(
                                concatMap((element) => from(this.repositoryPriceList.UpdateOrInsertPriceList(element)))
                            )
                            .subscribe({
                                next: (response) => {
                                    conta++;

                                    this.UpdateSyncInformation(_sync, priceList.length, conta);
                                },
                                complete: () => {
                                    this.localStorageService.SetSyncDate({
                                        Type: ChangeElement.Prices,
                                        Count: 0,
                                        SyncDate: this.datePipe.transform(syncDate, 'yyyy-MM-dd HH:mm:ss')
                                    });
                                },
                                error: (error) => {
                                    _sync.Info = error;
                                    conta++;
                                    this.UpdateSyncInformation(_sync, priceList.length, conta);
                                }
                            });
                    }else{
                        this.localStorageService.SetSyncDate({
                            Type: ChangeElement.Prices,
                            Count: 0,
                            SyncDate: this.datePipe.transform(syncDate, 'yyyy-MM-dd HH:mm:ss')
                        });

                        this.UpdateSyncInformation(_sync, priceList.length, priceList.length);
                    }
                }else{
                    _sync.Info = this.commonService.Translate('No se obtuvieron precios', 'No prices obtained');

                    this.UpdateSyncInformation(_sync, 0, 0);
                }
            },
        (error) => {
            _sync.Info = error;

            this.UpdateSyncInformation(_sync, 0, 0);
        })
        
    }

    /**
     * Retrieves all users and store them in the SQL Lite database
     * @param _sync The sync object to show the progress information in the UI
     */
    async SyncUsers(_sync: ISyncInfo): Promise<void>
    {
        let synchronizedUsersCounter: number = 0;

        from(this.repositoryUser.DeleteUsers())
            .pipe(
                concatMap(_ => this.userService.GetUsers())
            )
            .subscribe((response: ICLResponse<IUser[]>) => {
                    if (response.Data.length > 0) 
                    {
                        response.Data.forEach((user) => {
                            this.repositoryUser
                                .AddUser(user)
                                .then(() => {
                                    synchronizedUsersCounter++;
                                    this.UpdateSyncInformation(_sync, response.Data.length, synchronizedUsersCounter);
                                })
                                .catch((error) => {
                                    _sync.Info = error;
                                    synchronizedUsersCounter++;
                                    this.UpdateSyncInformation(_sync, response.Data.length, synchronizedUsersCounter);
                                });
                        });
                    } 
                    else 
                    {
                        _sync.Info = this.commonService.Translate(
                            "No se obtuvieron usuarios",
                            "No users obtained"
                        );
                        
                        this.UpdateSyncInformation(_sync, 0, 0);
                    }
                }, error => {
                    _sync.Info = error;
                    
                    this.UpdateSyncInformation(_sync, 0, 0);
                    
                    console.error(error);
                }
            );
    }

    /**
     * Retrieves all cards and store them in the SQL Lite database
     * @param _sync The sync object to show the progress information in the UI
     * @constructor
     */
    async SyncCards(_sync: ISyncInfo): Promise<void>
    {
        let synchronizedCardsCounter: number = 0;
        
        this.cardService.GetCards()
            .subscribe(async (next) => {
                if (next.Data) 
                {
                    await this.repositoryCard.DeleteCards();
                    
                    if (next.Data.length > 0) 
                    {
                        next.Data.forEach((element) => {
                            this.repositoryCard
                                .StoreCard(element)
                                .then(() => {
                                    synchronizedCardsCounter++;
                                    this.UpdateSyncInformation(_sync, next.Data.length, synchronizedCardsCounter);
                                })
                                .catch((error) => {
                                    _sync.Info = error;
                                    synchronizedCardsCounter++;
                                    this.UpdateSyncInformation(_sync, next.Data.length, synchronizedCardsCounter);
                                });
                        });
                    } 
                    else 
                    {
                        _sync.Info = this.commonService.Translate(
                            'No se obtuvieron tarjetas',
                            'No cards obtained'
                        );

                        this.UpdateSyncInformation(_sync, 0, 0);
                    }
                } 
                else 
                {
                    _sync.Info = this.commonService.Translate(
                        "No se obtuvieron tarjetas",
                        "No cards obtained"
                    );
                    
                    this.UpdateSyncInformation(_sync, 0, 0);
                }
            },
            (error) => {
                _sync.Info = error;
                
                this.UpdateSyncInformation(_sync, 0, 0);
                
                console.error(error);
            }
        );
    }

    /**
     * Retrieves all accounts and store them in the SQL Lite database
     * @param _sync The sync object to show the progress information in the UI
     * @constructor
     */
    async SyncAccounts(_sync: ISyncInfo): Promise<void>
    {
        let synchronizedAccountsCounter: number = 0;
        
        let syncLength: number = 0;

        this.accountService.GetAccounts()
            .pipe(
                concatMap(response => {
                    if(response && response.Data && response.Data.length > 0)
                    {
                        syncLength = response.Data.length;
                        
                        return of(response.Data)
                    }

                    _sync.Info = this.commonService.Translate(
                        "No se encontraron cuentas",
                        "No accounts where found"
                    );
                    
                    return EMPTY;
                }),
                concatMap(accounts => this.repositoryAccount.DeleteAccounts()
                    .pipe(
                        concatMap(deleteResult => from(accounts))        
                    )
                ),
                concatMap(account => this.repositoryAccount.StoreAccount(account)),
                finalize(() => this.UpdateSyncInformation(_sync, 100, 100))
            )
            .subscribe({
                next: (result) => {
                    synchronizedAccountsCounter++;
            
                    this.UpdateSyncInformation(_sync, syncLength, synchronizedAccountsCounter);
                },
                error: (error) => {
                    _sync.Info = error;
        
                    this.UpdateSyncInformation(_sync, 0, 0);
        
                    console.error(error);
                }
            });
    }

    /**
     * Retrieves the exchange rate amount and store it in the SQL Lite database
     * @param _sync The sync object to show the progress information in the UI
     * @constructor
     */
    async SyncExRate(_sync: ISyncInfo): Promise<void>
    {
        let exchangeRates: IExchangeRate[] = [];
        let cont: number = 0;

        this.exchangeRateService.GetUpcomingExchangeRate()
            .subscribe(async (response: ICLResponse<UpcomingExchangeRate[]>)=>{
                    if (response.Data) {
                        exchangeRates = response.Data.map((rate)=>({Rate: rate.Rate, date: rate.RateDate} as IExchangeRate));

                        if (exchangeRates.length > 0) {
                            from(exchangeRates)
                                .pipe(
                                    concatMap((element) => from(this.repositoryExchangeRate.UpdateOrInsertExchangeRate(element)))
                                )
                                .subscribe({
                                    next: (response) => {
                                        cont++;
                                        this.UpdateSyncInformation(_sync, exchangeRates.length, cont);
                                    },
                                    error: (error) => {
                                        _sync.Info = error;
                                        cont++;
                                        this.UpdateSyncInformation(_sync, exchangeRates.length, cont);
                                    }
                                });
                        }else{
                            this.UpdateSyncInformation(_sync, exchangeRates.length, exchangeRates.length);
                        }
                    }else{
                        _sync.Info = this.commonService.Translate('No se obtuvieron tipos de cambio', 'No exchange rates were obtained');

                        this.UpdateSyncInformation(_sync, 0, 0);
                    }
                },
                (error) => {
                    _sync.Info = error;

                    this.UpdateSyncInformation(_sync, 0, 0);
                })

    
    }

    /**
     * Retrieves all user valid routes and store them in the SQL Lite database
     * @param _sync The sync object to show the progress information in the UI
     * @constructor
     */
    async SyncRoutes(_sync: ISyncInfo): Promise<void>
    {
        try 
        {
            
            let alwaysDownloadRoute = false;
            
            let localRoutes: IRouteWithLines[] = [];
            
            let synchronizedRoutesCounter: number = 0;
            
            let syncLength = 0;


            this.geoconfigService.GetGeoConfigurations()
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
                            syncLength = routesResponse.Data.length;

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
                        this.UpdateSyncInformation(_sync, 0, 0);

                        let syncronizedRoutes: ISyncronizedRoutes = {
                            ActionFrom: SynchronizedRoutesFrom.SyncPage,
                            NewRoutesQty: syncLength,
                            MessageInfo: !syncLength ? this.commonService.Translate('No hay rutas nuevas', 'There are no new routes') : ''
                        };

                        this.routeService.SynchronizedRoutes$.next(syncronizedRoutes);
                    })
                ).subscribe({
                    next: (results) => {
                        synchronizedRoutesCounter++;
                        
                        this.UpdateSyncInformation(
                            _sync,
                            syncLength,
                            synchronizedRoutesCounter
                        );
                    },
                    error: (error) => {
                        _sync.Info = error;
                        this.UpdateSyncInformation(
                            _sync,
                            syncLength,
                            synchronizedRoutesCounter
                        );
                    }
                });
        } 
        catch (error) 
        {
            console.error(error);
        }
    }

    /**
     * Retrieves all checks from SQL Lite database and send them to the remote database
     * @param _sync The sync object to show the progress information in the UI
     * @constructor
     */
    async SyncChecks(_sync: ISyncInfo): Promise<void> 
    {
        let synchronizedRouteHistoriesCounter: number = 0;
        
        let syncLength: number = 0;
        
        this.repositoryRouteHistory.GetUnsynchronizedRoutesHistories()
            .pipe(
                concatMap(routeHistories => {
                    if(routeHistories && routeHistories.length)
                    {
                        syncLength = routeHistories.length;
                        
                        return this.checkinService.CreateCheckList(routeHistories)
                            .pipe(
                                concatMap(createdResponse => from(routeHistories))
                            );
                    }
                    
                    this.UpdateSyncInformation(_sync, 0, 0);
                        
                    return EMPTY;
                }),
                concatMap(routeHistory => from(this.repositoryRouteHistory.UpdateRouteHistorySyncStatus(routeHistory.Id, true))),
                catchError(() => {
                    this.UpdateSyncInformation(_sync, 0, 0);
                    return EMPTY;
                })
            )
            .subscribe({
                next: (result) => {
                    synchronizedRouteHistoriesCounter++;
                    
                    this.UpdateSyncInformation(_sync, syncLength, synchronizedRouteHistoriesCounter);
                },
                error: (error) => {
                    _sync.Info = error;

                    this.UpdateSyncInformation(_sync, 0, 0);
                }
            });
    }

    /**
     * Retrieves all permissions and store them in the SQL Lite database
     * @param _sync The sync object to show the progress information in the UI
     * @constructor
     */
    async SyncPermissions(_sync: ISyncInfo): Promise<void>
    {
        let userId: number = this.localStorageService.data.get(LocalStorageVariables.Session).UserId;
        
        let synchronizedPermissionsCounter: number = 0;

        this.permissionService.GetPermissionsByUserMobile()
            .subscribe({
                next: (callback) => {
                    if (callback && callback.Data) 
                    {
                        this.publisherService.publish({
                            Data: callback.Data,
                            Target: PublisherVariables.Permissions
                        });

                        this.repositoryPermission
                            .DeletePermission()
                            .then(() => {
                                if (callback.Data.length > 0) 
                                {
                                    callback.Data.forEach((element) => {
                                        this.repositoryPermission
                                            .StorePermission(element)
                                            .then(() => {
                                                synchronizedPermissionsCounter++;
                                                
                                                this.UpdateSyncInformation(
                                                    _sync,
                                                    callback.Data.length,
                                                    synchronizedPermissionsCounter
                                                );
                                            })
                                            .catch((error: any) => {
                                                _sync.Info = error;
                                                
                                                synchronizedPermissionsCounter++;
                                                
                                                this.UpdateSyncInformation(
                                                    _sync,
                                                    callback.Data.length,
                                                    synchronizedPermissionsCounter
                                                );
                                            });
                                    });
                                } 
                                else 
                                {
                                    _sync.Info = this.commonService.Translate(
                                        "No se obtuvieron Permisos",
                                        "No Permissions obtained"
                                    );

                                    this.UpdateSyncInformation(_sync, 0, 0);
                                }
                            })
                            .catch((error: any) => {
                                _sync.Info = error;
                                this.UpdateSyncInformation(_sync, 0, 0);
                                console.error(error);
                            });
                    } 
                    else 
                    {
                        _sync.Info = callback.Message;
                    
                        this.UpdateSyncInformation(_sync, 0, 0);
                    }
                    },
                error: (error: any) => {
                    _sync.Info = error;
                    this.UpdateSyncInformation(_sync, 0, 0);
                }
            });
    }

    /**
     * Retrieves current user company information and store it in the SQL Lite database
     * @constructor
     */
    async SyncCompanyInformation(_sync: ISyncInfo): Promise<void>
    {
        this.companyService.GetCompanyInformation()
            .subscribe(async (response) => {
                if (response) 
                {
                    await this.repositoryCompany.DeleteCompanyInformation();

                    this.repositoryCompany
                        .StoreCompanyInformation(response.Data)
                        .then(() => {
                            this.UpdateSyncInformation(_sync, 100, 100);
                        })
                        .catch((error: any) => {
                            _sync.Info = error;
                            this.UpdateSyncInformation(_sync, 0, 0);
                        });
                } 
                else 
                {
                    console.warn(response);
                    _sync.Info = this.commonService.Translate(
                        "La información de la compañía no se obtuvo",
                        "Company information was not obtained."
                    );
                    this.UpdateSyncInformation(_sync, 0, 0);
                }
            },
            (error) => {
                console.error(error);
                _sync.Info = error;
                this.UpdateSyncInformation(_sync, 0, 0);
            }
        );
    }

    /**
     * Retrieves all tax codes determinations and store them in the SQL Lite database
     * @param _sync The sync object to show the progress information in the UI
     * @constructor
     */
    async SyncTaxCodesDetermination(_sync: ISyncInfo) : Promise<void>
    {
        let synchronizedTaxCodesCounter = 0;
        
        this.taxesService.GetTaxCodesDetermination()
            .subscribe(async (response: ICLResponse<ITaxCodeDetermination[]>) => {
                try 
                {
                    if (response.Data && response.Data.length > 0) 
                    {
                        await this.repositoryTax.DeleteTaxCodeDeterminations();

                        if (response.Data.length > 0) 
                        {
                            response.Data.forEach((record) => {
                                this.repositoryTax
                                    .StoreTaxCodeDetermination(record)
                                    .then(() => {
                                        synchronizedTaxCodesCounter++;
                                        this.UpdateSyncInformation(_sync, response.Data.length, synchronizedTaxCodesCounter);
                                    })
                                    .catch((error) => {
                                        _sync.Info = error;
                                        synchronizedTaxCodesCounter++;
                                        this.UpdateSyncInformation(_sync, response.Data.length, synchronizedTaxCodesCounter);
                                    });
                            });
                        } 
                        else 
                        {
                            _sync.Info = this.commonService.Translate(
                                "No se obtuvieron determinaciones de impuestos",
                                "No Tax Determination obtained"
                            );

                            this.UpdateSyncInformation(_sync, 0, 0);
                        }
                    } 
                    else 
                    {
                        _sync.Info = this.commonService.Translate(
                            "No se obtuvo la determinación de impuestos",
                            "No Tax Determination Obtained"
                        );
                        
                        console.warn(response);
                        
                        this.UpdateSyncInformation(_sync, 0, 0);
                    }
                } 
                catch (error) 
                {
                    console.error(error);
                
                    _sync.Info = error;
                
                    this.UpdateSyncInformation(_sync, 0, 0);
                }
            },
            (error) => {
                console.error(error);
                
                _sync.Info = error;
                
                this.UpdateSyncInformation(_sync, 0, 0);
            }
        );
    }

    /**
     * Retrieves all currencies and store them in the SQL Lite database
     * @param _sync The sync object to show the progress information in the UI
     * @constructor
     */
    async SyncCurrencies(_sync: ISyncInfo): Promise<void>
    {
        let currencies: ICurrency[] = [];
        
        let synchronizedCurrenciesCounter: number = 0;
        
        this.companyService.GetCurrencies(true)
            .pipe(
                map(response => {
                    if (response.Data)
                    {
                        currencies = response.Data;

                        return response.Data;
                    }
                    else
                    {
                        _sync.Info = this.commonService.Translate(
                            "No se obtuvieron las monedas",
                            "Currencies not obtained"
                        );

                        this.UpdateSyncInformation(_sync, 100, 100);

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
                    this.UpdateSyncInformation(_sync, currencies.length, synchronizedCurrenciesCounter);
                },
            (error) => {
                    _sync.Info = error;
                    synchronizedCurrenciesCounter++;
                    this.UpdateSyncInformation(_sync, currencies.length, synchronizedCurrenciesCounter);
                }
            );
    }

    /**
     * Retrieves all warehouses and store them in the SQL Lite database
     * @param _sync The sync object to show the progress information in the UI
     */
    async SyncWarehouses(_sync: ISyncInfo): Promise<void>
    {
        let synchronizedWarehousesCounter: number = 0;
        
        this.warehouseService.GetWarehouses()
            .subscribe(async (response: ICLResponse<IWarehouses[]>) => {
                if (response.Data) 
                {
                    await this.repositoryWarehouse.DeleteWarehouses();

                    if (response.Data.length > 0) 
                    {
                        response.Data.forEach((element) => {
                            this.repositoryWarehouse
                                .AddWarehouse(element.WhsCode, element.WhsName)
                                .then(() => {
                                    synchronizedWarehousesCounter++;
                                    this.UpdateSyncInformation(_sync, response.Data.length, synchronizedWarehousesCounter);
                                })
                                .catch((error) => {
                                    _sync.Info = error;
                                    synchronizedWarehousesCounter++;
                                    this.UpdateSyncInformation(_sync, response.Data.length, synchronizedWarehousesCounter);
                                });
                        });
                    } 
                    else 
                    {
                        _sync.Info = this.commonService.Translate(
                            "No se obtuvieron almacenes",
                            "No warehouses obtained"
                        );

                        this.UpdateSyncInformation(_sync, 0, 0);
                    }
                } 
                else 
                {
                    _sync.Info = this.commonService.Translate(
                        "No se encontraron almacenes",
                        "No warehouses where found"
                    );
                    this.UpdateSyncInformation(_sync, 0, 0);
                }
            },
            (error) => {
                console.error(error);
                _sync.Info = error;
                this.UpdateSyncInformation(_sync, 0, 0);
            }
        );
    }

    /**
     * Retrieves all taxes and store them in the SQL Lite database
     * @param _sync The sync object to show the progress information in the UI
     * @constructor
     */
    async SyncTax(_sync: ISyncInfo): Promise<void>
    {
        let synchronizedTaxesCounter: number = 0;

        this.taxesService.GetTaxes()
            .subscribe(async (response: ICLResponse<ISalesTaxes[]>) => {
                if (response.Data) 
                {
                    await this.repositoryTax.DeleteTaxes();

                    if (response.Data.length > 0) 
                    {
                        response.Data.forEach((tax) => {
                            this.repositoryTax
                                .StoreTax(tax)
                                .then((data: any) => {
                                    synchronizedTaxesCounter++;
                                    
                                    this.UpdateSyncInformation(_sync, response.Data.length, synchronizedTaxesCounter);
                                })
                                .catch((error) => {
                                    _sync.Info = error;
                                    
                                    synchronizedTaxesCounter++;
                                    
                                    this.UpdateSyncInformation(_sync, response.Data.length, synchronizedTaxesCounter);
                                });
                        });
                    } 
                    else 
                    {
                        _sync.Info = this.commonService.Translate(
                            'No se obtuvieron impuestos',
                            'No taxes obtained'
                        );

                        this.UpdateSyncInformation(_sync, 0, 0);
                    }
                } 
                else 
                {
                    _sync.Info = response.Message;
                    
                    this.UpdateSyncInformation(_sync, 0, 0);
                }
            },
            (error) => {
                console.error(error);
                
                _sync.Info = error;
                
                this.UpdateSyncInformation(_sync, 0, 0);
            }
        );
    }

    /**
     * Retrieves all geo configurations and store them in the SQL Lite database
     * @param _sync The sync object to show the progress information in the UI
     * @constructor
     */
    async SyncGeoConfigs(_sync: ISyncInfo): Promise<void>
    {
        let synchronizedGeoConfigsCounter: number = 0;

        this.geoconfigService.GetGeoConfigurations()
            .subscribe(async (resp: ICLResponse<IGeoConfig[]>) => {
                if (resp.Data) 
                {
                    let userAssigmentId = +this.localStorageService.get(LocalStorageVariables.UserAssignment)?.Id ?? -1;

                    await this.repositoryGeoConfiguration.DeleteGeoConfigurations();

                    if (resp.Data.length > 0) 
                    {
                        resp.Data.forEach((x) => {
                            this.repositoryGeoConfiguration
                                .AddGeoConfiguration(x, userAssigmentId)
                                .then(() => {
                                    synchronizedGeoConfigsCounter++;
                                    
                                    this.UpdateSyncInformation(
                                        _sync,
                                        resp.Data.length,
                                        synchronizedGeoConfigsCounter
                                    );
                                })
                                .catch((error) => {
                                    _sync.Info = error;
                                    
                                    synchronizedGeoConfigsCounter++;
                                    
                                    this.UpdateSyncInformation(
                                        _sync,
                                        resp.Data.length,
                                        synchronizedGeoConfigsCounter
                                    );
                                });
                        });
                    } 
                    else 
                    {
                        _sync.Info = this.commonService.Translate(
                            "No se obtuvieron configuraciones Geo",
                            "No Geo configs obtained"
                        );

                        this.UpdateSyncInformation(_sync, 0, 0);
                    }
                } 
                else 
                {
                    _sync.Info = resp.Message;

                    this.UpdateSyncInformation(_sync, 0, 0);
                }
            },
            (error) => {
                _sync.Info = error;

                this.UpdateSyncInformation(_sync, 0, 0);
            }
        );
    }
    
    
    /**
     * Retrieves all settings and store them in the SQL Lite database
     * @param _sync The sync object to show the progress information in the UI
     */
    async SyncSettings(_sync: ISyncInfo): Promise<void>
    {
        let synchronizedSettingsCounter: number = 0;

        from(this.repositoryConfiguration.DeleteConfigurations())
            .pipe(
                concatMap(_ => this.settingsService.GetSettings())
            )
            .subscribe((response: ICLResponse<ISetting[]>) => {
                    if (response.Data.length > 0)
                    {
                        response.Data.forEach((setting) => {
                            this.repositoryConfiguration
                                .StoreConfiguration(setting.Code, setting.Json, setting.IsActive)
                                .then(() => {
                                    synchronizedSettingsCounter++;
                                    this.UpdateSyncInformation(_sync, response.Data.length, synchronizedSettingsCounter);
                                })
                                .catch((error) => {
                                    _sync.Info = error;
                                    synchronizedSettingsCounter++;
                                    this.UpdateSyncInformation(_sync, response.Data.length, synchronizedSettingsCounter);
                                });
                        });
                    }
                    else
                    {
                        _sync.Info = this.commonService.Translate(
                            "No se obtuvieron configuraciones",
                            "No configurations obtained"
                        );

                        this.UpdateSyncInformation(_sync, 0, 0);
                    }
                }, error => {
                    _sync.Info = error;

                    this.UpdateSyncInformation(_sync, 0, 0);

                    console.error(error);
                }
            );
    }


    /**
     * Retrieves all series and store them in the SQL Lite database
     * @param _sync The sync object to show the progress information in the UI
     */
    async SyncSeries(_sync: ISyncInfo): Promise<void>
    {
        let synchronizedSeriesCounter: number = 0;
        
        let syncLength: number = 0;

        this.repositoryDocument.GetAllDocuments()
            .pipe(
                concatMap(documents => {
                    if (documents && documents.length > 0 && documents.some((x) => x.TransactionStatus === DocumentSyncStatus.NotSynchronized))
                    {
                        _sync.Info = this.commonService.Translate('Documentos offline pendientes de respaldar', 'Offline documents pending synchonization');

                        this.UpdateSyncInformation(_sync, 0, 0);

                        return EMPTY;
                    }

                    
                    return this.serieService.GetSeriesByUser();
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
                    
                    _sync.Info = this.commonService.Translate('No se obtuvieron series', 'No series obtained');

                    return EMPTY;
                }),
                concatMap(series => this.repositorySerie.StoreSeries(series)),
                finalize(() => this.UpdateSyncInformation(_sync, 0, 0))
            )
            .subscribe({
                next:  async (response) => {
                    synchronizedSeriesCounter++;
                    this.UpdateSyncInformation(_sync, syncLength, synchronizedSeriesCounter);
                },
                error: (err) => {
                    _sync.Info = err;
                    this.UpdateSyncInformation(_sync, 0, 0);
                }
            });
    }

    /**
     * Retrieves all company UDFs and store them in the SQL Lite database
     * @param _sync The sync object to show the progress information in the UI
     * @constructor
     */
    async SyncUDFs(_sync: ISyncInfo): Promise<void>
    {
        let synchronizedUDFsCounter: number = 0;
        let udfsLength: number = 1;
        
        this.udfsService.GetCategoriesUdfs()
            .pipe(
                concatMap(categoriesResponse => of(this.repositoryCompany.DeleteUdfs())
                    .pipe(
                        map(deleteResult => categoriesResponse)
                    )
                ),
                concatMap(categoriesResponse => of(...(categoriesResponse.Data || []))),
                concatMap(category =>
                    forkJoin([
                            this.udfsService.Get(category.Name, false, true, true)
                                .pipe(
                                    catchError(error => of(null))
                                ),
                            this.udfsService.GetUdfsDevelopment(category.Name, true)
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
            .subscribe(result => {
                    this.UpdateSyncInformation(_sync, udfsLength, synchronizedUDFsCounter);
                },
                (err) => {
                    _sync.Info = err;
                    this.UpdateSyncInformation(_sync, 0, 0);
                },
                () => {
                    this.UpdateSyncInformation(_sync, 100, 100);
                }
            );
    }

    /**
     * Retrieves all measurement units and store them in the SQL Lite database
     * @param _sync The sync object to show the progress information in the UI
     */
    async SyncMeasurementUnits(_sync: ISyncInfo): Promise<void> 
    {
        let synchronizedMeasurementUnitsCount: number = 0;
        
        this.munitService.GetMeasurementUnits()
            .subscribe(async (response: ICLResponse<IMeasurementUnit[]>) => {
                if (response.Data) 
                {
                    await this.repositoryMeasurementUnit.DeleteMeasurementUnits();

                    if (response.Data.length > 0) 
                    {
                        response.Data.forEach((x) => {
                            this.repositoryMeasurementUnit
                                .AddMeasurementUnit(x)
                                .then(async () => {
                                    synchronizedMeasurementUnitsCount++;

                                    this.UpdateSyncInformation(_sync, response.Data.length, synchronizedMeasurementUnitsCount);
                                })
                                .catch((error) => {
                                    _sync.Info = error;

                                    synchronizedMeasurementUnitsCount++;

                                    this.UpdateSyncInformation(_sync, response.Data.length, synchronizedMeasurementUnitsCount);
                                });
                        });
                    } 
                    else 
                    {
                        _sync.Info = this.commonService.Translate(
                            "No se obtuvieron unidades de medida",
                            "No measurement units were obtained"
                        );

                        this.UpdateSyncInformation(_sync, 0, 0);
                    }
                } 
                else 
                {
                    console.warn(response);

                    _sync.Info = response.Message;

                    this.UpdateSyncInformation(_sync, 0, 0);
                }
            },
            (error) => {
                _sync.Info = error;

                this.UpdateSyncInformation(_sync, 0, 0);
            }
        );
    }

    /**
     * Retrieves all discount hierarchies and store them in the SQL Lite database
     * @param _sync The sync object to show the progress information in the UI
     * @constructor
     */
    async SyncDiscountHierarchy(_sync: ISyncInfo): Promise<void>
    {
        let synchronizedDiscountHierarchiesCounter: number = 0;

        this.discountHierarchyService.GetDiscountHierarchies()
            .subscribe(
            async (response: ICLResponse<IDiscountHierarchy[]>) => {
                try 
                {
                    if (response.Data) 
                    {
                        await this.repositoryDiscountHierarchy.DeleteDiscHierarchies();

                        if (response.Data.length > 0) 
                        {
                            response.Data.forEach((disc) => {
                                this.repositoryDiscountHierarchy
                                    .StoreDiscountHierarchy(disc)
                                    .then(async () => {
                                        synchronizedDiscountHierarchiesCounter++;

                                        this.UpdateSyncInformation(_sync, response.Data.length, synchronizedDiscountHierarchiesCounter);
                                    })
                                    .catch((err) => {
                                        _sync.Info = err;

                                        synchronizedDiscountHierarchiesCounter++;

                                        this.UpdateSyncInformation(_sync, response.Data.length, synchronizedDiscountHierarchiesCounter);
                                    });
                            });
                        } 
                        else 
                        {
                            _sync.Info = this.commonService.Translate(
                                "No se obtuvieron jerarquías de descuentos",
                                "No discound hierarchies were obtained"
                            );
                        
                            this.UpdateSyncInformation(_sync, 0, 0);
                        }
                    } 
                    else 
                    {
                        console.warn(response);

                        _sync.Info = response.Message;

                        this.UpdateSyncInformation(_sync, 0, 0);
                    }
                } 
                catch (error) 
                {
                    console.error(error);

                    _sync.Info = error;

                    this.UpdateSyncInformation(_sync, 0, 0);
                }
            },
            (error) => {
                console.error(error);

                _sync.Info = error;

                this.UpdateSyncInformation(_sync, 0, 0);
            }
        );
    }

    /**
     * Retrieves all discount groups and store them in the SQL Lite database
     * @param _sync The sync object to show the progress information in the UI
     */
    async SyncDiscountGroups(_sync: ISyncInfo): Promise<void>
    {
        let syncDate = new Date();
        
        let synchronizedDiscountGroupsCounter: number = 0;

        let lastSyncDate = this.localStorageService.GetSyncDate(ChangeElement.Discounts)?.SyncDate || new Date(0);

        this.discountGroupService.GetDiscountGroups(lastSyncDate)
            .subscribe(async (response: ICLResponse<IDiscountGroup[]>) => {
                if (response.Data.length > 0) 
                {
                    from(response.Data)
                        .pipe(
                            concatMap((disc) => from(this.repositoryDiscountGroup.StoreDiscountGroup(disc)))
                        )
                        .subscribe({
                            next: (next) => {
                                synchronizedDiscountGroupsCounter++;

                                this.UpdateSyncInformation(_sync, response.Data.length, synchronizedDiscountGroupsCounter);
                            },
                            complete: () => {
                                this.localStorageService.SetSyncDate({
                                    Type: ChangeElement.Discounts,
                                    Count: 0,
                                    SyncDate: this.datePipe.transform(syncDate, 'yyyy-MM-dd HH:mm:ss')
                                });
                            },
                            error: (error) => {
                                _sync.Info = error;

                                synchronizedDiscountGroupsCounter++;

                                this.UpdateSyncInformation(_sync, response.Data.length, synchronizedDiscountGroupsCounter);
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
                    
                    this.UpdateSyncInformation(_sync, 0, 0);
                }
            },
            (err) => {
                _sync.Info = err;
                
                this.UpdateSyncInformation(_sync, 0, 0);
            }
        );
    }

    /**
     * Retrives all charts and store them in the SQL Lite database
     * @param _sync The sync object to show the progress information in the UI
     * @constructor
     */
    async SyncCharts(_sync: ISyncInfo): Promise<void>
    {
        let synchronizedChartsCounter: number = 0;

        this.chartService.GetCharts()
            .subscribe((response: ICLResponse<IChart[]>) => {
                this.repositoryChart
                    .DeleteCharts()
                    .then(() => {
                        if (response.Data.length > 0) 
                        {
                            response.Data.forEach((element) => {
                                this.repositoryChart
                                    .AddChart(element)
                                    .then(() => {
                                        synchronizedChartsCounter++;
                                        
                                        this.UpdateSyncInformation(_sync, response.Data.length, synchronizedChartsCounter);
                                    })
                                    .catch((error) => {
                                        _sync.Info = error.message || error;
                                        
                                        synchronizedChartsCounter++;
                                        
                                        this.UpdateSyncInformation(_sync, response.Data.length, synchronizedChartsCounter);
                                    });
                            });
                        } 
                        else 
                        {
                            this.UpdateSyncInformation(_sync, 0, 0);
                        }
                    })
                    .catch((error) => {
                        _sync.Info = error.message || error;
                        
                        this.UpdateSyncInformation(_sync, 0, 0);
                    });
            },
            (error) => {
                _sync.Info = error;
                
                this.UpdateSyncInformation(_sync, 0, 0);
                
                console.error(error);
            }
        );
    }

    /**
     * Retrieves all blanket agreements and store them in the SQL Lite database
     * @param _sync The sync object to show the progress information in the UI
     * @constructor
     */
    async SyncBlanketAgreement(_sync: ISyncInfo): Promise<void>
    {
        let syncDate = new Date();
        
        let synchronizedBlanketAgreementsCounter: number = 0;

        let lastSyncDate = this.localStorageService.GetSyncDate(ChangeElement.Agreements)?.SyncDate || new Date(0);

        this.customerService.GetBlanketAgreement(lastSyncDate)
            .subscribe(async (response: ICLResponse<IBlanketAgreement[]>) => {
                try 
                {
                    if (response && response.Data) 
                    {
                        if (response.Data.length > 0) 
                        {
                            from(response.Data)
                                .pipe(
                                    concatMap((value) => from(this.repositoryCustomer.StoreBlanketAgreement(value)))
                                )
                                .subscribe({
                                    next: (result) => {
                                        synchronizedBlanketAgreementsCounter++;

                                        this.UpdateSyncInformation(_sync, response.Data.length, synchronizedBlanketAgreementsCounter);
                                    },
                                    complete: () => {
                                        this.localStorageService.SetSyncDate({
                                            Type: ChangeElement.Agreements,
                                            Count: 0,
                                            SyncDate: this.datePipe.transform(syncDate, 'yyyy-MM-dd HH:mm:ss')
                                        });
                                    },
                                    error: (error) => {
                                        _sync.Info = error;

                                        synchronizedBlanketAgreementsCounter++;

                                        this.UpdateSyncInformation(_sync, response.Data.length, synchronizedBlanketAgreementsCounter);
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
                            
                            this.UpdateSyncInformation(_sync, response.Data.length, response.Data.length);
                        }
                    } 
                    else 
                    {
                        _sync.Info = response.Message;

                        console.info(response.Message);

                        this.UpdateSyncInformation(_sync, 0, 0);
                    }
                } 
                catch (exception) 
                {
                    console.error(exception);
                
                    _sync.Info = exception;

                    this.UpdateSyncInformation(_sync, 0, 0);
                }
            },
            (error) => {
                console.error(error);

                _sync.Info = error;

                this.UpdateSyncInformation(_sync, 0, 0);
            }
        );
    }

    /**
     * Retrieves all documents types labels and store them in the SQL Lite database
     * @param _sync The sync object to show the progress information in the UI
     * @constructor
     */
    async SyncDocumentTypesLabels(_sync: ISyncInfo): Promise<void>
    {
        let synchronizedDocumentTypeLabelsCounter: number = 0;

        this.documentService.GetDocumentTypesLabels()
            .subscribe({
                next: async (response: ICLResponse<IDocumentTypeLabel[]>) => {
                    if (response.Data && response.Data.length) 
                    {
                        from(this.repositoryDocument.DeleteDocumentTypeLabels())
                            .pipe(
                                concatMap(x =>
                                    from(response.Data)
                                    .pipe(
                                        concatMap(x => from(this.repositoryDocument.AddDocumentTypeLabel(x)))
                                    )
                                )
                            )
                            .subscribe({
                                next: () => {
                                    synchronizedDocumentTypeLabelsCounter++;
                                    
                                    this.UpdateSyncInformation(_sync, response.Data.length, synchronizedDocumentTypeLabelsCounter);
                                },
                                error: (err) => {
                                    _sync.Info = err;
                                    
                                    synchronizedDocumentTypeLabelsCounter++;
                                    
                                    this.UpdateSyncInformation(_sync, response.Data.length, synchronizedDocumentTypeLabelsCounter);
                                }
                            });
                    } 
                    else 
                    {
                        this.UpdateSyncInformation(_sync, 0, 0);
                    }
                },
                error: (err) => {
                    console.error(err);

                    _sync.Info = err;

                    this.UpdateSyncInformation(_sync, 0, 0);
                }
            });
    }

    /**
     * Retrieves all bill of materials information and store them in the SQL Lite database
     * @constructor
     */
    async SyncBillOfMaterials(_sync: ISyncInfo): Promise<void>
    {
        let syncDate = new Date();
        
        let billOfMaterials: IBillOfMaterialToSync[];

        let syncCounter: number = 0;

        let lastSyncDate = this.localStorageService.GetSyncDate(ChangeElement.BillOfMaterials)?.SyncDate || new Date(0);
        
        this.billOfMaterialsService.GetBillOfMaterialsToSync(lastSyncDate)
            .subscribe(async (response: ICLResponse<IBillOfMaterialToSync[]>) =>{
                if (response.Data) {
                    billOfMaterials = response.Data;

                    if (billOfMaterials.length > 0) {
                        from(billOfMaterials)
                            .pipe(
                                concatMap((element) => from(this.repositoryProduct.UpdateOrCreateBillOfMaterials(element)))
                            )
                            .subscribe({
                                next: (response) => {
                                    syncCounter++;

                                    this.UpdateSyncInformation(_sync, billOfMaterials.length, syncCounter);
                                },
                                complete: () => {
                                    this.localStorageService.SetSyncDate({
                                        Type: ChangeElement.BillOfMaterials,
                                        Count: 0,
                                        SyncDate: this.datePipe.transform(syncDate, 'yyyy-MM-dd HH:mm:ss')
                                    });
                                },
                                error: (error) => {
                                    _sync.Info = error;

                                    syncCounter++;

                                    this.UpdateSyncInformation(_sync, billOfMaterials.length, syncCounter);
                                }
                            });
                    }else{
                        this.localStorageService.SetSyncDate({
                            Type: ChangeElement.BillOfMaterials,
                            Count: 0,
                            SyncDate: this.datePipe.transform(syncDate, 'yyyy-MM-dd HH:mm:ss')
                        });

                        this.UpdateSyncInformation(_sync, billOfMaterials.length, billOfMaterials.length);
                    }
                }else {
                    _sync.Info = this.commonService.Translate("No se obtuvieron listas de materiales", "No bill of materials were obtained");

                    this.UpdateSyncInformation(_sync, 0, 0);

                }
            },
        (error) => {
                _sync.Info = error;

                this.UpdateSyncInformation(_sync, 0, 0);
            })
           
    }

    /**
     * Retrieves all cards and store them in the SQL Lite database
     * @param _sync The sync object to show the progress information in the UI
     * @constructor
     */
    async SyncMenu(_sync: ISyncInfo): Promise<void>
    {
        let synchronizedCardsCounter: number = 0;
        
        // Realizar ambas solicitudes y combinar los resultados
        const menuES$:Observable<ICLResponse<IMenuMobile[]>> = this.menuService.GetUpcomingMenu("ES");
        const menuEN$:Observable<ICLResponse<IMenuMobile[]>> = this.menuService.GetUpcomingMenu("EN");

        forkJoin([menuES$, menuEN$]).subscribe(
            async ([responseES, responseEN]) => {
                const combinedData:IMenuMobile[] = [
                    ...(responseES.Data || []),
                    ...(responseEN.Data || [])
                ];
                if (combinedData.length > 0) {
                    await this.repositoryMenu.DeleteMenu();

                    combinedData.forEach((element:IMenuMobile) => {
                        this.repositoryMenu
                            .AddMenu(element)
                            .then(() => {
                                synchronizedCardsCounter++;
                                this.UpdateSyncInformation(_sync, combinedData.length, synchronizedCardsCounter);
                            })
                            .catch((error) => {
                                _sync.Info = error;
                                synchronizedCardsCounter++;
                                this.UpdateSyncInformation(_sync, combinedData.length, synchronizedCardsCounter);
                            });
                    });
                } else {
                    _sync.Info = this.commonService.Translate(
                        'No se obtuvieron menus',
                        'No menu obtained'
                    );

                    this.UpdateSyncInformation(_sync, 0, 0);
                }
            },
            (error) => {
                _sync.Info = error;
                this.UpdateSyncInformation(_sync, 0, 0);
                console.error(error);
            }
        );
    }

     /**
     * Retrieves printo format to sync
     * @param _sync The sync object to show the progress information in the UI
     */
    async SyncPrintFormatZPL(_sync: ISyncInfo): Promise<void>
    {
         this.printFormatService.GetPrintFormatZPLOffline()
            .subscribe(async (response) => {
                if (response) 
                {
                    await this.repositoryPrintFormat.DeletePrintFormatZPLOffline();

                    this.repositoryPrintFormat
                        .AddPrintFormatZPLOffline(response.Data)
                        .then(() => {
                            this.UpdateSyncInformation(_sync, 100, 100);
                        })
                        .catch((error: any) => {
                            _sync.Info = error;
                            this.UpdateSyncInformation(_sync, 0, 0);
                        });
                } 
                else 
                {
                    console.warn(response);
                    _sync.Info = this.commonService.Translate(
                        "La información del formato de impresion no se obtuvo",
                        "The print format information was not obtained"
                    );
                    this.UpdateSyncInformation(_sync, 0, 0);
                }
            },
            (error) => {
                console.error(error);
                _sync.Info = error;
                this.UpdateSyncInformation(_sync, 0, 0);
            }
        );

    }

    /**
     * Retrieves all PayTerms and store them in the SQL Lite database
     * @param _sync The sync object to show the progress information in the UI
     * @constructor
     */
    async SyncPayTerms(_sync: ISyncInfo): Promise<void>
    {
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

                    _sync.Info = this.commonService.Translate(
                        "No se encontraron terminos de pago",
                        "No payment terms where found"
                    );
                    
                    return EMPTY;
                }),
                concatMap(payTerms => this.repositoryPayTerms.DeletePayTerms()
                    .pipe(
                        concatMap(deleteResult => from(payTerms))        
                    )
                ),
                concatMap(payTerms => this.repositoryPayTerms.StorePayTerm(payTerms)),
                finalize(() => this.UpdateSyncInformation(_sync, 100, 100))
            )
            .subscribe({
                next: (result) => {
                    synchronizedAccountsCounter++;
            
                    this.UpdateSyncInformation(_sync, syncLength, synchronizedAccountsCounter);
                },
                error: (error) => {
                    _sync.Info = error;
        
                    this.UpdateSyncInformation(_sync, 0, 0);
        
                    console.error(error);
                }
            });
    }

}
