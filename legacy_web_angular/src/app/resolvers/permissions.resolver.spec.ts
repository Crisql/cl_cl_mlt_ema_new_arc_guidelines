
import { TestBed } from '@angular/core/testing';

import { PermissionsResolver } from './permissions.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule} from "@clavisco/alerts";

describe('PermissionsResolver', () => {
  let resolver: PermissionsResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule]
    });
    resolver = TestBed.inject(PermissionsResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});

