import { Injectable } from '@angular/core';
import {
  Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import {catchError, concatMap, forkJoin, Observable, of} from 'rxjs';
import {IApprovalDocumentsResolvedData} from "@app/interfaces/i-resolvers";
import {SalesPersonService} from "@app/services/sales-person.service";
import {BusinessPartnersService} from "@app/services/business-partners.service";
import {StructuresService} from "@app/services/structures.service";
import {AlertsService, CLToastType} from "@clavisco/alerts";
import {map} from "rxjs/operators";
import {PayTermsService} from "@app/services/pay-terms.service";
import {IPayTerms} from "@app/interfaces/i-pay-terms";

@Injectable({
  providedIn: 'root'
})
export class ApprovalDocsResolver implements Resolve<IApprovalDocumentsResolvedData | null> {

  constructor(
    private salesPersons: SalesPersonService,
    private businessPartnerService: BusinessPartnersService,
    private structuresService: StructuresService,
    private alertsService: AlertsService,
    private payTerms: PayTermsService
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IApprovalDocumentsResolvedData | null> {
    return forkJoin({
      SalesPersons: this.salesPersons.Get(),
      DocTypes: this.structuresService.Get('DocTypesForApprovals'),
      ApprovalStates: this.structuresService.Get('ApprovalStates'),
      DecisionStates: this.structuresService.Get('DecisionStates'),
      PayTerms: this.payTerms.Get<IPayTerms[]>()
    })
      .pipe(
        map(callback => {
          return {
            SalesPersons: callback.SalesPersons.Data,
            ApprovalStates: callback.ApprovalStates.Data,
            DocTypes: callback.DocTypes.Data,
            DecisionStates: callback.DecisionStates.Data,
            PayTerms: callback.PayTerms.Data
          } as IApprovalDocumentsResolvedData;
        }),
        concatMap(result => {
          this.alertsService.Toast({type: CLToastType.SUCCESS, message: 'Componentes requeridos obtenidos'});
          return of(result);
        }),
        catchError(err => {
          this.alertsService.ShowAlert({HttpErrorResponse: err});
          return of(null);
        })
      );
  }
}
