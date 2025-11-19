import { TestBed } from '@angular/core/testing';

import { GeoConfigService } from './geo-config.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('GeoConfigService', () => {
  let service: GeoConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(GeoConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
