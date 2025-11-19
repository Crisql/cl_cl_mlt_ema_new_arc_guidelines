import { TestBed } from '@angular/core/testing';

import { DiscountGroupService } from './discount-group.service';

describe('DiscountGroupService', () => {
  let service: DiscountGroupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DiscountGroupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
