import { TestBed } from '@angular/core/testing';

import { GeoconfigService } from './geoconfig.service';

describe('GeoconfigService', () => {
  let service: GeoconfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeoconfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
