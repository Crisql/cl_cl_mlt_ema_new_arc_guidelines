import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Repository, Structures} from '@clavisco/core';
import {Observable} from 'rxjs';
import {
  IAddressType, IBPAddresses, IBPProperties, IBPProperty,
  IBusinessPartner,
  IBusinessPartnerLocation, IPatchProperties, ISocioComercial
} from '../interfaces/i-business-partner';
import {DefineDescriptionHeader} from "@app/shared/shared.service";
import { IUserAssign } from '@app/interfaces/i-user';
import { StorageKey } from '@app/enums/e-storage-keys';

@Injectable({
  providedIn: 'root'
})
export class BusinessPartnersService {

  private readonly CONTROLLER = 'api/BusinessPartners';

  constructor(private http: HttpClient) {
  }

  Get<T>(_code?: string): Observable<Structures.Interfaces.ICLResponse<T>> {
    let path = this.CONTROLLER;

    if (_code) {
      path += `?CardCode=${_code}`;
    }

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Clientes obtenidos',
          OnError: 'No se pudo obtener los clientes'
        })});
  }

  /**
   * Method to obtain business partners according to filter
   * @param _value - Value to find business partner matches
   * @param _slpCode - Salesperson code to find business partner matches
   * @constructor
   */
  GetbyFilter<T>(_value?: string, _slpCode?: string): Observable<Structures.Interfaces.ICLResponse<T>> {

    const slpCode = _slpCode ?? Repository.Behavior.GetStorageObject<IUserAssign>(StorageKey.CurrentUserAssign)?.SlpCode ?? '';

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(`${this.CONTROLLER}/GetbyFilter`, {
      params:{
        FilterBusinessPartner: _value?.toUpperCase() || '',
        SlpCode: slpCode
      },
      headers: DefineDescriptionHeader({
        OnError: 'No se pudo obtener los clientes',
        OnSuccess: 'Clientes obtenidos'
      }
    )});
  }

  Post(_businessPartner: IBusinessPartner): Observable<Structures.Interfaces.ICLResponse<IBusinessPartner>> {
    return this.http.post<Structures.Interfaces.ICLResponse<IBusinessPartner>>(this.CONTROLLER, _businessPartner);
  }

  Patch(_bp: IBusinessPartner): Observable<Structures.Interfaces.ICLResponse<IBusinessPartner>> {
    return this.http.patch<Structures.Interfaces.ICLResponse<IBusinessPartner>>(this.CONTROLLER, _bp);
  }

  SaveAddress(_bp: IBusinessPartner): Observable<Structures.Interfaces.ICLResponse<IBusinessPartner>> {
    return this.http.patch<Structures.Interfaces.ICLResponse<IBusinessPartner>>(`${this.CONTROLLER}/CreateBPAddress`, _bp);
  }

  GetCustomerLocations(_cardCode: string, _addressType: number): Observable<Structures.Interfaces.ICLResponse<IBusinessPartnerLocation[]>> {
    return this.http.get<Structures.Interfaces.ICLResponse<IBusinessPartnerLocation[]>>(`${this.CONTROLLER}/${_cardCode}/Locations?AddressType=${_addressType}`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Direcciones de cliente obtenidas',
          OnError: 'No se pudo obtener las direcciones de cliente'
        })});
  }

  GetAddressType(): Observable<Structures.Interfaces.ICLResponse<IAddressType[]>> {
    return this.http.get<Structures.Interfaces.ICLResponse<IAddressType[]>>(`${this.CONTROLLER}/GetAddressType`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Tipos de direcciones de cliente obtenidas',
          OnError: 'No se pudo obtener los tipos de direcciones de cliente'
        })});
  }
  GetSocioComercial(): Observable<Structures.Interfaces.ICLResponse<ISocioComercial[]>> {
    return this.http.get<Structures.Interfaces.ICLResponse<ISocioComercial[]>>(`${this.CONTROLLER}/GetSocioComercial`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Socio comercial obtenido',
          OnError: 'No se pudo obtener el socio comercial'
        })});
  }

  GetBPAddress(_cardCode: string, _pattern: string): Observable<Structures.Interfaces.ICLResponse<IBPAddresses[]>> {
    return this.http.get<Structures.Interfaces.ICLResponse<IBPAddresses[]>>(`${this.CONTROLLER}/GetBPAddresses?CardCode=${_cardCode}&Pattern=${_pattern}`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Dirección de cliente obtenida',
          OnError: 'No se pudo obtener la dirección del cliente'
        })});
  }

  GetBPProperties(): Observable<Structures.Interfaces.ICLResponse<IBPProperties[]>> {
    return this.http.get<Structures.Interfaces.ICLResponse<IBPProperties[]>>(`${this.CONTROLLER}/GetBPProperties`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Propiedades de cliente obtenidas',
          OnError: 'No se pudo obtener las propiedades del cliente'
        })});
  }

  PostProperties(_patchProperties: IPatchProperties): Observable<Structures.Interfaces.ICLResponse<IBusinessPartner>> {
    return this.http.post<Structures.Interfaces.ICLResponse<IBusinessPartner>>(`${this.CONTROLLER}/PostProperties`, _patchProperties);
  }

  GetBPProperty(_cardCode: string): Observable<Structures.Interfaces.ICLResponse<IBPProperty>> {
    return this.http.get<Structures.Interfaces.ICLResponse<IBPProperty>>(`${this.CONTROLLER}/GetBPProperty?CardCode=${_cardCode}`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Propiedad de cliente obtenida',
          OnError: 'No se pudo obtener la propiedad del cliente'
        })});
  }

  /**
 * Retrieves the delivery addresses of a business partner (BP) from the backend API.
 * 
 * @param _cardCode - The unique identifier (CardCode) of the business partner.
 * @param _addressType - The type of address to retrieve. 
 */
  GetBPDeliveryAddress(_cardCode: string, _addressType: string): Observable<Structures.Interfaces.ICLResponse<IBPAddresses[]>> {
    return this.http.get<Structures.Interfaces.ICLResponse<IBPAddresses[]>>(`${this.CONTROLLER}/GetBPDeliveryAddresses`,
      {
        params: {
          CardCode: _cardCode,
          AddressType: _addressType
        },
        headers: DefineDescriptionHeader({
          OnSuccess: 'Dirección de cliente obtenida',
          OnError: 'No se pudo obtener la dirección del cliente'
        })});
  }
}
