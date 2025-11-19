import { TestBed } from '@angular/core/testing';

import { NetworkListenerService } from './network-listener.service';

describe('NetworkListenerService', () => {
  let service: NetworkListenerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NetworkListenerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
