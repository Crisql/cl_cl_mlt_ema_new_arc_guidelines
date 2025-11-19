import {Component, Inject, OnInit} from '@angular/core';
import {IActionButton} from "@app/interfaces/i-action-button";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {OverlayService} from "@clavisco/overlay";
import {
  AlertsService,
  CLModalType,
  CLNotificationType,
  CLToastType,
  ModalService,
  NotificationPanelService
} from "@clavisco/alerts";
import {CL_CHANNEL, ICLCallbacksInterface, ICLEvent, LinkerService, Register, Run, StepDown} from "@clavisco/linker";
import {
  catchError,
  concatMap,
  EMPTY,
  filter,
  finalize,
  Observable,
  of,
  startWith,
  Subscription,
  switchMap,
} from "rxjs";
import {IUser, IUserAssign} from "@app/interfaces/i-user";
import {ICLTableButton, MapDisplayColumns, MappedColumns} from "@clavisco/table";
import {
  IPPStoredTransactionResolvedData,
  IPPStoredTransactions,
  IPPStoredTransactionsFilter,
} from "@app/interfaces/i-pp-transactions";
import {CLPrint, GetError, PinPad, PinPadServices, PrintBase64File, Repository, Structures} from "@clavisco/core";
import {ActivatedRoute} from "@angular/router";
import {map} from "rxjs/operators";
import {PPStoredTransactionService} from "@app/services/ppstored-transaction.service";
import {ICompany} from "@app/interfaces/i-company";
import {ICurrentCompany, ICurrentUser} from "@app/interfaces/i-localStorage";
import {StorageKey} from "@app/enums/e-storage-keys";
import CL_ACTIONS = Structures.Enums.CL_ACTIONS;
import {IPermissionbyUser} from "@app/interfaces/i-roles";
import {environment} from "@Environment/environment";
import {ITerminals, ITerminalsByUser} from "@app/interfaces/i-terminals";
import {PrinterWorker, SharedService} from "@app/shared/shared.service";
import {formatDate} from "@angular/common";
import {FormatSalesAmount} from "@app/shared/common-functions";
import {ReportsService} from "@app/services/reports.service";
import {IUserToken} from "@app/interfaces/i-token";
import {ISettings} from "@app/interfaces/i-settings";
import {TerminalUsersService} from "@app/services/terminal-users.service";
import {PrinterWorkerService} from "@app/services/printer-worker.service";
import Validation from "@app/custom-validation/custom-validators";

@Component({
  selector: 'app-ppstored-transactions',
  templateUrl: './ppstored-transactions.component.html',
  styleUrls: ['./ppstored-transactions.component.scss']
})
export class PpstoredTransactionsComponent implements OnInit {

  pinpadForm!: FormGroup;
  actionButtons!: IActionButton[];
  users!: IUser[];
  userPermission!: IPermissionbyUser[];
  filteredUsers$!: Observable<IUser[]>;
  allSubscriptions$!: Subscription;
  terminals!: ITerminals[];
  setting!: ISettings;
  selectedCompany!: ICompany;
  currentUser!: ICurrentUser;


