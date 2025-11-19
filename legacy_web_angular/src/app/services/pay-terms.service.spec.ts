import { TestBed } from '@angular/core/testing';

import { PayTermsService } from './pay-terms.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('PayTermsService', () => {
  let service: PayTermsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(PayTermsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
