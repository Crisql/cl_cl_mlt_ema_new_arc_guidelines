import { TestBed } from '@angular/core/testing';

import { PurchaseSearchDocsService } from './purchase-search-docs.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('PurchaseSearchDocsService', () => {
  let service: PurchaseSearchDocsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(PurchaseSearchDocsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
