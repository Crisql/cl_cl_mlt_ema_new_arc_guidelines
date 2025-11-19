import {Component, ViewChild} from '@angular/core';
import {IonItemSliding} from "@ionic/angular";
import {ISalesPerson} from "../../../interfaces/i-sales-person";
import {IWarehouse} from "../../../models/i-warehouse";
import {IBinLocation} from "../../../interfaces/i-BinLocation";
import {DatePicker} from "@ionic-native/date-picker/ngx";
import {IUdf, IUdfContext, IUdfDevelopment} from "../../../interfaces/i-udfs";
import {IItemsTransfer} from "../../../models/db/product-model";
import {
  AllocationService,
  CommonService,
  LocalStorageService,
  LogManagerService,
  PermissionService,
  ProductService,
  WarehouseService
} from "../../../services";
import {SalesPersonService} from "../../../services/sales-person.service";
import {UdfsService} from "../../../services/udfs.service";
import {CustomModalController} from "../../../services/custom-modal-controller.service";
import {forkJoin, of} from "rxjs";
import {catchError, finalize, switchMap} from "rxjs/operators";
import {AlertType, LineStatus, LocalStorageVariables, LogEvent, UdfsCategory} from "../../../common/enum";
import {FilterDataComponent} from "../../../components/filter-data/filter-data.component";
import {
  TransferItemSearchComponent
} from "../../../components/inventory/transfer-request/transfer-item-search/transfer-item-search.component";
import {
  IStockTransfer,
  IStockTransferLinesBinAllocations,
  IStockTransferRows,
  IStockTransferRowsSelected
} from "../../../interfaces/i-stock-transfer";
import {StockTransferService} from "../../../services/stock-transfer.service";
import {
  EditInventoryTransferItemComponent
} from "../../../components/inventory/inventory-transfer/edit-inventory-transfer-item/edit-inventory-transfer-item.component";
import {UdfPresentationComponent} from "../../../components";
import {
  SelectBatchItemsComponent
} from "../../../components/inventory/inventory-transfer/select-batch-items/select-batch-items.component";
import {FormatDate, MappingUdfsDevelopment} from "../../../common/function";
import {IUniqueId} from "../../../interfaces/i-documents";
import {
  IStockTransferRequest,
  IStockTransferRequestRows,
  IWarehouseBinLocation
} from "../../../interfaces/i-stock-transfer-request";
import {PermissionsSelectedModel} from "../../../models/db/permissions";

@Component({
  selector: 'app-inventory-transfer',
  templateUrl: './inventory-transfer.page.html',
  styleUrls: ['./inventory-transfer.page.scss'],
})
export class InventoryTransferPage{

  @ViewChild(UdfPresentationComponent) udfPresentationComponent: UdfPresentationComponent;

  showHeader = true;
  showOriginData = true;
  showDestinationData = true;
  showDateFields = false;
  isSelectItemDisabled: boolean = true;
  isBatchedItems: boolean= false;
  isActionDuplicate: boolean = false;
  isEditionMode: boolean = false;
  isActionCopyTo: boolean = false;

  docDate: string;
  taxDate: string
  comments: string;
  uniqueId: string;


  salesPerson: ISalesPerson[] = [];
  salesPersonSelected: ISalesPerson | null;

  preloadedDocument: IStockTransfer| null;

  wareHouse: IWarehouse[] = [];
  wareHouseOriginSelected: IWarehouse | null;
  wareHouseDestinationSelected: IWarehouse | null;

  binLocationsOrigin: IBinLocation[]= [];
  binLocationsDestination: IBinLocation[]= [];
  binLocationOriginSelected: IBinLocation | null;
  binLocationDestinationSelected: IBinLocation | null;

  itemsTransfer: IItemsTransfer[]= [];
  itemsTransferSelected: IStockTransferRowsSelected[]= []

  permisionList: PermissionsSelectedModel[] = [];

  udfs: IUdfContext[] = [];
  udfsValues: IUdf[] = [];
  udfsDevelopment: IUdfDevelopment[] = [];
  constructor(private datePicker: DatePicker,
              private commonService: CommonService,
              private warehouseService: WarehouseService,
              private salesPersonService: SalesPersonService,
              private udfsService: UdfsService,
              private modalCtrl: CustomModalController,
              private logManagerService: LogManagerService,
              private productService: ProductService,
              private allocationService: AllocationService,
              private stockTransferService: StockTransferService,
              private permissionService: PermissionService,
              private localStorageService: LocalStorageService) { }

  ionViewWillEnter() {
    this.permisionList = [...this.permissionService.Permissions];
    this.RefreshData();
    this.SendInitalRequests();
  }

  /**
   * Mthod is for get initial data
   * @constructor
   */
  async SendInitalRequests(): Promise<void> {
    let loader = await this.commonService.Loader();
    loader.present();

    forkJoin({
      WareHouse: this.warehouseService.GetWarehouses().pipe(catchError(error => of(null))),
      SalesMen: this.salesPersonService.GetCustomers().pipe(catchError(error => of(null))),
      InventoryTransferUDFs: this.udfsService.Get(UdfsCategory.OWTQ).pipe(catchError(error => of(null))),
      UDFsDevelopment: this.udfsService.GetUdfsDevelopment(UdfsCategory.OWTR).pipe(catchError(error => of(null))),
    }).pipe(finalize(()=> loader.dismiss()))
        .subscribe({
          next: (callbacks) => {
            this.wareHouse = callbacks.WareHouse?.Data || [];

            this.salesPerson = callbacks.SalesMen?.Data || [];

            this.udfs = callbacks.InventoryTransferUDFs?.Data || []

            this.udfs = callbacks.InventoryTransferUDFs?.Data || [];

            this.udfsDevelopment = callbacks.UDFsDevelopment?.Data || [];
            
            this.CheckIfPreloadedDocument();
          },
          error: (error)=>{
            this.commonService.alert(AlertType.ERROR, error)
          }
        })
  }

