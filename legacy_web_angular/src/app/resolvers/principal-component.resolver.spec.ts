import { TestBed } from '@angular/core/testing';

import { PrincipalComponentResolver } from './principal-component.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule} from "@clavisco/alerts";
import {RouterTestingModule} from "@angular/router/testing";

describe('PrincipalComponentResolver', () => {
  let resolver: PrincipalComponentResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule, RouterTestingModule]
    });
    resolver = TestBed.inject(PrincipalComponentResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
