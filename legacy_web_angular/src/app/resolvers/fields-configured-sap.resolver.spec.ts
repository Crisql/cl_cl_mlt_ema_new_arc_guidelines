import { TestBed } from '@angular/core/testing';

import { FieldsConfiguredSapResolver } from './fields-configured-sap.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule} from "@clavisco/alerts";

describe('FieldsConfiguredSapResolver', () => {
  let resolver: FieldsConfiguredSapResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule]
    });
    resolver = TestBed.inject(FieldsConfiguredSapResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
