import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';
import {PendingTransactionService} from "@app/services/pending-transaction.service";

@Injectable({
  providedIn: 'root'
})

/**
 * Guard to prevent navigation when there are pending transactions.
 */
export class PendingTransactionGuard implements CanDeactivate<unknown> {
  private alertShown: boolean = false;

  constructor(
    private pendingTransactionService: PendingTransactionService,
  ) {}

  /**
   * Determines whether navigation can proceed based on pending transactions.
   * @returns An observable, promise, or boolean indicating whether navigation is allowed.
   */
  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    if (this.pendingTransactionService.hasPendingTransactions() && !this.alertShown) {
      window.alert('Hay una transacción pendiente. Por favor, espera a que se complete antes de salir.');
      this.alertShown = true;

      return false;
    }

    return true;
  }
}
