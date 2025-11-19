import { TestBed } from '@angular/core/testing';

import { DiscountHierarchiesResolver } from './discount-hierarchies.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule} from "@clavisco/alerts";

describe('DiscountHierarchiesResolver', () => {
  let resolver: DiscountHierarchiesResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule]
    });
    resolver = TestBed.inject(DiscountHierarchiesResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
