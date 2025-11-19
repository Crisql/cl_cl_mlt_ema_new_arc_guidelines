import { TestBed } from '@angular/core/testing';

import { SAPUsersService } from './sapusers.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('SAPUsersService', () => {
  let service: SAPUsersService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(SAPUsersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
