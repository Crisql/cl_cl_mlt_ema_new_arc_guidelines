import { TestBed } from '@angular/core/testing';

import { CheckRouteService } from './check-route.service';

describe('CheckRouteService', () => {
  let service: CheckRouteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CheckRouteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
