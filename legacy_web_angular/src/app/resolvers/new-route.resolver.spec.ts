import { TestBed } from '@angular/core/testing';

import { NewRouteResolver } from './new-route.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule} from "@clavisco/alerts";

describe('NewRouteResolver', () => {
  let resolver: NewRouteResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule]
    });
    resolver = TestBed.inject(NewRouteResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
