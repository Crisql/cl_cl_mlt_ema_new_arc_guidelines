import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {AlertsService, CLModalType, CLToastType, ModalService, NotificationPanelService} from "@clavisco/alerts";
import {CL_CHANNEL, ICLCallbacksInterface, ICLEvent, LinkerService, Register, Run, StepDown} from "@clavisco/linker";
import {
  catchError,
  concatMap,
  filter,
  finalize,
  forkJoin,
  from, last,
  map,
  Observable,
  of,
  Subscription,
  switchMap,
} from "rxjs";
import {IDocumentLine, ILinesGoodReceip} from "@app/interfaces/i-items";

import {DropdownList, ICLTableButton, MapDisplayColumns, MappedColumns, RowColors} from "@clavisco/table";
import {CLPrint, DownloadBase64File, GetError, Repository, Structures} from "@clavisco/core";
import {PurchasesDocumentService} from "@app/services/purchases-document.service";
import {IDocument} from "@app/interfaces/i-sale-document";
import {OverlayService} from "@clavisco/overlay";
import {ISuccessSalesInfo} from "@app/interfaces/i-success-sales-info";
import {SuccessSalesModalComponent} from "@Component/sales/document/success-sales-modal/success-sales-modal.component";
import {DropdownElement, IInputColumn, IRowByEvent} from "@clavisco/table/lib/table.space";
import {ICreateGoodReceiptDialogData} from "@app/interfaces/i-dialog-data";
import {IUdf, IUdfContext, IUdfDevelopment} from "@app/interfaces/i-udf";
import {UdfsService} from "@app/services/udfs.service";
import {environment} from "@Environment/environment";
import {IUserToken} from "@app/interfaces/i-token";
import {StorageKey} from "@app/enums/e-storage-keys";
import {
  GetIndexOnPagedTable,
  GetUdfsLines,
  MappingUdfsDevelopment,
  MappingUdfsLines
} from "@app/shared/common-functions";
import {IUniqueId, IUserDev, ULineMappedColumns} from "@app/interfaces/i-document-type";
import {IPermissionbyUser} from "@app/interfaces/i-roles";
import {CommonService} from "@app/services/common.service";
import {FormControl} from "@angular/forms";
import {ICurrencies} from "@app/interfaces/i-currencies";
import {IActionButton} from "@app/interfaces/i-action-button";
import {SharedService} from "@app/shared/shared.service";
import {DynamicsUdfPresentation} from "@clavisco/dynamics-udfs-presentation";
import {IStockWarehouses} from "@app/interfaces/i-stock-warehouses";
import {BinLocationsService} from "@app/services/bin-locations.service";
import {IDocumentLinesBinAllocations} from "@app/interfaces/i-serial-batch";
import {IDocumentAttachment} from "@app/interfaces/i-document-attachment";
import {formatDate} from "@angular/common";
import {IAttachments2Line} from "@app/interfaces/i-business-partner";
import {AttachmentsService} from "@app/services/Attachments.service";

