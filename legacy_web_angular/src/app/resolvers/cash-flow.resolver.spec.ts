
import { TestBed } from '@angular/core/testing';

import { CashFlowResolver } from './cash-flow.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule} from "@clavisco/alerts";

describe('CashFlowResolver', () => {
  let resolver: CashFlowResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule]
    });
    resolver = TestBed.inject(CashFlowResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});

