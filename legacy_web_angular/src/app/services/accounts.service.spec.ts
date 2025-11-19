import { TestBed } from '@angular/core/testing';

import { AccountsService } from './accounts.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('AccountsService', () => {
  let service: AccountsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(AccountsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
