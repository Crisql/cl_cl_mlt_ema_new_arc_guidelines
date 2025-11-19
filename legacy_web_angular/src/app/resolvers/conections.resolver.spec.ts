import { TestBed } from '@angular/core/testing';

import { ConectionsResolver } from './conections.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule} from "@clavisco/alerts";

describe('ConectionsResolver', () => {
  let resolver: ConectionsResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule]
    });
    resolver = TestBed.inject(ConectionsResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
