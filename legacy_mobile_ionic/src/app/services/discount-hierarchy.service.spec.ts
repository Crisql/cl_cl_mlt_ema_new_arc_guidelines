import { TestBed } from '@angular/core/testing';

import { DiscountHierarchyService } from './discount-hierarchy.service';

describe('DiscountHierarchyService', () => {
  let service: DiscountHierarchyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DiscountHierarchyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
