import { TestBed } from '@angular/core/testing';

import { PurchaseSearchDocsResolver } from './purchase-search-docs.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule} from "@clavisco/alerts";

describe('PurchaseSearchDocsResolver', () => {
  let resolver: PurchaseSearchDocsResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule]
    });
    resolver = TestBed.inject(PurchaseSearchDocsResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});

