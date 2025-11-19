import { TestBed } from '@angular/core/testing';

import { UdfResolver } from './udf.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule} from "@clavisco/alerts";

describe('UdfResolver', () => {
  let resolver: UdfResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule]
    });
    resolver = TestBed.inject(UdfResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
