import { TestBed } from '@angular/core/testing';

import {PPStoredTransactionResolver} from './ppstored-transaction.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule} from "@clavisco/alerts";

describe('PpstoredTransactionResolver', () => {
  let resolver: PPStoredTransactionResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule]
    });
    resolver = TestBed.inject(PPStoredTransactionResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
