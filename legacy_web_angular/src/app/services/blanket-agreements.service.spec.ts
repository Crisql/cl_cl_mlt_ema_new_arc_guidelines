import { TestBed } from '@angular/core/testing';

import { BlanketAgreementsService } from './blanket-agreements.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('BlanketAgreementsService', () => {
  let service: BlanketAgreementsService;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [HttpClientTestingModule]});
    service = TestBed.inject(BlanketAgreementsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
