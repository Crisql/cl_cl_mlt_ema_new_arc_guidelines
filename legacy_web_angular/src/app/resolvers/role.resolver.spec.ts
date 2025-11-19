import { TestBed } from '@angular/core/testing';

import { RoleResolver } from './role.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule} from "@clavisco/alerts";

describe('RoleResolver', () => {
  let resolver: RoleResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule]
    });
    resolver = TestBed.inject(RoleResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
