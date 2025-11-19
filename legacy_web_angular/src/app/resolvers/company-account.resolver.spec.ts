import { TestBed } from '@angular/core/testing';

import { CompanyAccountResolver } from './company-account.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule} from "@clavisco/alerts";

describe('CompanyAccountResolver', () => {
  let resolver: CompanyAccountResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule]
    });
    resolver = TestBed.inject(CompanyAccountResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
