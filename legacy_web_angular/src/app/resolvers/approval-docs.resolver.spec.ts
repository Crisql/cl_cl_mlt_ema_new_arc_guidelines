import { TestBed } from '@angular/core/testing';

import { ApprovalDocsResolver } from './approval-docs.resolver';
import {AlertsModule} from "@clavisco/alerts";
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('ApprovalDocsResolver', () => {
  let resolver: ApprovalDocsResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule]
    });
    resolver = TestBed.inject(ApprovalDocsResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
