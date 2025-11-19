import { TestBed } from '@angular/core/testing';

import { MasterDataService } from './master-data.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('MasterDataService', () => {
  let service: MasterDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(MasterDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
