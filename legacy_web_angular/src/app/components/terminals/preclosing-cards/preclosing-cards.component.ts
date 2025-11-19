import {Component, Inject, OnInit} from '@angular/core';
import {IStructures} from "@app/interfaces/i-structures";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {concatMap, filter, finalize, forkJoin, map, Subscription} from "rxjs";
import {IActionButton} from "@app/interfaces/i-action-button";
import {ICLTableButton, MapDisplayColumns, MappedColumns, RowColors} from "@clavisco/table";
import {CL_CHANNEL, ICLCallbacksInterface, LinkerService, Run, StepDown} from "@clavisco/linker";
import {CLPrint, GetError, Structures} from "@clavisco/core";
import {ActivatedRoute} from "@angular/router";
import {OverlayService} from "@clavisco/overlay";
import {AlertsService, CLModalType, CLToastType, ModalService} from "@clavisco/alerts";
import {IClosingCardsResolvedData} from "@app/interfaces/i-resolvers";
import {ITerminalSearchFilter} from "@app/interfaces/i-document-type";
import {formatDate} from "@angular/common";
import {IPinpadTerminal} from "@app/interfaces/i-terminals";
import {BalancesService} from "@app/services/balances.service";
import {ICLTerminal, ICommittedTransaction, IPPCashDeskClosing} from "@app/interfaces/i-pp-transactions";
import {PPTransactionService} from "@app/services/pp-transaction.service";
import {FormatSalesAmount} from "@app/shared/common-functions";
import {StructuresService} from "@app/services/structures.service";
import {TerminalUsersService} from "@app/services/terminal-users.service";

@Component({
  selector: 'app-preclosing-cards',
  templateUrl: './preclosing-cards.component.html',
  styleUrls: ['./preclosing-cards.component.scss']
})
export class PreclosingCardsComponent implements OnInit {
  TransactionType!: IStructures[];
  searchForm!: FormGroup;
  documents!: ICommittedTransaction[];
  terminals!: IPinpadTerminal[];
  actionButtons!: IActionButton[];
  shouldPaginateRequest: boolean = false;
  documentsTableId: string = "DOCS-TABLE";
  hasStandardHeaders: boolean = true;
  shouldSplitPascal: boolean = false;
  docTbMappedColumns!: MappedColumns;
  hasItemsSelection: boolean = false;
  buttons: ICLTableButton[] = [];

