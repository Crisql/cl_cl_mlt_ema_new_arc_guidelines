import { TestBed } from '@angular/core/testing';

import { UserAssignsComponentResolver } from './user-assigns-component.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule} from "@clavisco/alerts";

describe('UserAssignsComponentResolver', () => {
  let resolver: UserAssignsComponentResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule]
    });
    resolver = TestBed.inject(UserAssignsComponentResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
