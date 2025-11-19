import { TestBed } from '@angular/core/testing';

import { RoutesAdministratorsService } from './routes-administrators.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('RoutesAdministratorsService', () => {
  let service: RoutesAdministratorsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(RoutesAdministratorsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
