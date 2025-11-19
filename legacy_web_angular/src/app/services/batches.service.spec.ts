import { TestBed } from '@angular/core/testing';

import { BatchesService } from './batches.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('BatchesService', () => {
  let service: BatchesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(BatchesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
