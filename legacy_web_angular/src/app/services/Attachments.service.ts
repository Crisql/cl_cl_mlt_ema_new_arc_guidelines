import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {IAttachments2, IAttachments2Line} from "@app/interfaces/i-business-partner";
import {Structures} from "@clavisco/core";
import ICLResponse = Structures.Interfaces.ICLResponse;
import {DefineDescriptionHeader} from "@app/shared/shared.service";


@Injectable({
  providedIn: 'root'
})
export class AttachmentsService {

  private readonly CONTROLLER = 'api/Attachments';

  constructor(private http: HttpClient) {
  }

  Post(_formData: FormData): Observable<ICLResponse<IAttachments2>> {
    let headers = new HttpHeaders({"Request-With-Files": 'true'});
    return this.http.post<Structures.Interfaces.ICLResponse<IAttachments2>>(`${this.CONTROLLER}`, _formData, {headers});
  }

  GetFile(_ruta:string): Observable<ICLResponse<string>> {
    return this.http.get<Structures.Interfaces.ICLResponse<string>>(`${this.CONTROLLER}/Download?path=${encodeURIComponent(_ruta)}`,
      {headers: DefineDescriptionHeader({
          OnError: 'No se pudo obtener el adjunto',
          OnSuccess: 'Adjunto obtenido'
        })});
  }

  /**
   * Retrieves the attachment by his unique identifier
   * @param _attachmentEntry Attachment unique identifier
   * @constructor
   */
  Get(_attachmentEntry: number): Observable<ICLResponse<IAttachments2Line[]>> {

    let headers = DefineDescriptionHeader({
      OnSuccess: 'Adjuntos de cliente obtenidos',
      OnError: 'No se pudo obtener los adjuntos'
    });

    return this.http.get<ICLResponse<IAttachments2Line[]>>(`${this.CONTROLLER}`,
      {
          headers,
          params: {
            AttachmentEntry: _attachmentEntry
          }
        });
  }


}
