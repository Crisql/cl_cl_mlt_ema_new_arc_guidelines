import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {CLPrint, GetError, Structures} from '@clavisco/core';
import {DropdownList, ICLTableButton, MapDisplayColumns, MappedColumns} from '@clavisco/table';
import {ITerminalsComponentsResoveData, ITermsByUserResolveData} from 'src/app/interfaces/i-resolvers';
import {IPPTerminalUser, ITerminals, ITerminalsByUser} from 'src/app/interfaces/i-terminals';
import {IActionButton} from 'src/app/interfaces/i-action-button';
import {finalize, Subscription} from 'rxjs'
import {CL_CHANNEL, ICLCallbacksInterface, ICLEvent, LinkerService, Register, Run, StepDown} from '@clavisco/linker';
import {MatDialog} from "@angular/material/dialog";
import {AddTerminalsComponent} from "./add-terminals/add-terminals.component";
import {
  AlertsService,
  CLModalType,
  CLToastType,
  ModalService,
} from "@clavisco/alerts";
import {TableData} from "../../../interfaces/i-table-data";
import {SharedService} from "../../../shared/shared.service";
import {ITerminalsDialogData} from "../../../interfaces/i-dialog-data";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ICompany} from "../../../interfaces/i-company";
import {IUser} from "../../../interfaces/i-user";
import {TerminalUsersService} from "../../../services/terminal-users.service";
import {OverlayService} from "@clavisco/overlay";
import {DropdownElement, IRowByEvent} from "@clavisco/table/lib/table.space";
import {ICurrencies} from "@app/interfaces/i-currencies";
import {GetIndexOnPagedTable} from "@app/shared/common-functions";

@Component({
  selector: 'app-terminals',
  templateUrl: './terminals.component.html',
  styleUrls: ['./terminals.component.scss']
})
export class TerminalsComponent implements OnInit, OnDestroy {

  /**LISTAS*/
  terminals: ITerminals[] = [];
  terminalsByUser: ITerminalsByUser[] = [];
  company: ICompany[] = [];
  users: IUser[] = [];
  currencies: ICurrencies[] = [];

  /**CONFIG DE LA TABLA DE TERMINALES */
  shouldPaginateRequestTerminals: boolean = false;
  shouldPaginateRequestTerminalsByUsers: boolean = false;
  tableTerminals!: MappedColumns;
  tableTerminalColumns = {
    Id: 'Id',
    Active: 'Activo',
    TerminalCode: 'Terminal',
    Description: 'Descripción',
    Currency: 'Moneda',
    QuickPayAmount: 'Monto pago rápido'
  }
  tableId: string = 'TERMINALS-TABLE';
  buttons: ICLTableButton[] = [
    {
      Title: `Editar`,
      Action: Structures.Enums.CL_ACTIONS.UPDATE,
      Icon: `edit`,
      Color: `primary`,
      Data: ''
    }
  ];

  /*Variables*/
  isReload: boolean = true;