  /**
   *  Load details data preloaded document
   * @constructor
   */
  async CheckIfPreloadedDocument(): Promise<void> {

    try {
      let documentData = this.localStorageService.data.get(LocalStorageVariables.DocumentToEdit) as IStockTransferRequest | IStockTransfer;
      if (!documentData) return;

      this.isEditionMode = this.localStorageService.data.get(LocalStorageVariables.IsEditionMode) ?? false;
      this.isActionCopyTo = this.localStorageService.data.get(LocalStorageVariables.IsActionCopyTo) ?? false;
      this.isActionDuplicate = this.localStorageService.data.get(LocalStorageVariables.IsActionDuplicate) ?? false;
      
      if(documentData && this.isActionCopyTo){
        this.SetDataForCopy(documentData as IStockTransferRequest)
      }

      if(documentData && (this.isEditionMode || this.isActionDuplicate)){
        this.SetDataForEditOrDuplicate(documentData as IStockTransfer)

      }

      this.localStorageService.data.delete(LocalStorageVariables.DocumentToEdit);
      this.localStorageService.data.delete(LocalStorageVariables.IsActionCopyTo);
      this.localStorageService.data.delete(LocalStorageVariables.IsActionDuplicate);
      this.localStorageService.data.delete(LocalStorageVariables.IsEditionMode);

    } catch (err) {
      this.commonService.alert(AlertType.ERROR, err);
    }
  }

  /**
   * Load the data from the transfer request that you see to copy
   * @param _data
   * @constructor
   * @private
   */
  async SetDataForCopy(_data: IStockTransferRequest) {
    let loader = await this.commonService.Loader();
    loader.present();
    try {
      
      this.comments = _data.Comments;
      this.salesPersonSelected = this.salesPerson.find(person => person.SlpCode == _data.SalesPersonCode) || null;
      this.wareHouseOriginSelected = this.wareHouse.find(warehouse => warehouse.WhsCode == _data.FromWarehouse) || null;
      this.wareHouseDestinationSelected = this.wareHouse.find(warehouse => warehouse.WhsCode == _data.ToWarehouse) || null;
      this.docDate= _data.DocDate;
      this.taxDate= _data.TaxDate;
      
      this.udfsValues = _data.Udfs || [];
      

      this.itemsTransferSelected = _data.StockTransferLines.filter(x => x.LineStatus != 'C').map((element, index) => {
        return {
          Id: index + 1,
          FromNameWhsCode: this.wareHouseOriginSelected.WhsName || '',
          ToNameWarehouse: this.wareHouseDestinationSelected.WhsName || '',
          SysNumber: 0,
          DistNumber: '',
          Stock: this.GetStock(element),
          ManSerNum: element.ManSerNum,
          ManBtchNum: element.ManBtchNum,
          LocationsFrom: this.GetLocationFrom(element.LocationsFrom, element.BinAbs),
          LocationsTo: element.LocationsTo,
          LineNum: element.BaseLine,
          ItemCode: element.ItemCode,
          ItemDescription: element.ItemDescription,
          Quantity: element.Quantity,
          WarehouseCode: element.WarehouseCode,
          FromWarehouseCode: element.FromWarehouseCode,
          SerialNumbers: element.ManSerNum === 'Y' ? [
            {
              SystemSerialNumber: element.SysNumber,
              Quantity: 1,
              DistNumber: element.DistNumber,
            }
          ] : [],
          BatchNumbers: [],
          StockTransferLinesBinAllocations: element.BinAbs > 0 ? this.GetBin(index, element.BinAbs) : [],
          BinActivat: element.BinActivat,
          BinAbsOrigin: element.BinAbs > 0 ? element.BinAbs : -1,
          BinAbsDestino: -1,
          BaseType: element.BaseType,
          BaseLine: element.BaseLine,
          BaseEntry: element.BaseEntry,
          OnHandByBin: element.LocationsFrom,
          LineStatus: LineStatus.bost_Open,
          Udfs: []
        } as IStockTransferRowsSelected;
      });
      this.GetLocation(_data.FromWarehouse,1)
      this.GetLocation(_data.ToWarehouse,2)
    } catch (Exception) {
      this.commonService.alert(AlertType.ERROR, Exception)
    }finally {
      loader.dismiss();
    }
  }

  async SetDataForEditOrDuplicate(_data: IStockTransfer): Promise<void> {
    let loader = await this.commonService.Loader();
    loader.present();
    try {
      this.GetLocation(_data.FromWarehouse,1)
      this.GetLocation(_data.ToWarehouse,2)
      
      let fromLocationsD:IWarehouseBinLocation[]=[];
      let toLocationsD:IBinLocation[]=[];
      for (let index = 0; index < _data.StockTransferLines.length; index++) {
        const element = _data.StockTransferLines[index];

        if (element.StockTransferLinesBinAllocations.some(x => x.BinActionType == 'batFromWarehouse')) {
          let batFromWarehouse = element.StockTransferLinesBinAllocations.find(x => x.BinActionType == 'batFromWarehouse')?.BinAbsEntry
          this.binLocationOriginSelected = this.binLocationsOrigin.find(location => location.AbsEntry == batFromWarehouse);
        }

        if (element.StockTransferLinesBinAllocations.some(x => x.BinActionType == 'batToWarehouse')) {
          let batToWarehouse = element.StockTransferLinesBinAllocations.find(x => x.BinActionType == 'batToWarehouse')?.BinAbsEntry
          this.binLocationDestinationSelected = this.binLocationsDestination.find(location => location.AbsEntry == batToWarehouse);
        }

        fromLocationsD = await this.GetWarehousesBinLocationFrom(element.FromWarehouseCode, element.ItemCode);
        toLocationsD = await this.GetLocations(element.WarehouseCode);
        await this.SetItem(
            element.FromWarehouseCode,
            (element.StockTransferLinesBinAllocations.find(x => x.BinActionType == 'batFromWarehouse')?.BinAbsEntry) ?? 0,
            fromLocationsD,
            toLocationsD,
            element,
            index
        );
      }
          
      this.comments = _data.Comments;
      this.salesPersonSelected = this.salesPerson.find(person => person.SlpCode == _data.SalesPersonCode) || null;
      this.wareHouseOriginSelected = this.wareHouse.find(warehouse => warehouse.WhsCode == _data.FromWarehouse) || null;
      this.wareHouseDestinationSelected = this.wareHouse.find(warehouse => warehouse.WhsCode == _data.ToWarehouse) || null;
      this.preloadedDocument = _data;

      this.udfsValues = _data.Udfs || [];

      if((!this.itemsTransfer || this.itemsTransfer.length == 0) && this.wareHouseOriginSelected?.WhsCode && this.binLocationOriginSelected?.AbsEntry){
        const item = await this.GetItemsForTransfer(this.wareHouseOriginSelected?.WhsCode|| '', this.binLocationOriginSelected?.AbsEntry ||0);
        if(item && item.length> 0){
          this.itemsTransfer = item || [];
          this.isSelectItemDisabled = false;
        }
        
      }
      
      
      if(this.isEditionMode){
        this.docDate= _data.DocDate;
        this.taxDate= _data.TaxDate;
      }
    } catch (Exception) {
      this.commonService.alert(AlertType.ERROR, Exception)
    }finally {
      loader.dismiss();
    }
  }

