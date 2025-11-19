import { Injectable } from '@angular/core';
import {Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import {catchError, concatMap, forkJoin, map, Observable, of} from 'rxjs';
import {IApprovalDocumentsResolvedData} from "@app/interfaces/i-resolvers";
import {StructuresService} from "@app/services/structures.service";
import {AlertsService, CLToastType} from "@clavisco/alerts";
import {PayTermsService} from "@app/services/pay-terms.service";
import {IPayTerms} from "@app/interfaces/i-pay-terms";

@Injectable({
  providedIn: 'root'
})

export class PurchasesApprovalDocsResolver implements Resolve<IApprovalDocumentsResolvedData | null> {

  constructor(
    private structuresService: StructuresService,
    private alertsService: AlertsService,
    private payTermService: PayTermsService,
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IApprovalDocumentsResolvedData | null> {
    return forkJoin({
      DocTypes: this.structuresService.Get('DocTypesForPurchasesApprovals'),
      ApprovalStates: this.structuresService.Get('ApprovalStates'),
      DecisionStates: this.structuresService.Get('DecisionStates'),
      PayTerms: this.payTermService.Get<IPayTerms[]>()
    })
      .pipe(
        map(callback => {
          return {
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
