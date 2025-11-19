import { TestBed } from '@angular/core/testing';

import { RouteAssignmentService } from './route-assignment.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('RouteAssignmentService', () => {
  let service: RouteAssignmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(RouteAssignmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