  private GetStock(_element: IStockTransferRequestRows): number {
    return _element.BinActivat === 'Y' &&
    _element.LocationsFrom &&
    _element.LocationsFrom.length > 0
        ? _element.LocationsFrom[0].OnHandQty
        : _element.Stock;
  }

  private GetLocationFrom(_locationFrom: IWarehouseBinLocation[], _binAbs: number): IBinLocation[] {
    if (_binAbs === 0) {
      return _locationFrom?.map(x => {
        return {AbsEntry: x.AbsEntry, BinCode: x.BinCode} as IBinLocation
      });
    } else {
      return _locationFrom?.filter(x => x.AbsEntry === _binAbs).map(x => {
        return {AbsEntry: x.AbsEntry, BinCode: x.BinCode} as IBinLocation
      })
    }
  }

  private GetBin(_index: number, _binAbs: number): IStockTransferLinesBinAllocations[] {
    let bin: IStockTransferLinesBinAllocations[] = [];

    bin.push({
      BinAbsEntry: _binAbs,
      Quantity: 1,
      BaseLineNumber: _index,
      SerialAndBatchNumbersBaseLine: 0,
      BinActionType: 'batFromWarehouse'
    });

    return bin;
  }

  async GetWarehousesBinLocationFrom(_whsCode: string,_itemCode: string): Promise<IWarehouseBinLocation[]> {
    return new Promise((resolve, reject) => {
      this.stockTransferService.GetWarehousesBinLocation(_whsCode, _itemCode).pipe().subscribe({
        next: (result) => {
          resolve(result.Data);
        },
        error: (err) => {
          this.commonService.alert(AlertType.ERROR, err);
          reject(err);
        }
      });
    });
  }

  async GetLocations(_whsCode: string): Promise<IBinLocation[]> {
    return new Promise((resolve, reject) => {
      this.allocationService.GetLocationForTransfer(_whsCode).pipe().subscribe({
        next: (result) => {
          resolve(result.Data);
        },
        error: (err) => {
          this.commonService.alert(AlertType.ERROR, err);
          reject(err);
        }
      });
    });
  }

  async SetItem(_whsCode: string, _binAbs: number = 0,fromLocationsD:IWarehouseBinLocation[], toLocationsD:IBinLocation[], element:IStockTransferRows, index: number): Promise<IItemsTransfer[]> {
    return new Promise((resolve, reject) => {
      this.productService.GetItemForTransfer(_whsCode, _binAbs).pipe().subscribe({
        next:(value )=> {
          let articulos=value.Data;
          let articulo = articulos.find(x => x.ItemCode === element.ItemCode);

          let locationsFrom = fromLocationsD.map(location=>({
            ...location,
            Stock: 0
          } as IBinLocation));
          
          if (articulo) {
            let item:IStockTransferRowsSelected = {
              Id: index + 1,
              ItemCode: articulo.ItemCode,
              ItemDescription: articulo.ItemName,
              Quantity: element.Quantity,
              WarehouseCode: element.WarehouseCode,
              FromWarehouseCode: element.FromWarehouseCode,
              SerialNumbers: articulo.ManSerNum === 'Y' ? [{SystemSerialNumber: articulo.SysNumber, Quantity: 1 , DistNumber: articulo.DistNumber}] : [],
              BatchNumbers: element.BatchNumbers??[],
              StockTransferLinesBinAllocations: element.StockTransferLinesBinAllocations.length > 0 ? element.StockTransferLinesBinAllocations : [],
              FromNameWhsCode: (this.wareHouse.find(x => x.WhsCode === element.FromWarehouseCode)?.WhsName || ''),
              ToNameWarehouse: (this.wareHouse.find(x => x.WhsCode === element.WarehouseCode)?.WhsName || ''),
              DistNumber: articulo.ManSerNum === 'Y' ? articulo.DistNumber : 'N/A',
              SysNumber: articulo.ManSerNum === 'Y' ? articulo.SysNumber : 0,
              Stock: +(articulo.Stock),
              ManSerNum: articulo.ManSerNum,
              ManBtchNum: articulo.ManBtchNum,
              LineNum: 0,
              BinActivat: '',
              BinAbsOrigin: element.StockTransferLinesBinAllocations.some(x=>x.BinActionType=='batFromWarehouse') ? element.StockTransferLinesBinAllocations.find(x=>x.BinActionType=='batFromWarehouse')?.BinAbsEntry : -1,
              BinAbsDestino: element.StockTransferLinesBinAllocations.some(x=>x.BinActionType=='batToWarehouse') ? element.StockTransferLinesBinAllocations.find(x=>x.BinActionType=='batToWarehouse')?.BinAbsEntry :-1,
              LocationsFrom: locationsFrom.length>0 ? locationsFrom: [],
              LocationsTo: toLocationsD.length > 0 ? toLocationsD : [],
              Udfs: [],
              IdBinLocation: this.itemsTransferSelected && this.itemsTransferSelected.length > 0 ? Math.max(...this.itemsTransferSelected.map(x => (x.IdBinLocation || 0))) + 1 : 1,
              BaseEntry: this.isActionDuplicate ? undefined: element.BaseEntry,
              BaseLine: this.isActionDuplicate ? -1: element.BaseLine,
              BaseType: this.isActionDuplicate ? undefined: element.BaseType,
              LineStatus:element.LineStatus,
              OnHandByBin:fromLocationsD.length>0 ? fromLocationsD as IWarehouseBinLocation[] : []
            };
            this.itemsTransferSelected.push(item);
            resolve(value.Data)
          }},
        error: (err) => {
          this.commonService.alert(AlertType.ERROR, err)
          reject(err);
        }
      })
    });
  }


  /**
   * Searches sales person, potentially associated with an ion-item-sliding element.
   * @param _slidingSalesPerson The ion-item-sliding element associated with the customer search (if applicable).
   * @constructor
   */
  async SearchSalesPerson(_slidingSalesPerson: IonItemSliding) {
    try {
      let chooseModal = await this.modalCtrl.create({
        component: FilterDataComponent,
        componentProps: {
          inputData: this.salesPerson,
          inputTitle: "INVENTORY.SEARCH PURCHASING MANAGER",
          inputFilterProperties: ['SlpName']
        },
      });
      chooseModal.present();

      chooseModal.onDidDismiss<ISalesPerson>().then((result) => {
        if(result.data){
          this.salesPersonSelected = result.data as ISalesPerson;
        }
      });

    }catch (error) {
      this.commonService.alert(AlertType.ERROR, error);
      this.logManagerService.Log(LogEvent.ERROR, error);
    }finally {
      _slidingSalesPerson?.close();
    }
  }

