import { TestBed } from '@angular/core/testing';

import { AuthGuard } from './auth.guard';
import {AlertsModule} from "@clavisco/alerts";
import {RouterTestingModule} from "@angular/router/testing";

describe('AuthGuard', () => {
  let guard: AuthGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, AlertsModule],
    });
    guard = TestBed.inject(AuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
