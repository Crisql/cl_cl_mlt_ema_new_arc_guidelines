import { TestBed } from '@angular/core/testing';

import { LocalPrinterResolver } from './local-printer.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule} from "@clavisco/alerts";

describe('LocalPrinterResolver', () => {
  let resolver: LocalPrinterResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule]
    });
    resolver = TestBed.inject(LocalPrinterResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