  /**
   * Opens a modal to select a warehouse origin, then retrieves and sets items from the selected warehouse.
   * @param _slidingWareHouseOrigin - The sliding item component for the warehouse origin, closed after selection.
   */
  async SearchWareHouseOrigin(_slidingWareHouseOrigin: IonItemSliding) {
    try {

      let chooseModal = await this.modalCtrl.create({
        component: FilterDataComponent,
        componentProps: {
          inputData:  this.wareHouse,
          inputTitle: "INVENTORY.SEARCH WAREHOUSE ORIGIN",
          inputFilterProperties: ['WhsName']
        },
      });
      chooseModal.present();

      chooseModal.onDidDismiss<IWarehouse>().then(async (result) => {
        if(result.data){
          this.binLocationOriginSelected = null;
          this.binLocationsOrigin = [];
          this.itemsTransfer = [];
          this.wareHouseOriginSelected = result.data as IWarehouse
          
          await this.GetLocation(this.wareHouseOriginSelected?.WhsCode || '', 1);

        }
        
      });

    }catch (error) {
      this.commonService.alert(AlertType.ERROR, error);
      this.logManagerService.Log(LogEvent.ERROR, error);
    }finally {
      _slidingWareHouseOrigin?.close();
    }
  }

  /**
   * Opens a modal to select a location origin
   * @param _slidingBinLocationOrigin - The sliding item component for the location origin, closed after selection.
   */
  async SearchBinLocationOrigin(_slidingBinLocationOrigin: IonItemSliding){
    if(!this.binLocationsOrigin || this.binLocationsOrigin.length == 0){
      this.commonService.toast(this.commonService.Translate(`No hay ubicaciones de origen para seleccionar`, `There are no source locations to select`), 'dark', 'bottom');
      return;
    }
    
    try {
      let chooseModal = await this.modalCtrl.create({
        component: FilterDataComponent,
        componentProps: {
          inputData: this.binLocationsOrigin,
          inputTitle: "INVENTORY.SEARCH LOCATION ORIGIN",
          inputFilterProperties: ['BinCode']
        },
      });
      chooseModal.present();
      
      let loader = await this.commonService.Loader();
      
      chooseModal.onDidDismiss<IBinLocation>().then( async (result) => {
        loader?.present();
        if(result.data){
          this.binLocationOriginSelected= result.data as IBinLocation;
          this.isSelectItemDisabled = false;
          this.itemsTransfer = [];
          try {
            const item = await this.GetItemsForTransfer(this.wareHouseOriginSelected?.WhsCode|| '', this.binLocationOriginSelected?.AbsEntry ||0);

            if(!item || item.length == 0){
              this.commonService.toast(this.commonService.Translate(`No se obtuvieron ítems`, `No items obtained`), 'dark', 'bottom');
              return;
            }
            
            this.itemsTransfer = item || [];
          } catch (error) {
            this.commonService.alert(AlertType.ERROR, error);
          }
        }
        
      }).finally(()=>loader?.dismiss())

    }catch (error) {
      this.commonService.alert(AlertType.ERROR, error);
      this.logManagerService.Log(LogEvent.ERROR, error);
    }finally {
      
      _slidingBinLocationOrigin?.close();
    }
  }


  async GetItemsForTransfer(_whsCode: string, _absEntry: number): Promise<IItemsTransfer[]> {
    return new Promise((resolve, reject) => {
      this.productService.GetItemForTransfer(_whsCode, _absEntry)
          .pipe().subscribe({
        next: (result) => {
          resolve(result.Data);
        },
        error: (err) => {
          this.commonService.alert(AlertType.ERROR, err);
          reject(err);
        }
      });
    });
  }

  /**
   * Opens a modal to select a warehouse destination, then sets the selected destination warehouse.
   * @param _slidingWareHouseDestinatio - The sliding item component for the warehouse destination, closed after selection.
   */
  async SearchWareHouseDestination(_slidingWareHouseDestinatio: IonItemSliding) {
    try {
      let chooseModal = await this.modalCtrl.create({
        component: FilterDataComponent,
        componentProps: {
          inputData: this.wareHouse,
          inputTitle: "INVENTORY.SEARCH DESTINATION WAREHOUSE",
          inputFilterProperties: ['WhsName']
        },
      });
      chooseModal.present();
     
      let loader = await this.commonService.Loader();
      chooseModal.onDidDismiss<IWarehouse>().then(async (result) => {
        loader?.present();
        if(result.data){
          this.binLocationDestinationSelected = null;
          this.binLocationsDestination = [];
          this.wareHouseDestinationSelected = result.data as IWarehouse;
          await this.GetLocation(this.wareHouseDestinationSelected?.WhsCode || '', 2);
        }
      }).finally(()=>loader?.dismiss())

    }catch (error) {
      this.commonService.alert(AlertType.ERROR, error);
      this.logManagerService.Log(LogEvent.ERROR, error);
    }finally {
      _slidingWareHouseDestinatio?.close();
    }
  }

  /**
   * Opens a modal to select a location origin
   * @param _slidingBinLocationDestination - The sliding item component for the location origin, closed after selection.
   */
  async SearchBinLocationDestination(_slidingBinLocationDestination: IonItemSliding){

    if(!this.binLocationsDestination || this.binLocationsDestination.length == 0){
      this.commonService.toast(this.commonService.Translate(`No hay ubicaciones de destino para seleccionar`, `There are no destination locations to select`), 'dark', 'bottom');
      return;
    }
    
    try {
      let chooseModal = await this.modalCtrl.create({
        component: FilterDataComponent,
        componentProps: {
          inputData: this.binLocationsDestination,
          inputTitle: "INVENTORY.SEARCH DESTINATION LOCATION",
          inputFilterProperties: ['BinCode']
        },
      });
      chooseModal.present();

      chooseModal.onDidDismiss<IBinLocation>().then((result) => {
        if(result.data){
          this.binLocationDestinationSelected= result.data as IBinLocation
        }
      });

    }catch (error) {
      this.commonService.alert(AlertType.ERROR, error);
      this.logManagerService.Log(LogEvent.ERROR, error);
    }finally {
      _slidingBinLocationDestination?.close();
    }
  }

