import { TestBed } from '@angular/core/testing';

import { PurchasesDocumentResolver } from './purchases-document.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule, ModalModule} from "@clavisco/alerts";

describe('PurchasesDocumentResolver', () => {
  let resolver: PurchasesDocumentResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule, ModalModule]
    });
    resolver = TestBed.inject(PurchasesDocumentResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
