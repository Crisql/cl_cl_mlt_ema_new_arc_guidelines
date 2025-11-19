import { TestBed } from '@angular/core/testing';

import { ConsolidationBusinessPartnerService } from './consolidation-business-partner.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('ConsolidationBusinessPartnerService', () => {
  let service: ConsolidationBusinessPartnerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(ConsolidationBusinessPartnerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
