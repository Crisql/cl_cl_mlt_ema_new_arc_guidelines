import {AfterViewInit, Component, ElementRef, OnDestroy, QueryList, ViewChildren} from '@angular/core';
import Chart, {ChartConfiguration} from 'chart.js/auto';
import {EMPTY, forkJoin, from, of, Subscription, throwError} from 'rxjs';
import {
    AlertType,
    ChangeElement,
    LocalStorageVariables,
    LogEvent,
    PublisherVariables,
    SettingCodes
} from 'src/app/common/enum';
import {ISpeedTestSetting} from 'src/app/models/api/i-setting';
import {
    CheckRouteService,
    CommonService,
    CustomerService,
    DiscountGroupService,
    ExRateService,
    LocalStorageService,
    LogManagerService, MenuService,
    PermissionService,
    PriceListService,
    ProductService,
    PublisherService,
    Repository,
    UserService
} from 'src/app/services';
import {ChartService} from 'src/app/services/chart.service';
import {CHART_COLORS, transparentize} from 'src/assets/js/utils.chart.js'
import {catchError, concatMap, finalize, map, toArray} from "rxjs/operators";
import {
    ActionSheetButton,
    ActionSheetController,
    LoadingController,
    MenuController,
    ModalController,
    ToastController
} from "@ionic/angular";
import {CompanySelectionComponent} from "../../components/company-selection/company-selection.component";
import {SyncService} from "../../services/sync.service";
import {SettingsService} from "../../services/settings.service";
import {IMobileAppConfiguration} from "../../interfaces/i-settings";
import {IChangedInformation} from "../../models/i-changed-information";
import {formatDate} from "@angular/common";
import {BillOfMaterialsService} from "../../services/bill-of-materials.service";
import {Network} from "@ionic-native/network/ngx";
import {ICompany} from "../../models/db/companys";
import {IMenuMobile} from "../../interfaces/i-menu";
import {TranslateService} from "@ngx-translate/core";

@Component({
    selector: 'app-home',
    templateUrl: './home.page.html',
    styleUrls: ['./home.page.scss'],
})
export class HomePage implements AfterViewInit, OnDestroy {
    // varbox
    @ViewChildren('canva') private chartCanvas: QueryList<ElementRef>
    private chartCanvasSubscription: Subscription;
    charts: ChartConfiguration[];
    renderCharts: Chart[];
    speedTestSetting: ISpeedTestSetting;

    constructor(
        private chartService: ChartService,
        private localStorageService: LocalStorageService,
        private commonService: CommonService,
        private userService: UserService,
        private syncService: SyncService,
        private publisher: PublisherService,
        private repositoryPermission: Repository.Permission,
        private checkRouteService: CheckRouteService,
        private loadingController: LoadingController,
        private logManagerService: LogManagerService,
        public toastCtrl: ToastController,
        private permissionService: PermissionService,
        private exchangeService: ExRateService,
        private exchangeRepository: Repository.ExchangeRate,
        private modalController: ModalController,
        private settingsService: SettingsService,
        private menuController: MenuController,
        private actionSheetController: ActionSheetController,
        private customerService: CustomerService,
        private productService: ProductService,
        private billOfMaterialService: BillOfMaterialsService,
        private discountsGroupsService: DiscountGroupService,
        private pricesService: PriceListService,
        private network: Network,
        private repositoryCompany: Repository.Company,
        private menuService: MenuService,
        private menuRepository: Repository.Menu,
        private translator: TranslateService,
    ) {
    }
    
    async ionViewWillEnter() {
        this.localStorageService.Remove(LocalStorageVariables.IsUnauthorized);
        this.menuController.enable(true);
        this.charts = [];
        this.renderCharts = [];
        
        let selectedCompany = await this.localStorageService.get(LocalStorageVariables.SelectedCompany) as ICompany;
        
        if (!selectedCompany && this.network.type !== "none") 
        {
            this.OpenSelectionCompanyModal();
        } 
        else 
        {
            if(!selectedCompany){
                //Se obtinen los datos de la compania sincronicada
                from(this.repositoryCompany.GetCompanyInformation())
                    .pipe(
                        map((callback)=> (
                            {Name: callback?.CompanyName || '', DatabaseCode:  callback?.DatabaseCode || '',
                            ConnectionId: callback.ConnectionId || -1, Id: callback.CompanyId || -1, IsActive: true} as ICompany))
                    )
                    .subscribe(company =>{
                        if(company){
                            this.localStorageService.set(LocalStorageVariables.SelectedCompany, company, true);
                            //Emito compania para que el app.component.ts la obtenga y muestre el nombre en el menu
                            this.localStorageService.OnSelectCompany$.next(company);
                        }
                        this.SendInitialRequests();
                    },error => this.SendInitialRequests())
            }else{
                this.localStorageService.OnSelectCompany$.next(selectedCompany);
                this.SendInitialRequests();
            }
            
            
            
        }

        this.syncService.StartAutomaticVerificationOfClosedRoutes();
        //this.LoadSpeedTestSetting();
    }

