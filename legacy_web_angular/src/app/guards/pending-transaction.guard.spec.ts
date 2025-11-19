import { TestBed } from '@angular/core/testing';

import { PendingTransactionGuard } from './pending-transaction.guard';

describe('PendingTransactionGuard', () => {
  let guard: PendingTransactionGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(PendingTransactionGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
