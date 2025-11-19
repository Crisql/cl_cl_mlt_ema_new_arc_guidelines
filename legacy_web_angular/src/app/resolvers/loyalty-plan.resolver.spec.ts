import { TestBed } from '@angular/core/testing';

import { LoyaltyPlanResolver } from './loyalty-plan.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule} from "@clavisco/alerts";

describe('LoyaltyPlanResolver', () => {
  let resolver: LoyaltyPlanResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule]
    });
    resolver = TestBed.inject(LoyaltyPlanResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});

