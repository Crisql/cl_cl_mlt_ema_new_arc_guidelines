import { TestBed } from '@angular/core/testing';

import { PurchaseInvoiceResolver } from './purchase-invoice.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule, ModalModule} from "@clavisco/alerts";

describe('PurchaseInvoiceResolver', () => {
  let resolver: PurchaseInvoiceResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule, ModalModule]
    });
    resolver = TestBed.inject(PurchaseInvoiceResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});

