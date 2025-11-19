
import { TestBed } from '@angular/core/testing';

import { PaymentReceivedResolver } from './payment-received.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule, ModalModule} from "@clavisco/alerts";

describe('PaymentReceivedResolver', () => {
  let resolver: PaymentReceivedResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule, ModalModule]
    });
    resolver = TestBed.inject(PaymentReceivedResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});

