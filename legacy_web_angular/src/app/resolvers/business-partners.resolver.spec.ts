import { TestBed } from '@angular/core/testing';

import { BusinessPartnersResolver } from './business-partners.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule} from "@clavisco/alerts";

describe('BusinessPartnersResolver', () => {
  let resolver: BusinessPartnersResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule]
    });
    resolver = TestBed.inject(BusinessPartnersResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
