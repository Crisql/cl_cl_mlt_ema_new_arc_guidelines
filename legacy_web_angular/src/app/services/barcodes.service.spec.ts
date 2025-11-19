import { TestBed } from '@angular/core/testing';

import { BarcodesService } from './barcodes.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('BarcodesService', () => {
  let service: BarcodesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(BarcodesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
