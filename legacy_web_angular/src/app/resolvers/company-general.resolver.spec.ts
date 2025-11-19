import { TestBed } from '@angular/core/testing';

import { CompanyGeneralResolver } from './company-general.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule} from "@clavisco/alerts";

describe('CompanyGeneralResolver', () => {
  let resolver: CompanyGeneralResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule]
    });
    resolver = TestBed.inject(CompanyGeneralResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
