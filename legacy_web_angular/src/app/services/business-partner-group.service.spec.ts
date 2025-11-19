import { TestBed } from '@angular/core/testing';

import { BusinessPartnerGroupService } from './business-partner-group.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('BusinessPartnerGroupService', () => {
  let service: BusinessPartnerGroupService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(BusinessPartnerGroupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

