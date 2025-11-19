import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {IStockTransfer} from "@app/interfaces/i-stockTransfer";
import {Observable} from "rxjs";
import {Structures} from "@clavisco/core";
import ICLResponse = Structures.Interfaces.ICLResponse;
import {IBatches, IBinLocation} from "@app/interfaces/i-serial-batch";
import {DefineDescriptionHeader} from "@app/shared/shared.service";
import {IDocument} from "@app/interfaces/i-sale-document";
import {IDocumentAttachment} from "@app/interfaces/i-document-attachment";
import {IStockTransferRequest, IWarehouseBinLocation} from "@app/interfaces/i-stockTransferRequest";


@Injectable({
  providedIn: 'root'
})
export class StockTransferService {

  constructor(
    private http: HttpClient
  ) {

  }

  /**
   * Send a request to the API to create an stock transfer
   * @param _data The information about stock transfer
   * @param _attachment The stock transfer attachment
   * @param _attachmentFiles Attachment files
   * @constructor
   */
  public Post(_data: IStockTransfer, _attachment: IDocumentAttachment, _attachmentFiles: File[]): Observable<ICLResponse<IStockTransfer>> {
    let formData = new FormData();

    formData.append('Document', JSON.stringify(_data));

    formData.append('Attachment', JSON.stringify(_attachment));

    _attachmentFiles.forEach(attF => formData.append(attF.name, attF));

    return this.http.post<Structures.Interfaces.ICLResponse<IStockTransfer>>(`api/StockTransfers`, formData, {
      headers: new HttpHeaders({"Request-With-Files": 'true'})
    });
  }

  public Get(_docEntry: number, _accion: string): Observable<ICLResponse<IStockTransfer>> {
    return this.http.get<ICLResponse<IStockTransfer>>(`api/StockTransfers?DocEntry=${_docEntry}&Accion=${_accion}`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Solicitud de traslado obtenido',
          OnError: 'No se pudo obtener la solicitud de traslado'
        })});
  }

  Patch(_document: IStockTransfer, _attachment?: IDocumentAttachment, _attachmentFiles?: File[]): Observable<Structures.Interfaces.ICLResponse<IDocument>> {

      let formData = new FormData();

      formData.append('Document', JSON.stringify(_document));

      formData.append('Attachment', JSON.stringify(_attachment));

      _attachmentFiles?.forEach(attF => formData.append(attF.name, attF));

      return this.http.patch<Structures.Interfaces.ICLResponse<IDocument>>(`api/StockTransfers`, formData, {
        headers: new HttpHeaders({ "Request-With-Files": 'true' })
      });
  }

  public GetWarehousesBinLocation(_whsCode: string, _itemCode: string): Observable<ICLResponse<IWarehouseBinLocation[]>> {
    return this.http.get<ICLResponse<IWarehouseBinLocation[]>>(`api/StockTransfers?WhsCode=${_whsCode}&ItemCode=${_itemCode}`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Solicitud de traslado obtenido',
          OnError: 'No se pudo obtener la solicitud de traslado'
        })});
  }

  /**
   * Sends a request to the API to create a stock transfer draft.
   *
   * @param _document - The stock transfer document containing the necessary information for the draft.
   * @param _attachment - Optional document attachment related to the stock transfer.
   * @param _attachmentFiles - Optional array of files to be attached to the stock transfer draft.
   * @returns An observable of the API response containing the created stock transfer draft document.
   */
  PostStockTransfersDrafts(_document: IStockTransfer, _attachment?: IDocumentAttachment, _attachmentFiles?: File[]): Observable<Structures.Interfaces.ICLResponse<IDocument>> {

    let formData = new FormData();

    formData.append('Document', JSON.stringify(_document));

    formData.append('Attachment', JSON.stringify(_attachment));

    _attachmentFiles?.forEach(attF => formData.append(attF.name, attF));

    return this.http.post<Structures.Interfaces.ICLResponse<IDocument>>(`api/StockTransfers/PostStockTransfersDrafts`, formData, {
      headers: new HttpHeaders({ "Request-With-Files": 'true' })
    });
  }
}
