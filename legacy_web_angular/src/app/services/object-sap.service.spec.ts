import { TestBed } from '@angular/core/testing';

import { ObjectSapService } from './object-sap.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('ObjectSapService', () => {
  let service: ObjectSapService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(ObjectSapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
