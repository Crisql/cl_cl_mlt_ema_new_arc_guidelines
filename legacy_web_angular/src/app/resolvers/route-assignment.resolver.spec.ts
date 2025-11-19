import { TestBed } from '@angular/core/testing';

import { RouteAssignmentResolver } from './route-assignment.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule} from "@clavisco/alerts";

describe('RouteAssignmentResolver', () => {
  let resolver: RouteAssignmentResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule]
    });
    resolver = TestBed.inject(RouteAssignmentResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
