import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {ICLResponse} from "../models/responses/response";
import {LocalStorageService} from "./local-storage.service";
import {IStockAvailable} from "../interfaces/i-stock-available";
import { IItemMasterData } from "../interfaces/i-item";


@Injectable({
    providedIn: 'root'
})
export class ItemsService {

    private readonly CONTROLLER = 'api/Items';
    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService
    ) {
    }

    /**
     * This method is used obtainer stock available for warehouse
     * @param _whsCode
     * @param _itemCode
     * @constructor
     */
    GetStocAvailableForWarehouse(_whsCode: string, _itemCode: string): Observable<ICLResponse<IStockAvailable>> {
        return this.http.get<ICLResponse<IStockAvailable>>(`${this.CONTROLLER}/StockAvailable`,{
            params:{
                WhsCode: _whsCode,
                ItemCode: _itemCode
            }
        });
    }

     /**
     * Sends a request to create a new item master data record in the system.
     *
     * @param _item - The item master data object to be created.
     * @returns An `Observable` of type `ICLResponse<IItemMasterData>` containing the created item data or error information.
     */
    Post(_item: IItemMasterData): Observable<ICLResponse<IItemMasterData>> {
        return this.http.post<ICLResponse<IItemMasterData>>(this.CONTROLLER, _item);
    }

    /**
     * Sends a request to update an existing item master data record in the system.
     *
     * @param _item - The item master data object containing updated values.
     * @returns An `Observable` of type `ICLResponse<IItemMasterData>` containing the updated item data or error information.
     */
    Patch(_item: IItemMasterData): Observable<ICLResponse<IItemMasterData>> {
        _item.ItemCode = encodeURIComponent(_item.ItemCode);
        return this.http.patch<ICLResponse<IItemMasterData>>(this.CONTROLLER, _item);
    }

}