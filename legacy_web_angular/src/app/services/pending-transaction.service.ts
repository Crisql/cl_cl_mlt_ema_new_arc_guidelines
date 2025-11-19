import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})

/**
 * Service to manage and track pending transactions and control navigation blocking.
 */
export class PendingTransactionService {
  private pendingTransactions = new BehaviorSubject<number>(0);
  private blockNavigation = new BehaviorSubject<boolean>(false);

  /**
   * Starts a new transaction, increments the pending transactions count, and blocks navigation.
   */
  startTransaction(): void {
    this.pendingTransactions.next(this.pendingTransactions.value + 1);
    this.blockNavigation.next(true);
  };

  /**
   * Ends a transaction, decrements the pending transactions count, and unblocks navigation if no transactions remain.
   */
  endTransaction(): void {
    if (this.pendingTransactions.value > 0) {
      this.pendingTransactions.next(this.pendingTransactions.value - 1);
    }
    if (this.pendingTransactions.value === 0) {
      this.blockNavigation.next(false);
    }
  };

  /**
   * Checks if there are any pending transactions.
   * @returns A boolean indicating whether there are pending transactions.
   */
  hasPendingTransactions(): boolean {
    return this.pendingTransactions.value > 0;
  };
}
