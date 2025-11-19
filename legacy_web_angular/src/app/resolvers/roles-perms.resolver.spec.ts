import { TestBed } from '@angular/core/testing';

import { RolesPermsResolver } from './roles-perms.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule} from "@clavisco/alerts";

describe('RolesPermsResolver', () => {
  let resolver: RolesPermsResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule]
    });
    resolver = TestBed.inject(RolesPermsResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
