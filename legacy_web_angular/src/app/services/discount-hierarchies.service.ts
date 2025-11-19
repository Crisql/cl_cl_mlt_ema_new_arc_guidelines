import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {IDiscountHierarchy} from "@app/interfaces/i-discount-hierarchy";
import {Observable} from "rxjs";
import {Structures} from "@clavisco/core";
import {DefineDescriptionHeader} from "@app/shared/shared.service";

@Injectable({
  providedIn: 'root'
})
export class DiscountHierarchiesService {

  private readonly CONTROLLER = 'api/DiscountHierarchies'
  constructor(private http: HttpClient) { }

  Patch(_discountHierarchies: IDiscountHierarchy[]): Observable<Structures.Interfaces.ICLResponse<IDiscountHierarchy[]>>
  {
    return this.http.patch<Structures.Interfaces.ICLResponse<IDiscountHierarchy[]>>(this.CONTROLLER, _discountHierarchies);
  }
}
