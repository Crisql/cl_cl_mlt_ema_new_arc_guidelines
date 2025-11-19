import { TestBed } from '@angular/core/testing';

import { VerifyUserTokenGuard } from './verify-user-token.guard';
import {RouterTestingModule} from "@angular/router/testing";
import {AlertsModule, ModalModule} from "@clavisco/alerts";

describe('VerifyUserTokenGuard', () => {
  let guard: VerifyUserTokenGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule, RouterTestingModule],
    });
    guard = TestBed.inject(VerifyUserTokenGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
