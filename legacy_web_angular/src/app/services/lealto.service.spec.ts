import { TestBed } from '@angular/core/testing';

import { LealtoService } from './lealto.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('LealtoService', () => {
  let service: LealtoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(LealtoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
