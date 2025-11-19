import { TestBed } from '@angular/core/testing';

import { CashClosingsService } from './cashClosings.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('CashClosingsService', () => {
  let service: CashClosingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(CashClosingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

