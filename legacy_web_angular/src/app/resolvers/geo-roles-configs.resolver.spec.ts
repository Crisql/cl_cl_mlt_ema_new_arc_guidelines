import { TestBed } from '@angular/core/testing';

import { GeoRolesConfigsResolver } from './geo-roles-configs.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule} from "@clavisco/alerts";

describe('GeoRolesConfigsResolver', () => {
  let resolver: GeoRolesConfigsResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule]
    });
    resolver = TestBed.inject(GeoRolesConfigsResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
