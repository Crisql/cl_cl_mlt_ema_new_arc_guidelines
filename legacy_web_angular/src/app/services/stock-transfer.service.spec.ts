import { TestBed } from '@angular/core/testing';

import { StockTransferService } from './stock-transfer.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('StockTransferService', () => {
  let service: StockTransferService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(StockTransferService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

