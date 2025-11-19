import { TestBed } from '@angular/core/testing';

import { PadronService } from './padron.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('PadronService', () => {
  let service: PadronService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(PadronService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
