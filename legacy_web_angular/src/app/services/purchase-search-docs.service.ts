import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse} from "@angular/common/http";
import {map, Observable, tap} from "rxjs";
import {Structures} from "@clavisco/core";
import {IDocument} from "../interfaces/i-sale-document";
import {formatDate} from "@angular/common";
import ICLResponse = Structures.Interfaces.ICLResponse;
import {DefineDescriptionHeader} from "@app/shared/shared.service";
import {ControllerName, DocumentType, ViewType} from "@app/enums/enums";

@Injectable({
  providedIn: 'root'
})
export class PurchaseSearchDocsService {

  constructor(
    private http: HttpClient
  ) {
  }


  public GetDocuments<T>(
    _controller: string,
    _slpCode: number,
    _docNum: number,
    _cardCode: string,
    _cardName: string,
    _docStatus: string,
    _dateFrom: Date,
    _dateTo: Date,
    _objType?: string
  ): Observable<ICLResponse<T[]>> {

    let path: string = `api/${_controller}?SlpCode=${_slpCode}&DateFrom=${formatDate(_dateFrom, 'yyyy-MM-dd', 'en')}&DateTo=${formatDate(_dateTo, 'yyyy-MM-dd', 'en')}&DocNum=${_docNum}&DocStatus=${_docStatus}&CardCode=${_cardCode}&CardName=${_cardName}`;

    if(_controller === ControllerName.Draft){
       path = `api/${_controller}?SlpCode=${_slpCode || 0}&DateInit=${formatDate(_dateFrom, 'yyyy-MM-dd', 'en')}&DateEnd=${formatDate(_dateTo, 'yyyy-MM-dd', 'en')}&DocNum=${_docNum || 0}&DocStatus=${_docStatus}&DocCurrency=ALL&CardCode=${_cardCode || ''}&CardName=${_cardName || ''}&ViewType=${ViewType.Purchase}&ObjType=${_objType}`;
    }

    return this.http.get<ICLResponse<T[]>>(path,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Ordenes de compra obtenidas',
          OnError: 'No se pudo obtener las ordenes de compra'
        })});
  }

  public GetDocument<T>(_controller: string, _docEntry: number): Observable<Structures.Interfaces.ICLResponse<T>> {
    let path: string = `api/${_controller}?DocEntry=${_docEntry}`;
    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Orden de compra obtenida',
          OnError: 'No se pudo obtener la orden de compra'
        })});
  }

}
