import { TestBed } from '@angular/core/testing';

import { RoleService } from './role.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('RoleService', () => {
  let service: RoleService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(RoleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
