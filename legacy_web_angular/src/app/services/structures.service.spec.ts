import { TestBed } from '@angular/core/testing';

import { StructuresService } from './structures.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('StructuresService', () => {
  let service: StructuresService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(StructuresService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
