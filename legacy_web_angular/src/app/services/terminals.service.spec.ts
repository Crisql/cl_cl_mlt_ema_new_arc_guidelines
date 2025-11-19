import { TestBed } from '@angular/core/testing';

import { TerminalsService } from './terminals.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('TerminalsService', () => {
  let service: TerminalsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(TerminalsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
