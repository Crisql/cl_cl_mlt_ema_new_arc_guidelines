import { TestBed } from '@angular/core/testing';

import { CancelPaymentResolver } from './cancel-payment.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule} from "@clavisco/alerts";

describe('CancelPaymentResolver', () => {
  let resolver: CancelPaymentResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule]
    });
    resolver = TestBed.inject(CancelPaymentResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});

