import { TestBed } from '@angular/core/testing';

import { SyncDocumentService } from './sync-document.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('SyncDocumentService', () => {
  let service: SyncDocumentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(SyncDocumentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
