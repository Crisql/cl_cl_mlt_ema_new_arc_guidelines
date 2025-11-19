import { TestBed } from '@angular/core/testing';

import { DimensionsService } from './dimensions.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('DimensionsService', () => {
  let service: DimensionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(DimensionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
