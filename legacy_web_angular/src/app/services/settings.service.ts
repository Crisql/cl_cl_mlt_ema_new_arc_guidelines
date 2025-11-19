import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Structures} from '@clavisco/core';
import {Observable} from 'rxjs';
import {
  IValidateAttachmentsTable,
  IValidateAutomaticPrintingTable,
  IValidateInventoryTable
} from "../interfaces/i-items";
import {IBusinessPartnersFields, IMargin, ISettings} from '../interfaces/i-settings';
import ICLResponse = Structures.Interfaces.ICLResponse;
import {IShorcuts} from "@app/interfaces/i-shorcuts";
import {DefineDescriptionHeader} from "@app/shared/shared.service";

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly CONTROLLER = 'api/Settings';

  constructor(private http: HttpClient) {
  }

  Get<T>(_Code?: string): Observable<Structures.Interfaces.ICLResponse<T>> {
    let path = this.CONTROLLER;

    if (_Code) {
      path += `/?Code=${_Code}`;
    }

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path, {headers: DefineDescriptionHeader({
        OnSuccess: 'Configuraciones obtenidas',
        OnError: 'No se pudo obtener las configuraciones'
      })})
  }

  Post(_settings: ISettings): Observable<Structures.Interfaces.ICLResponse<ISettings>> {
    return this.http.post<Structures.Interfaces.ICLResponse<ISettings>>(this.CONTROLLER, _settings);
  }

  PostSettings(_settings: ISettings[]): Observable<Structures.Interfaces.ICLResponse<ISettings[]>> {
    let path = `${this.CONTROLLER}/list`;
    return this.http.post<Structures.Interfaces.ICLResponse<ISettings[]>>(path, _settings);
  }

  PatchSettings(_settings: ISettings[]): Observable<Structures.Interfaces.ICLResponse<ISettings[]>> {
    let path = `${this.CONTROLLER}/list`;
    return this.http.patch<Structures.Interfaces.ICLResponse<ISettings[]>>(path, _settings);
  }

  Patch(_settings: ISettings, _Code?: string): Observable<Structures.Interfaces.ICLResponse<ISettings>> {
    let path = `${this.CONTROLLER}?Code=${_Code}`;

    return this.http.patch<Structures.Interfaces.ICLResponse<ISettings>>(path, _settings);
  }

  GetValidateInventoryTables(): Observable<Structures.Interfaces.ICLResponse<IValidateInventoryTable[]>> {
    return this.http.get<Structures.Interfaces.ICLResponse<IValidateInventoryTable[]>>(`${this.CONTROLLER}/ValidateInventoryTables`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Tablas de validación de inventario obtenidas',
          OnError: 'No se pudo obtener las tablas de validación de inventario'
        })});
  }

  GetMarginTables(): Observable<Structures.Interfaces.ICLResponse<IMargin[]>> {
    return this.http.get<Structures.Interfaces.ICLResponse<IMargin[]>>(`${this.CONTROLLER}/MarginsTables`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Tablas de margenes obtenidas',
          OnError: 'No se pudo obtener las tablas de margenes'
        })});
  }


  GetFieldsBusinessPartner(): Observable<Structures.Interfaces.ICLResponse<IBusinessPartnersFields[]>> {
    return this.http.get<Structures.Interfaces.ICLResponse<IBusinessPartnersFields[]>>(`${this.CONTROLLER}/FieldsBusinessPartner`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Campos de clientes obtenidos',
          OnError: 'No se pudo obtener los campos de clientes'
        })});
  }

  GetShorcuts(): Observable<ICLResponse<IShorcuts[]>> {
    return this.http.get<ICLResponse<IShorcuts[]>>(`${this.CONTROLLER}/Shorcuts`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Accesos directos obtenidos',
          OnError: 'No se pudo obtener los accesos directos'
        })});
  }
  GetValidateAttachmentsTables(): Observable<Structures.Interfaces.ICLResponse<IValidateAttachmentsTable[]>> {
    return this.http.get<Structures.Interfaces.ICLResponse<IValidateAttachmentsTable[]>>(`${this.CONTROLLER}/ValidateAttachmentsTables`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Tablas de validación de adjuntos obtenidas',
          OnError: 'No se pudo obtener las tablas de validación de adjuntos'
        })});
  }

  /**
   * Retrieves the list of tables used to validate automatic printing.
   *
   * @returns An `Observable` containing the response with an array of `IValidateAutomaticPrintingTable`.
   */
  GetValidateAutomaticPrintingTables(): Observable<Structures.Interfaces.ICLResponse<IValidateAutomaticPrintingTable[]>> {
    return this.http.get<Structures.Interfaces.ICLResponse<IValidateAutomaticPrintingTable[]>>(`${this.CONTROLLER}/ValidateAutomaticPrintingTables`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Tablas de validación de impresiones automáticas',
          OnError: 'No se pudo obtener las tablas de validación de impresiones automáticas'
        })});
  }
}
