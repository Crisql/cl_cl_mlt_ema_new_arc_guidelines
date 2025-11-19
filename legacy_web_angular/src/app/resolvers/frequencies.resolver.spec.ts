import { TestBed } from '@angular/core/testing';

import { FrequenciesResolver } from './frequencies.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule} from "@clavisco/alerts";

describe('FrequenciesResolver', () => {
  let resolver: FrequenciesResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule]
    });
    resolver = TestBed.inject(FrequenciesResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
