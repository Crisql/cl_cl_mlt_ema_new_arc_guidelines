import { TestBed } from '@angular/core/testing';

import { ErrorInterceptor } from './error.interceptor';
import {RouterTestingModule} from "@angular/router/testing";
import {ModalModule} from "@clavisco/alerts";

describe('ErrorInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [RouterTestingModule, ModalModule],
    providers: [
      ErrorInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: ErrorInterceptor = TestBed.inject(ErrorInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
