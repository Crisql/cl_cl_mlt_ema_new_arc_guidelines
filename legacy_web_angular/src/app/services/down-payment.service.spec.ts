import { TestBed } from '@angular/core/testing';

import { DownPaymentService } from './down-payment.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('DownPaymentService', () => {
  let service: DownPaymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(DownPaymentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
