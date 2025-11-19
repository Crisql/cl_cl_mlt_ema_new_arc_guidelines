import { TestBed } from '@angular/core/testing';

import { TerminalsByUsersResolver } from './terminals-by-users.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule} from "@clavisco/alerts";

describe('TerminalsByUsersResolver', () => {
  let resolver: TerminalsByUsersResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule]
    });
    resolver = TestBed.inject(TerminalsByUsersResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});

