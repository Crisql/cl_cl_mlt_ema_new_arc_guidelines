import { TestBed } from '@angular/core/testing';

import { TerminalsResolver } from './terminals.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule} from "@clavisco/alerts";

describe('TerminalsResolver', () => {
  let resolver: TerminalsResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule]
    });
    resolver = TestBed.inject(TerminalsResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});

