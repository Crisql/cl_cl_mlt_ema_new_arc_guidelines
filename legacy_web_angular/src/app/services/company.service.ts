import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Structures } from '@clavisco/core';
import { Observable } from 'rxjs';
import { ICompany } from '../interfaces/i-company';
import {IDiscountHierarchy} from "@app/interfaces/i-discount-hierarchy";
import {ISalesPerson} from "@app/interfaces/i-sales-person";
import {IWarehouse} from "@app/interfaces/i-warehouse";
import {DefineDescriptionHeader} from "@app/shared/shared.service";

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private readonly CONTROLLER = 'api/Companies';
  constructor(private http: HttpClient) { }

  Get<T>(_isActive= false,_id?: number, ): Observable<Structures.Interfaces.ICLResponse<T>>
  {
    let path: string = this.CONTROLLER;

    if(_id)
    {
      path += `/${_id}`;
    }else {
      path += `?active=${_isActive}`;
    }

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Compañías obtenidas',
          OnError: 'No se pudo obtener las compañías'
        })});
  }

  Post(_company: ICompany): Observable<Structures.Interfaces.ICLResponse<ICompany>> {

    return this.http.post<Structures.Interfaces.ICLResponse<ICompany>>(this.CONTROLLER, _company);
  }

  Patch(_id: number,_company: ICompany): Observable<Structures.Interfaces.ICLResponse<ICompany>> {
    let path =  `${this.CONTROLLER}/${_id}`;

    return this.http.patch<Structures.Interfaces.ICLResponse<ICompany>>(path, _company);
  }

  GetDiscountHierarchy(_companyId: number): Observable<Structures.Interfaces.ICLResponse<IDiscountHierarchy[]>>
  {
    return this.http.get<Structures.Interfaces.ICLResponse<IDiscountHierarchy[]>>(`${this.CONTROLLER}/${_companyId}/DiscountHierarchies`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Jerarquia de descuentos de compañía obtenidos',
          OnError: 'No se pudo obtener las jerarquias de descuentos de la compañía'
        })});
  }

  GetSalesMen(_companyId: number, _licence:number): Observable<Structures.Interfaces.ICLResponse<ISalesPerson[]>>
  {
    return this.http.get<Structures.Interfaces.ICLResponse<ISalesPerson[]>>(`${this.CONTROLLER}/${_companyId}/SalesMen?licenseId=${_licence}`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Vendedores de compañía obtenidos',
          OnError: 'No se pudo obtener los vendedores de la compañía'
        })});
  }
  GetWarehouses(_companyId: number, _licence:number): Observable<Structures.Interfaces.ICLResponse<IWarehouse[]>>
  {
    return this.http.get<Structures.Interfaces.ICLResponse<IWarehouse[]>>(`${this.CONTROLLER}/${_companyId}/Warehouses?licenseId=${_licence}`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Almacenes de compañía obtenidos',
          OnError: 'No se pudo obtener los almacenes de la compañía'
        })});
  }
}
