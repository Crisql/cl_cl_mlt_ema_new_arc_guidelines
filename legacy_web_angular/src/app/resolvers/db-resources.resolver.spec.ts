import { TestBed } from '@angular/core/testing';

import { DbResourcesResolver } from './db-resources.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule} from "@clavisco/alerts";

describe('DbResourcesResolver', () => {
  let resolver: DbResourcesResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule]
    });
    resolver = TestBed.inject(DbResourcesResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
