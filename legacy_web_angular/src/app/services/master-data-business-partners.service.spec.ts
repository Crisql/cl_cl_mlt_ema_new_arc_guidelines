import { TestBed } from '@angular/core/testing';

import { MasterDataBusinessPartnersService } from './master-data-business-partners.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('MasterDataBusinessPartnersService', () => {
  let service: MasterDataBusinessPartnersService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(MasterDataBusinessPartnersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
