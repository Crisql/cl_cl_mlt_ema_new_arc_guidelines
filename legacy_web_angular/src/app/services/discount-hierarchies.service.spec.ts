import { TestBed } from '@angular/core/testing';

import { DiscountHierarchiesService } from './discount-hierarchies.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('DiscountHierarchiesService', () => {
  let service: DiscountHierarchiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(DiscountHierarchiesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
