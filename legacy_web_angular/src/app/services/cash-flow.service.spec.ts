import { TestBed } from '@angular/core/testing';

import { CashFlowService } from './cash-flow.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('CashFlowService', () => {
  let service: CashFlowService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(CashFlowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
