import { TestBed } from '@angular/core/testing';

import { RouteListResolver } from './route-list.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule} from "@clavisco/alerts";

describe('RouteListResolver', () => {
  let resolver: RouteListResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule]
    });
    resolver = TestBed.inject(RouteListResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
