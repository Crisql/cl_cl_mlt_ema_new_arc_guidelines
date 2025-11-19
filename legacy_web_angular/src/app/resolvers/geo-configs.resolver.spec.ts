import { TestBed } from '@angular/core/testing';

import { GeoConfigsResolver } from './geo-configs.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule} from "@clavisco/alerts";

describe('GeoConfigsResolver', () => {
  let resolver: GeoConfigsResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule]
    });
    resolver = TestBed.inject(GeoConfigsResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
