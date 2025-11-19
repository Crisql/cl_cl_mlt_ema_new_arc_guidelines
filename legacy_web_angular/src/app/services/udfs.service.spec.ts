import { TestBed } from '@angular/core/testing';

import { UdfsService } from './udfs.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('UdfsService', () => {
  let service: UdfsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(UdfsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
