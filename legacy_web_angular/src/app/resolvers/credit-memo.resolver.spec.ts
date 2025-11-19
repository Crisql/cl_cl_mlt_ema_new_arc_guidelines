
import { TestBed } from '@angular/core/testing';

import { CreditMemoResolver } from './credit-memo.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule} from "@clavisco/alerts";

describe('CreditMemoResolver', () => {
  let resolver: CreditMemoResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule]
    });
    resolver = TestBed.inject(CreditMemoResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});

