import { TestBed } from '@angular/core/testing';

import { SearchTransferRequestResolver } from './search-transfer-request.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule} from "@clavisco/alerts";

describe('SearchTransferRequestResolver', () => {
  let resolver: SearchTransferRequestResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule]
    });
    resolver = TestBed.inject(SearchTransferRequestResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});