  docTbColumns: { [key: string]: string } = {
    Id: "Id",
    ACQ: "Interno",
    TerminalCode: 'Terminal',
    TransactionType: 'Transacción',
    CreationDate: "Fecha Creación",
    AuthorizationNumber: "Número autorización",
    ReferenceNumber: "Número referencia",
    InvoiceNumber: "Factura",
    SalesAmount: "Monto"
  }
  //#endregion

  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };
  allSubscriptions: Subscription;

  constructor(
    public fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private overlayService: OverlayService,
    private alertsService: AlertsService,
    private balancesService: BalancesService,
    @Inject("LinkerService") private linkerService: LinkerService,
    private ppTransactionService: PPTransactionService,
    private structuresService: StructuresService,
    private terminalUsersService: TerminalUsersService,
    private modalService: ModalService
  ) {
    this.allSubscriptions = new Subscription();
    this.docTbMappedColumns = MapDisplayColumns({
      dataSource: this.documents,
      renameColumns: this.docTbColumns,
      ignoreColumns: ['HostDate', 'BlurredBackground', 'DocEntry', 'TotalTransactions', 'RowColor']
    });
  }

  ngOnInit(): void {
    this.InitVariables();
    this.HandleResolvedData();
  }

  HandleResolvedData(): void {
    this.allSubscriptions.add(
      this.activatedRoute.data.subscribe({
        next: (data) => {
          const resolvedData = data['resolvedData'] as IClosingCardsResolvedData;

          if (resolvedData) {
            this.terminals = resolvedData.Terminals;
            this.TransactionType = resolvedData.ClosingCardType;
          }
        }
      })
    );
  }

  InitVariables(): void {
    this.TransactionType = [];
    this.actionButtons = [
      {
        Key: 'SEARCH',
        MatColor: 'primary',
        MatIcon: 'search',
        Text: 'Buscar',
        DisabledIf: _form => _form?.invalid || false
      },
      {
        Key: 'ADD',
        MatColor: 'primary',
        MatIcon: 'save',
        Text: 'Crear',
        DisabledIf: _form => _form?.invalid || false
      },
      {
        Key: 'CLEAN',
        MatIcon: 'mop',
        Text: 'Limpiar'
      }
    ];
    this.documents = [];
    this.LoadForm();


    this.allSubscriptions.add(
      this.linkerService.Flow()?.pipe(
        StepDown<CL_CHANNEL>(this.callbacks),
      ).subscribe({
        next: callback => Run(callback.Target, callback, this.callbacks.Callbacks),
        error: error => CLPrint(error, Structures.Enums.CL_DISPLAY.ERROR)
      })
    );
  }

  LoadForm(): void {
    this.searchForm = this.fb.group({
      Terminal: ['', Validators.required],
      TransactionType: [null, Validators.required],
      DateFrom: [new Date(), Validators.required],
      DateTo: [new Date(), Validators.required],
    });


  }

  OnActionButtonClicked(_actionButton: IActionButton): void {
    switch (_actionButton.Key) {
      case 'SEARCH':
        this.documents = [];
        this.InflateTable();
        this.GetDocuments();
        break;
      case 'CLEAN':
        this.Clear();
        break;
      case 'ADD':
        this.documents = [];
        this.InflateTable();
        if (this.searchForm.controls['TransactionType'].value === 'BALANCE') {
          this.SaveBalance();
        } else {
          this.SavePreBalance()
        }
        break;
    }
  }

  public Clear(): void {
    this.overlayService.OnGet();
    forkJoin({
      Terminals: this.terminalUsersService.GetTerminals<IPinpadTerminal[]>(),
      ClosingCardType: this.structuresService.Get('ClosingCard')
    })
      .pipe(
        finalize(() => this.overlayService.Drop())
      ).subscribe({
      next: (callback) => {
        this.terminals = callback.Terminals.Data;
        this.TransactionType = callback.ClosingCardType.Data;
        this.searchForm.patchValue({
          Terminal: '',
          TransactionType: null,
          DateFrom: new Date(),
          DateTo: new Date(),
        });
        this.documents = [];
        this.InflateTable();
        this.alertsService.Toast({type: CLToastType.SUCCESS, message: 'Componentes requeridos obtenidos'})
      },
      error: (err) => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
      }
    });
  }

  /**
   * Method to obtain pinpad transactions
   * @constructor
   */
  GetDocuments(): void {
    let filter: ITerminalSearchFilter = this.searchForm.value as ITerminalSearchFilter;
    let transactionType = filter.TransactionType === 'BALANCE' ? 'BA' : 'PR';
    this.overlayService.OnGet();
    this.allSubscriptions.add(
      this.balancesService.Get(filter.Terminal.TerminalId, transactionType, filter.DateFrom, filter.DateTo)
        .pipe(finalize(() => this.overlayService.Drop()))
        .subscribe({
          next: (callback) => {
            this.documents = callback.Data;
            this.MapTotalTransacion();
          }
        }));
  }

  InflateTable(): void {
    const NEW_TABLE_STATE = {
      Records: this.documents,
      RecordsCount: this.documents.length,
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Target: this.documentsTableId,
      Data: JSON.stringify(NEW_TABLE_STATE)
    });
  }

  SaveBalance(): void {
    this.overlayService.OnPost();

    let filterSearchFilter: ITerminalSearchFilter = this.searchForm.value as ITerminalSearchFilter;

    if (!filterSearchFilter.Terminal) {
      this.alertsService.Toast({
        message: 'No se encontró configuración del terminal solicitado',
        type: CLToastType.INFO
      });
      return;
    }
    const CL_TERMINAL = {
      TerminalId: filterSearchFilter.Terminal.TerminalId
    } as ICLTerminal;


    this.ppTransactionService.Balance(CL_TERMINAL)
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
        finalize(() => this.overlayService.Drop()))
      .subscribe({
        next: (callback) => {
          this.modalService.Continue({
            title: 'Cierre creado correctamente',
            type: CLModalType.SUCCESS
          });

          this.documents = callback.Data;
          this.MapTotalTransacion();
        },
        error: (err) => {
          this.modalService.Continue({
            title: 'Se produjo un error creando el cierre',
            subtitle: GetError(err),
            type: CLModalType.ERROR
          });

        }
      });
  }

  SavePreBalance(): void {
    this.overlayService.OnPost();

    let filterSearchFilter: ITerminalSearchFilter = this.searchForm.value as ITerminalSearchFilter;

    if (!filterSearchFilter.Terminal) {
      this.alertsService.Toast({
        message: 'No se encontró configuración del terminal solicitado',
        type: CLToastType.INFO
      });
      return;
    }

    const CL_TERMINAL = {
      TerminalId: filterSearchFilter.Terminal.TerminalId
    } as ICLTerminal;

    this.ppTransactionService.PreBalance(CL_TERMINAL)
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
            Type: 'PR',
            TerminalId: CL_TERMINAL.TerminalId,
            IsApproved: !!callback.Data,
          } as IPPCashDeskClosing;
        }),
        concatMap(callback => this.balancesService.Balances(callback)),
        finalize(() => this.overlayService.Drop()))
      .subscribe({
        next: (callback) => {
          this.documents = callback.Data;
          this.MapTotalTransacion();
          this.modalService.Continue({
            title: 'Pre cierre creado correctamente',
            type: CLModalType.SUCCESS
          });
        },
        error: (err) => {
          this.modalService.Continue({
            title: 'Se produjo un error creando el pre cierre',
            subtitle: GetError(err),
            type: CLModalType.ERROR
          });
        }
      });

  }

  MapTotalTransacion(): void {

    let root = 0;
    let updatedValues: number[] = [];
    for (let c = 0; c < this.documents.length; c++) {
      for (let y = 0; y < this.documents.length; y++) {
        if ((this.documents[c].ACQ === this.documents[y].ACQ) && !updatedValues.find(u => u === this.documents[c].ACQ)) {
          updatedValues.push(+(this.documents[c].ACQ));
          let lastNode = {} as ICommittedTransaction;
          let totalTransactions = 0;
          if ((root % 2) === 0) {
            this.documents.forEach(x => {
              if (x.ACQ === this.documents[c].ACQ) {
                x.BlurredBackground = 'Y';
                x.TotalTransactions = 0;
                lastNode = x;
                totalTransactions += +(+x.SalesAmount).toFixed(2);
              }
            });
          } else {
            this.documents.forEach(x => {
              if (x.ACQ === this.documents[c].ACQ) {
                x.BlurredBackground = 'N';
                x.TotalTransactions = 0;
                lastNode = x;
                totalTransactions += +x.SalesAmount;
              }
            });
          }

          let TMP = this.documents.find(x => x.ACQ === lastNode.ACQ) as ICommittedTransaction;
          let MITEM = {...TMP};
          MITEM.AuthorizationNumber = '';
          MITEM.TerminalCode = '';
          MITEM.ReferenceNumber = '';
          MITEM.TransactionType = '';
          MITEM.ACQ = '';
          MITEM.CreationDate = '';
          MITEM.InvoiceNumber = 'TOTAL';
          MITEM.SalesAmount = totalTransactions.toString();

          this.documents.splice(this.documents.findIndex(x => x.ACQ === lastNode.ACQ), 0,
            {...MITEM});
          root++;
        }
      }
    }

    this.documents = this.documents.reverse();

    this.documents = this.documents.map((x, index) => {
      return {
        ...x,
        Id: index + 1,
        CreationDate: x.CreationDate ? formatDate(x.CreationDate, 'dd-MM-yyyy hh:mm:ss a', 'en') : '',
        TransactionType: x.TransactionType === '' ? '' : x.TransactionType === 'BA' ? 'BALANCE' : 'PRE_BALANCE',
        SalesAmount: FormatSalesAmount(+(x.SalesAmount)),
        RowColor: x.BlurredBackground == 'Y' ? RowColors.SkyBlue : ''
      }
    });

    this.InflateTable();
  }

  ngOnDestroy(): void {
    this.allSubscriptions.unsubscribe();
  }

}
