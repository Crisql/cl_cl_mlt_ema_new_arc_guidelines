
import { TestBed } from '@angular/core/testing';

import { CashClosingResolver } from './cash-closing.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule} from "@clavisco/alerts";

describe('CashClosingResolver', () => {
  let resolver: CashClosingResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule]
    });
    resolver = TestBed.inject(CashClosingResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});

