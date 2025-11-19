import { TestBed } from '@angular/core/testing';

import { DraftService } from './draft.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('DraftService', () => {
  let service: DraftService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(DraftService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
