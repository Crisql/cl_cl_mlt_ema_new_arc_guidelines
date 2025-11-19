import { TestBed } from '@angular/core/testing';

import { CompanyComponentResolver } from './company-component.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule} from "@clavisco/alerts";

describe('CompanyComponentResolver', () => {
  let resolver: CompanyComponentResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule]
    });
    resolver = TestBed.inject(CompanyComponentResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
