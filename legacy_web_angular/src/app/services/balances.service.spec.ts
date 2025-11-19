import { TestBed } from '@angular/core/testing';

import { BalancesService } from './balances.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('BalancesService', () => {
  let service: BalancesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(BalancesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
