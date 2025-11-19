import { TestBed } from '@angular/core/testing';

import { BusinessPartnersService } from './business-partners.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('BusinessPartnersService', () => {
  let service: BusinessPartnersService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(BusinessPartnersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
