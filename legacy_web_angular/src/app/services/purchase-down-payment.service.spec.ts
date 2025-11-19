import { TestBed } from '@angular/core/testing';

import { PurchaseDownPaymentService } from './purchase-down-payment.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('PurchaseDownPaymentService', () => {
  let service: PurchaseDownPaymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(PurchaseDownPaymentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
