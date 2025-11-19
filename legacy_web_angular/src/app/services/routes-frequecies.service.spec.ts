import { TestBed } from '@angular/core/testing';

import { RoutesFrequeciesService } from './routes-frequecies.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('RoutesFrequeciesService', () => {
  let service: RoutesFrequeciesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(RoutesFrequeciesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
