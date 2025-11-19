import { TestBed } from '@angular/core/testing';

import { BinLocationsService } from './bin-locations.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('BinLocationsService', () => {
  let service: BinLocationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(BinLocationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
