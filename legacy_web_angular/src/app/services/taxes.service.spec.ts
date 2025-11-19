import { TestBed } from '@angular/core/testing';

import { TaxesService } from './taxes.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('TaxesService', () => {
  let service: TaxesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(TaxesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
