import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Structures} from '@clavisco/core';
import {Observable} from 'rxjs';
import {
  IItemDataForInvoiceGoodReceipt,
  IItemMasterData,
  ItemDetail,
  ItemsTransfer,
  IWhInfoItem
} from '../interfaces/i-items';
import ICLResponse = Structures.Interfaces.ICLResponse;
import {ISerialNumbers} from "@app/interfaces/i-serial-batch";
import {DefineDescriptionHeader} from "@app/shared/shared.service";
import {ItemsFilterType} from "@app/enums/enums";


@Injectable({
  providedIn: 'root'
})
export class ItemsService {
  private readonly CONTROLLER = 'api/Items';

  constructor(private http: HttpClient) {
  }


  Get<T>(_code?: string, _whsCode?: string, _priceList?: number, _cardCode: string = '',
         _isItemSerialBatch?: number, _sysNumber?: number, _prchseItem: string = 'Y', _viewType: string = ItemsFilterType.InvntItem): Observable<Structures.Interfaces.ICLResponse<T>> {
    let encodingItemCode = encodeURIComponent(_code || '');

    let path = this.CONTROLLER;
    if (_code) {
      path += `?ItemCode=${encodingItemCode}&WhsCode=${_whsCode}&PriceList=${_priceList}&CardCode=${_cardCode}&PrchseItem=${_prchseItem}&SysNumber=${(_sysNumber ? _sysNumber : 0)}&ViewType=${_viewType}`;
    }

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Items obtenidos',
          OnError: 'No se pudo obtener los items'
        })});
  }

  /**
   * Methot to get items by whscode and type view
   * @param _whsCode - Code warehouse
   * @param _viewType - Type view
   * @constructor
   */
  GetAll<T>(_whsCode?: string, _viewType: string = ItemsFilterType.InvntItem): Observable<Structures.Interfaces.ICLResponse<T>> {

    let path = this.CONTROLLER;

    if (_whsCode) {
      path += `?&WhsCode=${_whsCode}&ViewType=${_viewType}`;
    }


    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Items de inventario obtenidos',
          OnError: 'No se pudo obtener los items de inventario'
        })});
  }

  GetAllPagination<T>(_itemCode:string = "", _whsCode: string = "", _viewType: string = ItemsFilterType.InvntItem): Observable<Structures.Interfaces.ICLResponse<T>> {

    let path = this.CONTROLLER;

    if (_whsCode) {
        path += `?ItemCode=${_itemCode}&WhsCode=${_whsCode}&ViewType=${_viewType}`;
    }

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Items de inventario obtenidos',
          OnError: 'No se pudo obtener los items de inventario'
        })});
  }

  GetAllItemsPagination<T>(_itemCode:string = ""): Observable<Structures.Interfaces.ICLResponse<T>> {

    let path = this.CONTROLLER;


    path += `?ItemCode=${_itemCode}`;


    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Items de inventario obtenidos',
          OnError: 'No se pudo obtener los items de inventario'
        })});
  }

  Post(_item: IItemMasterData): Observable<Structures.Interfaces.ICLResponse<IItemMasterData>> {
    return this.http.post<Structures.Interfaces.ICLResponse<IItemMasterData>>(this.CONTROLLER, _item);
  }

  Patch(_item: IItemMasterData): Observable<Structures.Interfaces.ICLResponse<IItemMasterData>> {
    _item.ItemCode = encodeURIComponent(_item.ItemCode);
    return this.http.patch<Structures.Interfaces.ICLResponse<IItemMasterData>>(this.CONTROLLER, _item);
  }

  GetStock<T>(_itemCode: string): Observable<Structures.Interfaces.ICLResponse<T>> {
    let encodingItemCode = encodeURIComponent(_itemCode || '');
    return this.http.get<Structures.Interfaces.ICLResponse<T>>(`${this.CONTROLLER}/${encodingItemCode}/WarehouseAvailability`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Stock de item obtenido',
          OnError: 'No se pudo obtener el stock del item'
        })});
  }

  /**
   * Method to obtain warehouses according to filter
   * @param _value - Value to find warehouses matches
   * @constructor
   */
  GetbyFilter<T>(_itemCode: string, _value:string): Observable<Structures.Interfaces.ICLResponse<T>> {
    let encodingItemCode = encodeURIComponent(_itemCode || '');
    let path = `${this.CONTROLLER}/WarehouseAvailabilityByFilter?&ItemCode=${encodingItemCode}&FilterWarehouse=${_value.toUpperCase() ?? ""}`;

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path, {headers: DefineDescriptionHeader({
        OnSuccess: 'Stock de item obtenido',
        OnError: 'No se pudo obtener el stock del item'
      })});
  }

  GetItemForTransfer(_whsCode: string, _binAbs: number = 0): Observable<ICLResponse<ItemsTransfer[]>> {
    let whsCodeDefault: string = _binAbs > 0 ? _whsCode : '';
    return this.http.get<ICLResponse<ItemsTransfer[]>>(`${this.CONTROLLER}?WhsCode=${_whsCode}&BinAbs=${_binAbs}&WarehouseDefault=${whsCodeDefault}`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Items para transferencia obtenidos',
          OnError: 'No se pudo obtener los items para transaferencia'
        })});
  }

  GetItemForTransferPagination(_whsCode: string, _binAbs: number = 0, _itemCode: string): Observable<ICLResponse<ItemsTransfer[]>> {
    let whsCodeDefault: string = _binAbs > 0 ? _whsCode : '';
    return this.http.get<ICLResponse<ItemsTransfer[]>>(`${this.CONTROLLER}?WhsCode=${_whsCode}&BinAbs=${_binAbs}&WarehouseDefault=${whsCodeDefault}&ItemCode=${_itemCode.toUpperCase()}`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Items para transferencia obtenidos',
          OnError: 'No se pudo obtener los items para transaferencia'
        })});
  }

  GetItemForTransferRequest(_whsCode: string): Observable<ICLResponse<ItemsTransfer[]>> {
    return this.http.get<ICLResponse<ItemsTransfer[]>>(`${this.CONTROLLER}/TransferRequest?WhsCode=${_whsCode}`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Items para solicitud de traslado obtenidos',
          OnError: 'No se pudo obtener los items para solicitud de traslado'
        })});
  }

  GetItemForTransferRequestPagination(_whsCode: string, _itemCode:string): Observable<ICLResponse<ItemsTransfer[]>> {
    return this.http.get<ICLResponse<ItemsTransfer[]>>(`${this.CONTROLLER}/TransferRequest?WhsCode=${_whsCode}&ItemCode=${_itemCode}`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Items para solicitud de traslado obtenidos',
          OnError: 'No se pudo obtener los items para solicitud de traslado'
        })});
  }

  GetItemDetail<T>(_itemCode: string, _docType: string): Observable<ICLResponse<T[]>> {
    let encodingItemCode = encodeURIComponent(_itemCode || '');
    return this.http.get<ICLResponse<T[]>>(`${this.CONTROLLER}/ItemDetails?ItemCode=${encodingItemCode}&DocType=${_docType}`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Detalles de item obtenidos',
          OnError: 'No se pudo obtener los detalles del item'
        })});
  }

  GetDataForGoodReceiptInvoice(_itemCodes: string[]): Observable<ICLResponse<IItemDataForInvoiceGoodReceipt[]>> {
    return this.http.post<ICLResponse<IItemDataForInvoiceGoodReceipt[]>>(`${this.CONTROLLER}/GetDataForGoodReceiptInvoice`, _itemCodes,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Items para entrada de mercancias obtenidos',
          OnError: 'No se pudo obtener los items para entrada de mercancias'
        })});
  }


  GetItemSeriesByWarehouse(_itemCode:string, _whsCode:string):Observable<ICLResponse<ISerialNumbers[]>>{
    return this.http.get<ICLResponse<ISerialNumbers[]>>(`${this.CONTROLLER}/${encodeURIComponent(_itemCode)}/Warehouse/${_whsCode}/Series`,
      {
        headers: DefineDescriptionHeader({
          OnSuccess: 'Series de item obtenidas',
          OnError: 'No se pudo obtener las series de item'
        })});
  }

  GetByScan<T>(_itemCode:string = "", _whsCode?: string, _viewType: string = ItemsFilterType.InvntItem): Observable<Structures.Interfaces.ICLResponse<T>> {

    let path = this.CONTROLLER;

    if (_whsCode) {
      path += `/GetByScan?ItemCode=${_itemCode}&WhsCode=${_whsCode}&ViewType=${_viewType}`;
    }
    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Items de inventario obtenidos',
          OnError: 'No se pudo obtener los items de inventario'
        })});
  }

  GetItemForTransferRequestScan(_whsCode: string, _itemCode:string): Observable<ICLResponse<ItemsTransfer[]>> {
    return this.http.get<ICLResponse<ItemsTransfer[]>>(`${this.CONTROLLER}/TransfersRequestScan?WhsCode=${_whsCode}&ItemCode=${_itemCode}`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Items para solicitud de traslado obtenidos',
          OnError: 'No se pudo obtener los items para solicitud de traslado'
        })});
  }

  GetItemForTransferScan(_whsCode: string, _binAbs: number = 0, _itemCode: string): Observable<ICLResponse<ItemsTransfer[]>> {
    let whsCodeDefault: string = _binAbs > 0 ? _whsCode : '';
    return this.http.get<ICLResponse<ItemsTransfer[]>>(`${this.CONTROLLER}/GetTransfersRequestScan?WhsCode=${_whsCode}&BinAbs=${_binAbs}&WarehouseDefault=${whsCodeDefault}&ItemCode=${_itemCode}`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Items para transferencia obtenidos',
          OnError: 'No se pudo obtener los items para transaferencia'
        })});
  }
  /**
   * Send a request to retrieve the item inventory information in an specific warehouse
   * @param _viewType Item to retrieve the inventory information
   * @param _whsCode Warehouse to retrieve the inventory information
   * @constructor
   */
  GetAllInventory<T>(_whsCode: string="", _viewType: string = ItemsFilterType.InvntItem): Observable<Structures.Interfaces.ICLResponse<T>> {

    let path = this.CONTROLLER;

    path += `/GetItemsEntryInventory?&WhsCode=${_whsCode}&ViewType=${_viewType}`;
    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path,
      {
        headers: DefineDescriptionHeader({
          OnSuccess: 'Items de inventario obtenidos',
          OnError: 'No se pudo obtener los items de inventario'
        })
      });
  }

  /**
   * Send a request to retrieve the item inventory information in an specific warehouse
   * @param _viewType Item to retrieve the inventory information
   * @param _whsCode Warehouse to retrieve the inventory information
   * @param _itemCode Information of the Item
   * @constructor
   */
  GetEntryAllPagination<T>(_itemCode:string = "", _whsCode?: string, _viewType: string = ItemsFilterType.InvntItem): Observable<Structures.Interfaces.ICLResponse<T>> {

    let path = this.CONTROLLER;

    if (_whsCode!="") {
      path += `?ItemCode=${_itemCode}&WhsCode=${_whsCode}&ViewType=${_viewType}`;
    }else{
      path += `/GetItemsEntryInventoryPagination?ItemCode=${_itemCode}&WhsCode=${_whsCode}&ViewType=${_viewType}`;
    }


    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Items de inventario obtenidos',
          OnError: 'No se pudo obtener los items de inventario'
        })});
  }

}