    /**
     * Show a modal with the available user companies to choose
     * @constructor
     */
    async OpenSelectionCompanyModal(): Promise<void> {
        let modal = await this.modalController.create({
            component: CompanySelectionComponent
        });
        modal.present();
        modal.onDidDismiss().then(company => {
            this.SendInitialRequests();
        });
    }

    /**
     * Send the initial request
     * @constructor
     */
    async SendInitialRequests(): Promise<void>
    {
        let loader: HTMLIonLoadingElement = await this.commonService.Loader();
        
        loader.present();
        
        forkJoin([
            this.settingsService.GetSettingByCode(SettingCodes.MobileAppConfiguration),
            this.permissionService.GetPermissionsByUserMobile()
        ])
            .pipe(
                catchError(err => {
                    this.syncService.StartAutomaticChecksSynchronization();
                    return throwError(err);
                }),
                map(responses => {
                    let currentCompanyId = this.localStorageService.get(LocalStorageVariables.SelectedCompany)?.Id ?? -1;

                    let appSettings = responses[0].Data?.Json ? JSON.parse(responses[0].Data.Json) as IMobileAppConfiguration[] : [];

                    let companyAppConfig = appSettings.find(setting => setting.CompanyId === currentCompanyId);

                    this.syncService.StartAutomaticChecksSynchronization(companyAppConfig.CheckSynchronizationInterval);
                    
                    this.localStorageService.set(LocalStorageVariables.MobileAppConfiguration, companyAppConfig, true); 
                    
                    return responses[1];
                }),
                concatMap(upResponse => {
                    if (upResponse.Data && upResponse.Data.length) 
                    {
                        let userToken = this.localStorageService.get(LocalStorageVariables.Session);

                        this.publisher.publish({
                            Target: PublisherVariables.Permissions,
                            Data: upResponse.Data,
                        });

                        return from(this.repositoryPermission.DeletePermission())
                            .pipe(
                                concatMap((result) => {
                                    return from(upResponse.Data)
                                        .pipe(
                                            concatMap((permission) => {
                                                return from(this.repositoryPermission.StorePermission(permission));
                                            }),
                                            finalize(() => {
                                                loader.dismiss();
                                                this.Toast(
                                                    `${this.commonService.Translate("Bienvenido", "Welcome")} ${userToken?.UserEmail
                                                    }`,
                                                    3000,
                                                    "top"
                                                );
                                                this.localStorageService.SetModalBackupStatus(false);
                                                
                                                this.SetGlobalOptions();
                                                // Sincroniza el tipo de cambio de forma automatica
                                                this.SyncExchangeRate();
                                               
                                                if(![this.network.Connection.UNKNOWN, this.network.Connection.NONE].includes(this.network.type))
                                                {
                                                    this.SyncMenus();
                                                }else{
                                                    const lang = this.localStorageService.get(LocalStorageVariables.Lang) || 'es';
                                                    this.menuService.triggerLoadMenu(lang);
                                                }
                                            }),
                                            toArray(),
                                            map(result => upResponse)
                                        )
                                })
                            )
                    }

                    return of(upResponse);
                }),
                concatMap(response => {
                    if(this.localStorageService.get(LocalStorageVariables.IsLoginLastPath) && this.network.type !== "none")
                    {
                        this.localStorageService.Remove(LocalStorageVariables.IsLoginLastPath);
                        
                        return forkJoin([
                            this.customerService.GetCustomersCount(this.localStorageService.GetSyncDate(ChangeElement.BusinessPartners)?.SyncDate),
                            this.customerService.GetBlanketAgreementCount(this.localStorageService.GetSyncDate(ChangeElement.Agreements)?.SyncDate),
                            this.productService.GetProductsCount(this.localStorageService.GetSyncDate(ChangeElement.Items)?.SyncDate),
                            this.pricesService.GetPriceListCount(this.localStorageService.GetSyncDate(ChangeElement.Prices)?.SyncDate),
                            this.pricesService.GetPriceListsInfoCount(this.localStorageService.GetSyncDate(ChangeElement.PriceLists)?.SyncDate),
                            this.billOfMaterialService.GetBillOfMaterialsToSyncCount(this.localStorageService.GetSyncDate(ChangeElement.BillOfMaterials)?.SyncDate),
                            this.discountsGroupsService.GetDiscountGroupsCount(this.localStorageService.GetSyncDate(ChangeElement.Discounts)?.SyncDate)
                        ])
                            .pipe(
                                concatMap(responses => from(responses)),
                                map(response => response.Data),
                                toArray()
                            )
                    }
                    
                    return of([] as IChangedInformation[]);
                }),

                finalize(()=>loader.dismiss())
                
            )
            .subscribe({
                next: (dataToSyncResponses) => {
                  this.PresentSyncDatesActionSheet(dataToSyncResponses);  
                },
                error: (err) => {
                    loader.dismiss();
                    this.commonService.alert(AlertType.ERROR, err);
                }
            });
    }
    
