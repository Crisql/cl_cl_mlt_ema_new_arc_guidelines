import { TestBed } from '@angular/core/testing';

import { GeoRoleService } from './geo-role.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('GeoRoleService', () => {
  let service: GeoRoleService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(GeoRoleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
