import { TestBed } from '@angular/core/testing';

import { PayTermsService } from './pay-terms.service';

describe('PayTermsService', () => {
  let service: PayTermsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PayTermsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
