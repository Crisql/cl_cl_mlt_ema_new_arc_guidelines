import { TestBed } from '@angular/core/testing';

import { CreditNotesService } from './credit-notes.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('CreditNotesService', () => {
  let service: CreditNotesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(CreditNotesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

