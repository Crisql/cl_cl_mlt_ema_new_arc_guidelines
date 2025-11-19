import { TestBed } from '@angular/core/testing';

import { GeoRolesResolver } from './geo-roles.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule} from "@clavisco/alerts";

describe('GeoRolesResolver', () => {
  let resolver: GeoRolesResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule]
    });
    resolver = TestBed.inject(GeoRolesResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
