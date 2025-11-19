import { Injectable } from '@angular/core';
import { ICLResponse } from '../models/responses/response';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ItemBarCodeCollection } from '../interfaces/i-barcode';

@Injectable({
  providedIn: 'root'
})
export class BarcodesService {

  private readonly CONTROLLER = 'api/Barcodes';

  constructor(private http: HttpClient) { }

  /**
 * Retrieves the list of barcode collections for a specific item.
 * 
 * @param _code - The item code to fetch barcodes for.
 * @returns An Observable containing a list of ItemBarCodeCollection entries.
 */
  Get(_code: string): Observable<ICLResponse<ItemBarCodeCollection[]>>
  {
     const headers = new HttpHeaders({
              'Cl-Sl-Pagination-Page': `${0}`,
              'Cl-Sl-Pagination-Page-Size': `${20000}`
            });
    return this.http.get<ICLResponse<ItemBarCodeCollection[]>>(this.CONTROLLER, {
      params:{
        ItemCode:_code || ''
      },
      headers: headers
    });

  }
}
