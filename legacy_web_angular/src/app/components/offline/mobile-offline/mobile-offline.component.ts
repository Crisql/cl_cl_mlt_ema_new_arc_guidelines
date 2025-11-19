import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {IPermissionbyUser} from "@app/interfaces/i-roles";
import {IActionButton} from "@app/interfaces/i-action-button";
import {DocumentSyncStatus, DocumentSyncTypes} from "@app/enums/enums";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ICLTableButton, MapDisplayColumns, MappedColumns} from "@clavisco/table";
import {CL_CHANNEL, ICLCallbacksInterface, ICLEvent, LinkerService, Register, Run, StepDown} from "@clavisco/linker";
import {finalize, Subscription} from "rxjs";
import {OverlayService} from "@clavisco/overlay";
import {AlertsService, CLNotificationType, CLToastType, ModalService, NotificationPanelService} from "@clavisco/alerts";
import {SharedService} from "@app/shared/shared.service";
import {SyncDocumentService} from "@app/services/sync-document.service";
import {LinkerEvent} from "@app/enums/e-linker-events";
import {CLPrint, GetError, Structures} from "@clavisco/core";
import {formatDate} from "@angular/common";
import {ISyncDocument, ISyncDocumentFilter, ISyncDocumentsPaged} from "@app/interfaces/i-sync-document";
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {ISyncDocumentDialogData} from "@app/interfaces/i-dialog-data";
import {DetailsComponent} from "@Component/offline/mobile-offline/details/details.component";
import {SyncDocumentStatusNamePipe} from "@app/pipes/sync-document-status-name.pipe";

@Component({
  selector: 'app-mobile-offline',
  templateUrl: './mobile-offline.component.html',
  styleUrls: ['./mobile-offline.component.scss']
})
export class MobileOfflineComponent implements OnInit, OnDestroy {

  /*Observables*/

  /*Lists*/
  permissions: IPermissionbyUser[] = []
  documentSyncStatus: { key: string, value: string }[] = Object.keys(DocumentSyncStatus).map((key: string) => {
    return {key: key, value: DocumentSyncStatus[key as keyof typeof DocumentSyncStatus]}
  })
  actionButtons: IActionButton[] = [];
  documentSyncTypes: { key: string, value: string }[] = Object.keys(DocumentSyncTypes).map((key: string) => {
    return {key: key, value: DocumentSyncTypes[key as keyof typeof DocumentSyncTypes]}
  })
  syncDocuments: ISyncDocument[] = [];

  /*Forms*/
  searchForm!: FormGroup;

