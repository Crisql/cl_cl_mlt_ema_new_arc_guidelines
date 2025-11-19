import { TestBed } from '@angular/core/testing';

import { UserComponentResolver } from './user-component.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule} from "@clavisco/alerts";

describe('UserComponentResolver', () => {
  let resolver: UserComponentResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule]
    });
    resolver = TestBed.inject(UserComponentResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