  //Campos de tabla
  shouldPaginateRequest: boolean = false;
  pinpadTableId: string = 'PINPAD-TABLE';
  hasStandardHeaders: boolean = true;
  shouldSplitPascal: boolean = false;
  pinpadMappedColumns!: MappedColumns;
  hasItemsSelection: boolean = false;
  transactions: IPPStoredTransactions[] = [];
  tableButtons: ICLTableButton[] = [
    {
      Color: 'primary',
      Action: CL_ACTIONS.DELETE,
      Icon: 'block',
      Title: 'Anular transacción'
    }
  ];
  pinpadTableColumns: { [key: string]: string } = {
    SyncUser: 'Usuario',
    TransactionId: "Num transacción",
    ReferenceNumber: 'Num referencia',
    AuthorizationNumber: 'Num autorización ',
    CreatedDate: 'Fecha de creación',
    TerminalId: "Terminal",
    InvoiceNumber: "Num Factura",
    SystemTrace: "Traza Sistema",
    SalesAmount: "Monto"
  };

  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };

  constructor(
    private fb: FormBuilder,
    private overlayService: OverlayService,
    private alertsService: AlertsService,
    private activatedRoute: ActivatedRoute,
    private ppStoredTransactionService: PPStoredTransactionService,
    private pinpadConnectorService: PinPadServices.Connector,
    private reportsService: ReportsService,
    @Inject('LinkerService') private linkerService: LinkerService,
    private terminalsUser: TerminalUsersService,
    private printerWorkerService: PrinterWorkerService,
    private modalService: ModalService
  ) {
    this.allSubscriptions$ = new Subscription();
    this.pinpadMappedColumns = MapDisplayColumns(
      {
        dataSource: [] as IPPStoredTransactions[],
        renameColumns: this.pinpadTableColumns,
        stickyColumns: [
          {Name: 'Options', FixOn: 'right'}
        ],
        ignoreColumns: ['Id', 'StateType', 'TransactionType', 'CreatedBy', 'UpdateDate', 'UpdatedBy', 'IsActive', 'StorageKey', 'Data', 'DocumentKey', 'CompanyId', 'Company']
      }
    );
  }

  ngOnInit(): void {


    Register<CL_CHANNEL>(this.pinpadTableId, CL_CHANNEL.OUTPUT, this.OnTableActionActivated, this.callbacks);


    this.allSubscriptions$.add(
      this.linkerService.Flow()?.pipe(
        StepDown<CL_CHANNEL>(this.callbacks),
      ).subscribe({
        next: callback => Run(callback.Target, callback, this.callbacks.Callbacks),
        error: error => CLPrint(error, Structures.Enums.CL_DISPLAY.ERROR)
      })
    );

    this.InitVariables();
    this.HandleResolvedData();
    this.LoadForm();
    this.PinpadConfiguration();
    this.SetValidatorAutoComplete();
  }


  InitVariables(): void {
    this.selectedCompany = Repository.Behavior.GetStorageObject<ICompany>(StorageKey.CurrentCompany) as ICompany;
    this.currentUser = Repository.Behavior.GetStorageObject<ICurrentUser>(StorageKey.CurrentUserAssign) as ICurrentUser;
    this.actionButtons = [
      {
        Key: 'SEARCH',
        MatColor: 'primary',
        MatIcon: 'search',
        Text: 'Buscar',
        DisabledIf: _form => _form?.invalid || false
      },
      {
        Key: 'CLEAN',
        MatIcon: 'mop',
        Text: 'Limpiar'
      }
    ];
  }

  LoadForm(): void {
    this.pinpadForm = this.fb.group({
      User: [this.DefaultUser(), Validators.required],
      Terminal: ['', Validators.required],
      DateFrom: [new Date(), Validators.required],
      DateTo: [new Date(), Validators.required],
    });

    this.pinpadForm.get('User')?.disable();

    if (this.userPermission?.some(_x => _x.Name === 'Sales_PPStoredTransaction_SearchTransactionsOfUsers')) {
      this.pinpadForm.get('User')?.enable();
    }

    this.pinpadForm.get('User')!.valueChanges.pipe(
      startWith(''),
      filter(value => value),
      map((value: string | IUser) => {
        this.filteredUsers$ = of(this.FilterDocuments(value));
        this.transactions = [];
        this.InflateTable();
      }),
    ).subscribe()

    this.pinpadForm.get('Terminal')!.valueChanges
    .subscribe({
      next: () => {
        this.transactions = [];
        this.InflateTable();
      }
    })

  }

  SetValidatorAutoComplete(): void {
    this.pinpadForm.get('User')?.addValidators(Validation.validateValueAutoComplete(this.users));
  }

  private PinpadConfiguration(): void {

    Repository.Behavior.SetTokenConfiguration({token: "Share", setting: "apiURL", value: environment.apiUrl});
    Repository.Behavior.SetTokenConfiguration({token: "PinPad", setting: "apiURL", value: "PinpadServicePP"});
    Repository.Behavior.SetTokenConfiguration({
      token: "PinPad",
      setting: "voidedVoucherPath",
      value: "api/Reports/PrintVoucher"
    });
  }

  DefaultUser(): IUser | string {
    return this.users?.find(x => x.Id = +this.currentUser?.UserId) || '';
  }

  FilterDocuments(_value: string | IUser): IUser[] {
    if (typeof _value !== 'string') {
      return this.users.filter(bp => (`${bp.Name}${bp.LastName}`) === _value?.Name || _value?.LastName);
    }
    return this.users.filter(bp => (`${bp.Name}${bp.LastName}`).toLowerCase().includes(_value.toLowerCase()))
  }

  HandleResolvedData(): void {
    this.activatedRoute.data.subscribe({
      next: (data) => {
        const resolvedData = data['resolvedData'] as IPPStoredTransactionResolvedData;
        if (resolvedData && resolvedData.Users) {

          this.users = resolvedData.Users || [];
          this.filteredUsers$ = of(this.users);

          this.userPermission = resolvedData.UserPermission || [];

          this.terminals = resolvedData.Terminals || [];

          this.setting = resolvedData.Setting;

          //Si no tiene el permiso de ver todas las terminales, se cargan solo las que el tiene asignadas
          if (!this.userPermission?.some(_x => _x.Name === 'Sales_PPStoredTransaction_Terminals')) {
            this.overlayService.OnGet()
            this.terminalsUser.Get<ITerminalsByUser[]>(+this.currentUser?.UserId, this.selectedCompany?.Id)
              .pipe(finalize(() => this.overlayService.Drop()))
              .subscribe({
                next: value => {
                  this.terminals = this.terminals.filter(terminal =>
                    value.Data.some(ob => ob.TerminalId == terminal.Id));
                }
              })
          }
        }
      }
    })
  }

  InflateTable(): void {
    const NEXT_TABLE_STATE = {
      CurrentPage: 0,
      ItemsPeerPage: 5,
      Records: this.transactions,
      RecordsCount: this.transactions.length,
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(NEXT_TABLE_STATE),
      Target: this.pinpadTableId
    });
  }

  DisplayUsers(_user: IUser): string {
    return _user && Object.keys(_user).length ? `${_user.Name} ${_user.LastName}` : '';
  }

  OnActionButtonClicked(_actionButton: IActionButton): void {
    switch (_actionButton.Key) {
      case 'SEARCH':
        this.SerchTransactions();
        break;
      case 'CLEAN':
        this.Reset()
        break;
    }
  }

  public Reset(): void {
    this.pinpadForm.reset();
    this.LoadForm();
    this.transactions = [];
    this.InflateTable();
  }

  /**
   * Method to select transaction to cancel
   * @param _event - Event emitted in the table button when selecting a transaction
   * @constructor
   */
  OnTableActionActivated = (_event: ICLEvent): void => {
    let clickedButton = JSON.parse(_event.Data) as ICLTableButton;
    let tableRow = JSON.parse(clickedButton.Data!) as IPPStoredTransactions;

    let currenUser = Repository.Behavior.GetStorageObject<IUserToken>(StorageKey.Session)?.UserId || -1;
    let selectUser = this.pinpadForm.get('User')?.value as IUser;

    switch (clickedButton.Action) {
      case Structures.Enums.CL_ACTIONS.DELETE:
        if (this.userPermission.some(_x => _x.Name === 'Sales_PPStoredTransaction_CancelTransactionsOfUsers') || selectUser.Id == currenUser) {
          this.CancelPinpadTransaction(tableRow);
        } else {
          this.alertsService.Toast({
            type: CLToastType.INFO,
            message: 'No tienes los permisos necesarios para anular esta transacción'
          });
        }
        break;
    }
  }

  CancelPinpadTransaction(tableRow: IPPStoredTransactions): void {

    this.overlayService.OnPost();
    let docEntry = -1; // i set this value to -1 because is used to ignore some fields in the report

    let transaction = {
      TerminalId: tableRow.TerminalId,
      InvoiceNumber: tableRow.InvoiceNumber,
      ReferenceNumber: tableRow.ReferenceNumber,
      SystemTrace: tableRow.SystemTrace,
      AuthorizationNumber: tableRow.AuthorizationNumber
    } as PinPad.Interfaces.ICommitedTransaction

    if (!transaction) {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: 'No se encontró la información de la transacción'
      });
      return;
    }

    this.pinpadConnectorService.VoidTransaction({
      transaction: transaction
    })
      .pipe(
        map(callback => {
          const TERMINAL: ITerminals = this.terminals.find(x => x.TerminalCode == tableRow.TerminalId) || {Currency: '  '} as ITerminals;

          // make some mappings
          let rawData = `>ct:1>ct_end>tr1:${tableRow.TerminalId}>tr_end1>am1:${tableRow.SalesAmount}>am_end1>ti1:${tableRow.InvoiceNumber}`;
          rawData += `>ti_end1>st1:${tableRow.SystemTrace}>st_end1>rn1:${tableRow.ReferenceNumber}`;
          rawData += `>rn_end1>na1:${tableRow.AuthorizationNumber}>na_end1>cu1:${TERMINAL.Currency}>cu_end1>fc1:${tableRow.CreatedDate.toString()}>fc_end1`;

          return rawData;

        }),
        concatMap(rawData => {

          return this.reportsService.PrintVoucher(docEntry, rawData).pipe(
            finalize(() => this.overlayService.Drop()),
            switchMap(callback => {
              if (PrinterWorker()) {
                return this.printerWorkerService.Post(callback.Data)
                  .pipe(
                    map(printLocal => callback),
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
                PrintBase64File({base64File: callback.Data, blobType: 'application/pdf', onNewWindow: false});
                return of(callback);
              }
            }),
            catchError(err => {
              this.alertsService.ShowAlert({HttpErrorResponse: err});
              return EMPTY;
            })
          );
        }),
        finalize(() => this.overlayService.Drop())
      )
      .subscribe({
        next: (callback) => {
          this.SerchTransactions();

          this.modalService.Continue({
            title: 'Transacción anulada correctamente',
            type: CLModalType.SUCCESS
          });
        },
        error: (err) => {
          this.modalService.Continue({
            title: 'Se produjo un error anulando la transacción',
            subtitle: GetError(err),
            type: CLModalType.ERROR
          });
        }
      });

  }


  SerchTransactions(): void {
    this.transactions = [];

    let transactionFilter: IPPStoredTransactionsFilter = this.pinpadForm.getRawValue() as IPPStoredTransactionsFilter;

    this.overlayService.OnGet();
    this.ppStoredTransactionService.Get<IPPStoredTransactions[]>(transactionFilter.User.Email, this.selectedCompany?.Id, transactionFilter.Terminal.TerminalCode, transactionFilter.DateFrom, transactionFilter.DateTo)
      .pipe(finalize(() => this.overlayService.Drop()))
      .subscribe({
        next: callback => {

          this.transactions = (callback.Data || []).map(d => {
            let desData = this.DesarializeData(d.Data);

            return {
              ...d,
              CreatedDate: formatDate(d.CreatedDate, 'dd-MM-yyyy hh:mm:ss a', 'en'),
              AuthorizationNumber: desData['authorizationNumber'],
              ReferenceNumber: desData['referenceNumber'],
              SystemTrace: desData['systemTraceNumber'],
              InvoiceNumber: desData['invoice'],
              TransactionId: desData['transactionId'],
              SalesAmount: FormatSalesAmount(parseFloat(desData['salesAmount'].slice(0, -2)))
            } as IPPStoredTransactions
          })
          this.InflateTable();
        },
        error: () => {
          this.InflateTable();
        }
      })
  }

  DesarializeData(_data: string): any {
    let decodedString = atob(_data);
    let parsedData = JSON.parse(decodedString);

    if (parsedData['EMVStreamResponse'])
      return parsedData['EMVStreamResponse'];
    return null;
  }


}
