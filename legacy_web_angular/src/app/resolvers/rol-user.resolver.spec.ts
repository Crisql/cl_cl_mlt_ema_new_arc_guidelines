import { TestBed } from '@angular/core/testing';

import { RolUserResolver } from './rol-user.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule} from "@clavisco/alerts";

describe('RolUserResolver', () => {
  let resolver: RolUserResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule]
    });
    resolver = TestBed.inject(RolUserResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
