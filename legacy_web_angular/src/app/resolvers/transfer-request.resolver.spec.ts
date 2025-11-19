import { TestBed } from '@angular/core/testing';

import { TransferRequestResolver } from './transfer-request.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule} from "@clavisco/alerts";

describe('TransferRequestResolver', () => {
  let resolver: TransferRequestResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule]
    });
    resolver = TestBed.inject(TransferRequestResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});

