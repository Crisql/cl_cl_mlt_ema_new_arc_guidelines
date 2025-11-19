import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {Structures} from "@clavisco/core";
import ICLResponse = Structures.Interfaces.ICLResponse;
import {IStockTransferRequest} from "@app/interfaces/i-stockTransferRequest";
import {formatDate} from "@angular/common";
import {DefineDescriptionHeader} from "@app/shared/shared.service";
import {IDocument} from "@app/interfaces/i-sale-document";
import {ControllerName, ViewType} from "@app/enums/enums";
import {IDocumentAttachment} from "@app/interfaces/i-document-attachment";


@Injectable({
  providedIn: 'root'
})
export class InventoryTrasferRequestService {
  private readonly CONTROLLER = `api/InventoryTransferRequests`;
  constructor(private http: HttpClient) {
  }

  public Post(_data: IStockTransferRequest, _attachment: IDocumentAttachment, _attachmentFiles: File[]): Observable<ICLResponse<IStockTransferRequest>> {
    let formData = new FormData();

    formData.append('Document', JSON.stringify(_data));

    formData.append('Attachment', JSON.stringify(_attachment));

    _attachmentFiles.forEach(attF => formData.append(attF.name, attF));
    return this.http.post<ICLResponse<IStockTransferRequest>>(this.CONTROLLER, formData, {
      headers: new HttpHeaders({"Request-With-Files": 'true'})
    });
  }

  public Patch(_data: IStockTransferRequest, _attachment: IDocumentAttachment, _attachmentFiles: File[]): Observable<ICLResponse<IStockTransferRequest>> {
    let formData = new FormData();

    formData.append('Document', JSON.stringify(_data));

    formData.append('Attachment', JSON.stringify(_attachment));

    _attachmentFiles.forEach(attF => formData.append(attF.name, attF));
    return this.http.patch<ICLResponse<IStockTransferRequest>>(this.CONTROLLER, formData, {
      headers: new HttpHeaders({"Request-With-Files": 'true'})
    });
  }

  /**
   * Method to get inventory transfers
   * @param _docNum DocNum to search document
   * @param _slpCode SlpCode to search document
   * @param _dateInit Date init to search document
   * @param _dateEnd Date end to search document
   * @param _docStatus Status to search document
   * @constructor
   */
  public GetAll(_docNum: number, _slpCode: number, _dateInit: Date, _dateEnd: Date, _docStatus: string): Observable<ICLResponse<IStockTransferRequest[]>> {
    let from = formatDate(_dateInit, 'yyyy-MM-dd', 'en');
    let to = formatDate(_dateEnd, 'yyyy-MM-dd', 'en');
    return this.http.get<ICLResponse<IStockTransferRequest[]>>(`${this.CONTROLLER}?DocNum=${_docNum || 0}&DateInit=${from}&DateEnd=${to}&SlpCode=${_slpCode}&DocStatus=${_docStatus}`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Solicitudes de traslado obtenidos',
          OnError: 'No se pudo obtener las solicitudes de traslado '
        })});
  }

  public Get(_docEntry: number, _accion: string): Observable<ICLResponse<IStockTransferRequest>> {
    return this.http.get<ICLResponse<IStockTransferRequest>>(`${this.CONTROLLER}?DocEntry=${_docEntry}&Accion=${_accion}`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Solicitud de traslado obtenido',
          OnError: 'No se pudo obtener la solicitud de traslado'
        })});
  }
  public GetDocuments<T>(
    _controller: string,
    _docNum: number,
    _slpCode: number,
    _dateInit: Date,
    _dateEnd: Date,
    _docStatus: string
  ): Observable<ICLResponse<T[]>> {
    let from = formatDate(_dateInit, 'yyyy-MM-dd', 'en');
    let to = formatDate(_dateEnd, 'yyyy-MM-dd', 'en');
    let path: string = `api/${_controller}?DocNum=${_docNum || 0}&DateInit=${from}&DateEnd=${to}&SlpCode=${_slpCode}&DocStatus=${_docStatus}`;

    return this.http.get<ICLResponse<T[]>>(path,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Documentos de inventario filtrados obtenidos',
          OnError: 'No se pudo obtener los documentos de inventario filtrados'
        })});
  }

  /**
   * Submits a draft of an inventory transfer request to the server.
   *
   * @param _data - The stock transfer request data to be sent.
   * @param _attachment - The document attachment associated with the request.
   * @param _attachmentFiles - An array of files to be attached to the request.
   * @returns An observable containing the server's response, which includes the submitted stock transfer request.
   */
  public PostInventoryTransferRequestsDrafts(_data: IStockTransferRequest, _attachment: IDocumentAttachment, _attachmentFiles: File[]): Observable<ICLResponse<IStockTransferRequest>> {
    let formData = new FormData();

    formData.append('Document', JSON.stringify(_data));

    formData.append('Attachment', JSON.stringify(_attachment));

    _attachmentFiles.forEach(attF => formData.append(attF.name, attF));
    return this.http.post<ICLResponse<IStockTransferRequest>>(`${this.CONTROLLER}/PostInventoryTransferRequestsDrafts`, formData, {
      headers: new HttpHeaders({"Request-With-Files": 'true'})
    });
  }
}
