import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {
  AlertsService,
  CLModalType,
  CLToastType,
  ModalService,
} from '@clavisco/alerts';
import {CLPrint, GetError, Repository, Structures} from '@clavisco/core';
import {
  CL_CHANNEL,
  CL_DISPLAY,
  ICLCallbacksInterface,
  ICLEvent,
  LinkerService,
  Register,
  Run,
  StepDown
} from '@clavisco/linker';
import {OverlayService} from '@clavisco/overlay';
import {catchError, filter, finalize, map, Observable, of, startWith, Subscription, switchMap} from 'rxjs';
import {LinkerEvent} from '@app/enums/e-linker-events';
import {IActionButton} from '@app/interfaces/i-action-button';
import {IItemsComponentResolvedData} from 'src/app/interfaces/i-resolvers';
import {ItemsService} from '@app/services/items.service';
import {AddValidatorAutoComplete, SharedService} from '@app/shared/shared.service';
import {IItemMasterData, ItemPrice} from "@app/interfaces/i-items";
import {IPriceList} from "@app/interfaces/i-price-list";
import {ItemBarCodeCollection} from "@app/interfaces/i-barcode";
import {ItemPriceService} from "@app/services/item-price.service";
import {ICLTableButton, MapDisplayColumns, MappedColumns} from "@clavisco/table";
import {BarcodesService} from "@app/services/barcodes.service";
import {ITaxe} from "@app/interfaces/i-taxe";
import {MasterDataService} from "@app/services/master-data.service";
import {IFilterKeyUdf, IUdf, IUdfContext, IUdfDevelopment} from "@app/interfaces/i-udf";
import {environment} from "@Environment/environment";
import {IUserToken} from "@app/interfaces/i-token";
import {StorageKey} from "@app/enums/e-storage-keys";
import {UdfsService} from "@app/services/udfs.service";
import {DynamicsUdfPresentation} from "@clavisco/dynamics-udfs-presentation";
import {MappingUdfsDevelopment} from "@app/shared/common-functions";
import Validation from "@app/custom-validation/custom-validators";
import {TAB} from "@angular/cdk/keycodes";
import {ISearchModalComponentDialogData, SearchModalComponent} from "@clavisco/search-modal";
import {MatDialog} from "@angular/material/dialog";
import {InventoryDetails} from "@app/interfaces/i-inventory-details";


@Component({
  selector: 'app-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.scss']
})


export class ItemsComponent implements OnInit {
  bardcode: ItemBarCodeCollection[] = [];
  inventoryDetails: InventoryDetails[] = [];
  itemForm!: FormGroup;
  allSubscriptions: Subscription;
  item: IItemMasterData[] = [];
  itemFormControl = new FormControl('');
  bcdCodeFormControl = new FormControl('');
  bcdNameFormControl = new FormControl('');
  actionButtons!: IActionButton[];
  IsonUpdate: boolean = false; // codigos que vienen de sap
  index: number = 0;
  TabIndex: number = 0;
  priceList!: IPriceList[];
  itemCode: string = '';
  textAction: string = 'Agregar';
  iconAction: string = 'add';
  price: FormControl = new FormControl();
  currentItem!: IItemMasterData | null;
  itemPrice: ItemPrice[] = [];
  taxes: ITaxe[] = [];

  //#region @clavisco/table Configuration
  IsSerial: boolean = false;
  shouldPaginateRequest: boolean = false;
  barcodetableId: string = 'BARCODE-TABLE';
  mappedColumns: MappedColumns;
  hasItemsSelection: boolean = false;
  hasStandardHeaders: boolean = true;
  shouldSplitPascal: boolean = false;

  barCodeColumns: { [key: string]: string } = {
    Id: '#',
    Barcode: 'Código de barras',
    FreeText: 'Descripción'
  }

  buttons: ICLTableButton[] = [
    {
      Title: `Editar`,
      Action: Structures.Enums.CL_ACTIONS.UPDATE,
      Icon: `edit`,
      Color: `primary`,
      Data: ''
    },
    {
      Title: `Eliminar`,
      Action: Structures.Enums.CL_ACTIONS.DELETE,
      Icon: `delete`,
      Color: `primary`,
      Data: ''
    }
  ]
  //#endregion

