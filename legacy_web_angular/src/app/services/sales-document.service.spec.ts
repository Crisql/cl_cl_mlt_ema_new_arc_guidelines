import { TestBed } from '@angular/core/testing';

import { SalesDocumentService } from './sales-document.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('SalesDocumentService', () => {
  let service: SalesDocumentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(SalesDocumentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
