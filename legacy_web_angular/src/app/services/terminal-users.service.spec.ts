import { TestBed } from '@angular/core/testing';

import { TerminalUsersService } from './terminal-users.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('TerminalUsersService', () => {
  let service: TerminalUsersService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(TerminalUsersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