  /**
   * Obtain the locations of the selected warehouse
   * @param _whsCode
   * @param _type
   * @constructor
   */
  async GetLocation(_whsCode: string, _type: number) {

    let loader = await this.commonService.Loader();
    loader.present();
    this.allocationService.GetLocationForTransfer(_whsCode).pipe(
        switchMap(result => {

          if (_type === 1) {
            this.binLocationsOrigin = result.Data ?? [];
          } else {
            this.binLocationsDestination = result.Data ?? [];
          }

          const isDataEmpty = (!result.Data || result.Data.length === 0);
          if(_type === 1){
            this.isSelectItemDisabled = !isDataEmpty;
          }

          if ((!result.Data || result.Data.length === 0 ) && _type === 1) {
            return this.productService.GetItemForTransfer(_whsCode, (this.binLocationOriginSelected?.AbsEntry) ?? 0);
          } else {
            if (_type === 1) {
              this.itemsTransfer = [];
            }
            return of(null);
          }
        }),
        finalize(() => loader.dismiss())
    ).subscribe({
      next: (callback) => {

        if (callback && callback.Data) {
          this.itemsTransfer = callback.Data;
        }

        if (this.itemsTransfer.length === 0) {
          this.commonService.toast(this.commonService.Translate(`No se obtuvieron ítems`, `No items obtained`), 'dark', 'bottom');
        }
      },
      error: (error) => {
        this.commonService.alert(AlertType.ERROR, error);
      }
    });
  }


  /**
   * Opens a modal to search and select items for transfer, then processes selected items.
   * @returns A promise that resolves when the item selection is complete.
   */
  async SearchItems(): Promise<void> {
    if(!this.ValidateSelectItem()){
      return 
    }

    if(!this.itemsTransfer || this.itemsTransfer?.length == 0 ){
      this.commonService.toast(this.commonService.Translate(`No hay items para seleccionar`, `There are no items to select`), 'dark', 'bottom');
      return;
    }
    
    try {
      let chooseModal = await this.modalCtrl.create({
        component: TransferItemSearchComponent,
        componentProps: {
          inputData: JSON.parse(JSON.stringify(this.itemsTransfer)),
        },
      });
      chooseModal.present();
      
      let loader = await this.commonService.Loader();
      chooseModal.onDidDismiss<IItemsTransfer[]>().then(async (result) => {
        loader?.present();
        if(result.data){
          await this.OnSelectItem(result.data);
        }
      }).finally(()=> loader?.dismiss())

    }catch (error) {
      this.commonService.alert(AlertType.ERROR, error);
      this.logManagerService.Log(LogEvent.ERROR, error);
    }
  }

  /**
   * Validates the selected warehouse and bin location for the transfer, ensuring
   * a destination is chosen and that source and destination are not identical.
   * @returns {boolean} - True if selection is valid; false otherwise.
   */
  ValidateSelectItem(): boolean {
    if(!this.wareHouseDestinationSelected){
      this.commonService.toast(this.commonService.Translate(`Seleccione el almacén de destino`, `Select the destination warehouse`), 'dark', 'bottom');
      return false;
    }

    if(this.binLocationsDestination?.length > 0 && !this.binLocationDestinationSelected){
      this.commonService.toast(this.commonService.Translate(`Seleccione la ubicación de destino`, `Select the destination location`), 'dark', 'bottom');
      return false;
    }
    

    if (this.wareHouseOriginSelected.WhsCode === this.wareHouseDestinationSelected.WhsCode) {
      if (this.binLocationsOrigin && this.binLocationsOrigin.length > 0 && this.binLocationsDestination && this.binLocationsDestination.length > 0) {
        if (this.binLocationOriginSelected.AbsEntry === this.binLocationDestinationSelected.AbsEntry) {
          this.commonService.toast(this.commonService.Translate(`La ubicación de origen y destino no pueden ser la misma dentro del mismo almacén`, `The source and destination locations cannot be the same within the same warehouse`), 'dark', 'bottom');
          return false;
        }
      } else {
        this.commonService.toast(this.commonService.Translate(`El almacén de origen y destino no pueden ser el mismo`, `The source and destination warehouse cannot be the same`), 'dark', 'bottom');
        return false;
      }
    }
    
    return true;
  }

