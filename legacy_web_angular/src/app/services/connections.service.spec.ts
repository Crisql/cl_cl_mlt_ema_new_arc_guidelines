import { TestBed } from '@angular/core/testing';

import { ConnectionsService } from './connections.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('ConnectionsService', () => {
  let service: ConnectionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(ConnectionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
