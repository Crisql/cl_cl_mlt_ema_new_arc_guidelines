import {ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CL_CHANNEL, ICLCallbacksInterface, ICLEvent, LinkerService, Register, Run, StepDown} from '@clavisco/linker';
import {concatMap, delay, withLatestFrom} from 'rxjs/operators';
import {StorageKey} from '../enums/e-storage-keys';
import {IUserToken} from '../interfaces/i-token';
import {SharedService} from '../shared/shared.service';
import {CLPrint, Repository, Structures} from '@clavisco/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {IPrincipalComponentResolvedData} from '../interfaces/i-resolvers';
import {IActionButton} from '../interfaces/i-action-button';
import {ICompany, IPorts} from '../interfaces/i-company';
import {IRouteSetting} from '../interfaces/i-settings';
import {environment} from 'src/environments/environment';
import {RptmngMenuService} from "@clavisco/rptmng-menu";
import {ISettings, IReportManagerSetting} from "../interfaces/i-settings";
import {ICurrentCompany, ICurrentSession, ICurrentUser} from "../interfaces/i-localStorage";
import {IExchangeRate} from "../interfaces/i-exchange-rate";
import {CurrentSessionService} from "../services/CurrentSession.service";
import {ExchangeRateService} from "../services/exchange-rate.service";
import {OverlayService} from "@clavisco/overlay";
import {AlertsService, CLToastType, NotificationPanelService} from "@clavisco/alerts";
import {
  catchError,
  filter,
  finalize,
  forkJoin,
  map,
  Observable,
  of,
  startWith, Subject,
  Subscription,
  switchMap,
  takeUntil, throwError
} from "rxjs";
import {MatDialog} from "@angular/material/dialog";
import {WarehouseSelectionComponent} from "./sales/warehouse-selection/warehouse-selection.component";
import {AssignsService} from "../services/assigns.service";
import {WarehousesService} from "../services/warehouses.service";
import {CompanySelectionComponent} from "./company-selection/company-selection.component";
import {IUserAssign} from "../interfaces/i-user";
import {IWarehouse} from "../interfaces/i-warehouse";
import {MenuNodesKey, SettingCode} from "@app/enums/enums";
import {GoogleService} from "@app/services/google.service";
import {IPermissionbyUser} from "@app/interfaces/i-roles";
import {PermissionUserService} from "@app/services/permission-user.service";
import {IMenu} from "@app/interfaces/i-menu";
import Behavior = Repository.Behavior;
import {CurrenciesService} from "@app/services/currencies.service";
import {ILocalPrinter} from "@app/interfaces/i-local-printer";
import {LocalPrinterService} from "@app/services/local-printer.service";
import {ChartsService} from "@app/services/charts.service";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {ISearchModalComponentDialogData, SearchModalComponent} from "@clavisco/search-modal";
import { ConnectionsService } from '@app/services/connections.service';
import { IConection } from '@app/interfaces/i-conection';
import { ServiceLayerService } from '@app/services/service-layer/service-layer.service';


