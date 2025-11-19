import {DatePipe} from "@angular/common";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Injectable, Injector} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {Observable, of} from "rxjs";
import {ChangeElement, LocalStorageVariables, ViewType} from "src/app/common/enum";
import {
    FreightResponse, IBaseReponse,
    IBatchedItem,
    IItemInventoryInfo,
    IItemToFreight,
    IMeasurementUnit,
    ItemFocusResponse,
    ProductsStockResponse,
} from "src/app/models";
import {
    BillOfMaterialModel,
    IItemInventoryParameter,
    IItemsTransfer,
} from "src/app/models/db/product-model";
import {ApiResponse, ICLResponse, ItemsFreightedResponse} from "src/app/models/responses/response";
import {LocalStorageService} from "./local-storage.service";
import {IUserAssign} from "../models/db/user-model";
import {MobileBatchesList} from "../interfaces/i-batches";
import {IItem} from "../models/i-item";
import {IChangedInformation} from "../models/i-changed-information";

@Injectable({
    providedIn: "root",
})
export class ProductService {
    private readonly CONTROLLER = 'api/Items';

    constructor(
        private http: HttpClient,
        private translateService: TranslateService,
        private localStorageService: LocalStorageService,
        private injector: Injector,
        private datePipe: DatePipe
    ) {
    }

    /**
     * Retrieves all items for synchronization
     * @param _syncDate Represent the last synchronization date
     * @constructor
     */
    GetProducts(_syncDate: string | Date = new Date(0)): Observable<ICLResponse<IItem[]>> 
    {
        return this.http.get<ICLResponse<IItem[]>>('api/Mobile/Items', {
            params: {
                LastUpdate: this.datePipe.transform(_syncDate, 'yyyy-MM-dd HH:mm:ss')
            }
        });
    }

    /**
     * Retrieves the count of all items that was modified
     * @param _syncDate Represent the last synchronization date
     * @constructor
     */
    GetProductsCount(_syncDate: string): Observable<ICLResponse<IChangedInformation>>
    {
        if(!_syncDate)
        {
            return of({
                Data: {
                    Type: ChangeElement.Items,
                    Count: 1
                }
            } as ICLResponse<IChangedInformation>);
        }
        
        return this.http.get<ICLResponse<IChangedInformation>>('api/Mobile/Items/Count', {
            params: {
                LastUpdate: this.datePipe.transform(_syncDate, 'yyyy-MM-dd HH:mm:ss')
            }
        });
    }

    getFocusItems(BPGroup: number, SubTipo: string) {
        const headers = new HttpHeaders({
            "Content-Type": "application/json",
            Authorization: `Bearer ${
                this.localStorageService.data.get("Session").access_token
            }`,
        });

        return this.http.get<ItemFocusResponse>(
            `${this.localStorageService.data.get(
                "ApiURL"
            )}api/Items/GetFocusItemsMobile?GroupCode=${BPGroup}&U_SubTipo=${SubTipo}&lang=${
                this.translateService.currentLang
            }`,
            {headers}
        );
    }

    InventoryInfo(itemCode: string) {
        const url = `${this.localStorageService.data.get(
            "ApiURL"
        )}api/Items/InventoryInfo?itemCode=${itemCode}&userMapp=${
            this.localStorageService.data.get("Session").userMappId
        }&lang=${this.translateService.currentLang}`;
        const headers = new HttpHeaders({
            "Content-Type": "application/json",
            Authorization: `Bearer ${
                this.localStorageService.data.get("Session").access_token
            }`,
        });

        return this.http.get<ProductsStockResponse>(url, {headers});
    }


    /**
     * Calculates the freight cost for a given list of items.
     * @param _itemsToFreight The list of items to be included in the freight calculation.
     * @param DocCurrency The currency in which the document is processed.
     * @returns An observable containing the freight calculation response.
     */
    CalculateFreight(_itemsToFreight: IItemToFreight[], DocCurrency: string): Observable<ApiResponse<IItemToFreight[]>> {
        return this.http.post<ApiResponse<IItemToFreight[]>>(
            `${this.localStorageService.data.get("ApiURL")}api/Items/CalculateFreight?DocCurrency=${DocCurrency}`,
            _itemsToFreight
        );
    }

    /**
     * This method is use to get items
     * @returns 
     */
    GetMinifiedItems(): Observable<ICLResponse<IItem[]>> 
    {
        let userAssignment: IUserAssign = this.localStorageService.get(LocalStorageVariables.UserAssignment);
        
        return this.http.get<ICLResponse<IItem[]>>('api/Items',
            {
                params: {
                    WhsCode: userAssignment.WhsCode,
                    ViewType: ViewType.SellItem
                },
                headers: new HttpHeaders().set("cl-offline-function-to-run", 'GetMinifiedItems'),
            });
    }

