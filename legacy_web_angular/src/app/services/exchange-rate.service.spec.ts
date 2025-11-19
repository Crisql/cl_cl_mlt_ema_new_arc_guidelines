import { TestBed } from '@angular/core/testing';

import { ExchangeRateService } from './exchange-rate.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {ModalModule} from "@clavisco/alerts";

describe('ExchangeRateService', () => {
  let service: ExchangeRateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ModalModule]
    });
    service = TestBed.inject(ExchangeRateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