  /**
   * Adds selected items to the transfer list, validating stock availability.
   * @param _items - Array of items selected for transfer, each containing quantity and stock information.
   */
   async OnSelectItem(_items: IItemsTransfer[]) {

    try {
      let itemId = this.itemsTransferSelected?.length || 0;
      for(const item of _items){
        if (this.itemsTransferSelected.some(x => x.ItemCode === item.ItemCode && x.FromWarehouseCode === this.wareHouseOriginSelected?.WhsCode)) {

          let qty: number = this.itemsTransferSelected
              .filter(x => x.ItemCode === item.ItemCode && x.FromWarehouseCode === this.wareHouseOriginSelected?.WhsCode)
              .reduce((acc, value) => acc + value.Quantity, 0);

          qty += item.Quantity;

          if (qty > +item.Stock) {
            this.commonService.Alert(AlertType.INFO, 'La cantidad no puede ser mayor al stock', 'The quantity cannot be greater than the stock');
            return
          }
        }
        if(this.itemsTransferSelected.some(x => x.ManSerNum === 'Y' && x.SysNumber === item.SysNumber)){
          this.commonService.Alert(AlertType.INFO, `El ítem ${item.ItemCode} ya ha sido agregado con la serie ${item.DistNumber}`, `The item ${item.ItemCode} has already been added to the series ${item.DistNumber}`);
          return
        }

        
        
        let groupLine: boolean = false;

        if (item.ManSerNum === 'N' && this.itemsTransferSelected.some(x => x.ItemCode === item.ItemCode && x.FromWarehouseCode === this.wareHouseOriginSelected?.WhsCode)) {

          groupLine = true;

          if (this.binLocationsOrigin && this.binLocationsOrigin.length > 0) {
            groupLine = this.itemsTransferSelected.some(x => x.ItemCode === item.ItemCode
                && x.FromWarehouseCode === this.wareHouseOriginSelected?.WhsCode
                && x.BinAbsDestino === +(this.binLocationDestinationSelected?.AbsEntry ?? 0));
          }
        }

        if (groupLine) {

          let index: number = this.itemsTransferSelected.findIndex(x => x.ItemCode === item.ItemCode && x.FromWarehouseCode === this.wareHouseOriginSelected?.WhsCode);

          if ((this.itemsTransferSelected[index].Quantity + item.Quantity ) < +this.itemsTransferSelected[index].Stock) {
            this.itemsTransferSelected[index].Quantity += item.Quantity;

            if (this.binLocationsOrigin && this.binLocationsOrigin.length > 0 && item.ManBtchNum === 'N') {
              this.itemsTransferSelected[index].StockTransferLinesBinAllocations.forEach((location)=>{
                location.Quantity = item.Quantity;
              });
            }
          } else {
            this.commonService.Alert(AlertType.INFO, 'La cantidad no puede ser mayor al stock', 'The quantity cannot be greater than the stock');
            return
          }

        } else {

          let Location: IStockTransferLinesBinAllocations[] = [];

          //Inserta la ubicacion destino
          this.binLocationsDestination && this.binLocationsDestination.length > 0 ?
              Location = [{
                BinAbsEntry: +(this.binLocationDestinationSelected.AbsEntry),
                Quantity: item.Quantity,
                BaseLineNumber: itemId,
                SerialAndBatchNumbersBaseLine: 0,
                BinActionType: 'batToWarehouse'
              } as IStockTransferLinesBinAllocations] : [];

          //Solo se inserta si el item no es manejado por lotes, inserta la ubicacion origin
          if (this.binLocationsOrigin && this.binLocationsOrigin.length > 0 && item.ManBtchNum === 'N') {

            Location.push(
                {
                  BinAbsEntry: +(this.binLocationOriginSelected.AbsEntry),
                  Quantity: item.Quantity,
                  BaseLineNumber: itemId,
                  SerialAndBatchNumbersBaseLine: 0,
                  BinActionType: 'batFromWarehouse'
                }
            );
          }

          let IdBinLocation = this.itemsTransferSelected && this.itemsTransferSelected.length > 0 ? Math.max(...this.itemsTransferSelected.map(x => (x.IdBinLocation || 0))) + 1 : 1;
          
          let setFromLocations : IBinLocation[]=[];
          let setOnHandByBin : IWarehouseBinLocation[]=[];
          
          const stockTransferResponse = await this.GetWarehousesBinLocationFrom(this.wareHouseOriginSelected?.WhsCode ?? "", item.ItemCode);

          if(stockTransferResponse.length>0){
            setFromLocations= stockTransferResponse?.map(location => ({
              ...location,
              Stock: 0 
            }));
            setOnHandByBin = stockTransferResponse;
          }else{
            setFromLocations=[];
          }

          itemId ++;
          
          let itemDataComplete = {
            Id: itemId,
            ItemCode: item.ItemCode,
            ItemDescription: item.ItemName,
            Quantity: item.Quantity,
            WarehouseCode: this.wareHouseDestinationSelected?.WhsCode,
            FromWarehouseCode: this.wareHouseOriginSelected?.WhsCode,
            SerialNumbers: item.ManSerNum === 'Y' ? [{SystemSerialNumber: item.SysNumber, Quantity: 1}] : [],
            BatchNumbers: [],
            StockTransferLinesBinAllocations: Location,
            FromNameWhsCode: (this.wareHouse.find(x => x.WhsCode === this.wareHouseOriginSelected?.WhsCode)?.WhsName || ''),
            ToNameWarehouse: (this.wareHouse.find(x => x.WhsCode === this.wareHouseDestinationSelected?.WhsCode)?.WhsName || ''),
            DistNumber: item.ManSerNum === 'Y' ? item.DistNumber : 'N/A',
            SysNumber: item.ManSerNum === 'Y' ? item.SysNumber : 0,
            Stock: +(item.Stock),
            ManSerNum: item.ManSerNum,
            ManBtchNum: item.ManBtchNum,
            LineNum: 0,
            BinActivat: '',
            BinAbsOrigin: +this.binLocationOriginSelected?.AbsEntry ?? 0,
            BinAbsDestino: +this.binLocationDestinationSelected?.AbsEntry ?? 0,
            LocationsFrom: setFromLocations?.length>0 ? setFromLocations: [],
            LocationsTo: this.binLocationsDestination.length>0 ? this.binLocationsDestination: [],
            OnHandByBin: setOnHandByBin?.length>0 ? setOnHandByBin: [],
            Udfs: [],
            IdBinLocation: IdBinLocation,
            LineStatus:LineStatus.bost_Open
          } as IStockTransferRowsSelected;

          this.itemsTransferSelected.push(itemDataComplete);
          
        }
      }
      this.isBatchedItems = this.itemsTransferSelected.some(item => item.ManBtchNum === 'Y');
      
    } catch (error) {
      this.commonService.alert(AlertType.ERROR, error);
    }
  }

  /**
   * Validates if the current user has the assigned permission
   * @param permision
   * @constructor
   */
  VerifyPermission(permision: string): boolean {
    return !this.permisionList.some((perm) => perm.Name === permision);
  }


  /**
   * Assign the selected date to the corresponding field
   * @param _dateTypeField
   * @constructor
   */
  ShowDatePicker(_dateTypeField: string): void {
    this.datePicker
        .show({
          date: new Date(),
          mode: "date",
          androidTheme: this.datePicker.ANDROID_THEMES.THEME_DEVICE_DEFAULT_LIGHT,
        })
        .then((date) => {
          switch (_dateTypeField) {
            case 'DocDate':
              this.docDate = date.toISOString()
              break;
            case 'TaxDate':
              this.taxDate = date.toISOString()
              break;
          }
        });
  }

  /**
   * Opens a modal to modify an item in the transfer document, then updates the item if changes are confirmed.
   * @param _index - The index of the item in the transfer list to be modified.
   * @param _item - The item data to be edited.
   * @param _itemSliding - (Optional) The sliding item component for the document line, closed after modification.
   */
  async ModifyDocumentLine(_index: number, _item: IStockTransferRowsSelected, _itemSliding?: IonItemSliding): Promise<void> {
    try {
      let chooseModal = await this.modalCtrl.create({
        component: EditInventoryTransferItemComponent,
        componentProps: {
          item: JSON.parse(JSON.stringify(_item)),
        },
      });
      chooseModal.present();

      chooseModal.onDidDismiss<IStockTransferRowsSelected>().then(async (result) => {
        if(result.data){
          let qty: number = this.itemsTransferSelected
              .filter((x, index) => x.ItemCode === result.data?.ItemCode && x.FromWarehouseCode === this.wareHouseOriginSelected?.WhsCode && index != _index)
              .reduce((acc, value) => acc + value.Quantity, 0);

          qty += result.data?.Quantity;

          if (qty > +result.data?.Stock) {
            this.commonService.Alert(AlertType.INFO, 'La cantidad no puede ser mayor al stock', 'The quantity cannot be greater than the stock');
            return
          }

          this.itemsTransferSelected[_index]= result.data;
        }
      });

    }catch (error) {
      this.commonService.alert(AlertType.ERROR, error);
      this.logManagerService.Log(LogEvent.ERROR, error);
    }finally {
      _itemSliding?.close();
    }
  }

