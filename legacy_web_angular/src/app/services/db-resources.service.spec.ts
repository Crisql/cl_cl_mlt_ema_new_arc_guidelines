import { TestBed } from '@angular/core/testing';

import { DbResourcesService } from './db-resources.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('DbResourcesService', () => {
  let service: DbResourcesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(DbResourcesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
