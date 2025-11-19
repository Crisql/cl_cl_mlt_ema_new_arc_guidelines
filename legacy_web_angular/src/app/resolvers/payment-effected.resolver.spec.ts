import { TestBed } from '@angular/core/testing';

import { PaymentEffectedResolver } from './payment-effected.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule, ModalModule} from "@clavisco/alerts";

describe('PaymentEffectedResolver', () => {
  let resolver: PaymentEffectedResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule, ModalModule]
    });
    resolver = TestBed.inject(PaymentEffectedResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
