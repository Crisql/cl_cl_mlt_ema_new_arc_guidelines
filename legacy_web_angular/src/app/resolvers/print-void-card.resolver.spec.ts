import { TestBed } from '@angular/core/testing';

import { PrintVoidCardResolver } from './print-void-card.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule} from "@clavisco/alerts";

describe('PrintVoidCardResolver', () => {
  let resolver: PrintVoidCardResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule]
    });
    resolver = TestBed.inject(PrintVoidCardResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