@Component({
  selector: 'app-inventoy-entry',
  templateUrl: './inventoy-entry.component.html',
  styleUrls: ['./inventoy-entry.component.scss']
})
export class InventoyEntryComponent implements OnInit {
  lines: ILinesGoodReceip[] = [];
  actionButtons: IActionButton[] = [];
  User!: string;
  uniqueId: string = '';
  Comments: FormControl = new FormControl();
  Total: number = 0;
  TO_FIXED_TOTALDOCUMENT: string = '';
  //#region @clavisco/table Configuration
  shouldPaginateRequest: boolean = false;
  InventorytableId: string = 'INVENTORY-TABLE';
  hasStandardHeaders: boolean = true;
  shouldSplitPascal: boolean = false;
  hasItemsSelection: boolean = false;
  dropdownColumns: string[] = ['BinAbsEntry'];
  dropdownDiffBy: string = 'IdDiffBy';
  dropdownDiffList!: DropdownList;
  location: DropdownElement[] = [];
  headerTableColumns: { [key: string]: string } = {
    Id: '#',
    ItemCode: 'Código',
    ItemDescription: 'Descripción',
    Solicited: 'Solicitado',
    OnHand: 'Disponible',
    Quantity: 'Faltante',
    AVGPrice: 'Precio promedio',
    UnitPrice: 'Último p. compra',
    WhsName: 'Almacén',
    BinAbsEntry: 'Ubicación',
    Total: 'Total'
  };
  InputColumns: IInputColumn[] = [
    {ColumnName: 'Quantity', FieldType: 'number'},
    {ColumnName: 'UnitPrice', FieldType: 'number'}];
  //mapped Table
  lineMappedColumns!: MappedColumns;
  lineMappedDisplayColumns: ULineMappedColumns<IDocumentLine, IPermissionbyUser> = {
    dataSource: [] as ILinesGoodReceip[],
    inputColumns: this.InputColumns,
    renameColumns: this.headerTableColumns,
    stickyColumns: [
      {Name: "Total", FixOn: 'right'},
      {Name: 'Options', FixOn: 'right'}
    ],
    ignoreColumns: ['DeviationStatus', 'DistNumber', 'UoMEntry', 'Warehouse', 'TaxCode', 'TaxOnlyCheckbox', 'DiscountPercent', 'CostingCode', 'InventoryItem', 'PurchaseItem', 'SalesItem', 'ItemName', 'UnitPriceFC',
      'IsCommited', 'OnOrder', 'WhsCode', 'ItemClass', 'ForeignName', 'Frozen', 'Series', 'U_IVA',
      'BarCode', 'ItemBarCodeCollection', 'ItemPrices', 'Rate', 'TotalFC',
      'LineNum', 'BaseLine', 'BaseEntry', 'BaseType', 'UnitPriceCOL', 'TotalCOL', 'LastPurchasePrice', 'UoMMasterData',
      'ManBtchNum', 'ManSerNum', 'DocumentLinesBinAllocations', 'SysNumber', 'SerialNumbers', 'BatchNumbers',
      'TotalDescFC', 'TotalDescCOL', 'TotalImpFC', 'TotalImpCOL', 'WarehouseCode', 'TaxRate', 'TaxOnly', 'IdUomEntry', 'LineTotal', 'Udfs', 'Message', 'RowColor','ManBinLocation', 'IdDiffBy','BinCode']

  }