    ngAfterViewInit(): void {
        from(this.GetMapCharts());
    }

    async GetMapCharts(): Promise<void> {
        let loader = await this.commonService.Loader();
        loader.present();
        this.chartService.GetCharts().subscribe(req => {
            try {
                req.Data.forEach(chart => {
                    // Mapeo de colores y opciones
                    chart.options = JSON.parse(chart.options);
                    chart.data.datasets.forEach(dataset => {
                        let color = dataset.color;
                        delete dataset.color;
                        // Se personaliza la configuracion de color segun corresponda
                        switch (chart.type) {
                            case 'pie':
                            case 'bar':
                            case 'doughnut':
                                let colors: string[] = JSON.parse(color);
                                dataset["backgroundColor"] = []
                                colors.forEach(c => dataset["backgroundColor"].push(CHART_COLORS[c]));
                                break;
                            default:
                                dataset["borderColor"] = CHART_COLORS[color];
                                dataset["backgroundColor"] = transparentize(CHART_COLORS[color], 0.5);
                                break;
                        }
                    });
                    this.charts.push(chart as ChartConfiguration);
                });
                loader.dismiss();
                this.chartCanvasSubscription = this.chartCanvas.changes.subscribe(canva => {
                        for (let c = 0; c < canva.length; c++) {
                            this.renderCharts.push(new Chart(canva.toArray()[c].nativeElement, this.charts[c]));
                        }
                        ;
                    }
                );
            } catch (ex) {
                console.warn(ex);
                loader.dismiss();
                this.commonService.toast(ex, 'dark', 'bottom');
            }
        }, error => {
            console.warn(error)
            loader.dismiss();
            this.commonService.toast(error, 'dark', 'bottom');
        })
    }

    ngOnDestroy(): void {
        if (this.chartCanvasSubscription)
            this.chartCanvasSubscription.unsubscribe();
    }

    SetGlobalOptions(): void {
        let userToken = this.localStorageService.get(LocalStorageVariables.Session);

        this.publisher.publish({
            Data: userToken.UserEmail,
            Target: PublisherVariables.LoggedUser,
        });

        this.syncService.SyncLogsMobile();
    }

    /**
     * Retrieves the current exchange rate and store it if not exist
     * @constructor
     */
    async SyncExchangeRate(): Promise<void> {
        let loading: HTMLIonLoadingElement = await this.commonService.Loader("Sincronizando tipo de cambio...", "Sync exchange rate...");
        
        loading.present();

        this.exchangeService.GetExchangeRate()
            .pipe(finalize(()=> loading.dismiss()))
            .subscribe({
                next: (response)=>{
                    this.exchangeRepository.UpdateOrInsertExchangeRate(response.Data)
                },
                error: (err)=>{
                    this.commonService.alert(AlertType.ERROR, err ,err);
                }
            })
    }

    async Toast(mensaje: string, duracion: number, posicion: string): Promise<void> {
        let toast = await this.toastCtrl.create({
            message: mensaje,
            duration: duracion,
            position: "bottom",
        });

        toast.present();
    }

