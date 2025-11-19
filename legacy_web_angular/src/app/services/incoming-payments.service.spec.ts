import { TestBed } from '@angular/core/testing';

import { IncomingPaymentsService } from './incoming-payments.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('IncomingPaymentsService', () => {
  let service: IncomingPaymentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(IncomingPaymentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

