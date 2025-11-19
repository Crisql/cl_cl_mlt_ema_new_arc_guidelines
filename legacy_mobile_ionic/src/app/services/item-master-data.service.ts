import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ICLResponse } from '../models/responses/response';
import { IItemMasterData } from '../interfaces/i-item';
import { InventoryDetails } from '../interfaces/i-inventory-details';

@Injectable({
  providedIn: 'root'
})
export class ItemMasterDataService {

  private readonly CONTROLLER = 'api/MasterDataItems';

  constructor(private http: HttpClient) { }

  /**
   * Method to obtain items according to filter
   * @param _value - Value to find business partner matches
   * @constructor
   */
  GetbyFilter(_value: string, _page: number, _pageSize: number): Observable<ICLResponse<IItemMasterData[]>> {

    const headers = new HttpHeaders({
          'Cl-Sl-Pagination-Page': `${_page}`,
          'Cl-Sl-Pagination-Page-Size': `${_pageSize}`
        });
        
    return this.http.get<ICLResponse<IItemMasterData[]>>(`${this.CONTROLLER}/GetbyFilter`,
      {
        params: {
          FilterItem: _value?.toUpperCase()
        },
        headers: headers
      }
    );
  }

  /**
   * Retrieves item master data by item code.
   *
   * @param _code - The item code used to fetch the item details.
   * @returns An Observable of type ICLResponse<IItemMasterData> containing item data.
   */
  Get(_code: string): Observable<ICLResponse<IItemMasterData>>
  {
    return this.http.get<ICLResponse<IItemMasterData>>(this.CONTROLLER, {
      params: {
        ItemCode: _code || ''
      }
    });
  }


  /**
   * Retrieves the inventory availability details for a given item across all warehouses.
   *
   * @param _itemCode - The unique identifier (ItemCode) of the item to look up.
   * @returns An `Observable` containing an `ICLResponse` with a list of `InventoryDetails` objects.
   */
  GetItemInventoryDetails(_itemCode: string): Observable<ICLResponse<InventoryDetails[]>> {
    const headers = new HttpHeaders({
              'Cl-Sl-Pagination-Page': `${0}`,
              'Cl-Sl-Pagination-Page-Size': `${20000}`
            });
    return this.http.get<ICLResponse<InventoryDetails[]>>(`${this.CONTROLLER}/GetInventoryDetails`,
      {
        params: {
          ItemCode: _itemCode
        },
        headers: headers
      });
  }

}