    GetItemDetail(_itemCode: string, _whsCode: string, _docTable: string, _docType: number, _serialNumber: number = 0, _priceList: number,_viewType, _purchaseItem: string = 'N'): Observable<ICLResponse<IItem>> 
    {
        const CARD_CODE = this.localStorageService.get('cardCode');
        
        return this.http.get<ICLResponse<IItem>>('api/Items', {
            headers: new HttpHeaders().set("cl-offline-function-to-run", 'GetItemDetails'),
            params: {
                ItemCode: _itemCode,
                WhsCode: _whsCode,
                PriceList: _priceList?.toString(),
                CardCode: CARD_CODE,
                PrchseItem: _purchaseItem,
                SysNumber: _serialNumber?.toString(),
                ViewType:_viewType
            }
        });
    }

    GetBatchesFromItems(_itemsToBatch: IBatchedItem[]): Observable<ICLResponse<MobileBatchesList[]>> {
        const URL = `${this.localStorageService.data.get("ApiURL")}api/Mobile/Batches`;
        return this.http.post<ICLResponse<MobileBatchesList[]>>(URL, _itemsToBatch);
    }

    /**
     * Obtenien el inventario de los items enviados por parametros
     * @param _itemInventoryParams Items de los que se va a obtener el inventario
     * @param _docType Tipo de documento debe ser en formato de tabla en SAP. Ej: Factura = OINV
     * @returns Lista con todos los inventarios de los items pasados por parametro
     */
    GetItemsInventoryInfo(_itemInventoryParams: IItemInventoryParameter[], _docType: string): Observable<ApiResponse<IItemInventoryInfo[]>> {
        const URL = `${this.localStorageService.data.get("ApiURL")}api/Items/GetItemsInventoryInfo?docType=${_docType}`;

        return this.http.post<ApiResponse<IItemInventoryInfo[]>>(URL, _itemInventoryParams);
    }


    /**
     * Retrieves the details of a Bill of Material for a given item.
     *
     * @param _itemCode - The code of the item to query.
     * @param _whsCode - The warehouse code where the item is stored.
     * @param _docTable - The document table associated with the item.
     * @param _docType - The type of document related to the query.
     * @param _binCode - (Optional) The bin code associated with the item.
     * @param _serialNumber - (Optional) The serial number of the item.
     * @returns An Observable with the API response containing a list of Bill of Material models.
     */
    GetBillOfMaterialDetail(_itemCode: string, _whsCode: string, _docTable: string, _docType: number, _binCode: string, _serialNumber: string): Observable<ApiResponse<BillOfMaterialModel[]>> {
        const CARD_CODE = this.localStorageService.get('cardCode');
        const URL = `${this.localStorageService.data.get("ApiURL")}api/Items/GetBillOfMaterialDetail?itemCode=${_itemCode}&cardCode=${CARD_CODE}&whsCode=${_whsCode}&docTable=${_docTable}&docType=${_docType}&binCode=${_binCode ?? ""}&serialNumber=${_serialNumber ?? ""}`;
        return this.http.get<ApiResponse<BillOfMaterialModel[]>>(URL);
    }

    /**
     * Gets the items for a warehouse transfer
     * @param _whsCode
     * @constructor
     */
    GetItemForTransferRequest(_whsCode: string): Observable<ApiResponse<IItemsTransfer[]>> {
        const URL = `${this.localStorageService.data.get("ApiURL")}api/Items/TransferRequest`;
        return this.http.get<ApiResponse<IItemsTransfer[]>>(URL, {
            params:{
                WhsCode: _whsCode
            }
        });
    }

    /**
     * Gets the items for a stock transfer
     * @param _whsCode
     * @param _binAbs
     * @constructor
     */
    GetItemForTransfer(_whsCode: string, _binAbs: number = 0): Observable<ApiResponse<IItemsTransfer[]>> {
        let whsCodeDefault: string = _binAbs > 0 ? _whsCode : '';
        
        const URL = `${this.localStorageService.data.get("ApiURL")}api/Items`;
        return this.http.get<ApiResponse<IItemsTransfer[]>>(URL, {
            params: {
                WhsCode: _whsCode,
                BinAbs: _binAbs.toString(),
                WarehouseDefault: whsCodeDefault
            }
        });
    }


    /**
     * Retrieves a paginated list of items from the backend based on the provided filters.
     * 
     * @template T - The expected response data type.
     * @param _itemCode - (Optional) Filter by specific item code.
     * @param _whsCode - (Optional) Filter by specific warehouse code.
     * @param _page - The page number to retrieve (used for pagination).
     * @param _pageSize - The number of records per page.
     * @param _viewType - (Optional) The view context for the item list (default is 'SellItem').
     * @returns An observable containing a paginated response of type `ICLResponse<T>`.
     * 
     * Includes custom headers to indicate pagination parameters and a fallback function for offline usage.
     */
    GetAllPagination<T>(_itemCode:string = "", _whsCode: string = "", _viewType: string, _page: number, _pageSize: number): Observable<ICLResponse<T>> {

        const headers = new HttpHeaders({
          'Cl-Sl-Pagination-Page': `${_page}`,
          'Cl-Sl-Pagination-Page-Size': `${_pageSize}`,
          "cl-offline-function-to-run": 'GetMinifiedItems'
        });

        return this.http.get<ICLResponse<T>>(this.CONTROLLER,
        {
            params: {
                ItemCode: _itemCode,
                WhsCode: _whsCode,
                ViewType: _viewType
            },
            headers: headers
        });
    }

}
