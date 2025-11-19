import { TestBed } from '@angular/core/testing';

import { CompanyConfigurationsResolver } from './company-configurations.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule} from "@clavisco/alerts";

describe('CompanyConfigurationsResolver', () => {
  let resolver: CompanyConfigurationsResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule]
    });
    resolver = TestBed.inject(CompanyConfigurationsResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
