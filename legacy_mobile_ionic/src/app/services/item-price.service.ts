import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ICLResponse } from '../models/responses/response';
import { Observable } from 'rxjs';
import { ItemPrice } from '../interfaces/i-item';

@Injectable({
  providedIn: 'root'
})
export class ItemPriceService {

  private readonly CONTROLLER = 'api/Prices';

  constructor(private http: HttpClient) { }

  /**
   * Retrieves the price of an item for a specific price list.
   *
   * @param _itemCode - The code of the item to look up.
   * @param _priceList - The ID of the price list to fetch the item price from.
   * @returns An Observable containing the item price response.
   */
  Get(_itemCode: string, _priceList: number): Observable<ICLResponse<ItemPrice>> {

    return this.http.get<ICLResponse<ItemPrice>>(this.CONTROLLER,
      {
        params: {
          ItemCode: _itemCode || '',
          PriceList: _priceList.toString()
        }
      })
  }
}
