import { TestBed } from '@angular/core/testing';

import { AssignsService } from './assigns.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('AssignsService', () => {
  let service: AssignsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(AssignsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
