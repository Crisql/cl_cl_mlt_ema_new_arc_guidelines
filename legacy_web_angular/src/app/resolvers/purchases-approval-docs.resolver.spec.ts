import { TestBed } from '@angular/core/testing';

import { PurchasesApprovalDocsResolver } from './purchases-approval-docs.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule} from "@clavisco/alerts";

describe('PurchasesApprovalDocsResolver', () => {
  let resolver: PurchasesApprovalDocsResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule]
    });
    resolver = TestBed.inject(PurchasesApprovalDocsResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
