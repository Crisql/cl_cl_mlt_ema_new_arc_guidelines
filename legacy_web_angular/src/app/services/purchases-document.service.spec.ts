import { TestBed } from '@angular/core/testing';

import { PurchasesDocumentService } from './purchases-document.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('PurchasesDocumentService', () => {
  let service: PurchasesDocumentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(PurchasesDocumentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