  //#region Table Inventory Details
  inventoryDetailsTableId: string = 'INVENTORY-DETAILS-TABLE';
  shouldPaginateRequestInventoryDetails: boolean = true;
  mappedColumnsInventoryDetails: MappedColumns;
  hasStandardHeadersInventoryDetails: boolean = true;
  shouldSplitPascalInventoryDetails: boolean = false;
  inventoryDetailsColumns: { [key: string]: string } = {
    WhsCode: '#',
    WhsName: 'Almacen',
    OnHand: 'Stock',
    IsCommited: 'Comprometido',
    OnOrder: 'Pedido',
    Available: 'Disponible'
  }
  //#endregion

  //#region Udfs
  udfsDevelopment: IUdfDevelopment[] = [];
  udfsDataHeader: IUdf[] = [];
  udfsValue: IUdf[] = [];
  UdfsId: string = 'Udf';
  Title: string = 'Udfs';
  ApiUrl: string = environment.apiUrl;
  DBODataEndPoint: string = 'OITM';
  isVisible: boolean = true;
  Token: string = Repository.Behavior.GetStorageObject<IUserToken>(StorageKey.Session)?.access_token || "";
  //#endregion
  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };

  searchModalId = "searchModalId";
  opcionesMenuForm!: FormGroup;

  constructor(
    private fb: FormBuilder, private sharedService: SharedService,
    @Inject('LinkerService') private linkerService: LinkerService,
    private overlayService: OverlayService,
    private alertsService: AlertsService,
    private itemService: ItemsService,
    private activatedRoute: ActivatedRoute,
    private itemPriceService: ItemPriceService,
    private barcodesService: BarcodesService,
    private masterDataService: MasterDataService,
    private udfsService: UdfsService,
    private modalService: ModalService,
    private matDialog: MatDialog
  ) {
    this.mappedColumns = MapDisplayColumns(
      {
        dataSource: [] as ItemBarCodeCollection[],
        renameColumns: this.barCodeColumns,
        ignoreColumns: ['AbsEntry', 'ItemNo', 'UoMEntry']
      }
    );

    this.mappedColumnsInventoryDetails = MapDisplayColumns(
      {
        dataSource: [] as InventoryDetails[],
        renameColumns: this.inventoryDetailsColumns,
        ignoreColumns: ['ForeignName', 'InventoryItem', 'ItemClass', 'ItemCode', 'PurchaseItem', 'SalesItem', 'TaxCode', 'TaxOnly', 'TaxRate', 'UnitPrice', 'UoMEntry', 'ItemName']
      }
    );

    this.allSubscriptions = new Subscription();
  }

  ngOnInit(): void {
    this.onLoad();
  }

  ngOnDestroy(): void {
    this.sharedService.SetActionButtons([]);
    this.allSubscriptions.unsubscribe();
  }

  onLoad(): void {

    this.opcionesMenuForm = this.fb.group({
      Opcion: ['2']
    });

    this.HandleResolvedData();
    this.loadForm();
    this.loadActionButton();
    this.RegisterActionButtonsEvents();

    this.allSubscriptions.add(
      this.linkerService.Flow()?.pipe(
        StepDown<CL_CHANNEL>(this.callbacks),
      ).subscribe({
        next: callback => Run(callback.Target, callback, this.callbacks.Callbacks),
        error: error => CLPrint(error, Structures.Enums.CL_DISPLAY.ERROR)
      })
    );

    this.allSubscriptions.add(this.sharedService.OnActionButtonClicked(this.OnActionButtonClicked));

  }

  loadForm(): void {

    const validators = !this.IsSerial ? [Validators.required] : [];
    this.itemForm = this.fb.group({
      ItemCode: ['', validators],
      ItemName: ['', [Validators.required]],
      UnitPrice: [''],
      U_IVA: [''],
      PriceImp: [''],
      ForeignName: ['']
    });
    this.itemFormControl.setValidators([Validation.validateValueAutoComplete(this.item)])
  }

  /**
   * Load component buttons
   */
  loadActionButton(): void {
    this.actionButtons = [
      {
        Key: 'ADD',
        MatIcon: 'edit',
        Text: 'Actualizar',
        MatColor: 'primary',
        DisabledIf: (_form?: FormGroup) => _form?.invalid || false
      },
      {
        Key: 'CLEAN',
        MatIcon: 'mop',
        Text: 'Limpiar'
      }
    ];
  }

  RegisterActionButtonsEvents(): void {
    Register<CL_CHANNEL>(LinkerEvent.ActionButton, CL_CHANNEL.OUTPUT, this.OnActionButtonClicked, this.callbacks);
    Register<CL_CHANNEL>(this.barcodetableId, CL_CHANNEL.REQUEST_RECORDS, this.getRecords, this.callbacks);
    Register(this.UdfsId, CL_CHANNEL.OUTPUT, this.OnClickUdfEvent, this.callbacks);
    Register<CL_CHANNEL>(this.UdfsId, CL_CHANNEL.OUTPUT_2, this.ContentUdf, this.callbacks);
    Register<CL_CHANNEL>(this.barcodetableId, CL_CHANNEL.OUTPUT, this.OnTableActionActivated, this.callbacks);
    Register<CL_CHANNEL>(this.searchModalId, CL_CHANNEL.REQUEST_RECORDS, this.OnModalRequestRecords, this.callbacks);
    Register<CL_CHANNEL>(this.inventoryDetailsTableId, CL_CHANNEL.REQUEST_RECORDS, this.GetInventoryDetails, this.callbacks);
  }

  /**
   *
   * @param _actionButton
   */
  OnActionButtonClicked = (_actionButton: IActionButton): void => {

    switch (_actionButton.Key) {
      case 'ADD':
        this.Save();
        break;
      case 'CLEAN':
        this.Clear();
        break;
    }
  }

  Clear(): void {
    this.modalService.CancelAndContinue({
      type: CLModalType.QUESTION,
      title: `Está seguro de que desea limpiar campos?`,
    }).pipe(
      filter(res => res),
    ).subscribe({
      next: () => {
        this.CleanTabChange();
      }
    });
  }

  CleanTabChange(): void {
    this.IsonUpdate = false;
    this.currentItem = null;
    this.loadForm();
    this.CleanFields();
    this.CleanBardCode();
    this.itemFormControl.reset();
    this.price.reset();
    this.bardcode = [];
    this.itemPrice = [];
    this.publishTable();
    this.EnableOrDisableFields();

    if (this.opcionesMenuForm.controls['Opcion'].value === '1') {
      this.actionButtons = [
        {
          Key: 'ADD',
          MatIcon: 'save',
          Text: 'Crear',
          MatColor: 'primary',
          DisabledIf: (_form?: FormGroup) => _form?.invalid || false
        },
        {
          Key: 'CLEAN',
          MatIcon: 'mop',
          Text: 'Limpiar'
        }
      ];
    } else {
      this.actionButtons = [
        {
          Key: 'ADD',
          MatIcon: 'edit',
          Text: 'Actualizar',
          MatColor: 'primary',
          DisabledIf: (_form?: FormGroup) => _form?.invalid || false
        },
        {
          Key: 'CLEAN',
          MatIcon: 'mop',
          Text: 'Limpiar'
        }
      ];
    }

  }

  HandleResolvedData(): void {

    this.activatedRoute.data.subscribe({
      next: (data) => {

        const resolvedData: IItemsComponentResolvedData = data['resolvedData'];
        this.TabIndex = 0;

        if (resolvedData) {

          this.IsSerial = resolvedData.Serial?.IsSerial ?? false;
          this.taxes = resolvedData.Taxes;
          this.priceList = resolvedData?.PriceList||[];
          this.udfsDevelopment = resolvedData.UdfsDevelopment;

        }
      }
    });
  }


  Save(): void {
    if (this.isVisible)
      this.GetConfiguredUdfs();
    else
      this.SaveChanges();
  }


  onSelectItem(_item: IItemMasterData): void {
    this.itemFormControl.reset();
    this.price.reset();
    this.bardcode = [];
    this.itemPrice = [];
    this.publishTable();
    this.itemCode = _item.ItemCode;

    this.overlayService.OnGet();
    this.masterDataService.Get<IItemMasterData>(_item.ItemCode)
      .pipe(
        switchMap(res => {
          this.itemFormControl.setValue(`${_item.ItemCode} - ${_item.ItemName}`);
          this.actionButtons = [];
          this.actionButtons = [
            {
              Key: 'ADD',
              MatIcon: 'edit',
              Text: 'Actualizar',
              MatColor: 'primary',
              DisabledIf: (_form?: FormGroup) => _form?.invalid || false
            },
            {
              Key: 'CLEAN',
              MatIcon: 'mop',
              Text: 'Limpiar'
            }
          ];

          this.currentItem = res.Data;
          this.EnableOrDisableFields();
          this.itemForm.patchValue(res.Data);
          this.price.setValue(this.priceList[0]);
          let taxRate = this.taxes.find(x => x.TaxCode === res.Data.TaxCode)?.TaxRate ?? 0;
          this.itemForm.controls['U_IVA'].setValue(taxRate);

          return this.itemPriceService.Get<ItemPrice>(this.itemForm.controls['ItemCode'].value, this.priceList[0]?.ListNum ?? 0)
        }),
        switchMap(callback => {
          this.itemForm.controls['UnitPrice']?.setValue(callback.Data?.Price);
          this.updatePrice();
          this.getBarCodeTable();

          let udfKey = {
            ItemCode: this.itemForm.controls['ItemCode'].value,
            TypeDocument: this.DBODataEndPoint
          } as IFilterKeyUdf;
          
          return this.udfsService.GetUdfsData(udfKey);
        }),
        finalize(() => this.overlayService.Drop()))
      .subscribe({
        next: (callback) => {
          this.udfsDataHeader = callback.Data || [];
          if (this.udfsDataHeader && this.udfsDataHeader.length > 0) {
            this.SetUDFsValues();
          }
        },
      });
  }

  /**
   * METODO PARA VALIDAR QUE NO SE PERMITAN AGREGAR ITEMS DESDE EL TAB DE EBUSQUEDA Y EDICION
   * @constructor
   * @private
   */
  public EnableOrDisableFields(): boolean {
    if (this.opcionesMenuForm.controls['Opcion'].value === '2') {
      if (this.currentItem) {
        return false
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  hasPermission(): boolean {
    let permissions = Repository.Behavior.GetStorageObject<any>(StorageKey.Permissions);//permisos

    if (permissions?.some((permission: { Name: string }) => permission.Name === "MasterData_Items_ChangePriceListPrice")){
      return true;
    }else{
      return false;
    }
  }

  TabChange(tabChangeEvent: any): void {
    this.IsonUpdate = false;
    this.TabIndex = tabChangeEvent;
    if (tabChangeEvent === 0 && this.currentItem) return;

    if (tabChangeEvent === 1) {
      this.SearchInventoryDetails();
    }
  }
  /**
   * Method that is executed when changing menu selection
   * @param _value - Value selected in the menu
   * @constructor
   */
  public OpcionMenu(_value: string): void {
    this.opcionesMenuForm.controls['Opcion'].setValue(_value);
    this.CleanTabChange();
  }

  /**
   * Method is executed when changing price list
   * @param _event - Price list selected
   * @constructor
   */
  GetItemPrices(_event: IPriceList): void {
    if (!this.itemForm.controls['ItemCode'].value) {
      let priceList: IPriceList = this.price.value;

      if (this.itemPrice && this.itemPrice.length > 0 && this.itemPrice.some(x => x.PriceList === +priceList.ListNum)) {
        let index = this.itemPrice.findIndex(x => x.PriceList === +priceList.ListNum);

        if (index != -1)
          this.itemForm.controls['UnitPrice'].setValue(this.itemPrice[index]?.Price);

      } else {
        this.itemForm.controls['UnitPrice'].setValue(0);
      }

      this.updatePrice();
      return;
    }

    this.overlayService.OnGet();
    this.itemPriceService.Get<ItemPrice>(this.itemForm.controls['ItemCode'].value, +_event.ListNum)
      .pipe(finalize(() => this.overlayService.Drop()))
      .subscribe({
        next: (callback) => {
          this.itemForm.controls['UnitPrice']?.setValue(callback.Data?.Price);
          this.updatePrice();
        }
      });
  }

  updatePriceImp(): void {

    if (+this.itemForm.value.PriceImp > 0) {

      let priceList: IPriceList = this.price.value;

      if (!priceList) {
        this.itemForm.controls['PriceImp'].setValue(0);
        this.alertsService.Toast({type: CLToastType.INFO, message: `Seleccione lista de precio`});
        return;
      }

      if (!this.itemForm.value.U_IVA) {
        this.itemForm.controls['PriceImp'].setValue(0);
        this.alertsService.Toast({type: CLToastType.INFO, message: `Seleccione impuesto`});
        return;
      }

      const mTotal = this.itemForm.value.PriceImp / (1 + this.itemForm.value.U_IVA / 100);
      this.itemForm.patchValue({UnitPrice: +mTotal.toFixed(2)});

      if (this.itemPrice && this.itemPrice.length > 0 && this.itemPrice.some(x => x.PriceList === +priceList.ListNum)) {

        let index = this.itemPrice.findIndex(x => x.PriceList === +priceList.ListNum);
        if (index != -1)
          this.itemPrice[index].Price = this.itemForm.value.UnitPrice;
      } else {
        let price: ItemPrice = {
          Price: this.itemForm.controls['UnitPrice'].value,
          Currency: priceList.PrimCurr,
          PriceList: priceList.ListNum
        }

        this.itemPrice.push(price);
      }
    }

  }

  updatePrice(): void {
    if (+this.itemForm.value.UnitPrice >= 0) {
      let priceList: IPriceList = this.price.value;

      if (!priceList) {
        this.itemForm.controls['UnitPrice'].setValue(0);
        this.alertsService.Toast({type: CLToastType.INFO, message: `Seleccione lista de precio`});
        return;
      }

      if (!this.itemForm.value.U_IVA) {
        this.itemForm.controls['PriceImp'].setValue(this.itemForm.value.UnitPrice);
        //return;
      }

      const UNIT_PRICE = +this.itemForm.value.UnitPrice;
      const mTotal = UNIT_PRICE + UNIT_PRICE * (+this.itemForm.value.U_IVA / 100);

      this.itemForm.patchValue({PriceImp: +mTotal.toFixed(2)});

      if (this.itemPrice && this.itemPrice.length > 0 && this.itemPrice.some(x => x.PriceList === +priceList.ListNum)) {
        let index = this.itemPrice.findIndex(x => x.PriceList === +priceList.ListNum);
        if (index != -1)
          this.itemPrice[index].Price = this.itemForm.value.UnitPrice;

      } else {
        let price: ItemPrice = {
          Price: this.itemForm.controls['UnitPrice'].value,
          Currency: priceList.PrimCurr,
          PriceList: priceList.ListNum
        }

        this.itemPrice.push(price);
      }
    }
  }


  /**
   * Listening event of component search-modal
   * @param _event - Event gets data from modal
   * @constructor
   */
  OnModalRequestRecords = (_event: ICLEvent): void => {
    const VALUE = JSON.parse(_event.Data);

    this.overlayService.OnGet();
    this.masterDataService.GetbyFilter<IItemMasterData[]>(VALUE?.SearchValue)
      .pipe(finalize(() => this.overlayService.Drop())
      ).subscribe({
      next: (callback) => {
        this.item = callback.Data;
        this.InflateTableItem();

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
   * Send information to search-modal component
   * @constructor
   * @private
   */
  private InflateTableItem(): void {
    const NEXT_TABLE_STATE = {
      CurrentPage: 0,
      ItemsPeerPage: 5,
      Records: this.item,
      RecordsCount: this.item.length,
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(NEXT_TABLE_STATE),
      Target: this.searchModalId
    });
  }

  /**
   * Show ítems search modal
   * @constructor
   */
  ShowModalSearchItems(): void
  {
    this.matDialog.open(SearchModalComponent, {
      width: '65%',
      height: "80%",
      data: {
        Id: this.searchModalId,
        ModalTitle: 'Lista ítems',
        MinInputCharacters: 2,
        InputDebounceTime: 200,
        ShouldPaginateRequest : true,
        TableMappedColumns: {
          IgnoreColumns: ['Id','ForeignName','ItemPrices','Series','TaxCode','ItemBarCodeCollection','Udfs','TaxRate',
          'UnitPrice','ItemClass','TypeAheadFormat','UoMEntry','UoMMasterData','OnHand','ManBtchNum','ManSerNum','AbsEntry',
          'DistNumberLote','DistNumberSerie','SysNumber','TypeAheadFormat','BinCode','Device'],
          RenameColumns: {
            ItemCode: 'Codigo',
            ItemName: 'Nombre',
            BarCode: 'Código barras'
          }
        }
      } as ISearchModalComponentDialogData<IItemMasterData>
    }).afterClosed()
      .subscribe({
        next: (value) => {
          if(value){
            this.onSelectItem(value);
          }
        }
      });
  }

  //#region bardCode
  publishTable(): void {
    const NEW_TABLE_STATE = {
      Records: this.bardcode,
      RecordsCount: this.bardcode.length
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Target: this.barcodetableId,
      Data: JSON.stringify(NEW_TABLE_STATE)
    });

  }

  private getBarCodeTable(): void {
    this.linkerService.Publish({
      CallBack: CL_CHANNEL.PRE_REQ_RECORDS,
      Target: this.barcodetableId,
      Data: ''
    });
  }

  /**
   * Method to edit a barcode table
   * @param _event - Event emitted in the table button when selecting a barcode
   * @constructor
   */
  OnTableActionActivated = (_event: ICLEvent): void => {
    if (_event.Data) {
      const BUTTON_EVENT = JSON.parse(_event.Data);
      const ACTION = JSON.parse(BUTTON_EVENT.Data) as ItemBarCodeCollection;
      this.index = ACTION.Id;

      switch (BUTTON_EVENT.Action) {
        case Structures.Enums.CL_ACTIONS.UPDATE:
          this.IsonUpdate = this.bardcode.some(x => x.AbsEntry === ACTION.AbsEntry && ACTION.AbsEntry != -1);
          this.bcdCodeFormControl.setValue(ACTION.Barcode);
          this.bcdNameFormControl.setValue(ACTION.FreeText);

          let isAddBarCode = this.bardcode.some(x => x.AbsEntry === ACTION.AbsEntry);
          this.textAction = isAddBarCode ? 'Actualizar' : 'Agregar';
          this.iconAction = isAddBarCode ? 'edit' : 'add';

          break;
        case Structures.Enums.CL_ACTIONS.DELETE:
          if (ACTION.AbsEntry > 0) {
            this.alertsService.Toast({
              type: CLToastType.INFO,
              message: 'Este código de barras no se puede eliminar, ya que este ha sido previamente creado en SAP.'
            });
            return
          }

          this.bardcode.splice(this.index - 1, 1);
          this.bardcode.forEach((x, index) => {
            x.Id = index + 1;
          });
          this.publishTable();
          break;
      }
    }
  }

  CleanBardCode(): void {
    this.IsonUpdate = false;
    this.bcdCodeFormControl.setValue('');
    this.bcdNameFormControl.setValue('');
    this.textAction = 'Agregar';
    this.iconAction = 'add';
    this.index = -1;
  }

  AddBardCode(): void {

    if (!this.bcdCodeFormControl.value) return;

    let index = this.bardcode.findIndex(x => x.Barcode.toLowerCase() === this.bcdCodeFormControl.value.toLowerCase())

    if (index >= 0) {
      this.bardcode[index].Barcode = this.bcdCodeFormControl.value;
      this.bardcode[index].FreeText = this.bcdNameFormControl.value;
    } else {
      this.bardcode.push({
        Id: 0,
        Barcode: this.bcdCodeFormControl.value,
        FreeText: this.bcdNameFormControl.value,
        UoMEntry: -1,
        AbsEntry: -1
      });
    }

    this.bardcode.forEach((x, index) => {
      x.Id = index + 1;
    });

    this.publishTable();

    this.bcdCodeFormControl.reset();
    this.bcdNameFormControl.reset();
    this.textAction = 'Agregar';
    this.iconAction = 'add';
    this.IsonUpdate = false;
    this.index = -1;
  }

  /**
   * Get item barcode
   */
  private getRecords = (): void => {

    if (this.itemCode) {
      this.overlayService.OnGet();
      this.barcodesService.Get<ItemBarCodeCollection>(this.itemCode)
        .pipe(
          finalize(() => this.overlayService.Drop())
        ).subscribe({
        next: (callback) => {
          this.bardcode = callback.Data;
          this.bardcode.forEach((x, index) => {
            x.Id = index + 1;
          });
          this.publishTable();
        }
      });
    }

  }
  //#endregion

  //#region Inventory Details
  /**
   * Method to get inventory details
   * @constructor
   */
  GetInventoryDetails = (): void => {
    this.overlayService.OnGet();
    this.masterDataService.GetItemInventoryDetails(this.itemCode).pipe(
      finalize(() => this.overlayService.Drop())
    ).subscribe({
      next: (callback) => {
        this.inventoryDetails = callback.Data;
        this.InflateTableProperties();
      }
    });
  }

  private InflateTableProperties(): void {
    const NEXT_TABLE_STATE = {
      CurrentPage: 0,
      ItemsPeerPage: 5,
      Records: this.inventoryDetails,
      RecordsCount: this.inventoryDetails.length,
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(NEXT_TABLE_STATE),
      Target: this.inventoryDetailsTableId
    });
  }

  public SearchInventoryDetails(): void {
    this.linkerService.Publish({
      CallBack: CL_CHANNEL.PRE_REQ_RECORDS,
      Target: this.inventoryDetailsTableId,
      Data: ''
    });
  }

  //#endregion

  //#region Udfs
  SetUDFsValues(): void {
    this.linkerService.Publish({
      Target: this.UdfsId,
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(this.udfsDataHeader)
    });
  }

  public ContentUdf = (_event: ICLEvent): void => {
    let udfs: DynamicsUdfPresentation.Structures.Interfaces.IUdf[] = JSON.parse(_event.Data);
    this.isVisible = udfs.length > 0;
  }

  OnClickUdfEvent = (_event: ICLEvent): void => {
    this.udfsValue = JSON.parse(_event.Data) as IUdfContext[];
    this.SaveChanges();
  }

  private SaveChanges(): void {
    this.overlayService.OnPost();

    this.SetUdfsDevelopment();

    let item = this.itemForm.getRawValue() as IItemMasterData;
    item.ItemBarCodeCollection = this.bardcode;
    item.ItemPrices = this.itemPrice;
    item.Udfs = this.udfsValue;


    let updateOrCreate$: Observable<Structures.Interfaces.ICLResponse<IItemMasterData>> | null = null;

    if (this.opcionesMenuForm.controls['Opcion'].value === '1') {
      updateOrCreate$ = this.itemService.Post(item);
    } else {
      updateOrCreate$ = this.itemService.Patch(item);
    }

    updateOrCreate$
      .pipe(
        switchMap(res => {
          this.overlayService.Drop();
          this.udfsValue = [];
          this.item = []
          return this.modalService.Continue({
            type: CLModalType.SUCCESS,
            title: !item.ItemCode ? 'Ítem creado correctamente' : 'Ítem actualizado correctamente'
          })
        }),
        finalize(() => this.overlayService.Drop())
      ).subscribe({
      next: () => {
        this.ResetDocument();
      },
      error: (err) => {
        this.modalService.Continue({
          title: !item.ItemCode ? 'Se produjo un error creando el ítem' : 'Se produjo un error actualizando el ítem',
          subtitle: GetError(err),
          type: CLModalType.ERROR
        });
      }
    });
  }

  private ResetDocument(): void {
    try {
      this.itemFormControl.reset();
      this.itemForm.reset();
      this.price.reset();
      this.bardcode = [];
      this.publishTable();
      this.bcdCodeFormControl.reset();
      this.bcdNameFormControl.reset();
      this.CleanFields();
    } catch (Exception) {
      CLPrint(Exception, CL_DISPLAY.ERROR);
    }
  }

  private CleanFields(): void {
    if (this.isVisible) {
      this.linkerService.Publish({
        Target: this.UdfsId,
        Data: '',
        CallBack: CL_CHANNEL.RESET
      });
    }
  }

  private GetConfiguredUdfs(): void {
    this.linkerService.Publish({
      CallBack: CL_CHANNEL.DATA_LINE_1,
      Data: '',
      Target: this.UdfsId
    });
  }

  private SetUdfsDevelopment(): void {
    let data = {
      U_IVA: this.taxes.find(x => x.TaxRate === this.itemForm.value.U_IVA)?.TaxCode ?? ''
    };

    MappingUdfsDevelopment(data, this.udfsValue, this.udfsDevelopment);
  }


  //#endregion
  protected readonly TAB = TAB;
}
