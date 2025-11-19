import { TestBed } from '@angular/core/testing';

import { ActivitiesResolver } from './activities.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('ActivitiesResolver', () => {
  let resolver: ActivitiesResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    resolver = TestBed.inject(ActivitiesResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
