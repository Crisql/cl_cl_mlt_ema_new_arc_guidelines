import { TestBed } from '@angular/core/testing';

import { LogEventsService } from './log-events.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('LogEventsService', () => {
  let service: LogEventsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(LogEventsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
