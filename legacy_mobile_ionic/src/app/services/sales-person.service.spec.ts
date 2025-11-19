import { TestBed } from '@angular/core/testing';

import { SalesPersonService } from './sales-person.service';

describe('SalesPersonService', () => {
  let service: SalesPersonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SalesPersonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