  /**
   * Displays the details of a specified document line in an alert.
   * @param _documentLine - The document line data containing item details such as code, description, stock, and quantity.
   */
  ShowLineDetails(_documentLine: IStockTransferRowsSelected): void {
    let message = `
      <table class="line-details-table">
          <tr>
              <td><b>${this.commonService.Translate('Código', 'Code')}</b>:</td><td>${_documentLine.ItemCode}</td>
          </tr>
          <tr>
              <td><b>${this.commonService.Translate('Nombre', 'Name')}</b>:</td><td>${_documentLine.ItemDescription}</td>
          </tr>
          <tr>
              <td><b>${this.commonService.Translate('Disponible', 'Available')}</b>:</td><td>${_documentLine.Stock}</td>
          </tr>
          <tr>
              <td><b>${this.commonService.Translate('Cantidad', 'Quantity')}</b>:</td><td>${_documentLine.Quantity}</td>
          </tr>
          <tr>
              <td><b>${this.commonService.Translate('Almacén de origen', 'Origin warehouse')}</b>:</td><td>${_documentLine.FromNameWhsCode}</td>
          </tr>
          <tr>
              <td><b>${this.commonService.Translate('Ubicación de origen', 'Location of origin')}</b>:</td><td>${_documentLine.LocationsFrom?.find(location=> location.AbsEntry == _documentLine.BinAbsOrigin)?.BinCode || ''}</td>
          </tr>
          <tr>
              <td><b>${this.commonService.Translate('Almacén de destino', 'Destination warehouse')}</b>:</td><td>${_documentLine.ToNameWarehouse}</td>
          </tr>
          <tr>
              <td><b>${this.commonService.Translate('Ubicación de destino', 'Destination location')}</b>:</td><td>${_documentLine.LocationsTo?.find(location=> location.AbsEntry == _documentLine.BinAbsDestino)?.BinCode || ''}</td>
          </tr>
          <tr>
              <td><b>${this.commonService.Translate('Serie', 'Series')}</b>:</td><td>${_documentLine.DistNumber}</td>
          </tr>
      </table>`;


    this.commonService.Alert(AlertType.INFO, message, message, 'Detalle del producto', 'Product detail');

  }

  /**
   * Removes an item from the transfer document list if the sliding action is completed.
   * @param _index - The index of the item in the transfer list to be removed.
   * @param _item - The item data to be removed from the transfer list.
   * @param _itemSliding - The sliding item component for the document line, closed after removal.
   */
  async RemoveDocumentLine(_index: number, _item: IStockTransferRowsSelected, _itemSliding: IonItemSliding | undefined): Promise<void> {
    try {
      let slidingRatio: number = 0;

      if (_itemSliding) slidingRatio = await _itemSliding.getSlidingRatio();

      // Verifica si el deslizamiento no está en curso y el ratio de deslizamiento es igual a 0
      if (slidingRatio === 1 && _itemSliding) {

        this.itemsTransferSelected.splice(_index, 1);
        this.isBatchedItems = this.itemsTransferSelected.some(item => item.ManBtchNum === 'Y');

        //se actualizan los indices de las lineas
        this.itemsTransferSelected = this.itemsTransferSelected.map((x, index) => {
          return {
            ...x,
            Id: index + 1,
            StockTransferLinesBinAllocations: x.StockTransferLinesBinAllocations && x.StockTransferLinesBinAllocations.length > 0
                ? x.StockTransferLinesBinAllocations.map(allocation => ({
                  ...allocation,
                  BaseLineNumber: index
                }))
                : x.StockTransferLinesBinAllocations
          }
        });
        
      }
    } catch (error) {
      this.commonService.alert(AlertType.ERROR, error);
      this.logManagerService.Log(LogEvent.ERROR, error);
    } finally {
      _itemSliding?.close();
    }
  }

  /**
   * Opens a modal dialog for selecting batch items. Filters items based on batch configuration status,
   * updates selected items on confirmation.
   * @param {boolean} _callToSave - Indicates if the dialog is called during save; defaults to false.
   * @returns {Promise<void>}
   */
   async OpenDialogLotes(_callToSave: boolean= false) {
    try {
      //If called on save, the modal is started with the items with batches that have not been configured
      const batchItems = _callToSave ? this.itemsTransferSelected.filter(item => item.ManBtchNum === 'Y' && (!item.BatchNumbers || item.BatchNumbers.length === 0|| item.BatchNumbers.reduce((acc, batch)=> acc + batch.Quantity, 0) != item.Quantity)) :
          this.itemsTransferSelected.filter(item=> item.ManBtchNum == 'Y');
      
      let chooseModal = await this.modalCtrl.create({
        component: SelectBatchItemsComponent,
        componentProps: {
          batchedItems: [...batchItems]
        },
      });
      
      chooseModal.present();

      chooseModal.onDidDismiss<IStockTransferRowsSelected[]>().then(async (result) => {
        if(result.data){
          result.data.forEach((batchItem)=>{
            this.itemsTransferSelected[batchItem.Id -1] = batchItem;
          })
        }
      });

    }catch (error) {
      this.commonService.alert(AlertType.ERROR, error);
      this.logManagerService.Log(LogEvent.ERROR, error);
    }
  }

  /**
   * Retrieves a list of User Defined Fields (UDFs) from the presentation component and combines them with development UDFs.
   * @returns An array of UDF objects containing the name, field type, and value.
   */
  GetValuesUDFs(): IUdf[] {
    let UDFList: IUdf[] = [];

    const valuesUDFs = this.udfPresentationComponent?.GetValuesUDFs() || [];

    if (Array.isArray(valuesUDFs)) {
      UDFList = valuesUDFs
          .map(([key, value]) => ({ Name: key, FieldType: '', Value: value } as IUdf));
    }

    let data = MappingUdfsDevelopment({
      uniqueId: this.uniqueId,
    } as IUniqueId, this.udfsDevelopment);

    UDFList.push(...data);

    return UDFList;
  }

