import {Component, Inject, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {CL_CHANNEL, ICLCallbacksInterface, ICLEvent, LinkerService, Register, Run, StepDown} from "@clavisco/linker";
import {LinkerEvent} from "../../../enums/e-linker-events";
import {IActionButton} from "../../../interfaces/i-action-button";
import {CashClosingsService} from "../../../services/cashClosings.service";
import {OverlayService} from "@clavisco/overlay";
import {AlertsService, CLModalType, CLToastType, ModalService, NotificationPanelService} from "@clavisco/alerts";
import {IPaydeskBalance} from "../../../interfaces/i-PaydeskBalance";
import {
  catchError,
  concatMap,
  filter,
  finalize,
  forkJoin,
  map, merge,
  Observable,
  of,
  startWith,
  Subscription,
  switchMap,
} from "rxjs";
import {CLPrint, DownloadBase64File, GetError, PinPad, PrintBase64File, Repository, Structures} from "@clavisco/core";
import {StorageKey} from "../../../enums/e-storage-keys";
import {ICurrentSession} from "../../../interfaces/i-localStorage";
import {ActivatedRoute, PRIMARY_OUTLET, Router, UrlSegment, UrlSegmentGroup, UrlTree} from "@angular/router";
import {ICashClosingResolverData, ICashClosingSearchResolverData} from "../../../interfaces/i-resolvers";
import {ICurrencies} from "../../../interfaces/i-currencies";
import {IPaymentSetting, ISettings} from "../../../interfaces/i-settings";
import {ICompany} from "../../../interfaces/i-company";
import {PrinterWorker, SharedService} from "../../../shared/shared.service";
import {ICLTableButton, MapDisplayColumns, MappedColumns} from "@clavisco/table";
import {formatDate} from "@angular/common";
import {TableData} from "../../../interfaces/i-table-data";
import {MatDialog} from "@angular/material/dialog";
import {SendEmailComponent} from "./sendEmail/send-email.component";
import {IUserToken} from "../../../interfaces/i-token";
import {IPermissionbyUser} from "../../../interfaces/i-roles";
import {IUser, IUserAssign} from "../../../interfaces/i-user";
import {PPTransactionService} from "@app/services/pp-transaction.service";
import {ICLTerminal, IPPCashDeskClosing} from "@app/interfaces/i-pp-transactions";
import {BalancesService} from "@app/services/balances.service";
import {SettingCode} from "@app/enums/enums";
import {SettingsService} from "@app/services/settings.service";
import {SalesDocumentService} from "@app/services/sales-document.service";
import {TerminalUsersService} from "@app/services/terminal-users.service";
import {PermissionUserService} from "@app/services/permission-user.service";
import ITerminal = PinPad.Interfaces.ITerminal;
import {PrinterWorkerService} from "@app/services/printer-worker.service";
import Validation from "@app/custom-validation/custom-validators";
import {CurrenciesService} from "@app/services/currencies.service";


@Component({
  selector: 'app-cash-closing',
  templateUrl: './cash-closing.component.html',
  styleUrls: ['./cash-closing.component.scss']
})
export class CashClosingComponent implements OnInit, OnDestroy {

  currencies: ICurrencies[] = [];
  closingReports: IPaydeskBalance[] = [];
  permissions: IPermissionbyUser[] = [];
  users: IUser[] = [];
  terminals: ITerminal[] = [];
  terminalsFiltered: ITerminal[] = [];

  /*OBSERVABLES*/
  users$!: Observable<IUser[]>;

  setting!: ISettings;
  selectedCompany!: ICompany | null;

  closingForm!: FormGroup;
  searchForm!: FormGroup;

  tableButtons: ICLTableButton[] = [];
  shouldPaginateRequest: boolean = false;
  closingTableId: string = 'CLOSING-TABLE';
  docTbMappedColumns!: MappedColumns;
  actionButtons!: IActionButton[];
  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };
  allSubscriptions: Subscription;
  docTbColumns: { [key: string]: string } = {
    CreatedBy: 'Usuario',
    DateFormatted: 'Fecha de creación',
    CashAmount: 'Monto efectivo',
    CardAmount: 'Monto tarjetas',
    TransferAmount: 'Monto transferencias',
    CardAmountPinpad: 'Total pinpad',
    UrlReport: ''
  }

  indexSelected: number = 0;
  data: string = '';
  currentUser: string = '';
  isPinpad: boolean = true;

  userLogged!: IUserAssign;

  @ViewChild('report') reportTemplate!: TemplateRef<any>

  constructor(
    @Inject('LinkerService') private linkerService: LinkerService,
    private fb: FormBuilder,
    private cashClosingService: CashClosingsService,
    private overlayService: OverlayService,
    private activatedRoute: ActivatedRoute,
    private alertsService: AlertsService,
    private router: Router,
    private sharedService: SharedService,
    private matDialog: MatDialog,
    private pptransactionsService: PPTransactionService,
    private modalService: ModalService,
    private balancesService: BalancesService,
    private settingService: SettingsService,
    private terminalUsersService: TerminalUsersService,
    private permissionUserService: PermissionUserService,
    private printerWorkerService: PrinterWorkerService,
    private currenciesService: CurrenciesService
  ) {

    this.allSubscriptions = new Subscription();
    this.docTbMappedColumns = MapDisplayColumns({
      dataSource: this.closingReports,
      renameColumns: this.docTbColumns,
      ignoreColumns: ['UrlReport', 'Terminal']
    });

  }

  ngOnInit(): void {
    this.OnLoad();
  }

  ngOnDestroy(): void {
    this.sharedService.SetActionButtons([]);
    this.allSubscriptions.unsubscribe();
  }

  private RegisterButtonsEvents(): void {
    Register<CL_CHANNEL>(LinkerEvent.ActionButton, CL_CHANNEL.OUTPUT, this.OnActionButtonClicked, this.callbacks);
    Register<CL_CHANNEL>(this.closingTableId, CL_CHANNEL.OUTPUT, this.OnTableButtonClicked, this.callbacks);
  }

  /**
   * Method to define the resulting events for the table buttons
   * @param _event - Event emitted from the table buttons
   * @constructor
   */
  private OnTableButtonClicked = (_event: ICLEvent) : void => {

    let data: TableData = JSON.parse(_event.Data);

    let rowSelectDocument: IPaydeskBalance = JSON.parse(data.Data);


    switch (data.Action) {
      case Structures.Enums.CL_ACTIONS.OPTION_1:
        this.SendEmailReport(rowSelectDocument);
        break;
      case Structures.Enums.CL_ACTIONS.OPTION_2:
        this.PrintReport(rowSelectDocument);
        break;
      case Structures.Enums.CL_ACTIONS.OPTION_3:
        this.DownloadReport(rowSelectDocument);
        break;
      case Structures.Enums.CL_ACTIONS.OPTION_4:
        this.PreviewReport(rowSelectDocument);
        break;
    }
  }

  public OnActionButtonClicked(_actionButton: IActionButton): void {

    switch (_actionButton.Key) {
      case 'CREAR-CIERRE':
        this.SaveChanges();
        break;
      case 'SEARCH':
        this.Search();
        break;
      case 'CLEAN':
        this.Clear();
        break;

    }
  }

  private Clear(): void {
    this.overlayService.OnGet();
    forkJoin([
      this.settingService.Get<ISettings>(SettingCode.Payment),
      this.currenciesService.Get(false),
      this.permissionUserService.Get<IPermissionbyUser[]>(),
    ]).pipe(
      switchMap(res => {

        let companyId = Repository.Behavior.GetStorageObject<ICompany>(StorageKey.CurrentCompany)?.Id || 0;

        let data: IPaymentSetting[] = JSON.parse(res[0].Data?.Json || '');
        let pinpad: boolean = false;

        if (data && data.length > 0) {
          pinpad = data.some(x => x.CompanyId === companyId && x.Pinpad);
        }

        if (pinpad) {
          return this.terminalUsersService.GetTerminals<ITerminal[]>().pipe(
            map(terminals => {
              return {
                Setting: res[0].Data,
                Currency: res[1].Data,
                Terminals: terminals.Data,
                Permissions: res[2].Data
              } as ICashClosingResolverData
            })
          );
        } else {
          return of({
            Setting: res[0].Data,
            Currency: res[1].Data,
            Terminals: [],
            Permissions: res[2].Data
          } as ICashClosingResolverData);
        }
      }),

      finalize(() => this.overlayService.Drop())
    ).subscribe({
      next: res => {
        this.terminalsFiltered = [];
        this.searchForm.reset();
        this.closingForm.reset();
        this.indexSelected = 0;
        this.currencies = res?.Currency ? res?.Currency : [];
        this.setting = res.Setting;
        this.terminals = res.Terminals;
        this.SetInitialData();

        this.alertsService.Toast({
          type: CLToastType.SUCCESS,
          message: 'Componentes requeridos obtenidos'
        });
      },
      error: err => {
        this.alertsService.ShowAlert({
          HttpErrorResponse: err
        });
      }
    });
  }

  private OnLoad(): void {
    this.currentUser = Repository.Behavior.GetStorageObject<IUserToken>(StorageKey.Session)?.UserEmail || '';
    this.selectedCompany = Repository.Behavior.GetStorageObject<ICompany>(StorageKey.CurrentCompany);
    this.userLogged = Repository.Behavior.GetStorageObject<IUserAssign>(StorageKey.CurrentUserAssign) as IUserAssign;

    this.InitForm();
    this.DefineDocument();

    this.RegisterButtonsEvents();


    this.allSubscriptions.add(
      this.linkerService.Flow()?.pipe(
        StepDown<CL_CHANNEL>(this.callbacks),
      ).subscribe({
        next: callback => Run(callback.Target, callback, this.callbacks.Callbacks),
        error: error => CLPrint(error, Structures.Enums.CL_DISPLAY.ERROR)
      })
    );

    this.HandleResolvedData();
    this.InitAutocomplete();
    this.SetValidatorAutoComplete();
  }

  private InitForm(): void {
    this.closingForm = this.fb.group({
      Currency: ['', [Validators.required]],
      CashAmount: [0],
      CardAmount: [0],
      TransferAmount: [0],
      CardAmountPinpad: [{value: 0, disabled: true}],
      Terminal: [{value: 0, disabled: true}]
    });

    this.closingForm.get('CardAmountPinpad')?.disable();

    this.searchForm = this.fb.group({
      User: ['', [Validators.required]],
      DateFrom: [new Date(), Validators.required],
      DateTo: [new Date(), Validators.required],
    });

    this.searchForm.get('User')?.disable();

  }

  private DefineDocument(): void {

    const tree: UrlTree = this.router.parseUrl(this.sharedService.GetCurrentRouteSegment());
    const urlSegmentGroup: UrlSegmentGroup = tree.root.children[PRIMARY_OUTLET];
    const urlSegment: UrlSegment[] = urlSegmentGroup?.segments;

    if (urlSegment?.length > 0 && urlSegment[2]) {
      this.indexSelected = 1;
      this.tableButtons = [
        {
          Title: `Enviar por email`,
          Action: Structures.Enums.CL_ACTIONS.OPTION_1,
          Icon: `mail`,
          Color: `primary`,
          Data: ''
        },
        {
          Title: `Imprimir`,
          Action: Structures.Enums.CL_ACTIONS.OPTION_2,
          Icon: `print`,
          Color: `primary`,
          Data: ''
        },
        {
          Title: `Descargar`,
          Action: Structures.Enums.CL_ACTIONS.OPTION_3,
          Icon: `picture_as_pdf`,
          Color: `primary`,
          Data: ''
        },
        {
          Title: `Previsualizar`,
          Action: Structures.Enums.CL_ACTIONS.OPTION_4,
          Icon: `info`,
          Color: `primary`,
          Data: ''
        }
      ];
      this.actionButtons = [
        {
          Key: 'SEARCH',
          MatIcon: 'search',
          Text: 'Buscar',
          MatColor: 'primary',
          DisabledIf: (_form?: FormGroup) => _form?.invalid || false
        },
        {
          Key: 'CLEAN',
          MatIcon: 'mop',
          Text: 'Limpiar',
          MatColor: 'primary'
        }
      ];

    } else {
      this.indexSelected = 0;
      this.actionButtons = [
        {
          Key: 'CREAR-CIERRE',
          MatIcon: 'save',
          Text: 'Crear',
          MatColor: 'primary',
          DisabledIf: (_form?: FormGroup) => _form?.invalid || false
        },
        {
          Key: 'CLEAN',
          MatIcon: 'mop',
          Text: 'Limpiar',
          MatColor: 'primary'
        }
      ];
    }

  }

  private SaveChanges(): void {
    if (this.closingForm.invalid) {
      this.closingForm.markAllAsTouched();
      return;
    }

    const data: IPaydeskBalance = this.closingForm.getRawValue();

    let dataSession = Repository.Behavior.GetStorageObject<ICurrentSession>(StorageKey.CurrentSession) as ICurrentSession;

    data.ExchangeRate = dataSession?.Rate;
    data.SlpCode = +this.userLogged?.SlpCode;

    this.overlayService.OnPost();
    this.cashClosingService.Post(data).pipe(
      finalize(() => this.overlayService.Drop())
    ).subscribe({
      next: (callback) => {
        this.router.navigate(['sales/cash-closing/search']);

        this.modalService.Continue({
          title: 'Cierre de caja creado correctamente',
          type: CLModalType.SUCCESS
        });
      },
      error: (err) => {
        this.modalService.Continue({
          title:  `Se produjo un error creando el cierre de caja`,
          subtitle: GetError(err),
          type: CLModalType.ERROR
        });
      }
    })
  }

  public DisplayFnUser(_customer: IUser): string {
    return _customer && Object.keys(_customer).length ? `${_customer.Name} ${_customer.LastName}` : '';
  }

  private HandleResolvedData(): void {
    this.activatedRoute.data
      .subscribe({
        next: (data) => {
          const dataResolved = data['resolvedData'] as ICashClosingResolverData;

          if (dataResolved) {
            this.currencies = dataResolved.Currency;
            this.setting = dataResolved.Setting;
            this.terminals = dataResolved.Terminals;
            this.permissions = dataResolved.Permissions;
            this.SetInitialData();
          }

          const dataSearchResolvedData = data['resolvedSearchData'] as ICashClosingSearchResolverData;

          if (dataSearchResolvedData) {
            this.permissions = dataSearchResolvedData.Permission;
            this.closingReports = dataSearchResolvedData.Balances;
            this.users = dataSearchResolvedData.Users;
            this.InflateTable();

            if (this.permissions.some(_x => _x.Name === 'Sales_CashClosing_SearchCashClosingOfUsers')) {
              this.searchForm.get('User')?.enable();
            }

            let user = this.users.find(_x => _x.Email === this.currentUser) as IUser;
            if (user) {
              this.searchForm.controls['User'].setValue(user);
            }

          }
        }
      });
  }

  /**
   * Initial loading in form
   * @constructor
   * @private
   */
  private SetInitialData(): void {
    let defaultCurrency = this.currencies.find(x => x.IsLocal);

    this.terminalsFiltered = this.terminals.filter(x => x.Currency == defaultCurrency?.Id);
    this.closingForm.patchValue({
      Currency: defaultCurrency?.Id,
    });

    if (this.setting) {
      let res: IPaymentSetting[] = JSON.parse(this.setting.Json);

      if (res && res.length > 0) {

        this.isPinpad = res.some(_x => _x.CompanyId === this.selectedCompany?.Id && _x.Pinpad);

        if (this.isPinpad) {
          if (this.permissions.some(p => p.Name === 'Sales_CashClosing_EditPinpadCardsAmount')) {
            this.closingForm.get('CardAmountPinpad')?.enable();
          }

          this.closingForm.controls['Terminal'].enable();

          let terminal = this.terminalsFiltered.find(x => x.Currency == defaultCurrency?.Id && x.IsDefault)?.TerminalId;

          this.closingForm.patchValue({
            Terminal: terminal ? terminal : 0
          });

          this.GetPPTotal();
        }
      }

    }
  }

  private InitAutocomplete(): void {

    this.users$ = this.searchForm.controls['User'].valueChanges.pipe(
      startWith(''),
      map(element => {
        return this.FilterUser(element);
      }),
    );
  }

  private FilterUser(_value: string | IUser): IUser[] {

    if (typeof _value != 'string' && typeof _value != 'object')
      return [];

    if (typeof _value == 'object' && _value) {
      return this.users.filter(u => u.Email === _value.Email);
    }

    return this.users.filter(u => (`${u.Name}${u.LastName}${u.Email}`)
      .toLowerCase()
      .includes(_value?.toLowerCase() || ''))
  }

  private SetValidatorAutoComplete(): void {
    this.searchForm.get('User')?.addValidators(Validation.validateValueAutoComplete(this.users));
  }

  public TapChange(selectIndex: number): void {

    switch (selectIndex) {
      case 0:
        this.router.navigate(['sales/cash-closing']);
        break;
      case 1:
        this.router.navigate(['sales/cash-closing/search']);
        break;
    }

  }

  private Search(): void {

    let data = this.searchForm.getRawValue();

    this.overlayService.OnGet();
    this.cashClosingService.GetAll<IPaydeskBalance[]>(data.User?.Email, data.DateFrom, data.DateTo).pipe(
      finalize(() => this.overlayService.Drop())
    ).subscribe({
      next: (res => {
        this.closingReports = res.Data;
        this.InflateTable();
      }),
      error: (err) => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
      }
    })
  }

  /**
   * Method to update table data
   * @constructor
   * @private
   */
  private InflateTable() : void {
    this.closingReports = this.closingReports.map(d => this.sharedService.MapTableColumns({
      ...d,
      DateFormatted: formatDate(d.CreatedDate, "MMMM d, y", 'en')
    }, Object.keys(this.docTbColumns)));

    const NEW_TABLE_STATE = {
      Records: this.closingReports,
      RecordsCount: this.closingReports.length
    };
    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Target: this.closingTableId,
      Data: JSON.stringify(NEW_TABLE_STATE)
    });
  }

  private DownloadReport(rowSelectDocument: IPaydeskBalance): void {
    this.overlayService.OnGet();
    this.cashClosingService.GetReport<string>(rowSelectDocument.UrlReport).pipe(
      finalize(() => {
        this.overlayService.Drop();
      })
    ).subscribe({
      next: (res => {
        DownloadBase64File(res.Data, `Cierre de caja - ${rowSelectDocument.CreatedBy}`, 'application/pdf', 'pdf');
      }),
      error: (err) => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
      }
    })
  }

  private SendEmailReport(rowSelectDocument: IPaydeskBalance): void {
    this.matDialog.open(SendEmailComponent, {
      width: '98%',
      maxWidth: '600px',
      height: '80%',
      maxHeight: '400px',
      disableClose: true,
      data: rowSelectDocument.UrlReport
    }).afterClosed().subscribe({});
  }

  private PrintReport(rowSelectDocument: IPaydeskBalance): void {
    this.overlayService.OnGet();
    this.cashClosingService.GetReport<string>(rowSelectDocument.UrlReport).pipe(
      switchMap(res => {
        if (PrinterWorker()) {
          return this.printerWorkerService.Post(res.Data)
            .pipe(
              map(printLocal => res),
              catchError((err) => {
                this.modalService.Continue({
                  title: 'Se produjo un error al imprimir',
                  subtitle: GetError(err),
                  type: CLModalType.ERROR
                });
                return of(err);
              })
            );
        } else {
          PrintBase64File({base64File: res.Data, blobType: 'application/pdf', onNewWindow: false});
          return of(res);
        }
      }),
      finalize(() => {
        this.overlayService.Drop();
      })
    ).subscribe()
  }

  private PreviewReport(rowSelectDocument: IPaydeskBalance): void {

    this.overlayService.OnGet();
    this.cashClosingService.GetReport<string>(rowSelectDocument.UrlReport).pipe(
      finalize(() => {
        this.overlayService.Drop();
      })
    ).subscribe({
      next: (res => {
        this.matDialog.open(this.reportTemplate, {
          width: '100%',
          maxWidth: '900px',
          height: '90%',
          disableClose: false,
          panelClass: 'custom-dialog',
          data: this.Base64ToArrayBuffer(res.Data)
        }).afterClosed().subscribe();
        this.data = res.Data;
      }),
      error: (err) => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
      }
    })


  }

  public Base64ToArrayBuffer(base64: string): ArrayBufferLike {
    let binary_string = window.atob(base64);
    let len = binary_string.length;
    let bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }

  public ChangeTerminal(): void {
    this.closingForm.controls['CardAmountPinpad'].setValue(0);
  }

  public ChangeDocCurrency(): void {
    let currency = this.closingForm.controls['Currency'].value;

    this.closingForm.controls['CardAmountPinpad'].setValue(0);

    this.terminalsFiltered = this.terminals.filter(x => x.Currency == currency);

    let terminal = this.terminalsFiltered.find(x => x.Currency == currency && x.IsDefault)?.TerminalId

    this.closingForm.patchValue({
      Terminal: terminal ? terminal : 0
    });
  }

  public GetPPTotal(): void {

    let rate = Repository.Behavior.GetStorageObject<ICurrentSession>(StorageKey.CurrentSession)?.Rate || 0;

    const data: IPaydeskBalance = this.closingForm.getRawValue();

    if (!data.Terminal) {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: `Seleccione terminal para consultar totales pinpad`
      });
      return;
    }

    this.overlayService.OnGet();
    this.pptransactionsService.GetPPTransactionTotal(data.Terminal, rate).pipe(
      finalize(() => {
        this.overlayService.Drop();
      })
    ).subscribe({
      next: (callback) => {
        if (callback.Data.Total == -1) {
          this.closingForm.controls['CardAmountPinpad'].setValue(0);

          this.modalService.CancelAndContinue({
            type: CLModalType.QUESTION,
            title: `Generar cierre tarjetas pinpad?`,
            subtitle: `${callback.Message}`
          }).pipe(
            filter(res => res)
          ).subscribe( {
            next: (callback) => {
              this.SaveBalance();
            },
              error: (err) => {
              this.alertsService.ShowAlert({HttpErrorResponse: err});
            }
          });

        } else {
          this.closingForm.controls['CardAmountPinpad'].setValue(callback.Data.Total);
        }
      },
      error: (err) => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
      }
    })
  }

  public SaveBalance(): void {
    this.overlayService.OnPost();

    const data: IPaydeskBalance = this.closingForm.getRawValue();
    let rate = Repository.Behavior.GetStorageObject<ICurrentSession>(StorageKey.CurrentSession)?.Rate || 0;

    const CL_TERMINAL = {
      TerminalId: data.Terminal
    } as ICLTerminal;


    this.pptransactionsService.Balance(CL_TERMINAL)
      .pipe(
        filter(res => {
          if (!res.Result) {
            this.alertsService.Toast({type: CLToastType.ERROR, message: `${res.Error.Code} ${res.Error.Message}`});
          }
          return res.Result;
        }),
        map(callback => {
          return {
            SerializedTransaction: callback.Data,
            Type: 'BA',
            TerminalId: CL_TERMINAL.TerminalId,
            IsApproved: !!callback.Data,
          } as IPPCashDeskClosing;
        }),
        concatMap(callback => this.balancesService.Balances(callback)),
        concatMap(callback => this.pptransactionsService.GetPPTransactionTotal(data.Terminal, rate)),

        finalize(() => this.overlayService.Drop()))
      .subscribe({
        next: (callback) => {
          if (callback && callback.Data) {
            this.closingForm.controls['CardAmountPinpad'].setValue(callback.Data.Total);

          }

          this.modalService.Continue({
            title: 'Balance generado correctamente',
            type: CLModalType.SUCCESS
          });
        },
        error: (err) => {
          this.modalService.Continue({
            title: `Se produjo un error generando el balance`,
            subtitle: GetError(err),
            type: CLModalType.ERROR
          });
        }
      });
  }

}
