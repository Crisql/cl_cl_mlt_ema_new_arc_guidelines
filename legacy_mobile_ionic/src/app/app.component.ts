import {Component, OnInit} from "@angular/core";
import {AlertController, MenuController, Platform, PopoverController} from "@ionic/angular";
import {SplashScreen} from "@ionic-native/splash-screen/ngx";
import {StatusBar} from "@ionic-native/status-bar/ngx";
import {LangChangeEvent, TranslateService} from "@ngx-translate/core";
import {Router} from "@angular/router";
// Common
import { AlertType, DocumentType } from "src/app/common";
// Services
import {
  CommonService,
  CompanyService,
  LocalStorageService,
  MenuService,
  PermissionService,
  PublisherService,
} from "./services";
// Models
import {Events, PermissionsSelectedModel} from "./models";
import {Network} from "@ionic-native/network/ngx";
import {concatMap, delay, delayWhen, filter, first, retry, retryWhen, take, tap} from "rxjs/operators";
import {CashDeskClosingComponent} from "./components";
import {LoginService} from './services/login.service';
import {SyncService} from "./services/sync.service";
import {Repository} from './services/repository.service';
import {SyncDetails} from "./models/db/sync-model";
import {CustomModalController} from "./services/custom-modal-controller.service";
import {DocumentSyncStatus, LocalStorageVariables, PublisherVariables} from "./common/enum";
import {from, timer} from "rxjs"
import {ISpeedTestSetting} from "./models/api/i-setting";
import {BluetoothSerial} from "@ionic-native/bluetooth-serial/ngx";
import {ICompany} from "./models/db/companys";
import {IMenu} from "./interfaces/i-menu";
import {IMobileAppConfiguration} from "./interfaces/i-settings";
import {IOfflineDocument} from "./models/db/i-offline-document";
import {StructuresService} from "./services/structures.service";

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"],
})
export class AppComponent implements OnInit {
  //VARBOX
  documents: IOfflineDocument[];
  appPages: IMenu[];
  dbName: string;
  loggedUser: string;
  perms: PermissionsSelectedModel[];
  isModalRaised: boolean;
  isBackingUpDocuments: boolean;
  lastLogin: string;
  lastSynchronization: string;
  speedTestSetting: ISpeedTestSetting;
  speedTestMbps: number = 0;
  selectedCompany: ICompany;
  pagesDocuments: string[] = ['quotations', 'order', 'documents', 'invoice', 'reserveInvoice', 'delivery', 'credit-notes',
                              'cash-reserve-Invoice', 'credit-down-invoice', 'cash-down-invoice'];
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private translator: TranslateService,
    private router: Router,
    private network: Network,
    private alertController: AlertController,
    private localStorageService: LocalStorageService,
    private syncService: SyncService,
    private publisherService: PublisherService,
    private repositoryCustomer: Repository.Customer,
    private repositoryProduct: Repository.Product,
    private repositoryPriceList: Repository.PriceList,
    private repositoryCompany: Repository.Company,
    private companyService: CompanyService,
    private repositoryWarehouse: Repository.Warehouse,
    private commonService: CommonService,
    private repositoryCard: Repository.Card,
    private repositoryAccount: Repository.Account,
    private repositoryExchangeRate: Repository.ExchangeRate,
    private repositoryRoute: Repository.Route,
    private modalCtrl: CustomModalController,
    private repositoryDocument: Repository.Document,
    private popoverCtrl: PopoverController,
    private loginService: LoginService,
    private permissionService: PermissionService,
    private bluetoothSerial: BluetoothSerial,
    private repositoryCurrency: Repository.Currency,
    private menuController: MenuController,
    private repositoryMenu: Repository.Menu,
    private menuService: MenuService,
    private sharedService: StructuresService
  ) {
    this.isModalRaised = false;
    this.localStorageService.SetModalBackupStatus(false);
    this.isBackingUpDocuments = false;
  }

  ngOnInit() {
    this.menuController.enable(false);
    this.InitializeApp();
    this.commonService.speedTestMbps.subscribe({next: (speedMbps) => {
      this.speedTestMbps = speedMbps;
    }});
    this.OnSelectCompany();
    this.sharedService.loadMenu$.subscribe(language => {
      this.LoadMenu(language);
    });
  }

  InitializeApp(): void {
    this.translator.setDefaultLang("es");
    const lang = this.localStorageService.get(LocalStorageVariables.Lang) || 'es';

    this.translator.use(lang);

    this.translator.onLangChange
        .subscribe({
          next: (event: LangChangeEvent) => {
            this.LoadMenu(event.lang)
          }
        });
    
    this.network.onConnect()
        .pipe(
            filter(() => !['/', '/login', '/document-upload', '/recover-password'].includes(this.router.url)),
            concatMap(() => this.repositoryDocument.GetAllDocuments())
        )
        .subscribe({
          next: async (documents)=> {
            if (documents && documents.length > 0) 
            {
              this.documents = documents.filter(x => x.TransactionStatus === DocumentSyncStatus.NotSynchronized);
              
              if (!this.isModalRaised && !this.localStorageService.GetIsBackingUpDocuments() && this.documents.length > 0) 
              {
                this.isModalRaised = true;
                
                this.commonService.Alert(
                  AlertType.QUESTION,
                  "Documentos sin respaldar, cualquier cambio realizado se perderá",
                  "Documents without backup, any changes made will be lost",
                  "¿Desea ir a la sección de sincronización?", 
                  "Do you want to see sync up section?"  ,
                  [
                    {
                      text: this.translator.currentLang === "es" ? "Cancelar" : "Cancel",
                      role: "cancel",
                      handler: _=> {
                        this.isModalRaised = false;
                        this.localStorageService.SetModalBackupStatus(false);
                      }
                    },
                    {
                      text: this.translator.currentLang === "es" ? "Continuar" : "Continue",
                      handler: async _ => {
                        let CURRENT_MODAL = (await this.popoverCtrl.getTop());
  
                        if (CURRENT_MODAL) 
                        {
                          CURRENT_MODAL.dismiss();
                        }
                        this.isModalRaised = false;
  
                        if (this.appPages) 
                        {
                          this.appPages.forEach(x => { x.Open = false });
                        }
  
                        this.router.navigate(["document-upload"], { replaceUrl: true });
                        
                        this.modalCtrl.DismissAll();
                      },
                    },
                  ]
                );
              }
            }
          },
          error: (error) => {
            console.log(error);
          }
        });

    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });

    this.listenEvents();

    this.localStorageService.GetLastSession().subscribe((lastSession: string)=>{
      this.lastLogin = lastSession;
    });

    this.ConnectLastedBluetoothPrinter();
    
  }

  /**
   * Take the identifier from the local storage of the last connected bluetooth printer and try to connect
   * @constructor
   * @private
   */
  private ConnectLastedBluetoothPrinter(): void
  {
    this.bluetoothSerial.isConnected()
        .then(result => {}, reason => {
          const printAddress: string = this.localStorageService.get(LocalStorageVariables.BluetoothPrinter);

          if(printAddress)
          {
            this.bluetoothSerial.connect(printAddress)
                .subscribe({
                  next: () => console.log('Bluetooth printer connected'),
                  error: () => console.log('Failed to connect with bluetooth printer')
                });
          }
        })
        .catch(err => {
          console.error("An error occurs trying to connect the printer: ", err);
        });
  }
  
  listenEvents() {
    this.publisherService
      .getObservable()
      .pipe(filter((x: Events) => x.Target === PublisherVariables.LoggedUser))
      .subscribe((data: Events) => {
        this.loggedUser = data.Data;
        this.lastSynchronization = this.localStorageService.GetLastSynchronization(data.Data);
      });

    this.publisherService
      .getObservable()
      .pipe(filter((x: Events) => x.Target === PublisherVariables.DbName))
      .subscribe((data: Events) => {
        this.dbName = data.Data;
      });

    this.publisherService
      .getObservable()
      .pipe(filter((x: Events) => x.Target === PublisherVariables.Permissions))
      .subscribe((x) => {
        this.perms = x.Data;
        this.permissionService.Permissions = x.Data;
        //this.localStorageService.set("perms", this.perms);
      });
  }

  /**
   * Sets the document type in local storage based on the given page ID.
   *
   * @param pageId - The numeric identifier of the page in menu option.
   */
  setDocumentType(pageId: number) {
    switch (pageId) { 
      case 4:
        this.localStorageService.data.set(
          "DocumentType",
          DocumentType.SaleOffer
        );
        break;
      case 5:
        this.localStorageService.data.set(
          "DocumentType",
          DocumentType.SaleOrder
        );
        break;
      case 6:
        this.localStorageService.data.set(
          "DocumentType",
          DocumentType.CreditInvoice
        );
        break;
      case 7:
        this.localStorageService.data.set(
          "DocumentType",
          DocumentType.CashInvoice
        );
        break;
      case 8:
        this.localStorageService.data.set(
          "DocumentType",
          DocumentType.ReserveInvoice
        );
        break;
      case 9:
        this.localStorageService.data.set(
          "DocumentType",
          DocumentType.Delivery
        );
        break;
      case 12:
        this.localStorageService.data.set(
          "DocumentType",
          DocumentType.CreditNotes
        );
        break;
      case 14:
        this.localStorageService.data.set(
          "DocumentType",
          DocumentType.CashReserveInvoice
        );
        break;
      case 64:
        this.localStorageService.data.set(
            "DocumentType",
            DocumentType.CreditDownInvoice
        );
        break;
      case 65:
        this.localStorageService.data.set(
            "DocumentType",
            DocumentType.CashDownInvoice
        );
        break;
    }
  }

  async onClickMenuOption(option: any) {

    // Check if the menu option need connection
    if([this.network.Connection.UNKNOWN, this.network.Connection.NONE].includes(this.network.type) && option.NeedConnection)
    {
      this.commonService.Alert(AlertType.INFO, 'Necesitas conexión a Internet', 'You need Internet connection');
      return;
    }

    // Check if the synchronization if complete if is trying to navigate to another page
    if(!this.syncService.IsSynchronizationCompleted() && option.Page !== "sync")
    {
      this.commonService.Alert(
          AlertType.INFO,
          'La sincronización no ha terminado',
          'The synchronization has not finished'
      );

      return;
    }

    this.localStorageService.set('isOnSyncMode', false, true);

    // Check if the user have permissions to navigate to the page
    if (!this.hasPerm(option.Perm)) 
    {
      this.commonService.Alert(
          AlertType.INFO,
          'No cuentas con permisos para acceder',
          'You do not have permission to access'
      );

      return;
    }

    // Check if the company allow to use offline mode
    if (this.network.type === "none") 
    {
      let offlineModeIsAllowed = !((this.localStorageService.get(LocalStorageVariables.MobileAppConfiguration) as IMobileAppConfiguration).OnlineOnly ?? true);
      
      if(!offlineModeIsAllowed)
      {
        this.commonService.Alert(
            AlertType.INFO,
            `La empresa no permite el modo sin conexión`,
            `The company does not allow offline mode.`
        );
        return;
      }
    }

    if (option.Sons && option.Sons && option.Sons.length === 0) 
    {
      try 
      {
        this.appPages.forEach(x => x.Open = false);
      }
      catch(error) 
      {
        console.error(error);
      }
    }

    if (option.Page === "CashDeskClosing")
    {
      let modal = await this.modalCtrl.create({
        component: CashDeskClosingComponent,
        componentProps: {
          data: {
          },
        },
      });
      modal.present();

      return;
    }

    if (this.pagesDocuments.includes(option.Page)) this.setDocumentType(option.Id);

    if (option.Page === "sync") this.localStorageService.set('isOnSyncMode', true, true);

    // Only if there are no internet connection I will check the syncronized data
    if([this.network.Connection.UNKNOWN, this.network.Connection.NONE].includes(this.network.type))
    {
      let errorMessage = "";
      let checkIfCustomerAreSynchronized = false;
      let checkIfProductsAreSynchronized = false;
      let checkIfPricesAreSynchronized = false;
      let checkIfCompanyInfoIsSynchronized = false;
      let checkIfWarehouseAreSynchronized = false;
      let checkIfAccountsAreSynchronized = false;
      let checkIfCardsAreSynchronized = false;
      let checkIfExRateIsSynchronized = false;
      let checkIfRoutesAreSynchronized = false;
      let checkIfDocumentTagsAreSynchronized = false;
      let checkIfCurrenciesAreSynchronized = false;

      if (this.pagesDocuments.includes(option.Page))
      {
        checkIfCustomerAreSynchronized = true;
        checkIfProductsAreSynchronized = true;
        checkIfPricesAreSynchronized = true;
        checkIfCompanyInfoIsSynchronized = true;
        checkIfWarehouseAreSynchronized = true;
        checkIfDocumentTagsAreSynchronized = true;
        checkIfCurrenciesAreSynchronized = true;

        if (option.Id === 7)
        {
          checkIfCardsAreSynchronized = true;
          checkIfAccountsAreSynchronized = true;
          checkIfExRateIsSynchronized = true;
        }
      }

      if (option.Page === "routes") checkIfRoutesAreSynchronized = true;

      if (checkIfCustomerAreSynchronized)
      {
        let areCustomersSynchronized: boolean = await this.repositoryCustomer.AreCustomerSynchronized();

        if (!areCustomersSynchronized) errorMessage += this.commonService.Translate("Clientes<br/>", "Customers<br/>");
      }

      if (checkIfProductsAreSynchronized)
      {
        let areProductsSynchronized: boolean = await this.repositoryProduct.AreProductsSynchronized();

        if (!areProductsSynchronized) errorMessage += this.commonService.Translate("Productos<br/>", "Items<br/>");
      }

      if (checkIfPricesAreSynchronized)
      {
        let arePriceListSynchronized: boolean = await this.repositoryPriceList.ArePriceListsSynchronized();

        if (!arePriceListSynchronized) errorMessage += this.commonService.Translate("Precios<br/>", "Prices<br/>")
      }

      if (checkIfPricesAreSynchronized)
      {
        let arePriceListsSynchronized: boolean = await this.repositoryPriceList.ArePriceListsInformationSynchronized();

        if (!arePriceListsSynchronized) errorMessage += this.commonService.Translate("Lista de Precios<br/>", "Price lists<br/>");
      }

      if (checkIfCompanyInfoIsSynchronized)
      {
        let isCompanyInfoSynchronized: boolean = await this.repositoryCompany.IsCompanyInformationSynchronized();

        if (!isCompanyInfoSynchronized) errorMessage += this.commonService.Translate("Compañía<br/>", "Company<br/>");
      }

      if (checkIfWarehouseAreSynchronized)
      {
        let areWarehousesSynchronized: boolean = await this.repositoryWarehouse.AreWarehousesSynchronized();

        if (!areWarehousesSynchronized) errorMessage += this.commonService.Translate("Almacenes<br/>", "Warehouses<br/>");
      }

      if (checkIfCardsAreSynchronized)
      {
        let areCardsSynchronized: boolean = await this.repositoryCard.AreCardsSynchronized();

        if (!areCardsSynchronized) errorMessage += this.commonService.Translate("Tipos de tarjeta<br/>", "Card types<br/>");
      }

      if (checkIfAccountsAreSynchronized)
      {
        let areAccountsSynchronized: boolean = await this.repositoryAccount.AreAccountsSynchronized();

        if (!areAccountsSynchronized) errorMessage += this.commonService.Translate("Cuentas<br/>", "Accounts<br/>");
      }

      if (checkIfExRateIsSynchronized && [this.network.Connection.NONE, this.network.Connection.UNKNOWN].includes(this.network.type))
      {
        let isExchangeRateSynchronized: boolean = await this.repositoryExchangeRate.AreExchangeRateSynchronized();

        if (!isExchangeRateSynchronized) errorMessage += this.commonService.Translate("Tipo de cambio<br/>", "Exchange rate<br/>");
      }

      if (checkIfRoutesAreSynchronized)
      {
        let areRoutesSynchronized: boolean = await this.repositoryRoute.AreRoutesSynchronized();

        if (!areRoutesSynchronized) errorMessage += this.commonService.Translate("Rutas<br/>", "Routes<br/>");
      }

      if(checkIfDocumentTagsAreSynchronized)
      {
        let areDocumentTypesLabelsSynchronized: boolean = await this.repositoryDocument.AreDocumentTypeLabelsSynchronized();

        if(!areDocumentTypesLabelsSynchronized) errorMessage += this.commonService.Translate("Etiq. documentos<br/>", "Document tags<br/>");
      }

      if(checkIfCurrenciesAreSynchronized)
      {
        let areCurrenciesSynchronized: boolean = await this.repositoryCurrency.AreCurrenciesSynchronized();

        if(!areCurrenciesSynchronized) errorMessage += this.commonService.Translate("Monedas<br/>", "Currencies<br/>");
      }

      if ((errorMessage && ([this.network.Connection.NONE, this.network.Connection.UNKNOWN].includes(this.network.type) || checkIfRoutesAreSynchronized)))
      {
        this.commonService.Alert(
            AlertType.WARNING,
            errorMessage,
            errorMessage,
            'Sincronizaciones pendientes: ',
            'Pending synchronizations: '
        );
        return;
      }
    }

    this.router.navigateByUrl(option.Page);

    if(option.Page === "sync")
    {
      this.localStorageService.SetLastSynchronization(this.loggedUser);
      this.lastSynchronization = this.localStorageService.GetLastSynchronization(this.loggedUser);
    }
  }

  async onClickSyncOption(submenu: any) {

    if([this.network.Connection.UNKNOWN, this.network.Connection.NONE].includes(this.network.type) && submenu.NeedConnection)
    {
      this.commonService.Alert(AlertType.INFO, 'Necesitas conexión a Internet', 'You need Internet connection');
      return;
    }

    if (!this.hasPerm(submenu.Perm)) {
      this.commonService.alert(
        AlertType.INFO,
        this.translator.currentLang === "es"
          ? "No cuentas con permisos para realizar esta acción"
          : "You do not have permissions to perform this action"
      );

      return;
    }

    if(!this.syncService.IsSynchronizationCompleted())
    {
      this.commonService.alert(
        AlertType.INFO,
        this.translator.currentLang === "es"
          ? "La sincronización no ha terminado"
          : "The synchronization has not finished"
      );

      return;
    }

    if (submenu.Sons && submenu.Sons.length === 0) {
      try 
      {
        this.appPages.forEach(x => x.Open = false);
      }
      catch(error) 
      {
        console.log(error);
      }
    }


    if (this.syncService[submenu.Page]) {

      this.localStorageService.set('isOnSyncMode', true, true);

      if(submenu.Page === 'SyncChecks') 
      {
        await this.syncService[submenu.Page](true);
      }
      else
      {
        await this.syncService[submenu.Page]();
      }
      
      this.localStorageService.set('isOnSyncMode', false, true);

    }
  }

  async onClickLogout() {

    if(!this.syncService.IsSynchronizationCompleted())
    {
      this.commonService.alert(
        AlertType.INFO,
        this.translator.currentLang === "es"
          ? "La sincronización no ha terminado"
          : "The synchronization has not finished"
      );

      return;
    }

    this.commonService.Alert(
      AlertType.QUESTION, 
      "¿Desea cerrar sesión?", 
      "Do you want to logout?",
      "Confirmación", 
      "Confirmation",
      [
        {
          text: this.translator.currentLang === "es" ? "Cancelar" : "Cancel",
          role: "cancel",
        },
        {
          text: this.translator.currentLang === "es" ? "Continuar" : "Continue",
          handler: () => {
            if (this.appPages) {
              this.appPages.forEach(x => {
                x.Open = false;
              });
            }
            this.menuController.enable(false);
            this.lastSynchronization = "";
            this.loginService.Logout();
          },
        },
      ]);
  }

  /**
   * This methosd is used to get report
   * @param option
   * @constructor
   */
  GetAppReports(option: IMenu) {
    if(!option.Open) return;
    if (!this.hasPerm(option.Perm)) {
      this.commonService.alert(
        AlertType.INFO,
        this.translator.currentLang === "es"
          ? "No cuentas con permisos para realizar esta acción"
          : "You do not have permissions to perform this action"
      );

      return;
    }

    if (this.network.type === "none") {
      this.commonService.alert(
        AlertType.INFO,
        this.translator.currentLang === "es"
          ? "Necesitas conexión a Internet"
          : "You need Internet connection"
      );
      return;
    }

    option.Sons = [];

    option.Open = true;

    if (this.localStorageService.get("KeyReportManager")) {
      this.syncService.getAppReports(option);
      
    } else {
      this.commonService.toast("Obteniendo key para Report Manager", "dark");

      this.companyService
        .GetKeyReportManager()
        .pipe(first())
        .subscribe((response) => {
          if (response.result) {
            if(response.errorInfo)
            {
              this.commonService.Alert(AlertType.INFO, response.errorInfo.Message, response.errorInfo.Message);
            }
            else
            {
              this.localStorageService.set(
                "KeyReportManager",
                response.Data,
                true
                );
                this.syncService.getAppReports(option);
            }
          }
          else
          {
            this.commonService.Alert(AlertType.ERROR, response.errorInfo.Message, response.errorInfo.Message);
          }
        });
    }
  }

  hasPerm(requiredPerm: string) {
    if (!this.perms) return false;
    if (!requiredPerm) return true;

    return this.perms.some((x) => x.Name === requiredPerm);
  }
  
  OnSelectCompany(): void
  {
    this.localStorageService.OnSelectCompany$.subscribe({
      next: (company) => {
        this.selectedCompany = company;
      }
    })
  }

  /**
   * Loads and filters the application menu based on the user’s permissions and the selected language.
   * 
   * This function fetches the full menu structure from the `repositoryMenu` service, filters out any items
   * (including submenus) the user does not have permission to access, and maps the result into the `IMenu` format
   * to be stored in the `appPages` property.
   * 
   * @param _language - The language code ('en', 'es') used to retrieve localized menu content.
   */
  public LoadMenu(_language: string): void {
    this.repositoryMenu.GetMenu(_language.toUpperCase()).then(menu => {
      this.appPages = [];
      this.appPages = menu
        .filter(option => this.hasPerm(option.NamePermission)) 
        .map<IMenu>(option => {
          const sons = option.Nodes != null ? 
            option.Nodes
              .filter(suboption=> this.hasPerm(suboption.NamePermission)) 
              .map<IMenu>(suboption => ({
                Name: suboption.Description,
                Id: Number(suboption.Key.split('-')[1]),
                Icon: suboption.Icon,
                Sons: [],
                Url: suboption.Type,
                Page: suboption.Route,
                Perm: suboption.NamePermission,
                NeedConnection: suboption.NeedConnection,
                Open: null
              })) 
            : [];

          return {
            Name: option.Description,
            Id: Number(option.Key.split('-')[1]),
            Icon: option.Icon,
            Sons: sons,
            Url: option.Type,
            Page: option.Route,
            Perm: option.NamePermission,
            NeedConnection: option.NeedConnection,
            Open: null
          } as IMenu;
        });
    }).catch(error => {
      console.error(error);
    });
  }

}
