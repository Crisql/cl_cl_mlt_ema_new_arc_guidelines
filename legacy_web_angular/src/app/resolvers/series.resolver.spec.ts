import { TestBed } from '@angular/core/testing';

import { SeriesResolver } from './series.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule} from "@clavisco/alerts";

describe('SeriesResolver', () => {
  let resolver: SeriesResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule]
    });
    resolver = TestBed.inject(SeriesResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