  /*
  * Saves the changes made in the stock transfer request by sending the data to the server.
  * It constructs the transfer request data including details like comments, warehouses, and UDFs.
  */
  async SaveChanges() {

    //Valido que se hayan ingresado los lotes
    if (this.itemsTransferSelected.some(x => x.ManBtchNum === 'Y' && (!x.BatchNumbers || x.BatchNumbers.length === 0 || x.BatchNumbers.reduce((acc, batch)=> acc + batch.Quantity, 0) != x.Quantity))) {
      this.OpenDialogLotes(true);
      
      this.commonService.toast(this.commonService.Translate(`Hay ítems manejados por lotes, por favor ingrese la cantidad por lote`, `There are items handled in batches, please enter the quantity per batch`), 'dark', 'bottom');
      return;
    }

    //Valido l acantidad disponible ya sea por almacen o ubicaion
    let index = this.itemsTransferSelected.findIndex(x => x.Quantity > x.Stock);

    if (index >= 0) {
      let rowItem = this.itemsTransferSelected[index];
      this.commonService.Alert(AlertType.INFO, `El ítem ${rowItem.ItemCode}, no puede tener una cantidad mayor al disponible, stock: ${rowItem.Stock}`, `The item ${rowItem.ItemCode}, cannot have a quantity greater than that available, stock: ${rowItem.Stock}`);
      return;
    }

    //Valido que se hayan ingresado las series
    index = this.itemsTransferSelected.findIndex(x => x.ManSerNum === 'Y' && (!x.SerialNumbers || x.SerialNumbers.length === 0));

    if (index >= 0) {
      let rowItem = this.itemsTransferSelected[index];
      this.commonService.Alert(AlertType.INFO, `El ítem <b>${rowItem.ItemCode} - ${rowItem.ItemDescription}</b> es manejado por series por favor ingrese la serie al editar`, `Item <b>${rowItem.ItemCode} - ${rowItem.ItemDescription}</b> is handled by series please enter the series when editing`);
      return;
    }

    //Valido que se hayan ingresado las ubicaciones de origen
    if (this.itemsTransferSelected.some(x => x.BinActivat === 'Y' && x.BinAbsOrigin === -1)) {
      this.commonService.Alert(AlertType.INFO,
          `Verifique que todas las líneas tengan la ubicación de origen asignada, si no posee ubicación en la columna (Ubicación origen), el ítem no tiene stock en ninguna ubicación`,
          `Verify that all lines have the source location assigned, if it does not have a location in the (Source Location) column, the item does not have stock in any location`);

      return;
    }


    if (this.itemsTransferSelected.some(x => x.BinAbsDestino === -1 && x.LocationsTo && x.LocationsTo.length > 0)) {
      this.commonService.Alert(AlertType.INFO,
          `Verifique que todas las líneas tengan la ubicación de destino asignada`,
          `Verify that all lines have the destination location assigned`);

      return;
    }

    let data: IStockTransfer = {
      DocEntry: this.isEditionMode ? this.preloadedDocument?.DocEntry : 0,
      DocNum:  this.isEditionMode ? this.preloadedDocument?.DocNum : 0,
      AttachmentEntry: 0,
      Comments: this.comments,
      ToWarehouse: this.wareHouseDestinationSelected?.WhsCode || '',
      FromWarehouse: this.wareHouseOriginSelected?.WhsCode || '',
      DocDate : FormatDate(this.docDate),
      TaxDate : FormatDate(this.taxDate),
      SalesPersonCode: Number(this.salesPersonSelected.SlpCode),
      Udfs: this.GetValuesUDFs(),
      StockTransferLines: this.itemsTransferSelected.map(element => {
        return {
          ItemCode: element.ItemCode,
          ItemDescription: element.ItemDescription,
          Quantity: element.Quantity,
          WarehouseCode: element.WarehouseCode,
          FromWarehouseCode: element.FromWarehouseCode,
          SerialNumbers: element.SerialNumbers,
          BatchNumbers: element.BatchNumbers,
          BaseType: element.BaseType,
          BaseLine: element.BaseLine,
          BaseEntry: element.BaseEntry,
          LineStatus:element.LineStatus,
          StockTransferLinesBinAllocations: element.StockTransferLinesBinAllocations,
          Udfs: []
        } as IStockTransferRows
      })
    }
    
    let loader = await this.commonService.Loader();
    loader.present();

    let request$;

    if (this.preloadedDocument?.DocEntry > 0 && this.isEditionMode ) {
      request$ = this.stockTransferService.Patch(data);
    } else {
      request$ = this.stockTransferService.Post(data);
    }

    request$.pipe(
        finalize(() => loader.dismiss())
    ).subscribe({
      next: (callback) => {
        let message = `
          <table class="line-details-table">
              <tr>
                  <td><b>DocNum</b>:</td><td>${callback?.Data?.DocNum || this.preloadedDocument?.DocNum || 0}</td>
              </tr>
              <tr>
                  <td><b>DocEntry</b>:</td><td>${callback?.Data?.DocEntry || this.preloadedDocument?.DocEntry || 0}</td>
              </tr>
          </table>`;

        this.commonService.Alert(AlertType.SUCCESS,
            message,
            message,
            `Transferencia de stock ${this.isEditionMode? 'actualizada': 'creada'} correctamente`,
            `Stock transfer ${this.isEditionMode? 'updated': 'created'} successfully`)
        ;
        this.RefreshData();
      },
      error: (error) => {
        this.commonService.alert(AlertType.ERROR, error);
      }
    });
  }

  /**
   * Resets the transfer request data to its initial state, clearing selected items, warehouses, and dates.
   * It also generates a new unique document ID and initializes the UDF form.
   */
  RefreshData() {
    this.docDate= new Date().toISOString();
    this.taxDate= new Date().toISOString();
    this.udfPresentationComponent?.initUDFForm();
    this.uniqueId = this.commonService.GenerateDocumentUniqueID();

    this.showHeader = true;
    this.showOriginData = true;
    this.showDestinationData = true;
    this.showDateFields = false;

    this.isBatchedItems= false;
    this.isSelectItemDisabled = false;
    this.comments= '';
    
    this.salesPersonSelected= null;
    
    this.wareHouseOriginSelected=  null;
    this.wareHouseDestinationSelected= null;

    this.binLocationsOrigin= [];
    this.binLocationsDestination= [];
    this.binLocationOriginSelected= null;
    this.binLocationDestinationSelected= null;

    this.itemsTransfer= [];
    this.itemsTransferSelected= [];

    this.preloadedDocument = null;
    this.isActionDuplicate = false;
    this.isEditionMode = false;
    this.isActionCopyTo = false;

    this.udfs = [];
    this.udfsDevelopment  = [];
    this.udfsValues = [];
  }
  

}
