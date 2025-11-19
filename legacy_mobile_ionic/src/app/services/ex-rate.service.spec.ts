import { TestBed } from '@angular/core/testing';

import { ExRateService } from './ex-rate.service';

describe('ExRateService', () => {
  let service: ExRateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExRateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
