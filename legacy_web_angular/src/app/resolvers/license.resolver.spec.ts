import { TestBed } from '@angular/core/testing';

import { LicenseResolver } from './license.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule} from "@clavisco/alerts";

describe('LicenseResolver', () => {
  let resolver: LicenseResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule]
    });
    resolver = TestBed.inject(LicenseResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
