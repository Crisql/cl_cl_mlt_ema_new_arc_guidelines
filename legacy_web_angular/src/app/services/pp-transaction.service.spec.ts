import { TestBed } from '@angular/core/testing';

import { PPTransactionService } from './pp-transaction.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('PPTransactionService', () => {
  let service: PPTransactionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(PPTransactionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

