import { TestBed } from '@angular/core/testing';

import { WithholdingTaxService } from './withholding-tax.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('WithholdingTaxService', () => {
  let service: WithholdingTaxService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(WithholdingTaxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
