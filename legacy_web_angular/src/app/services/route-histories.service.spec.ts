import { TestBed } from '@angular/core/testing';

import { RouteHistoriesService } from './route-histories.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('RouteHistoriesService', () => {
  let service: RouteHistoriesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(RouteHistoriesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
