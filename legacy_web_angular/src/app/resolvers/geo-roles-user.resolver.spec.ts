import { TestBed } from '@angular/core/testing';

import { GeoRolesUserResolver } from './geo-roles-user.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule} from "@clavisco/alerts";

describe('GeoRolesUserResolver', () => {
  let resolver: GeoRolesUserResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule]
    });
    resolver = TestBed.inject(GeoRolesUserResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
