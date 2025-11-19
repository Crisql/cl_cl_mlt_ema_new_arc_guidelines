import { TestBed } from '@angular/core/testing';

import { PrintFormatsService } from './print-formats.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('PrintFormatsService', () => {
  let service: PrintFormatsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(PrintFormatsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
