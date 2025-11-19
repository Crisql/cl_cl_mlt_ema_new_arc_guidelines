import { TestBed } from '@angular/core/testing';

import { JsonDataServiceService } from './json-data-service.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('JsonDataServiceService', () => {
  let service: JsonDataServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(JsonDataServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