@Component({
  selector: 'app-principal',
  templateUrl: './principal.component.html',
  styleUrls: ['./principal.component.scss']
})
export class PrincipalComponent implements OnInit, OnDestroy {
  environmentName: string = `${environment.type} environment - ${environment.name}`;
  actionButtons!: IActionButton[];
  isMenuOpened!: boolean;
  currentPage!: string;
  MenuNodes!: IMenu[];
  MenuId: string = 'MAIN-MENU';
  User!: string;
  Title: string = 'EMA';
  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };
  selectedCompany!: ICompany;
  settings!: ISettings[];
  AppKey: number = 0;
  permissions: IPermissionbyUser[] = [];
  subscriptions$: Subscription = new Subscription();
  exchangeRateCurrencySymbol: string = '';
  menuNodeKey!: string;
  searchWarehouseModalId = "searchWarehouseModalId";
  warehouses: IWarehouse[] = [];
  @ViewChild('session') session!: ElementRef;

  constructor(
    @Inject('LinkerService') private linkerService: LinkerService,
    private router: Router,
    private sharedService: SharedService,
    private activatedRoute: ActivatedRoute,
    @Inject('OverlayService') private overlayService: OverlayService,
    private exchangeRateService: ExchangeRateService,
    private alertsService: AlertsService,
    private assignService: AssignsService,
    private whsService: WarehousesService,
    private googleService: GoogleService,
    public currentSessionService: CurrentSessionService,
    @Inject('RptmngMenuService') private rptmngMenuService: RptmngMenuService,
    private matDialog: MatDialog,
    private permissionUserService: PermissionUserService,
    private notificationService: NotificationPanelService,
    private currenciesService: CurrenciesService,
    private localPrinterService: LocalPrinterService,
    private chartService: ChartsService,
    private connectionService: ConnectionsService,
    private warehousesService: WarehousesService,
    private changeDetector: ChangeDetectorRef,
    private serviceLayerService: ServiceLayerService
  ) { }

  ngOnDestroy(): void {
    this.subscriptions$.unsubscribe();
  }

  ngOnInit(): void {
    Register<CL_CHANNEL>(this.searchWarehouseModalId, CL_CHANNEL.REQUEST_RECORDS, this.OnModalShowWarehouseRequestRecords, this.callbacks);
    Repository.Behavior.SetTokenConfiguration({ token: 'PinPad', setting: 'backupTransactionsPath', value: 'api/PPStoredTransaction' });
    Repository.Behavior.DeleteStorageObject(StorageKey.IsUnauthorized);

    this.InitVariables();
    this.HandleResolvedData();
    this.changeDetector.detectChanges();
  }

  public InitVariables(): void {

    this.googleService.LoadGoogleMapsScript();

    this.ToggleMenu();
    this.User = Repository.Behavior.GetStorageObject<IUserToken>(StorageKey.Session)?.UserEmail || '';

    this.sharedService.OnCurrentPageChange().pipe(delay(1))
      .subscribe({
        next: (page) => {
          this.currentPage = page;
        }
      });


    this.selectedCompany = this.sharedService.OnCurrentCompanyChange() as ICompany;

    if (!this.selectedCompany) {
      this.OpenDialogCompanySelection();
    }

    this.sharedService.GetActionsButtons().pipe(delay(1))
      .subscribe({
        next: (buttons) => {
          this.actionButtons = buttons;
        }
      });

    this.RegisterLinkerEvents();

    this.subscriptions$.add(
    this.linkerService.Flow()?.pipe(
      StepDown<CL_CHANNEL>(this.callbacks),
    ).subscribe({
      next: callback => Run(callback.Target, callback, this.callbacks.Callbacks),
      error: error => CLPrint(error, Structures.Enums.CL_DISPLAY.ERROR)
    })
  );
  }

  public HandleResolvedData(): void {
    this.activatedRoute.data
      .subscribe({
        next: (data) => {
          const resolvedData = data['resolvedData'] as IPrincipalComponentResolvedData;

          if (resolvedData) {
            this.MenuNodes = resolvedData.MenuOptions;

            this.permissions = resolvedData.Permissions;

            if(resolvedData.Currencies)
            {
              this.exchangeRateCurrencySymbol = resolvedData.Currencies.find(c => c.IsLocal)!.Symbol;
            }

            // Get the current route segment
            let currentRoute = this.sharedService.GetCurrentRouteSegment();

            if (currentRoute === '/') currentRoute = '/home';

            // Get menu option description with current route segment
            let currentRouteDes = this.MenuNodes
              .reduce((acc, val) => acc.concat([val, ...val.Nodes]), [] as IMenu[])
              .sort((a, b) => b.Route.length - a.Route.length)
              .find(m => currentRoute.includes(`/${m.Route}`))?.Description || '';

            //Set the current page
            this.sharedService.SetCurrentPage(currentRouteDes);


            if (resolvedData.Setting) {
              this.settings = resolvedData.Setting;

              if (this.settings.find((element) => element.Code == SettingCode.ReportManager)) {

                let rptList = JSON.parse(this.settings.find((element) => element.Code == SettingCode.ReportManager)?.Json || '');

                Repository.Behavior.SetStorage<IReportManagerSetting[]>(rptList, StorageKey.ReportManager);
              }

              this.SetPinPadPortsToStorage();
            }

            if(resolvedData && resolvedData.LocalPrinter) {

              Repository.Behavior.SetStorage<ILocalPrinter>(resolvedData.LocalPrinter, StorageKey.LocalPrinter);
            }

            if (resolvedData && resolvedData.Permissions) {

              if(!resolvedData.LocalPrinter || !resolvedData?.LocalPrinter.UseLocalPrint){
                this.MenuNodes = this.MenuNodes.filter(x =>x.NamePermission !== 'Local_Printer_Access');
              }

              this.FilterMenuOptions(resolvedData.Permissions);
            }



          } else {
            this.MenuNodes = [
              {
                Description: 'No hay opciones disponibles',
                Icon: '',
                Key: '',
                Nodes: [],
                Route: '',
                Visible: true,
                NamePermission: '',
                Category: ''
              }
            ];
          }
        }
      });
  }

  public RegisterLinkerEvents(): void {
    Register(this.MenuId, CL_CHANNEL.OUTPUT, this.ClickMenuOption, this.callbacks);
  }

  public ClickMenuOption = (_event: ICLEvent): void => {
    const menuNode: IMenu = JSON.parse(_event.Data) as IMenu;

    this.menuNodeKey = menuNode.Key

    switch (menuNode.Key) {
      case MenuNodesKey.Logout:
        this.sharedService.Logout(false);
        break;
      case MenuNodesKey.Reports:
        this.InsertReportsMenuOptions(menuNode);
        break;
      default:
        if (menuNode.Route) {
          this.sharedService.SetCurrentPage(menuNode.Description);
        } else if (menuNode.Key !== MenuNodesKey.Reports) // La opcion del menu "I-43" es la opcion de reportes
        {
          // Se valida que la opcion se parte de los reportes
          if (menuNode.Key.includes('I-')) {
            this.rptmngMenuService.ViewReportParameters(+(menuNode.Key.replace('I-', '')), menuNode.Description, true, true)
              .subscribe({next: (result: any) => CLPrint(result, Structures.Enums.CL_DISPLAY.INFORMATION)});
          }
        }
        break;
    }

    this.MenuNodes.forEach(node =>{
      if(node.Category != menuNode.Category && node.Nodes.length > 0 ){

        this.linkerService.Publish(
          {
            CallBack: CL_CHANNEL.INPUT,
            Data: JSON.stringify(
              {
                Node: node,
                Expanded: false
              }
            ),
            Target: this.MenuId
          }
        );
      }
    })


  }


  public ToggleMenu(): void {
    this.isMenuOpened = !this.isMenuOpened;
    this.linkerService.Publish({
      CallBack: CL_CHANNEL.DATA_LINE_1,
      Data: JSON.stringify(this.isMenuOpened),
      Target: this.MenuId
    });
  }

  private InsertReportsMenuOptions(menuNode: IMenu): void {

    this.SetAppKey();

    this.rptmngMenuService.NestOptions(
      this.AppKey,
      {
        ShouldResolve: true,
        OptionChildrensProp: 'Nodes',
        OptionPropToCompare: 'Description',
        MapFunction: (rpt: { Name: any; Id: any; }) => ({
          Description: rpt.Name,
          Key: `I-${rpt.Id}`,
          Icon: 'description',
          Category: 'I'
        } as IMenu),
        MenuOptions: this.MenuNodes,
        OptionToAddChilds: {...menuNode}
      })
      .subscribe({
        next: (callback: IMenu[]) => {
          this.MenuNodes = callback;

          this.linkerService.Publish(
            {
              CallBack: CL_CHANNEL.INPUT,
              Data: JSON.stringify(
                {
                  Node: callback.find(n => n.Key === 'I-43'),
                  Expanded: true
                }
              ),
              Target: this.MenuId
            }
          );
        }
      });

  }

  private SetAppKey(): void {
    let currentCompany = Behavior.GetStorageObject<ICurrentCompany>("CurrentCompany");

    if (currentCompany) {
      let rptList :IReportManagerSetting[] = Behavior.GetStorageObject<IReportManagerSetting[]>("ReportManager") || [];

      if (rptList.some(x => x.CompanyId === currentCompany?.Id)) {
        this.AppKey = rptList.filter(x => x.CompanyId === currentCompany?.Id)[0].AppKey || 0;
      }
    }
  }

  /**
   * METODO PARA REFRESCAR EL TIPO DE CAMBIO
   */
  public RefreshExchangeRate(): void {

    this.overlayService.OnGet('Refrescando tipo de cambio, espere por favor...');

    this.exchangeRateService.Get<IExchangeRate>().pipe(
      finalize(() => this.overlayService.Drop())
    ).subscribe({
      next: (callback) => {
        this.SetCurrentData(callback.Data);
      }
    });


  }

  /**
   * HALEVANTA EL MODAL DE CAMBIAR EL ALMACEN
   */
  public OpenDialogWarehouse(): void {
    if (!this.permissions.some(p => p.Name === 'Toolbar_ChangeWarehouse')) {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: 'No tienes permisos para cambiar de almacén'
      });
      return;
    }

    this.matDialog.open(SearchModalComponent, {
      width: '65%',
      height: "80%",
      data: {
        Id: this.searchWarehouseModalId,
        ModalTitle: 'Cambiar almacén',
        MinInputCharacters: 2,
        InputDebounceTime: 200,
        ShouldPaginateRequest : true,
        TableMappedColumns: {
          IgnoreColumns: ['BinActivat'],
           RenameColumns: {
             WhsCode: 'Código',
             WhsName: 'Almacén',
          }
        }
      } as ISearchModalComponentDialogData<IWarehouse>
    }).afterClosed()
      .subscribe({
        next: (value) => {
          if(value){
            const data = Repository.Behavior.GetStorageObject<ICurrentSession>(StorageKey.CurrentSession) as ICurrentSession;
            data.WhsName = value.WhsName;
            data.WhsCode = value.WhsCode;
            this.currentSessionService.setWhsName(data.WhsName);
            Repository.Behavior.SetStorage<ICurrentSession>(data, StorageKey.CurrentSession);
            this.sharedService.changeWarehouse$.next(value.WhsCode);
          }
        }
      });

  }

  public OpenDialogCompanySelection(): void {

    this.matDialog.open(CompanySelectionComponent, {
      disableClose: true,
      minWidth: '50%',
      maxWidth: '100%',
      height: 'auto',
      maxHeight: '80%',
      data: !!this.selectedCompany
    }).afterClosed().pipe(
      filter((result: ICompany) => !!result),
      concatMap(result => {
        this.overlayService.OnGet();
        this.sharedService.SetCurrentCompany(result);
        this.selectedCompany = result;
        const currentUser = Repository.Behavior.GetStorageObject<ICurrentUser>(StorageKey.Session);
        return this.assignService.GetUserByCompany<IUserAssign>((currentUser?.UserId || '0'), result.Id)
      }),
      concatMap(result => {
        let data = {
          WhsCode: result.Data.WhsCode,
          WhsName: '',
          Rate: 0
        } as ICurrentSession;

        Repository.Behavior.SetStorage<ICurrentSession>(data, StorageKey.CurrentSession);
        Repository.Behavior.SetStorage<IUserAssign>(result.Data, StorageKey.CurrentUserAssign);
        this.SetPinPadPortsToStorage();

        return this.exchangeRateService.Get<IExchangeRate>().pipe(
          switchMap(exchangeRateResponse => {
            console.log(this.selectedCompany);
            return forkJoin({
              exchangeRateResponse$: of(exchangeRateResponse),
              whsResponse$: this.whsService.Get<IWarehouse>(result.Data.WhsCode).pipe(
                catchError(err => {
                  return of(null);
                })
              ),
              permResponse$: this.permissionUserService.Get<IPermissionbyUser[]>().pipe(
                catchError(err => {
                  return of(null);
                })
              ),
              currencies$: this.currenciesService.Get(false),
              localPrinterResponse$: this.localPrinterService.Get<ILocalPrinter>(result.Data.Id).pipe(
                catchError(err => {
                  return of(null);
                })
              ),
              chart$: this.chartService.GetCharts().pipe(
                catchError(err => {
                  return of(null);
                })
              ),
              connections$: this.connectionService.Get<IConection>(this.selectedCompany.ConnectionId).pipe(
                catchError(err => {
                  return of(null);
                })
              ),
            });
          }),
          catchError(err => {
            console.error(err);
            return throwError(err);
          })
        );
      }),
      finalize(() => this.overlayService.Drop())
    ).subscribe({
      next: (res) => {
        if (res && res.whsResponse$ && res.whsResponse$.Data) {
          this.currentSessionService.setWhsName(res.whsResponse$.Data.WhsName);
        }

        if (res && res.exchangeRateResponse$ && res.exchangeRateResponse$.Data) {
          this.SetCurrentData(res.exchangeRateResponse$.Data);
          this.currentSessionService.setRate(res.exchangeRateResponse$.Data.Rate);
        }

        if (!res.localPrinterResponse$?.Data || !res.localPrinterResponse$?.Data.UseLocalPrint) {
          this.MenuNodes = this.MenuNodes.filter(x => x.NamePermission !== 'Local_Printer_Access');
        }

        if (res && res.localPrinterResponse$ && res.localPrinterResponse$.Data) {
          Repository.Behavior.SetStorage<ILocalPrinter>(res.localPrinterResponse$.Data, StorageKey.LocalPrinter);
        }

        if (res && res.permResponse$ && res.permResponse$.Data) {
          this.permissions = res.permResponse$.Data;
          this.FilterMenuOptions(res.permResponse$.Data);
        }

        if (res && res.currencies$ && res.currencies$.Data) {
          this.exchangeRateCurrencySymbol = res.currencies$.Data.find(c => c.IsLocal)!.Symbol;
        }

        if (res && res.chart$ && res.chart$.Data) {
          this.sharedService.getCharts$.next(res.chart$.Data);
        }

        if (res && res.connections$ && res.connections$.Data) {
          this.sharedService.SetCurrentConnection(res.connections$.Data);
        }

        let data = {
          WhsCode: res.whsResponse$?.Data?.WhsCode,
          WhsName: res.whsResponse$?.Data?.WhsName,
          Rate: res.exchangeRateResponse$?.Data?.Rate
        } as ICurrentSession;

        Repository.Behavior.SetStorage<ICurrentSession>(data, StorageKey.CurrentSession);

        // Esto va a quedar comentado de momento
        // this.serviceLayerService.Login();

        if (this.router.url !== '/home') {
          let url = this.router.url.substring(1).split('/');
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate(url);
          });
        }

        this.alertsService.Toast({
          type: CLToastType.SUCCESS,
          message: 'Componentes requeridos obtenidos'
        });
      },
      error: (error) => {
        this.alertsService.ShowAlert({ HttpErrorResponse: error });
      }
    });
  }


  FilterMenuOptions(_permissions: IPermissionbyUser[]): void {
    let menuNodesWithChilds = this.MenuNodes.filter(mn => mn.Nodes && mn.Nodes.length);

    this.MenuNodes = this.MenuNodes.filter(x => {
      return _permissions.some(y => y.Name === x.NamePermission) || x.NamePermission === '';
    });

    this.MenuNodes.forEach(menuNode => {
      menuNode.Nodes = menuNode.Nodes.filter(node => {
        return _permissions.some(y => y.Name === node.NamePermission) || node.NamePermission === '';
      });
    });

    this.MenuNodes = this.MenuNodes.filter(mn => !((!mn.Nodes || !mn.Nodes.length) && menuNodesWithChilds.some(mn2 => mn2.Key === mn.Key)));

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(this.MenuNodes),
      Target: this.MenuId
    });

    Repository.Behavior.SetStorage<IPermissionbyUser[]>(_permissions, StorageKey.Permissions);
    Repository.Behavior.SetStorage<IMenu[]>(this.MenuNodes, StorageKey.Menu);

  }


  private SetCurrentData(_data: IExchangeRate): void {
    if (_data) {
      const data = Repository.Behavior.GetStorageObject<ICurrentSession>(StorageKey.CurrentSession) as ICurrentSession;
      this.currentSessionService.setRate(_data.Rate);
      data.Rate = _data.Rate;
      Repository.Behavior.SetStorage<ICurrentSession>(data, StorageKey.CurrentSession);
      this.sharedService.refreshRate$.next(_data.Rate);
    } else {
      const data = Repository.Behavior.GetStorageObject<ICurrentSession>(StorageKey.CurrentSession) as ICurrentSession;
      data.Rate = 0;
      Repository.Behavior.SetStorage<ICurrentSession>(data, StorageKey.CurrentSession);
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: 'No se ha definido el tipo de cambio.',
        verticalPosition: 'top'
      });
      this.sharedService.refreshRate$.next(0);
      this.currentSessionService.setRate(0);
    }
  }


  SetPinPadPortsToStorage(): void
  {
    if (this.settings.find((element) => element.Code == SettingCode.Route)) {

      let route: IRouteSetting[] = JSON.parse(this.settings.find((element) => element.Code == SettingCode.Route)?.Json || '');

      if (route && route.length > 0) {

        if (route.some(x => x.CompanyId === this.selectedCompany?.Id))
        {
          Repository.Behavior.SetStorage(route.filter(x => x.CompanyId === this.selectedCompany?.Id)[0].MessageServiceLayer || '', StorageKey.PreviewDocumentMessage);

          let url = {
            PortServiceLocal: route.filter(x => x.CompanyId === this.selectedCompany?.Id)[0].PortServiceLocal || '',
            PortServicePinpad: route.filter(x => x.CompanyId === this.selectedCompany?.Id)[0].PortServicePinpad || ''
          } as IPorts;

          Repository.Behavior.SetStorage<IPorts>(url, StorageKey.Ports);
        }
      }
    }
  }


/**
 * Listening event of component search-modal
 * @param _event - Event gets data from modal
 * @constructor
 */
OnModalShowWarehouseRequestRecords = (_event: ICLEvent): void => {

  const VALUE = JSON.parse(_event.Data);
  this.overlayService.OnGet();
  this.warehousesService.GetbyFilter<IWarehouse[]>(VALUE?.SearchValue)
    .pipe(finalize(() => this.overlayService.Drop())
    ).subscribe({
    next: (callback) => {
      this.warehouses = callback.Data;

      this.InflateTableWarehouse();

      this.alertsService.Toast({
        type: CLToastType.SUCCESS,
        message: 'Componentes requeridos obtenidos'
      });
    },
    error: (err) => {
      this.alertsService.ShowAlert({HttpErrorResponse: err});
    }
  })

}

  /**
   * Send information to search-modal warehouses component
   * @constructor
   * @private
   */
  private InflateTableWarehouse(): void {
    const NEXT_TABLE_STATE = {
      CurrentPage: 0,
      ItemsPeerPage: 5,
      Records: this.warehouses,
      RecordsCount: this.warehouses.length,
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(NEXT_TABLE_STATE),
      Target: this.searchWarehouseModalId
    });
  }

}
