import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ICLResponse } from '../models/responses/response';
import { Observable } from 'rxjs/internal/Observable';
import { Structures } from '../common/constants';
import { IAttachments2, IAttachments2Line } from '../interfaces/i-document-attachment';

@Injectable({
  providedIn: 'root'
})
export class AttachmentsService {

  private readonly CONTROLLER = 'api/Attachments';

  constructor(private http: HttpClient) {
  }


  /**
   * Retrieves a file from the server by its encoded path.
   *
   * @param _ruta - The relative or full path of the file to be downloaded.
   * @returns An Observable of type ICLResponse<string> containing the base64-encoded file content or a download URL, depending on backend implementation.
   */
  GetFile(_ruta:string): Observable<ICLResponse<string>> {
    return this.http.get<ICLResponse<string>>(`${this.CONTROLLER}/Download?path=${encodeURIComponent(_ruta)}`);
  }

  /**
   * Retrieves the attachment by his unique identifier
   * @param _attachmentEntry Attachment unique identifier
   * @constructor
   */
  Get(_attachmentEntry: number): Observable<ICLResponse<IAttachments2Line[]>> {

    return this.http.get<ICLResponse<IAttachments2Line[]>>(`${this.CONTROLLER}`,
      {
          params: {
            AttachmentEntry: _attachmentEntry.toString()
          }
        });
  }

  /**
   * Uploads a file to the server.
   * @param _formData FormData with the file to upload
   * @returns 
   */
  Post(_formData: FormData): Observable<ICLResponse<IAttachments2>> {
    let headers = new HttpHeaders({"Request-With-Files": 'true'});
    return this.http.post<ICLResponse<IAttachments2>>(`${this.CONTROLLER}`, _formData, {headers});
  }

}
