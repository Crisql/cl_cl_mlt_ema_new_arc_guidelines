import {Component, Inject, OnInit} from '@angular/core';
import {catchError, finalize, forkJoin, Observable, of, Subscription, switchMap} from "rxjs";
import {IActionButton} from "@app/interfaces/i-action-button";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {CL_CHANNEL, ICLCallbacksInterface, ICLEvent, LinkerService, Register, Run, StepDown} from "@clavisco/linker";
import {ICLTableButton, MapDisplayColumns, MappedColumns} from "@clavisco/table";
import {CLPrint, GetError, PinPad, PrintBase64File, Repository, Structures} from "@clavisco/core";
import {ActivatedRoute, Router} from "@angular/router";
import {OverlayService} from "@clavisco/overlay";
import {
  AlertsService,
  CLModalType,
  CLToastType,
  ModalService,
  NotificationPanelService
} from "@clavisco/alerts";
import {PrinterWorker, SharedService} from "@app/shared/shared.service";
import {formatDate} from "@angular/common";
import {map} from "rxjs/operators";
import {IPrintVoidCardComponentsResoveData,} from "@app/interfaces/i-resolvers";
import {TableData} from "@app/interfaces/i-table-data";
import {ICommitedVoidedTransaction, IFilterPPVoidTransaction} from "@app/interfaces/i-pp-transactions";
import {IUser} from "@app/interfaces/i-user";
import {PPTransactionService} from "@app/services/pp-transaction.service";
import {ReportsService} from "@app/services/reports.service";
import {IPinpadTerminal, ITerminals} from "@app/interfaces/i-terminals";
import {FormatSalesAmount} from "@app/shared/common-functions";
import {IPermissionbyUser} from "@app/interfaces/i-roles";
import {IUserToken} from "@app/interfaces/i-token";
import {StorageKey} from "@app/enums/e-storage-keys";
import {UserService} from "@app/services/user.service";
import {TerminalsService} from "@app/services/terminals.service";
import {TerminalUsersService} from "@app/services/terminal-users.service";
import {PermissionUserService} from "@app/services/permission-user.service";
import {PrinterWorkerService} from "@app/services/printer-worker.service";
import Validation from "@app/custom-validation/custom-validators";

