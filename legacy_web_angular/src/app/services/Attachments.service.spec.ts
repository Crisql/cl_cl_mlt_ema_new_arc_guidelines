import { TestBed } from '@angular/core/testing';

import { AttachmentsService } from './Attachments.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('AttachmentsService', () => {
  let service: AttachmentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(AttachmentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