  /*Table*/
  shouldPaginateRequest: boolean = false;
  documentsTableId: string = "LOG-EVENTS-TABLE";
  documentsMappedColumns!: MappedColumns;
  pageSizeOptions: number[] = [5, 10, 15];
  itemsPeerPage: number = 10;
  currentPage: number = 0;
  recordsCount: number = 0;
  hasPaginator: boolean = true;
  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };
  allSubscriptions: Subscription;
  documentsTableColumns: { [key: string]: string } = {
    DocumentKey: "Key del documento",
    CreatedBy: "Usuario",
    DocumentType: "Tipo de documento",
    CreatedDate: "Fecha sincronización",
    UpdateDate: "Último intento de creación en SAP",
    StatusName: "Estado"
  };
  buttons: ICLTableButton[] = [
    {
      Title: `Detalles`,
      Action: Structures.Enums.CL_ACTIONS.READ,
      Icon: `more`,
      Color: `primary`
    }
  ];

  constructor(
    @Inject('LinkerService') private linkerService: LinkerService,
    private overlayService: OverlayService,
    private alertsService: AlertsService,
    private modalService: ModalService,
    private activatedRoute: ActivatedRoute,
    private sharedService: SharedService,
    private matDialog: MatDialog,
    private router: Router,
    private formBuilder: FormBuilder,
    private syncDocumentService: SyncDocumentService,
    private syncDocumentStatusPipe: SyncDocumentStatusNamePipe
  ) {
    this.allSubscriptions = new Subscription();
    this.documentsMappedColumns = MapDisplayColumns({
      dataSource: this.syncDocuments,
      renameColumns: this.documentsTableColumns,
      ignoreColumns: [
        'Id',
        'UpdatedBy',
        'IsActive',
        'UserAssignId',
        'CommittedDate',
        'BackupsRequestAmount',
        'TransactionType',
        'TransactionStatus',
        'TransactionDetail',
        'DocEntry',
        'DocNum',
        'RawDocument',
        'UserAssign',
        'OfflineDate'
      ]
    });
  }

  ngOnInit(): void {
    this.OnLoad();
  }

  ngOnDestroy(): void {
    this.sharedService.SetActionButtons([]);
    this.allSubscriptions.unsubscribe();
  }

  private OnLoad(): void {
    this.InitializeForm();
    this.actionButtons = [
      {
        Key: 'SEARCH',
        MatIcon: 'search',
        Text: 'Buscar',
        MatColor: 'primary',
        DisabledIf: _form => _form!.invalid
      }
    ]

    Register<CL_CHANNEL>(LinkerEvent.ActionButton, CL_CHANNEL.OUTPUT, this.OnActionButtonClicked, this.callbacks);
    Register<CL_CHANNEL>(this.documentsTableId, CL_CHANNEL.OUTPUT, this.OnSyncDocumentTableActionActivated, this.callbacks);

    this.allSubscriptions.add(
      this.linkerService.Flow()?.pipe(
        StepDown<CL_CHANNEL>(this.callbacks),
      ).subscribe({
        next: callback => Run(callback.Target, callback, this.callbacks.Callbacks),
        error: error => CLPrint(error, Structures.Enums.CL_DISPLAY.ERROR)
      })
    );

    this.ReadQueryParameters();
  }

  public OnActionButtonClicked(_actionButton: IActionButton): void {

    switch (_actionButton.Key) {
      case 'SEARCH':
        this.SearchSyncDocuments();
        break;
    }
  }

  private InitializeForm(): void {
    this.searchForm = this.formBuilder.group({
      From: [new Date(), Validators.required],
      To: [new Date(), Validators.required],
      Status: [''],
      Type: [''],
      Filter: ['']
    });
  }

  private InflateTable(): void {
    const NEW_TABLE_STATE = {
      CurrentPage: this.currentPage,
      ItemsPeerPage: this.itemsPeerPage,
      Records: this.syncDocuments,
      RecordsCount: this.recordsCount
    };
    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Target: this.documentsTableId,
      Data: JSON.stringify(NEW_TABLE_STATE)
    } as ICLEvent);
  }

  SearchSyncDocuments(): void {
    let searchData = {
      ...this.searchForm.getRawValue(),
      Skip: this.currentPage,
      Take: this.itemsPeerPage
    } as ISyncDocumentFilter;

    this.overlayService.OnPost();
    this.syncDocumentService.GetFiltered<ISyncDocumentsPaged>(searchData.Filter, searchData.Status, searchData.Type, searchData.From, searchData.To, searchData.Skip, searchData.Take).pipe(
      finalize(() => this.overlayService.Drop())
    ).subscribe({
      next: (callback) => {
        this.syncDocuments = (callback.Data.SyncDocuments || []).map(doc => {
          return {
            ...doc,
            DocumentType: this.DocumentTypeDescription(doc.DocumentType),
            CreatedDate: formatDate(doc.CreatedDate, "d/MM/y h:mm:ss a", 'en'),
            UpdateDate: (doc.UpdateDate) ? formatDate(doc.UpdateDate, "d/MM/y h:mm:ss a", 'en') : "N/A",
            StatusName: this.syncDocumentStatusPipe.transform(doc.TransactionStatus)
          }
        });
        this.recordsCount = (callback.Data.Count || 0);
        this.InflateTable();
      }
    });
  }

  DocumentTypeDescription(_event: string): string {
    switch (_event) {
      case DocumentSyncTypes.Invoice:
        return 'Facturas';
      case DocumentSyncTypes.InvoiceWithPayment:
        return 'Factura + Pago';
      case DocumentSyncTypes.SaleQuotation:
        return 'Cotizaciones';
      case DocumentSyncTypes.SaleOrder:
        return 'Orden de compra';
      case DocumentSyncTypes.IncomingPayment:
        return 'Pagos recibidos';
      default:
        return 'Todos';
    }
  }

  DocumentStatusDescription(_event: string): string {
    switch (_event) {
      case DocumentSyncStatus.Success:
        return 'Completado';
      case DocumentSyncStatus.Errors:
        return 'Con errores';
      case DocumentSyncStatus.InQueue:
        return 'En cola';
      case DocumentSyncStatus.Processing:
        return 'Procesando';
      default:
        return 'Todos';
    }
  }

  ReadQueryParameters(): void {
    this.allSubscriptions.add(this.activatedRoute.queryParams.subscribe(params => {
      if (params['dialog']) {
        let recordId: number = params['recordId'] ? +(params['recordId']) : 0;

        if (params['dialog'] === 'details' && !recordId) {
          this.alertsService.Toast({type: CLToastType.ERROR, message: 'Debe enviar el parametro "recordId"'});
        } else {
          this.OpenDetailsDialog(recordId);
        }
      }
    }));
  }

  OpenDetailsDialog(_id: number): void {
    this.matDialog.open(DetailsComponent, {
      maxWidth: '100vw',
      minWidth: '75vw',
      maxHeight: 'calc(100vh - 20px)',
      disableClose: true,
      data: {
        Id: _id
      } as ISyncDocumentDialogData
    })
      .afterClosed()
      .subscribe({
        next: (result) => {
          this.router.navigate([this.sharedService.GetCurrentRouteSegment()], {relativeTo: this.activatedRoute});
        }
      });
  }

  /**
   * Method to view document details
   * @param _event - Event emitted in the table button when selecting a line
   * @constructor
   */
  OnSyncDocumentTableActionActivated = (_event: ICLEvent): void => {
    if (_event.Data) {
      const BUTTON_EVENT = JSON.parse(_event.Data);
      const ACTION_SYNC_DOCUMENT = JSON.parse(BUTTON_EVENT.Data) as ISyncDocument;

      switch (BUTTON_EVENT.Action) {
        case Structures.Enums.CL_ACTIONS.READ:
          this.router.navigate([this.sharedService.GetCurrentRouteSegment()], {
            relativeTo: this.activatedRoute, queryParams: {
              dialog: 'details',
              recordId: ACTION_SYNC_DOCUMENT.Id
            }
          });
          break;
      }
    }
  }
}
