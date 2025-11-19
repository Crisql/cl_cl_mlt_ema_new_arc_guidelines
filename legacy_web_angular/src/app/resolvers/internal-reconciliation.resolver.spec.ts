import { TestBed } from '@angular/core/testing';

import { InternalReconciliationResolver } from './internal-reconciliation.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule} from "@clavisco/alerts";

describe('InternalReconciliationResolver', () => {
  let resolver: InternalReconciliationResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule]
    });
    resolver = TestBed.inject(InternalReconciliationResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
