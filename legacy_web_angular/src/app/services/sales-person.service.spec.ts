import { TestBed } from '@angular/core/testing';

import { SalesPersonService } from './sales-person.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('SalesPersonService', () => {
  let service: SalesPersonService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(SalesPersonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
