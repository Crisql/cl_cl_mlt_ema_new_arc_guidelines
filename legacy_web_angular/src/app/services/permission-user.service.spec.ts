import { TestBed } from '@angular/core/testing';

import { PermissionUserService } from './permission-user.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('PermissionUserService', () => {
  let service: PermissionUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(PermissionUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
