import {Component, ViewChild} from '@angular/core';
import {DatePicker} from "@ionic-native/date-picker/ngx";
import {IonItemSliding} from "@ionic/angular";
import {forkJoin, of} from "rxjs";
import {catchError, finalize} from "rxjs/operators";
import {UdfPresentationComponent} from "../../../components";
import {ISalesPerson} from "../../../interfaces/i-sales-person";
import {IWarehouse} from "../../../models/i-warehouse";
import {IItemsTransfer} from "../../../models/db/product-model";
import {IStockTransferRequest, IStockTransferRequestRows} from "../../../interfaces/i-stock-transfer-request";
import {IUdf, IUdfContext, IUdfDevelopment} from "../../../interfaces/i-udfs";
import {
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
import {InventoryTransferRequestService} from "../../../services/inventory-transfer-request.service";
import {UdfsCategory, AlertType, LogEvent, LineStatus, LocalStorageVariables} from 'src/app/common/enum';
import { FilterDataComponent } from 'src/app/components/filter-data/filter-data.component';
import {
  TransferItemSearchComponent
} from "../../../components/inventory/transfer-request/transfer-item-search/transfer-item-search.component";
import {
  EditTransferItemComponent
} from "../../../components/inventory/transfer-request/edit-transfer-item/edit-transfer-item.component";
import {FormatDate, MappingUdfsDevelopment} from "../../../common/function";
import {IUniqueId} from "../../../interfaces/i-documents";
import {PermissionsSelectedModel} from "../../../models";


@Component({
  selector: 'app-transfer-request',
  templateUrl: './transfer-request.page.html',
  styleUrls: ['./transfer-request.page.scss'],
})
export class TransferRequest {

  @ViewChild(UdfPresentationComponent, { static: false }) udfPresentationComponent: UdfPresentationComponent;
  
  showHeader = true;
  showDateFields = false;
  isActionDuplicate: boolean = false;
  isEditionMode: boolean = false;
  
  comments: string;
  uniqueId: string;
  
  docDate: string;
  dueDate: string
  taxDate: string
  
  indexMaxUpdate: number = -1;
  indexMinUpdate: number = 0;


  salesPerson: ISalesPerson[] = [];
  salesPersonSelected: ISalesPerson | null;

  wareHouse: IWarehouse[] = [];
  wareHouseOriginSelected: IWarehouse | null;
  wareHouseDestinationSelected: IWarehouse | null;
  
  itemsTransfer: IItemsTransfer[]= [];
  itemsTransferSelected: IStockTransferRequestRows[]= [];

  preloadedDocument: IStockTransferRequest | null;

  permisionList: PermissionsSelectedModel[] = [];
 
  udfs: IUdfContext[] = [];
  udfsDevelopment: IUdfDevelopment[] = [];
  udfsValues: IUdf[] = [];

  constructor(private datePicker: DatePicker,
              private commonService: CommonService,
              private warehouseService: WarehouseService,
              private salesPersonService: SalesPersonService,
              private udfsService: UdfsService,
              private modalCtrl: CustomModalController,
              private logManagerService: LogManagerService,
              private productService: ProductService,
              private inventoryTransferRequestService: InventoryTransferRequestService,
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
      InventoryUDFs: this.udfsService.Get(UdfsCategory.OWTQ).pipe(catchError(error => of(null))),
      UDFsDevelopment: this.udfsService.GetUdfsDevelopment(UdfsCategory.OWTQ).pipe(catchError(error => of(null))),
    }).pipe(finalize(()=> loader.dismiss()))
        .subscribe({
          next: (callbacks) => {
            this.wareHouse = callbacks.WareHouse?.Data || [];
            
            this.salesPerson = callbacks.SalesMen?.Data || [];
            
            this.udfs = callbacks.InventoryUDFs?.Data || []

            this.udfs = callbacks.InventoryUDFs?.Data || [];
            
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
      let documentData = this.localStorageService.data.get(LocalStorageVariables.DocumentToEdit) as IStockTransferRequest;
      if (!documentData) return;

      this.isEditionMode = this.localStorageService.data.get(LocalStorageVariables.IsEditionMode) ?? false;
      this.isActionDuplicate = this.localStorageService.data.get(LocalStorageVariables.IsActionDuplicate) ?? false;
      
      this.SetDataForEdit(documentData);

      this.localStorageService.data.delete(LocalStorageVariables.DocumentToEdit);
      this.localStorageService.data.delete(LocalStorageVariables.IsActionDuplicate);
      this.localStorageService.data.delete(LocalStorageVariables.IsEditionMode);
      
    } catch (e) {

    }
  }

  /**
   * Load data from request to edit
   * @param _data
   * @constructor
   * @private
   */
  private SetDataForEdit(_data: IStockTransferRequest): void {

    try {
      this.wareHouseOriginSelected = this.wareHouse.find(warehouse => warehouse.WhsCode == _data.FromWarehouse) || null;
      this.wareHouseDestinationSelected = this.wareHouse.find(warehouse => warehouse.WhsCode == _data.ToWarehouse) || null;

      this.comments = _data.Comments;
      this.salesPersonSelected = this.salesPerson.find(person => person.SlpCode == _data.SalesPersonCode) || null;
      this.docDate= _data.DocDate;
      this.dueDate= _data.DueDate;
      this.taxDate= _data.TaxDate;
      
      this.udfsValues = _data.Udfs || [];
      
      this.preloadedDocument = _data || null;
      

      this.indexMaxUpdate = _data?.StockTransferLines.reduce((acc, i) => (i.BaseLine > acc.BaseLine ? i : acc)).BaseLine || 0;
      this.indexMinUpdate = _data?.StockTransferLines.reduce((acc, i) => (i.BaseLine < acc.BaseLine ? i : acc)).BaseLine || 0;

      this.itemsTransferSelected = _data.StockTransferLines.map((element, index) => {
        return {
          ItemCode: element.ItemCode,
          ItemDescription: element.ItemDescription,
          Quantity: element.Quantity,
          WarehouseCode: element.WarehouseCode,
          FromWarehouseCode: element.FromWarehouseCode,
          SerialNumbers: [],
          BaseType: '',
          BaseLine: element.BaseLine,
          BaseEntry: 0,
          SysNumber: 0,
          DistNumber: '',
          Stock: element.Stock,
          ManSerNum: element.ManSerNum,
          ManBtchNum: element.ManBtchNum,
          LineNum: element.BaseLine,
          LocationsFrom: [],
          LocationsTo: [],
          LineStatus: element.LineStatus,
          Udfs: []
        } as IStockTransferRequestRows

      });

      this.GetItems(this.wareHouseOriginSelected?.WhsCode || '');

    } catch (Exception) {
      this.commonService.alert(AlertType.ERROR, Exception);
    }
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

      chooseModal.onDidDismiss<ISalesPerson>().then(async (result) => {
        let loader = await this.commonService.GetTopLoader();

        if(result.data){
          this.salesPersonSelected = result.data as ISalesPerson;

        }
        loader?.dismiss();
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
          inputData:  this.wareHouse.filter(wareHouse => wareHouse?.WhsCode != this.wareHouseDestinationSelected?.WhsCode),
          inputTitle: "INVENTORY.SEARCH WAREHOUSE ORIGIN",
          inputFilterProperties: ['WhsName']
        },
      });
      chooseModal.present();
  
      chooseModal.onDidDismiss<IWarehouse>().then(async (result) => {
        let loader = await this.commonService.GetTopLoader();
        if(result.data){
          this.wareHouseOriginSelected = result.data as IWarehouse
          
          await this.GetItems(this.wareHouseOriginSelected.WhsCode);
        }
        loader?.dismiss();
      });

    }catch (error) {
      this.commonService.alert(AlertType.ERROR, error);
      this.logManagerService.Log(LogEvent.ERROR, error);
    }finally {
      _slidingWareHouseOrigin?.close();
    }
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
          inputData: this.wareHouse.filter(wareHouse => wareHouse?.WhsCode != this.wareHouseOriginSelected?.WhsCode),
          inputTitle: "INVENTORY.SEARCH DESTINATION WAREHOUSE",
          inputFilterProperties: ['WhsName']
        },
      });
      chooseModal.present();

      chooseModal.onDidDismiss<IWarehouse>().then(async (result) => {
        let loader = await this.commonService.GetTopLoader();
        if(result.data){
          this.wareHouseDestinationSelected = result.data as IWarehouse
        }
        loader?.dismiss();
      });
      
    }catch (error) {
      this.commonService.alert(AlertType.ERROR, error);
      this.logManagerService.Log(LogEvent.ERROR, error);
    }finally {
      _slidingWareHouseDestinatio?.close();
    }
    
  }


  /**
   * Retrieves items for a specified warehouse code and sets them for transfer.
   * @param _whsCode - The code of the warehouse to fetch items from.
   */
  async GetItems(_whsCode: string) {
    let loader = await this.commonService.Loader();

    loader.present();
    this.productService.GetItemForTransferRequest(_whsCode).pipe(
        finalize(() => loader.dismiss())
    ).subscribe({
      next: (callback) => {
        if(callback.Data){
          this.itemsTransfer = callback.Data;
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
    try {
      let chooseModal = await this.modalCtrl.create({
        component: TransferItemSearchComponent,
        componentProps: {
          inputData: JSON.parse(JSON.stringify(this.itemsTransfer)),
        },
      });
      chooseModal.present();

      chooseModal.onDidDismiss<IItemsTransfer[]>().then(async (result) => {
        let loader = await this.commonService.GetTopLoader();
        if(result.data){
          this.OnSelectItem(result.data);
        }
        loader?.dismiss();
      });

    }catch (error) {
      this.commonService.alert(AlertType.ERROR, error);
      this.logManagerService.Log(LogEvent.ERROR, error);
    }
  }

  /**
   * Adds selected items to the transfer list, validating stock availability.
   * @param _items - Array of items selected for transfer, each containing quantity and stock information.
   */
  public OnSelectItem(_items: IItemsTransfer[]): void {

    try {
      _items.forEach((item)=>{
        if (this.itemsTransferSelected.some(x => x.ItemCode === item.ItemCode && x.FromWarehouseCode === this.wareHouseOriginSelected?.WhsCode)) {

          let qty: number = this.itemsTransferSelected
              .filter(x => x.ItemCode === item.ItemCode && x.FromWarehouseCode === this.wareHouseOriginSelected?.WhsCode)
              .reduce((acc, value) => acc + value.Quantity, 0);

          qty += item.Quantity;

          if (qty > +item.Stock) {
            this.commonService.Alert(AlertType.INFO, 'La cantidad no puede ser mayor al stock', 'The quantity cannot be greater than the stock');
            return
          }
          
          let index = this.itemsTransferSelected.findIndex(x => x.ItemCode === item.ItemCode && x.FromWarehouseCode === this.wareHouseOriginSelected?.WhsCode)
          if (index >= 0) {
            this.itemsTransferSelected[index].Quantity += item.Quantity;
            return;
          }
          
        } 
        let itemModel = {
          ItemCode: item.ItemCode,
          ItemDescription: item.ItemName,
          Quantity: item.Quantity,
          WarehouseCode: this.wareHouseDestinationSelected?.WhsCode,
          FromWarehouseCode: this.wareHouseOriginSelected?.WhsCode,
          SerialNumbers: item.ManSerNum === 'Y' ? [{SystemSerialNumber: item.SysNumber, Quantity: 1}] : [],
          DistNumber: item.ManSerNum === 'Y' ? item.DistNumber : 'N/A',
          SysNumber: item.ManSerNum === 'Y' ? item.SysNumber : 0,
          Stock: +(item.Stock),
          ManSerNum: item.ManSerNum,
          ManBtchNum: item.ManBtchNum,
          LineNum: -1,
          BinActivat: '',
          LocationsTo: [],
          LocationsFrom: [],
          LineStatus: LineStatus.bost_Open,
          Udfs: []
        } as IStockTransferRequestRows;

        this.itemsTransferSelected.push(itemModel);

      })
    } catch (Exception) {
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
   * Opens a modal to modify an item in the transfer document, then updates the item if changes are confirmed.
   * @param _index - The index of the item in the transfer list to be modified.
   * @param _item - The item data to be edited.
   * @param _itemSliding - (Optional) The sliding item component for the document line, closed after modification.
   */
  async ModifyDocumentLine(_index: number, _item: IStockTransferRequestRows, _itemSliding?: IonItemSliding): Promise<void> {
    
    try {
      let chooseModal = await this.modalCtrl.create({
        component: EditTransferItemComponent,
        componentProps: {
          item: JSON.parse(JSON.stringify(_item)),
          wareHouse: this.wareHouse,
        },
      });
      chooseModal.present();

      chooseModal.onDidDismiss<IStockTransferRequestRows>().then(async (result) => {
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
   * Removes an item from the transfer document list if the sliding action is completed.
   * @param _index - The index of the item in the transfer list to be removed.
   * @param _item - The item data to be removed from the transfer list.
   * @param _itemSliding - The sliding item component for the document line, closed after removal.
   */
  async RemoveDocumentLine(_index: number, _item: IStockTransferRequestRows, _itemSliding: IonItemSliding | undefined): Promise<void> {

    try {
      let slidingRatio: number = 0;

      if (_itemSliding) slidingRatio = await _itemSliding.getSlidingRatio();

      // Verifica si el deslizamiento no está en curso y el ratio de deslizamiento es igual a 0
      if (slidingRatio === 1 && _itemSliding) {

        this.itemsTransferSelected.splice(_index, 1);
      }
    } catch (error) {
      this.commonService.alert(AlertType.ERROR, error);
      this.logManagerService.Log(LogEvent.ERROR, error);
    } finally {
      _itemSliding?.close();
    }
  }

  /**
   * Gets the name of the warehouse by code
   * @param _code Code of the warehouse
   * @constructor
   */
  GetWarehouseName(_code: string): string{
    return this.wareHouse.find(warehouse=> warehouse.WhsCode == _code)?.WhsName || '-'
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
          case 'DueDate':
            this.dueDate = date.toISOString()
            break;
          case 'TaxDate':
            this.taxDate = date.toISOString()
            break;
        }
      });
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

  /**
   * Displays the details of a specified document line in an alert.
   * @param _documentLine - The document line data containing item details such as code, description, stock, and quantity.
   */
  ShowLineDetails(_documentLine: IStockTransferRequestRows): void {
    
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
              <td><b>${this.commonService.Translate('Almacén de origen', 'Origin warehouse')}</b>:</td><td>${this.GetWarehouseName(_documentLine.FromWarehouseCode)}</td>
          </tr>
          <tr>
              <td><b>${this.commonService.Translate('Almacén de destino', 'Destination warehouse')}</b>:</td><td>${this.GetWarehouseName(_documentLine.WarehouseCode)}</td>
          </tr>
      </table>`;


    this.commonService.Alert(AlertType.INFO, message, message, 'Detalle del producto', 'Product detail');
  }


  /**
   * Saves the changes made in the stock transfer request by sending the data to the server.
   * It constructs the transfer request data including details like comments, warehouses, and UDFs.
   */
 async SaveChanges() {

    let data = {
      DocEntry: this.isEditionMode ? this.preloadedDocument?.DocEntry : 0,
      DocNum: 0,
      Comments:this.comments,
      FromWarehouse: this.wareHouseOriginSelected?.WhsCode,
      ToWarehouse: this.wareHouseDestinationSelected?.WhsCode,
      SalesPersonCode: this.salesPersonSelected?.SlpCode,
      Udfs: this.GetValuesUDFs(),
      DocDate: FormatDate(this.docDate),
      DueDate: FormatDate(this.dueDate),
      TaxDate: FormatDate(this.taxDate)
    } as IStockTransferRequest

    let isUpdate = false;

    if (this.preloadedDocument?.DocEntry > 0 && this.isEditionMode ) {
      isUpdate = true;
      if ((this.itemsTransferSelected.length - 1) < this.indexMinUpdate) {
        this.indexMaxUpdate = -1;
      }
    }

    data.StockTransferLines = this.itemsTransferSelected.map((element) => {
      element.LineNum == -1 ? this.indexMaxUpdate = this.indexMaxUpdate + 1 : this.indexMaxUpdate;
      return {
        ItemCode: element.ItemCode,
        ItemDescription: element.ItemDescription,
        Quantity: element.Quantity,
        WarehouseCode: element.WarehouseCode,
        FromWarehouseCode: element.FromWarehouseCode,
        SerialNumbers: element.SerialNumbers,
        Udfs: [],
        LineNum: isUpdate ? element.LineNum == -1 ? this.indexMaxUpdate : element.LineNum : element.LineNum
      } as IStockTransferRequestRows;
    })
    
    let loader = await this.commonService.Loader();
    loader.present();

    let request$;

    if (isUpdate) {
      request$ = this.inventoryTransferRequestService.Patch(data);
    } else {
      request$ = this.inventoryTransferRequestService.Post(data);
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
            `Solicitud de transferencia ${isUpdate? 'actualizada': 'creada'} correctamente`,
            `Transfer request ${isUpdate? 'updated': 'created'}  successfully`)
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
    this.itemsTransferSelected = [];
    this.itemsTransfer = []
    this.wareHouseDestinationSelected = null;
    this.wareHouseOriginSelected = null;
    this.salesPersonSelected = null;
    this.docDate= new Date().toISOString();
    this.dueDate= new Date().toISOString();
    this.taxDate= new Date().toISOString();
    this.uniqueId = this.commonService.GenerateDocumentUniqueID();
    this.showHeader = true;
    this.showDateFields = false;
    this.comments= '';
    this.udfPresentationComponent?.initUDFForm();
    this.preloadedDocument = null;
    this.isActionDuplicate = false;
    this.isEditionMode = false;
    this.indexMaxUpdate = -1;
    this.indexMinUpdate = 0;

    this.udfs = [];
    this.udfsDevelopment  = [];
    this.udfsValues = [];
  }
  
}
