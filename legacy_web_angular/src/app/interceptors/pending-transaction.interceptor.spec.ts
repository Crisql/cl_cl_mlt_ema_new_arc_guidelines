import { TestBed } from '@angular/core/testing';

import { PendingTransactionInterceptor } from './pending-transaction.interceptor';

describe('PendingTransactionInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      PendingTransactionInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: PendingTransactionInterceptor = TestBed.inject(PendingTransactionInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
