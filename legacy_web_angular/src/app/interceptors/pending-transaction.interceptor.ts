import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import {finalize, Observable} from 'rxjs';
import {PendingTransactionService} from "@app/services/pending-transaction.service";

@Injectable()

/**
 * HTTP interceptor to track pending transactions for navigation blocking.
 */
export class PendingTransactionInterceptor implements HttpInterceptor {
  constructor(private pendingTransactionService: PendingTransactionService) {}

  /**
   * Intercepts outgoing HTTP requests to track the start and end of transactions.
   * @param req - The outgoing HTTP request.
   * @param next - The HTTP handler to process the request.
   * @returns An observable of the HTTP event, finalizing the transaction when the request completes.
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.pendingTransactionService.startTransaction();

    return next.handle(req).pipe(
      finalize(() => {
        this.pendingTransactionService.endTransaction();
      })
    );
  };
}
