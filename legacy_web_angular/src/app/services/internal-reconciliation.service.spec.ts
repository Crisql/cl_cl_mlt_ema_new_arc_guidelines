import { TestBed } from '@angular/core/testing';

import { InternalReconciliationService } from './internal-reconciliation.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('InternalReconciliationService', () => {
  let service: InternalReconciliationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(InternalReconciliationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
