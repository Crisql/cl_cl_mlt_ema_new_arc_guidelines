import { TestBed } from '@angular/core/testing';

import { PrinterWorkerService } from './printer-worker.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('PrinterWorkerService', () => {
  let service: PrinterWorkerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(PrinterWorkerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
