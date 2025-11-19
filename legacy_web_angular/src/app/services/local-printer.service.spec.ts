import { TestBed } from '@angular/core/testing';

import { LocalPrinterService } from './local-printer.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('LocalPrinterService', () => {
  let service: LocalPrinterService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(LocalPrinterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