  /**CONFIG DE LA TABLA DE TERMINALES POR USUARIO*/
  checkboxColumns: string[] = ['Assigned', 'Default'];
  dropdownList!: DropdownList;
  tableTerminalsByUser!: MappedColumns;
  tableTerminalByUserColumns = {
    Assigned: 'Seleccionar',
    Id: 'Id',
    Active: 'Activo',
    TerminalCode: 'Terminal',
    Description: 'Descripción',
    Currency: 'Moneda',
    QuickPayAmount: 'Monto pago rápido',
    Default: 'Por defecto',
  }
  tableByUserId: string = 'TERMINALS-BY_USER-TABLE';


  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };
  actionButtons!: IActionButton[];
  allSubscriptions!: Subscription;

  /*VARIABLES*/
  index: number = 0;

  /*FORMULARIOS*/
  frmTermsByUser!: FormGroup;

  localCurrency!: ICurrencies;

  constructor(
    @Inject('LinkerService') private linkerService: LinkerService,
    private activatedRoute: ActivatedRoute,
    private sharedService: SharedService,
    private router: Router,
    public dialog: MatDialog,
    private alertsService: AlertsService,
    private fb: FormBuilder,
    private termsByUserService: TerminalUsersService,
    private overlayService: OverlayService,
    private modalService: ModalService
  ) {
    this.configTableTerminals();
    this.configTableTerminalsByUser();
    this.allSubscriptions = new Subscription();
  }

  ngOnInit(): void {
    this.onLoad();
  }

  ngOnDestroy(): void {
    this.sharedService.SetActionButtons([]);
    this.allSubscriptions.unsubscribe();
  }

  private initForm(): void {
    this.frmTermsByUser = this.fb.group({
      UserId: ['', Validators.required],
      CompanyId: ['', Validators.required]
    });
  }

  private configTableTerminals(): void {
    this.tableTerminals = MapDisplayColumns(
      {
        dataSource: this.terminals,
        renameColumns: this.tableTerminalColumns,
        stickyColumns: [
          {Name: 'Options', FixOn: 'right'}
        ],
        ignoreColumns: [
          'CreatedBy',
          'UpdatedBy',
          'CreatedDate',
          'UpdatedDate',
          'Status',
          'Assigned'
        ]
      }
    );
  }

  private configTableTerminalsByUser(): void {
    this.tableTerminalsByUser = MapDisplayColumns(
      {
        dataSource: this.terminals,
        renameColumns: this.tableTerminalByUserColumns,
        ignoreColumns: [
          'CreatedBy',
          'UpdatedBy',
          'CreatedDate',
          'UpdatedDate',
          'Status'
        ]
      }
    );
  }

  /**
   * CARGA LA INFORMACION DE INICIO DEL COMPONENTE
   */
  private loadInitialData(): void {

    this.allSubscriptions.add(this.activatedRoute.data.subscribe({
      next: (data) => {

        let resolvedData: ITerminalsComponentsResoveData = data['resolveTerminalsData'];

        if (resolvedData) {

          this.currencies = resolvedData.Currencies
          this.localCurrency = this.currencies.find(c => c.IsLocal)!;

          this.index = 0;
          this.actionButtons = [
            {
              Key: 'ADD_TERMINAL',
              MatIcon: 'add',
              Text: 'Agregar',
              MatColor: 'primary'
            }
          ];

          this.terminals = (resolvedData.Terminals || []).map(x => this.sharedService.MapTableColumns({
            ...x,
            Active: x.IsActive ? 'Sí' : 'No'
          }, Object.keys(this.tableTerminalColumns)));

          this.inflateTableTerminals();
        }

        let resolveTerminalsByUsersData: ITermsByUserResolveData = data['resolveTerminalsByUsersData'];

        if (resolveTerminalsByUsersData) {

          this.currencies = resolveTerminalsByUsersData.Currencies
          this.localCurrency = this.currencies.find(c => c.IsLocal)!;

          this.company = resolveTerminalsByUsersData.Company;
          this.users = resolveTerminalsByUsersData.Users;

          this.index = 1;
          this.actionButtons = [
            {
              Key: 'ADD_TERMINAL_BY_USER',
              MatIcon: 'edit',
              Text: 'Actualizar',
              MatColor: 'primary'
            }
          ];

          this.terminals = (resolveTerminalsByUsersData.Terminals || []).map(x => this.sharedService.MapTableColumns({
            ...x,
            Active: x.IsActive ? 'Sí' : 'No',
            Assigned: false
          }, Object.keys(this.tableTerminalByUserColumns)));

          this.InflateTableTerminalsByUser();
        }

      }
    }));

  }

  /**
   * INICIALIZA TABLA DE TERMINALES
   * @private
   */
  private inflateTableTerminals(): void {
    const NEXT_TABLE_STATE = {
      CurrentPage: 0,
      ItemsPeerPage: 5,
      Records: this.terminals,
      RecordsCount: this.terminals.length,
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Target: this.tableId,
      Data: JSON.stringify(NEXT_TABLE_STATE)
    } as ICLEvent);

  }

  /**
   * INICIALIZA TABLA DE TERMINALES POR USUARIO Y COMPANIA
   * @private
   */
  public InflateTableTerminalsByUser(): void {
    const NEXT_TABLE_STATE = {
      CurrentPage: 0,
      ItemsPeerPage: 5,
      Records: this.terminals,
      RecordsCount: this.terminals.length
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Target: this.tableByUserId,
      Data: JSON.stringify(NEXT_TABLE_STATE)
    } as ICLEvent);

  }

  /**
   * METODO QUE SE EJECUTA AL INICIO
   * @private
   */
  private onLoad(): void {

    this.initForm();
    this.registerTableEvents();

    this.allSubscriptions.add(
      this.linkerService.Flow()?.pipe(
        StepDown<CL_CHANNEL>(this.callbacks),
      ).subscribe({
        next: callback => Run(callback.Target, callback, this.callbacks.Callbacks),
        error: error => CLPrint(error, Structures.Enums.CL_DISPLAY.ERROR)
      })
    );

    this.loadInitialData();
    this.readQueryParameters();
  }

  /**
   * REGISTRA LOS EVENTOS DE LA TABLA
   * @private
   */
  private registerTableEvents(): void {
    Register<CL_CHANNEL>(this.tableId, CL_CHANNEL.OUTPUT, this.editTerminal, this.callbacks);
    //Register<CL_CHANNEL>(this.tableByUserId, CL_CHANNEL.DATA_LINE_3, this.onTableItemSelectionActivated, this.callbacks);
    Register<CL_CHANNEL>(this.tableByUserId, CL_CHANNEL.OUTPUT_3, this.EventColumn, this.callbacks);
  }

  /**
   * Method to update terminals by users
   * @param _event - Event emitted from the table to edit
   * @constructor
   */
  public EventColumn = (_event: ICLEvent): void => {

    let data: IRowByEvent<ITerminals> = JSON.parse(_event.Data);

    let selectedRowIndex = GetIndexOnPagedTable(data.ItemsPeerPage, data.RowIndex, data.CurrentPage + 1);

    if (selectedRowIndex < 0 || selectedRowIndex >= this.terminals.length) {
      console.error('Índice seleccionado fuera de rango:', selectedRowIndex);
      return; // Salir si el índice es inválido
    }

    let markedAsDefaultCurrency = data.Row.Currency;

    let defaultUSDCurrencyIndex = this.terminals.findIndex(x => x.Currency != this.localCurrency.Id && x.Default);
    let defaultCOLCurrencyIndex = this.terminals.findIndex(x => x.Currency == this.localCurrency.Id && x.Default);
    if (data.Row.Assigned !== undefined) {
    if (data.Row.Assigned) {
      if (this.terminals[selectedRowIndex].Assigned) {
        if (markedAsDefaultCurrency != this.localCurrency.Id) {
          if (defaultUSDCurrencyIndex == selectedRowIndex) {
            this.terminals[defaultUSDCurrencyIndex].Default = false;
          } else {
            this.terminals[selectedRowIndex].Default = true;
            this.terminals[defaultUSDCurrencyIndex].Default = false;
          }
        } else {
          if (defaultCOLCurrencyIndex == selectedRowIndex) {
            this.terminals[defaultCOLCurrencyIndex].Default = false;
          } else {
            this.terminals[selectedRowIndex].Default = true;
            this.terminals[defaultCOLCurrencyIndex].Default = false;
          }
        }
      } else {
        this.terminals[selectedRowIndex].Assigned = !this.terminals[data.RowIndex].Assigned;
      }
    } else {
      this.terminals[selectedRowIndex].Default = false;
      this.terminals[selectedRowIndex].Assigned = false;
    }
  }
    this.InflateTableTerminalsByUser();
  }

  /**
   * Method to select a terminal
   * @param _event - Event emitted in the table button when selecting a terminal
   * @constructor
   */
  public editTerminal = (_event: ICLEvent): void => {

    let tableData: TableData = JSON.parse(_event.Data);
    let model: ITerminals = JSON.parse(tableData.Data);

    this.router.navigate([this.sharedService.GetCurrentRouteSegment()], {
      relativeTo: this.activatedRoute, queryParams: {
        dialog: 'update',
        recordId: model.Id
      }
    });
  }

  /**
   * CREA UNA TERMINAL
   */
  public newTerminal(_event: IActionButton): void {

    switch (_event.Key) {
      case 'ADD_TERMINAL':
        this.router.navigate([this.sharedService.GetCurrentRouteSegment()], {
          relativeTo: this.activatedRoute, queryParams: {
            dialog: 'create'
          }
        });
        break;
      case 'ADD_TERMINAL_BY_USER':
        this.addTerminalUser();
        break;
    }


  }

  /**
   * REDIRECCIONAR
   * @private
   */
  private readQueryParameters(): void {
    this.allSubscriptions.add(this.activatedRoute.queryParams.subscribe(params => {
      if (params['dialog']) {
        let recordId: number = params['recordId'] ? +(params['recordId']) : 0;

        if (params['dialog'] === 'update' && !recordId) {
          this.alertsService.Toast({type: CLToastType.ERROR, message: 'Debe enviar el parametro "recordId"'});
        } else {
          this.openDialog(recordId);
        }
      }
    }));
  }

  /**
   * ABRE LA MODAL
   * @param id
   */
  public openDialog(id: number): void {

    this.dialog.open(AddTerminalsComponent, {
      width: '98%',
      maxWidth: '750px',
      height: '550px',
      data: {
        Id: id,
        Currencies: this.currencies
      } as ITerminalsDialogData
    }).afterClosed().subscribe({
      next: (res) => {
        this.router.navigate([this.sharedService.GetCurrentRouteSegment()], {relativeTo: this.activatedRoute});
      }
    });

  }

  /**
   * SE EJECUTA CUANDO SE CAMBIA DE TAB
   * @param tabChangeEvent
   */
  public tabChanged(tabChangeEvent: any): void {

    this.index = tabChangeEvent;

    switch (this.index) {
      case 0:
        this.router.navigate(['/maintenance', 'terminals']);
        break;
      case 1:
        this.router.navigate(['/maintenance', 'terminals', 'terms-by-users']);
        break;
    }

  }

  /**
   * SE EJECUTA AL SELECIONAR USUARIO O COMPANIA
   */
  public selectUser(): void {

    if (this.frmTermsByUser.valid) {

      this.terminalsByUser = [];

      this.overlayService.OnGet();
      this.termsByUserService.Get<ITerminalsByUser[]>(
        this.frmTermsByUser.controls['UserId'].value,
        this.frmTermsByUser.controls['CompanyId'].value,
      ).pipe(
        finalize(() => this.overlayService.Drop())
      ).subscribe({
        next: (callback) => {
          this.terminals = this.terminals.map(x => {
            return {...x, Assigned: false, Default: false}
          });

          callback.Data.forEach(x => {
            const matchingTerminal = this.terminals.find(element => element.Id === x.TerminalId);
            if (matchingTerminal) {
              matchingTerminal.Assigned = true;
              matchingTerminal.Default = x.IsDefault;
            }
          });

          this.isReload = true;

          this.InflateTableTerminalsByUser();
        },
      })
    }
  }

  /**
   * GUARDA LAS TERMINALES ASIGNADAS AL USUARIO Y COMPANIA
   */
  public addTerminalUser(): void {

    if (this.frmTermsByUser.valid) {

      //Si arreglan el evento esto codigo se puede eliminar
      this.terminalsByUser = this.terminals.filter(x => x.Assigned).map(element => {
        return {
          UserId: 0,
          TerminalId: element.Id,
          CompanyId: 0
        } as ITerminalsByUser
      });

      let terminalUser: IPPTerminalUser = {
        UserId: this.frmTermsByUser.controls['UserId'].value,
        CompanyId: this.frmTermsByUser.controls['CompanyId'].value,
        TerminalsByUser: this.terminalsByUser,
        TerminalDefaultCOL: this.terminals.find(x => x.Default && x.Currency === this.localCurrency.Id)?.Id ?? 0,
        TerminalDefaultUSD: this.terminals.find(x => x.Default && x.Currency !== this.localCurrency.Id)?.Id ?? 0,
      }

      this.overlayService.OnGet();
      this.termsByUserService.Post(terminalUser).pipe(
        finalize(() => this.overlayService.Drop())
      ).subscribe({
        next: (res) => {
          this.modalService.Continue({
            title: 'Asignación de terminales guardada correctamente',
            type: CLModalType.SUCCESS
          });
        },
        error: (err) => {
          this.modalService.Continue({
            title: 'Se produjo un error guardando la asignación de terminales',
            subtitle: GetError(err),
            type: CLModalType.ERROR
          });
        }
      });

    } else {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: 'Verfique que haya seleccionado el usuario y compañía.'
      });
    }

  }

}

