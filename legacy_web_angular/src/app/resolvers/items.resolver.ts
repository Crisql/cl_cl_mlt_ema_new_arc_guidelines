import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {AlertsService, CLToastType} from '@clavisco/alerts';
import {catchError, concatMap, forkJoin, map, Observable, of} from 'rxjs';
import {IItemsComponentResolvedData} from '../interfaces/i-resolvers';
import {IPriceList} from "../interfaces/i-price-list";
import {ITaxe} from "../interfaces/i-taxe";
import {PriceListService} from "../services/price-list.service";
import {TaxesService} from "../services/taxes.service";
import {UdfsService} from "@app/services/udfs.service";
import {SeriesService} from "@app/services/series.service";
import {Repository, Structures} from "@clavisco/core";
import {ICompany} from "@app/interfaces/i-company";
import {StorageKey} from "@app/enums/e-storage-keys";
import {IUserAssign} from "@app/interfaces/i-user";
import {ObjectType} from "@app/enums/enums";
import {ISerialType} from "@app/interfaces/i-serie";
import ICLResponse = Structures.Interfaces.ICLResponse;
import {HttpErrorResponse} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ItemsResolver implements Resolve<IItemsComponentResolvedData | null> {
  constructor(
    private priceListService: PriceListService,
    private taxesService: TaxesService,
    private udfsService: UdfsService,
    private alertsService: AlertsService,
    private seriesService: SeriesService
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IItemsComponentResolvedData | null> {

    const companyId = Repository.Behavior.GetStorageObject<ICompany>(StorageKey.CurrentCompany)?.Id || 0;
    const userAssingId = Repository.Behavior.GetStorageObject<IUserAssign>(StorageKey.CurrentUserAssign)?.Id ?? 0;

    return forkJoin({
      PriceList: this.priceListService.Get<IPriceList[]>(),
      Taxes: this.taxesService.Get<ITaxe[]>(),
      Serial: this.seriesService.GetIsSerial(userAssingId, ObjectType.Items, companyId).pipe(catchError((error: HttpErrorResponse) => this.ErrorSerialType(error))),
      UdfsDevelopment: this.udfsService.GetUdfsDevelopment('OITM'),
    })
      .pipe(
        map(callback => ({
          PriceList: callback.PriceList.Data,
          Taxes: callback.Taxes.Data,
          Serial: callback.Serial.Data,
          UdfsDevelopment: callback.UdfsDevelopment.Data
        } as IItemsComponentResolvedData)),
        concatMap(result => {
          this.alertsService.Toast({
            type: CLToastType.SUCCESS,
            message: 'Componentes requeridos obtenidos'
          });
          return of(result);
        }),
        catchError(err => {
          this.alertsService.ShowAlert({
            HttpErrorResponse: err
          });
          return of(null);
        })
      )
  }

  /**
   * Handles errors for HTTP requests related to serialization.
   * @param _error The HTTP error that occurred.
   * @returns An observable that emits a response object with a custom error message.
   * @private
   */
  private ErrorSerialType(_error: HttpErrorResponse):Observable<ICLResponse<ISerialType>> {
    return of({
      Data: {
        IsSerial: false
      } as ISerialType,
      Message: _error.error?.Message ?? _error.message
    } as ICLResponse<ISerialType>);
  }
}