    async PresentSyncDatesActionSheet(_changesDatas: IChangedInformation[]): Promise<void> {
        if(!_changesDatas.length || _changesDatas.every(c => !c.Count)) return;
        
        let syncButtons: ActionSheetButton[] = [];
        
        let logText = 'Información desactualizados [ ';

        const CANCEL_BUTTON: ActionSheetButton = {
            text: this.commonService.Translate(`Cerrar`, `Close`),
            icon: "close-outline",
            role: "cancel"
        };

        _changesDatas
            .filter(changeData => changeData.Count > 0)
            .forEach((changesData) => {
                let text = '';
                
                let icon = '';
                
                switch (changesData.Type) {
                    case ChangeElement.Items:
                        text = this.commonService.Translate('Artículos', 'Items');
                        icon = "clvs-sync-items";
                        break;
                    case ChangeElement.Prices:
                        text = this.commonService.Translate('Precios', 'Prices');
                        icon = "clvs-sync-prices";
                        break;
                    case ChangeElement.Discounts:
                        text = this.commonService.Translate('Grupos de descuentos', 'Discound groups');
                        icon = "clvs-sync-discount-groups";
                        break;
                    case ChangeElement.Agreements:
                        text = this.commonService.Translate('Acuerdos globales', 'Blanket Agreements');
                        icon = "clvs-sync-blanket-agreement";
                        break;
                    case ChangeElement.BusinessPartners:
                        text = this.commonService.Translate('Socios de negocio', 'Business partners');
                        icon = "clvs-sync-customers";
                        break;
                    case ChangeElement.BillOfMaterials:
                        text = this.commonService.Translate('Lista de materiales', 'Bill of materials');
                        icon = "clvs-sync-items";
                        break;
                    case ChangeElement.PriceLists:
                        text = this.commonService.Translate('Listas de precios', 'Price lists');
                        icon = "clvs-sync-price-lists";
                        
                        break;
                }
    
                syncButtons.push({
                    text: text,
                    icon: icon
                });
    
                logText += text + ' ';
            });
        
        logText += `] al ${formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss aaa', 'en')}`

        syncButtons.push(CANCEL_BUTTON);

        const actionSheet = await this.actionSheetController.create({
            header: 'Información desactualizada',
            backdropDismiss: true,
            buttons: syncButtons,
        });
        
        this.logManagerService.Log(LogEvent.INFO, logText);
        
        await actionSheet.present();
    }

    /**
     * Synchronizes menu options by fetching upcoming menus in both Spanish and English,
     * and updates the local menu repository with the retrieved data.
     *
     * @returns A promise that resolves when the synchronization process is complete.
     */
    async SyncMenus(): Promise<void> {
        let loading: HTMLIonLoadingElement = await this.commonService.Loader("Sincronizando tipo de menu...", "Sync menu options...");
        let conta = 0;
        let contaProgress = 0;
        let progress = 0;
        loading.present();

        // Create observables for both ES and EN menu requests
        const menuES$ = this.menuService.GetUpcomingMenu("es");
        const menuEN$ = this.menuService.GetUpcomingMenu("en");

        // Use forkJoin to wait for both requests to complete
        forkJoin([menuES$, menuEN$])
            .pipe(finalize(() => loading.dismiss()))
            .subscribe({
                next: async ([responseES, responseEN]) => {
                    // Combine the data from both responses
                    const combinedData = [...(responseES.Data || []), ...(responseEN.Data || [])];
                    await this.menuRepository.DeleteMenu();
                    combinedData.forEach((element: IMenuMobile) => {
                        this.menuRepository
                            .AddMenu(element)
                            .then((data: any) => {
                                conta++;
                                contaProgress = conta / combinedData.length;
                                progress = contaProgress * 100;
                                
                                if (conta === combinedData.length) {
                                    loading.dismiss();
                                    const lang = this.localStorageService.get(LocalStorageVariables.Lang) || 'es';
                                    this.menuService.triggerLoadMenu(lang);
                                }
                            })
                            .catch((error: any) => {
                                loading.dismiss();
                                console.error(error);
                            });
                    });
                },
                error: (err) => {
                    loading.dismiss();
                    this.commonService.alert(AlertType.ERROR, err, err);
                }
            });
    }
}