  //#region Udfs
  udfsDevelopment: IUdfDevelopment[] = [];
  udfsValue: IUdf[] = [];
  UdfsId: string = 'UdfOIGN';
  Title: string = 'Udfs';
  ApiUrl: string = environment.apiUrl;
  DBODataEndPoint: string = 'OIGN';
  Token: string = Repository.Behavior.GetStorageObject<IUserToken>(StorageKey.Session)?.access_token || "";
  udfsLines: IUdfContext[] = [];
  isVisible: boolean = true; //Mostrar fielset udfs configurados

  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };
  allSubscriptions: Subscription;
  documentAttachment: IDocumentAttachment = {
    AbsoluteEntry: 0,
    Attachments2_Lines: []
  } as IDocumentAttachment;
  attachmentFiles: File[] = [];
  attachmentTableId: string = "InventoryEntryDocumentAttachmentTableId";
  attachmentLineMappedColumns!: MappedColumns;
  attachmentLineMappedColumnsArgs = {
    dataSource: [],
    renameColumns: {
      Id: '#',
      FileName: 'Nombre archivo',
      AttachmentDate: 'Fecha del anexo',
      FreeText: 'Texto libre'
    },
    stickyColumns: [
      {Name: 'Options', FixOn: 'right'}
    ],
    inputColumns: [{ColumnName: 'FreeText', FieldType: 'text'}],
    ignoreColumns: ['AbsoluteEntry', 'FileExtension', 'Override', 'SourcePath', 'LineNum']
  };
  attachmentTableButtons: ICLTableButton[] = [
    {
      Title: `Eliminar`,
      Action: Structures.Enums.CL_ACTIONS.DELETE,
      Icon: `delete`,
      Color: `primary`,
      Data: ''
    },
    {
      Title: `Descargar`,
      Action: Structures.Enums.CL_ACTIONS.OPTION_1,
      Icon: `download`,
      Color: `primary`,
      Data: ''
    }
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ICreateGoodReceiptDialogData,
    private matDialogRef: MatDialogRef<InventoyEntryComponent>,
    private alertsService: AlertsService,
    @Inject('LinkerService') private linkerService: LinkerService,
    private purchaseDocumentService: PurchasesDocumentService,
    private overlayService: OverlayService,
    private matDialog: MatDialog,
    private udfsService: UdfsService,
    private commonService: CommonService,
    private modalService: ModalService,
    private sharedService: SharedService,
    private binLocationsService: BinLocationsService,
    private attachmentService: AttachmentsService,
  ) {
    this.lineMappedColumns = MapDisplayColumns(this.lineMappedDisplayColumns);
    this.allSubscriptions = new Subscription();
    this.attachmentLineMappedColumns = MapDisplayColumns(this.attachmentLineMappedColumnsArgs as any);
  }

  ngOnDestroy(): void {
    this.sharedService.SetActionButtons([]);
    this.allSubscriptions.unsubscribe();
  }

  ngOnInit(): void {
    this.RegisterTableEvents();
    this.actionButtons = [
      {
        Key: 'ADD',
        Text: 'Crear',
        MatIcon: 'save',
        MatColor: 'primary'
      },
      {
        Key: 'CANCEL',
        Text: 'Cancelar',
        MatIcon: 'cancel',
        MatColor: 'primary'
      }
    ];
    this.TO_FIXED_TOTALDOCUMENT = `1.${this.data?.DecimalTotalDocument || 0}-${this.data?.DecimalTotalDocument || 0}`;
    this.User = Repository.Behavior.GetStorageObject<IUserToken>(StorageKey.Session)?.UserEmail || '';
    this.uniqueId = this.commonService.GenerateDocumentUniqueID();
    this.lines = this.data.Lines || [];


    this.Comments.setValue(this.data.Comments);

    this.Total = +(this.lines
      ?.reduce(
        (a, b) =>
          a +
          (b.UnitPrice * b.Quantity - b.UnitPrice * b.Quantity * (b.DiscountPercent / 100) +
            (b.UnitPrice * b.Quantity -
              b.UnitPrice * b.Quantity * (b.DiscountPercent / 100)) *
            (b.TaxRate / 100) || 0),
        0
      )
      .toFixed(this.data.DecimalTotalDocument));

    this.LoadData();

  }

  /**
   * Initial load for modal
   * @constructor
   */
  public LoadData(): void {
    this.overlayService.OnGet();

    forkJoin({
      UdfsLines: this.udfsService.Get<IUdfContext[]>('OIGN', true, true)
        .pipe(catchError(res => of(null))),
      UdfsDevelopment: this.udfsService.GetUdfsDevelopment('OIGN')
        .pipe(catchError(res => of(null))),

    })
      .pipe(
        switchMap(res => {
          this.udfsLines = res.UdfsLines?.Data ?? [];
          this.udfsDevelopment = res.UdfsDevelopment?.Data ?? [];

          if (this.udfsLines && this.udfsLines?.length > 0) {
            MappingUdfsLines(this.udfsLines, this.headerTableColumns, this.InputColumns);
            this.lineMappedDisplayColumns.renameColumns = this.headerTableColumns;
            this.lineMappedColumns = MapDisplayColumns(this.lineMappedDisplayColumns);
          }

          if (this.lines.some(x => x.ManBinLocation && !x.BinCode)) {

            return from(this.lines?.filter(x => x.ManBinLocation && !x.BinCode)).pipe(
              concatMap(item =>
                this.binLocationsService.GetLocationForTransfer(item.WarehouseCode)
                  .pipe(
                    switchMap(callback => {
                      if (callback && callback.Data) {
                        this.lines.forEach((line, index) => {
                          if (line.ItemCode === item.ItemCode && line.WarehouseCode === item.WarehouseCode && item.ManBinLocation && !item.BinCode) {

                            const dropLocation: DropdownElement[] = callback.Data.map(element => ({
                              key: element.AbsEntry,
                              value: element.BinCode,
                              by: line.IdDiffBy,
                            }));

                            this.location.push(...dropLocation);
                          }
                        });
                        this.dropdownDiffList = {
                          BinAbsEntry: this.location as DropdownElement[],
                        };
                      }
                      return of(null);
                    })
                  )
              ),
              last(),
            )
          } else {
            return of(null)
          }
        }),
        finalize(() => this.overlayService.Drop())
      ).subscribe({
      next: (responses) => {
        this.ValidLocation();
        this.InflateTable();
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

  private RegisterTableEvents(): void {
    Register<CL_CHANNEL>(this.InventorytableId, CL_CHANNEL.OUTPUT_3, this.GetRecordsEditField, this.callbacks);
    Register(this.UdfsId, CL_CHANNEL.OUTPUT, this.OnClickUdfEvent, this.callbacks);
    Register<CL_CHANNEL>(this.UdfsId, CL_CHANNEL.OUTPUT_2, this.ContentUdf, this.callbacks);
    Register<CL_CHANNEL>(this.attachmentTableId, CL_CHANNEL.OUTPUT, this.OnAttachmentTableButtonClicked, this.callbacks);
    Register<CL_CHANNEL>(this.attachmentTableId, CL_CHANNEL.OUTPUT_3, this.OnAttachmentTableRowModified, this.callbacks);

    this.allSubscriptions.add(
      this.linkerService.Flow()?.pipe(
        StepDown<CL_CHANNEL>(this.callbacks),
      ).subscribe({
        next: callback => Run(callback.Target, callback, this.callbacks.Callbacks),
        error: error => CLPrint(error, Structures.Enums.CL_DISPLAY.ERROR)
      })
    );
  }

  public OnClickUdfEvent = (_event: ICLEvent): void => {
    if (!this.data.GoodsReceiptAccount || this.data.GoodsReceiptAccount == "") {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: `Cuenta no configurada para ajuste de inventario`
      });

      return;
    }
    const CORRUPTED_QUANTITY = this.lines.find((x) => x.Quantity <= 0);

    if (CORRUPTED_QUANTITY) {

      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: `Cantidad del producto ${CORRUPTED_QUANTITY.ItemCode}, debe ser mayor a 0`
      });

      return;
    }
    if (this.Total === 0) {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: `Total del documento debe ser mayor a 0`
      });
      return;
    }

    let indexBin = this.lines.findIndex(x => (!x.DocumentLinesBinAllocations || x.DocumentLinesBinAllocations.length === 0) && x.ManBinLocation === 'Y');

    if (indexBin >= 0) {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: `El ítem en la línea ${(indexBin + 1)} es manejado por ubicación, seleccione la ubicación.`
      });

      return ;
    }


    const CORRUPTED_ITEM = this.lines.find((x) => x.UnitPrice === 0);

    if (CORRUPTED_ITEM) {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: `El precio del producto "${CORRUPTED_ITEM.ItemCode}" no puede ir en 0.`
      });
      return;
    }
    const CORRUPTED_LINES = this.lines.find((i) => i.DeviationStatus == 0);

    if (CORRUPTED_LINES) {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: `"Artículo ${CORRUPTED_LINES.ItemCode} - ${CORRUPTED_LINES.ItemDescription} que no puede ser procesado ya que cuentan con una desviación: ${CORRUPTED_LINES.Message}. `
      });
      return;
    }

    this.udfsValue = JSON.parse(_event.Data) as IUdfContext[];

    let document = {} as IDocument;
    document.DocumentLines = this.lines;
    document.DocumentLines = this.lines.map(x => {
      return {
        ...x, Udfs: GetUdfsLines(x, this.udfsLines),
        AccountCode: this.data.GoodsReceiptAccount
      } as IDocumentLine
    });
    document.Comments = this.data.Comments;
    document.Udfs = this.udfsValue;
    this.SetUdfsDevelopment();

    this.overlayService.OnPost();
    this.purchaseDocumentService.Post('InventoryGenEntries', document, this.documentAttachment, this.attachmentFiles).pipe(
      map(res => {
        this.overlayService.Drop();
        return {
          DocEntry: res.Data.DocEntry,
          DocNum: res.Data.DocNum,
          NumFE: '',
          CashChange: 0,
          CashChangeFC: 0,
          Title: 'Entrada',
        } as ISuccessSalesInfo;
      }),
      switchMap(res => this.OpenDialogSuccessSales(res)),
      finalize(() => {
        this.overlayService.Drop();
      })
    ).subscribe({
      next: (callback) => {
        this.matDialogRef.close(this.lines)
      },
      error: (err) => {
        this.modalService.Continue({
          title: 'Se produjo un error creando la entrada',
          subtitle: GetError(err),
          type: CLModalType.ERROR
        });
      }
    });
  }

  public OnActionButtonClicked(_event: IActionButton): void {
    switch (_event.Key) {
      case 'ADD':
        this.Save();
        break;
      case 'CANCEL':
        this.matDialogRef.close();
        break;
    }
  }

  public GetRecordsEditField = (_event: ICLEvent): void => {
    try {
      let ALL_RECORDS = JSON.parse(_event.Data) as IRowByEvent<ILinesGoodReceip>;
      if (+(ALL_RECORDS.Row.Quantity) <= 0 || +(ALL_RECORDS.Row.UnitPrice) < 0) {
        this.InflateTable();
        return;
      }

      let INDEX = GetIndexOnPagedTable(ALL_RECORDS.ItemsPeerPage, ALL_RECORDS.RowIndex, ALL_RECORDS.CurrentPage + 1);

      this.lines[INDEX] = ALL_RECORDS.Row;

      if (ALL_RECORDS.EventName === 'Dropdown') {


        let LocationSelected = this.location.find(x => x.key === ALL_RECORDS.Row.BinAbsEntry);

        let Location: IDocumentLinesBinAllocations[] = [];

        Location = [{
          SerialAndBatchNumbersBaseLine: 0,
          BinAbsEntry: LocationSelected?.key,
          Quantity: ALL_RECORDS.Row.Quantity,
          Stock: ALL_RECORDS.Row.OnHand
        } as IDocumentLinesBinAllocations];

        this.lines[INDEX].BinCode = (LocationSelected?.value || '').toString();

        this.lines[INDEX].DocumentLinesBinAllocations = Location;

      }

      ALL_RECORDS.Row.DocumentLinesBinAllocations && ALL_RECORDS.Row.DocumentLinesBinAllocations?.length > 0 ? ALL_RECORDS.Row.DocumentLinesBinAllocations[0].Quantity = ALL_RECORDS.Row.Quantity : [];


      let unitPrice = +(this.lines[INDEX].UnitPrice);
      let taxRate = this.lines[INDEX].TaxRate;
      let discount = +(this.lines[INDEX].DiscountPercent);
      let cant = +(this.lines[INDEX].Quantity);

      this.lines[INDEX].Total =
        +(((unitPrice * cant) - (unitPrice * cant * (discount / 100)) +
          ((unitPrice * cant) -
            (unitPrice * cant * (discount / 100))) *
          (taxRate / 100) || 0).toFixed(this.data.DecimalTotalDocument));


      this.Total = +(this.lines
        .reduce(
          (a, b) =>
            a +
            (b.UnitPrice * b.Quantity - b.UnitPrice * b.Quantity * (b.DiscountPercent / 100) +
              (b.UnitPrice * b.Quantity -
                b.UnitPrice * b.Quantity * (b.DiscountPercent / 100)) *
              (b.TaxRate / 100) || 0),
          0
        )
        .toFixed(this.data.DecimalTotalDocument));

      this.InflateTable();

    } catch (error) {

    }
  }

  public GetSymbol(): string {
    return this.data.Currencies?.filter(c => c.Id !== '##').find(c => c.Id === this.data.DocCurrency)!.Symbol;
  }

  public ValidLocation(): void {
    this.lines.forEach((line, index) => {

      if (line.ManBinLocation && line.BinCode && line.DocumentLinesBinAllocations && line.DocumentLinesBinAllocations?.length > 0) {

        this.lines[index].BinAbsEntry = line.DocumentLinesBinAllocations[0].BinAbsEntry;

        const dropLocation: DropdownElement[] = line.DocumentLinesBinAllocations.map(element => ({
          key: element.BinAbsEntry,
          value: line.BinCode,
          by: line.IdDiffBy,
        }));

        this.location.push(...dropLocation);
      }
    });

    this.dropdownDiffList = {
      BinAbsEntry: this.location as DropdownElement[],
    };

  }
  public InflateTable(): void {
    this.lines.forEach((x, index) => {
      x.Id = index + 1;
      x.RowMessage = x.DeviationStatus == 0 ? x.Message : ''
      x.RowColor = x.DeviationStatus == 0 ? RowColors.BeigePink : ''
    });

    const NEXT_TABLE_STATE = {
      CurrentPage: 0,
      ItemsPeerPage: 5,
      Records: this.lines,
      RecordsCount: this.lines.length,
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(NEXT_TABLE_STATE),
      Target: this.InventorytableId
    });
  }

  public Save(): void {
    this.GetConfiguredUdfs();
  }

  private OpenDialogSuccessSales(_data: ISuccessSalesInfo): Observable<ISuccessSalesInfo> {
    return this.matDialog.open(SuccessSalesModalComponent, {
      width: '98%',
      maxWidth: '700px',
      height: 'auto',
      maxHeight: '80%',
      data: _data,
      disableClose: true
    }).afterClosed().pipe(
      filter(res => res)
    )
  }

  //#region udfs
  public GetConfiguredUdfs(): void {
    this.linkerService.Publish({
      CallBack: CL_CHANNEL.DATA_LINE_1,
      Data: '',
      Target: this.UdfsId
    });
  }

  private SetUdfsDevelopment(): void {
    MappingUdfsDevelopment<IUniqueId>({uniqueId: this.uniqueId} as IUniqueId, this.udfsValue, this.udfsDevelopment);
    MappingUdfsDevelopment<any>({PriceList: this.data.PriceList}, this.udfsValue, this.udfsDevelopment);
    MappingUdfsDevelopment<IUserDev>({User: this.User} as IUserDev, this.udfsValue, this.udfsDevelopment);

  }
  public ContentUdf = (_event: ICLEvent): void => {
    let udfs: DynamicsUdfPresentation.Structures.Interfaces.IUdf[] = JSON.parse(_event.Data);
    this.isVisible = udfs.length > 0;
  }
  private InflateAttachmentTable(): void {
    const NEXT_TABLE_STATE = {
      Records: this.documentAttachment.Attachments2_Lines,
      RecordsCount: this.documentAttachment.Attachments2_Lines.length,
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(NEXT_TABLE_STATE),
      Target: this.attachmentTableId
    });
  }
  OnAttachFile(_event: Event): void {
    let files = (_event.target as HTMLInputElement).files;

    if(!files) return;

    let hasDuplicatesFiles: boolean = false;

    // Remove duplicated files
    let attachmentFiles = Array.from(files).reduce((acc, val) => {
      if(![...this.attachmentFiles, ...acc].some(file => file.name == val.name))
      {
        acc.push(val);
      }
      else
      {
        hasDuplicatesFiles = true;
      }

      return acc;
    }, [] as File[]);

    this.attachmentFiles = [...this.attachmentFiles, ...attachmentFiles];

    if(this.attachmentFiles.some(file => file.name.split('.').length == 0))
    {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: `Hay archivos que no contienen extensión. Por favor agrégueles una extensión.`
      });
      return;
    }

    let validExtensions: string[] = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'txt', 'xls', 'ppt', 'xlsx', 'pptx'];

    let invalidFile = attachmentFiles.find(file => !validExtensions.includes(file.name.split('.').pop()!));

    if(invalidFile)
    {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: `La extensión del archivo ${invalidFile.name} no es permitida.`
      });
      return;
    }

    attachmentFiles.forEach((file, index) => {

      let date = new Date();

      let fileExtension = file.name.split('.').pop()!;

      let fileName = file.name.replace(`.${fileExtension}`, '');

      this.documentAttachment.Attachments2_Lines.push({
        Id: this.documentAttachment.Attachments2_Lines.length === 0 ? index + 1 : this.documentAttachment.Attachments2_Lines.length + 1,
        FileName: fileName,
        FreeText: '',
        AttachmentDate: formatDate(date, "yyyy-MM-dd", 'en'),
        FileExtension: fileExtension
      } as IAttachments2Line);

    });

    (_event.target as HTMLInputElement).value = "";

    this.InflateAttachmentTable();

    if(hasDuplicatesFiles)
    {
      this.modalService.Continue({
        type: CLModalType.INFO,
        subtitle: "No es posible cargar archivos con el mismo nombre."
      })
    }
  }
  private OnAttachmentTableRowModified = (_event: ICLEvent): void => {
    let ALL_RECORDS = JSON.parse(_event.Data) as IRowByEvent<IAttachments2Line>;

    let INDEX = GetIndexOnPagedTable(ALL_RECORDS.ItemsPeerPage, ALL_RECORDS.RowIndex, ALL_RECORDS.CurrentPage + 1, true);

    this.documentAttachment.Attachments2_Lines[INDEX].FreeText = ALL_RECORDS.Row.FreeText;
  }
  OnAttachmentTableButtonClicked = (_event: ICLEvent) => {
    const BUTTON_EVENT = JSON.parse(_event.Data);

    const ATTACHMENT_LINE = JSON.parse(BUTTON_EVENT.Data) as IAttachments2Line;

    switch(BUTTON_EVENT.Action)
    {
      case Structures.Enums.CL_ACTIONS.DELETE:
        let removedAttachmentLine = this.documentAttachment.Attachments2_Lines.splice(ATTACHMENT_LINE.Id - 1, 1)[0];

        this.documentAttachment.Attachments2_Lines = this.documentAttachment.Attachments2_Lines.map((attL, index) => {
          return {
            ...attL,
            Id: index + 1
          }
        });

        this.attachmentFiles = this.attachmentFiles?.filter(attF => attF.name != `${removedAttachmentLine.FileName}.${removedAttachmentLine.FileExtension}`);

        this.InflateAttachmentTable();
        break;

      case Structures.Enums.CL_ACTIONS.OPTION_1:
        if(!ATTACHMENT_LINE.AbsoluteEntry)
        {
          this.alertsService.Toast({
            type: CLToastType.INFO,
            message: "Este adjunto aún no ha sido guardado en SAP"
          });

          break;
        }

        this.overlayService.OnGet();

        this.attachmentService.GetFile(`${ATTACHMENT_LINE.SourcePath}\\${ATTACHMENT_LINE.FileName}.${ATTACHMENT_LINE.FileExtension}`)
          .pipe(
            finalize(() => this.overlayService.Drop())
          ).subscribe({
          next: (callback) => {
            if(callback.Data){
              DownloadBase64File(callback.Data, ATTACHMENT_LINE.FileName, 'application/octet-stream', ATTACHMENT_LINE.FileExtension);
            }
          },
          error: (error) => {
            this.alertsService.ShowAlert({HttpErrorResponse: error});
          }
        });
        break;
    }
  }
  //endregion
}
