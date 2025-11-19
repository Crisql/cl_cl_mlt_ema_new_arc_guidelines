
import { TestBed } from '@angular/core/testing';

import { CashClosingSearchResolver } from './cash-closing-search.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule} from "@clavisco/alerts";

describe('CashClosingSearchResolver', () => {
  let resolver: CashClosingSearchResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    resolver = TestBed.inject(CashClosingSearchResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});

