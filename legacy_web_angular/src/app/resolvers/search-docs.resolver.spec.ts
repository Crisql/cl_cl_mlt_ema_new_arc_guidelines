import { TestBed } from '@angular/core/testing';

import { SearchDocsResolver } from './search-docs.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule} from "@clavisco/alerts";

describe('SearchDocsResolver', () => {
  let resolver: SearchDocsResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule]
    });
    resolver = TestBed.inject(SearchDocsResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
