import { TestBed } from '@angular/core/testing';

import { OutgoingPaymentService } from './outgoing-payment.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('OutgoingPaymentService', () => {
  let service: OutgoingPaymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(OutgoingPaymentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
