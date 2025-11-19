import { TestBed } from '@angular/core/testing';

import { SalesDocumentResolver } from './sales-document.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule, ModalModule} from "@clavisco/alerts";

describe('SalesDocumentResolver', () => {
  let resolver: SalesDocumentResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ModalModule, AlertsModule]
    });
    resolver = TestBed.inject(SalesDocumentResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
