import { TestBed } from '@angular/core/testing';
import {PPStoredTransactionService} from "@app/services/ppstored-transaction.service";
import {HttpClientTestingModule} from "@angular/common/http/testing";


describe('PpStoredTransactionService', () => {
  let service: PPStoredTransactionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(PPStoredTransactionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
