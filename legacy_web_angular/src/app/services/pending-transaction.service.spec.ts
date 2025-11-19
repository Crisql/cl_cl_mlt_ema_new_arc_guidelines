import { TestBed } from '@angular/core/testing';

import { PendingTransactionService } from './pending-transaction.service';

describe('PendingTransactionService', () => {
  let service: PendingTransactionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PendingTransactionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