@Component({
  selector: 'app-print-void-cards',
  templateUrl: './print-void-cards.component.html',
  styleUrls: ['./print-void-cards.component.scss']
})
export class PrintVoidCardsComponent implements OnInit {
  /*LISTAS**/
  commitedVoidedTransactions: ICommitedVoidedTransaction[] = [];
  actionButtons: IActionButton[] = [];
  users: IUser[] = [];
  filteredUsers$!: Observable<IUser[]>;
  terminals!: ITerminals[];
  userPermissions: IPermissionbyUser[] = [];
  /**FORMULARIOS*/
  frmSearchDocument!: FormGroup;

  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };
  allSubscriptions!: Subscription;

  /*CONFIGURACION DE LA TABLA*/
  docTbColumns: { [key: string]: string } = {
    User: "Usuario",
    TransactionId: "Num transacción",
    ReferenceNumber: 'Num referencia',
    AuthorizationNumber: 'Num autorización ',
    CreationDate: "Fecha anulación",
    DocDateFormatted: "Fecha",
    SalesAmount: "Monto",
    TerminalId: "Terminal",
    InvoiceNumber: "Num Factura",
    SystemTrace: "Traza Sistema"
  }
  documentsTableId: string = 'DOCS-TABLE';
  docTbMappedColumns!: MappedColumns;
  buttons: ICLTableButton[] = [
    {
      Title: `Imprimir`,
      Action: Structures.Enums.CL_ACTIONS.OPTION_4,
      Icon: `print`,
      Color: `primary`,
      Data: ''
    },
  ];

  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private overlayService: OverlayService,
    private ppTransactionService: PPTransactionService,
    @Inject("LinkerService") private linkerService: LinkerService,
    private alertsService: AlertsService,
    private sharedService: SharedService,
    private reportsService: ReportsService,
    private notificationService: NotificationPanelService,
    private usersService: UserService,
    private terminalsService: TerminalsService,
    private terminalUsersService: TerminalUsersService,
    private permissionUserService: PermissionUserService,
    private printerWorkerService: PrinterWorkerService,
    private modalService: ModalService
  ) {
    this.configTableDocs();
    this.allSubscriptions = new Subscription();
  }

  ngOnDestroy(): void {
    this.allSubscriptions.unsubscribe();
  }

  ngOnInit(): void {
    this.onLoad();
  }

  private onLoad(): void {
    this.initForm();
    this.handleResolvedData();
    this.SetValidatorAutoComplete();
    Register<CL_CHANNEL>(this.documentsTableId, CL_CHANNEL.OUTPUT, this.onTableButtonClicked, this.callbacks);
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
    this.allSubscriptions.add(
      this.linkerService.Flow()?.pipe(
        StepDown<CL_CHANNEL>(this.callbacks),
      ).subscribe({
        next: callback => Run(callback.Target, callback, this.callbacks.Callbacks),
        error: error => CLPrint(error, Structures.Enums.CL_DISPLAY.ERROR)
      })
    );
  }

  /**
   * Method to obtain canceled Transactions
   * @constructor
   */
  public GetRecords = (): void => {

    let user = this.frmSearchDocument.controls['User'].value as IUser;
    let from = formatDate(this.frmSearchDocument.controls['DateFrom'].value, 'yyyy-MM-dd', 'en');
    let to = formatDate(this.frmSearchDocument.controls['DateTo'].value, 'yyyy-MM-dd', 'en');
    let terminal = this.frmSearchDocument.controls['Terminal'].value as IPinpadTerminal

    let data = {
      Email: user ? user.Email : '',
      DateFrom: from,
      DateTo: to,
      Terminal: terminal.TerminalId
    } as IFilterPPVoidTransaction;

    if (this.frmSearchDocument.valid) {

      this.overlayService.OnGet();

      this.ppTransactionService.GetCanceledTransactions(data).pipe(
        finalize(() => this.overlayService.Drop())
      ).subscribe({
        next: (callback) => {
          this.commitedVoidedTransactions = callback.Data;

          const NEW_TABLE_STATE = {
            Records: this.commitedVoidedTransactions.map(d => this.sharedService.MapTableColumns({
              ...d,
              DocDateFormatted: formatDate(d.CreationDate, 'dd-MM-yyyy hh:mm:ss a', 'en'),
              SalesAmount: FormatSalesAmount(+(d.SalesAmount)),
            }, Object.keys(this.docTbColumns))),
            RecordsCount: this.commitedVoidedTransactions.length
          };
          this.linkerService.Publish({
            CallBack: CL_CHANNEL.INFLATE,
            Target: this.documentsTableId,
            Data: JSON.stringify(NEW_TABLE_STATE)
          });
        }
      });
    } else this.frmSearchDocument.markAllAsTouched();

  }

  /**
   * METODO
   * @private
   */
  private initForm(): void {
    this.frmSearchDocument = this.fb.group({
      User: [''],
      DateFrom: [new Date(), Validators.required],
      DateTo: [new Date(), Validators.required],
      Terminal: ['', Validators.required]
    });
    this.frmSearchDocument.get('User')?.disable();
    this.frmSearchDocument.get('User')!.valueChanges.pipe(
      map((value: string | IUser) => {
        this.filteredUsers$ = of(this.filterUsers(value));
      })
    ).subscribe();

  }

  SetValidatorAutoComplete(): void{
    this.frmSearchDocument.get('User')?.addValidators(Validation.validateValueAutoComplete(this.users));
  }

  /**
   * METODO PARA INICIALIZAR LA TABLA
   * @private
   */
  private configTableDocs(): void {
    this.docTbMappedColumns = MapDisplayColumns({
      dataSource: this.commitedVoidedTransactions,
      renameColumns: this.docTbColumns,
      stickyColumns: [
        {Name: 'Options', FixOn: 'right'}
      ],
      ignoreColumns: ['DocEntry', 'InvoiceNumber', 'SystemTrace', 'CreationDate']
    });
  }


  /**
   * METODO PARA FILTRO DEL AUTOCOMPLETE
   * @param _value
   * @private
   */
  public filterUsers(_value: string | IUser): IUser[] {
    if (typeof _value !== 'string') {
      return this.users.filter(user => user.Name === user.Name);
    }
    return this.users.filter(user => (`${user.Name}${user.LastName}`).toLowerCase().includes(_value.toLowerCase()))
  }


  /**
   * METODO QUE SE EJECUTA AL INICIAR EL COMPONENTE Y MAPEA LA DATA INICIAL
   * @private
   */
  private handleResolvedData(): void {
    this.allSubscriptions.add(
      this.activatedRoute.data.subscribe({
        next: (data) => {
          const resolvedData = data['resolvedData'] as IPrintVoidCardComponentsResoveData;

          if (resolvedData) {
            this.users = resolvedData.Users;
            this.filteredUsers$ = of(this.users.slice(0, 10));
            this.terminals = resolvedData.TerminalsUser;
            this.userPermissions = resolvedData.Permissions;
            this.SetInitialData();
          }
        }
      })
    );
  }

  public LoadDataUserForm(): void {
    let currentUser = Repository.Behavior.GetStorageObject<IUserToken>(StorageKey.Session)?.UserEmail || '';
    let user = this.users.find(_x => _x.Email === currentUser) as IUser;

    if (user) {
      this.frmSearchDocument.controls['User'].setValue(user);
    }

  }

  /**
   * METODO PARA MOSTRAR LOS DATOS QUE REQUIERO EN EL AUTOCOMPLETE
   * @param _salesPerson
   */
  public displayUsersPersons(_salesPerson: IUser): string {
    return _salesPerson && Object.keys(_salesPerson).length ? `${_salesPerson.Name} - ${_salesPerson.LastName}` : '';
  }


  /**
   * METODO QUE SE EJECUTA EN EL BOTON DE BUSCAR O LIMPIAR
   * @param _actionButton
   */
  public onActionButtonClicked(_actionButton: IActionButton): void {
    switch (_actionButton.Key) {
      case 'SEARCH':
        this.GetRecords();
        break;
      case 'CLEAN':
        this.Clear();
        break;
    }
  }

  /**
   * METODO QUE SE EJECUTA EN LOS BOTONES DE LA TABLA
   * @param _event -  Event emitted in the table button when selecting a transaction
   */
  public onTableButtonClicked = (_event: ICLEvent): void => {

    let data: TableData = JSON.parse(_event.Data);

    let rowSelectDocument: ICommitedVoidedTransaction = JSON.parse(data.Data);

    const TERMINAL: ITerminals = this.terminals.find(x => x.TerminalCode == rowSelectDocument.TerminalId) || {Currency: '  '} as ITerminals;

    // make some mappings
    let docEntry = -1; // i set this value to -1 because is used to ignore some fields in the report
    let rawData = `>ct:1>ct_end>tr1:${rowSelectDocument.TerminalId}>tr_end1>am1:${rowSelectDocument.SalesAmount}>am_end1>ti1:${rowSelectDocument.InvoiceNumber}`;
    rawData += `>ti_end1>st1:${rowSelectDocument.SystemTrace}>st_end1>rn1:${rowSelectDocument.ReferenceNumber}`;
    rawData += `>rn_end1>na1:${rowSelectDocument.AuthorizationNumber}>na_end1>cu1:${TERMINAL.Currency}>cu_end1>fc1:${rowSelectDocument.CreationDate.toString()}>fc_end1`;

    switch (data.Action) {
      case Structures.Enums.CL_ACTIONS.OPTION_4:

        this.overlayService.OnGet();

        this.reportsService.PrintVoucher(docEntry, rawData).pipe(
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
              PrintBase64File({base64File: res.Data, blobType: 'application/pdf', onNewWindow: false})
              return of(res);
            }
          }),
          finalize(() => this.overlayService.Drop()))
          .subscribe();
        break;

    }
  }

  /**
   * METODO QUE LIMPIA LA DATA
   * @private
   */
  public Clear(): void {
    this.overlayService.OnGet();
    forkJoin({
      Users: this.usersService.Get<IUser[]>(),
      TerminalsUser: this.terminalUsersService.TerminalsByPermissionByUser<IPinpadTerminal[]>(),
      Permissions: this.permissionUserService.Get<IPermissionbyUser[]>().pipe(catchError(res => of(null))),
    }).pipe(
      finalize(() => this.overlayService.Drop())
    ).subscribe({
      next: (callback) => {
        this.users = callback.Users.Data;
        this.filteredUsers$ = of(this.users.slice(0, 10));
        this.terminals = callback.TerminalsUser.Data;
        this.userPermissions = callback.Permissions?.Data ?? [];
        this.SetInitialData();
        this.ResetDocument();
        this.alertsService.Toast({type: CLToastType.SUCCESS, message: 'Componentes requeridos obtenidos'});
      },
      error: (err) => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
      }
    });
  }

  private ResetDocument(): void {
    this.frmSearchDocument.patchValue({
      Terminal: '',
      DateFrom: new Date(),
      DateTo: new Date()
    })
    this.commitedVoidedTransactions = [];
    const EMPTY_TABLE_STATE = {
      Records: [],
      RecordsCount: 0
    }
    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Target: this.documentsTableId,
      Data: JSON.stringify(EMPTY_TABLE_STATE)
    });
  }

  public SetInitialData(): void {
    this.LoadDataUserForm();
    if (this.userPermissions.some(_x => _x.Name === 'Sales_PrintVoidCards_SearchByOtherUser')) {
      this.frmSearchDocument.get('User')?.enable();
    }
  }


}
