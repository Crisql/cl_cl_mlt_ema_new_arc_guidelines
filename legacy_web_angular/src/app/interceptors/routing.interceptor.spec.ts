import { TestBed } from '@angular/core/testing';

import { RoutingInterceptor } from './routing.interceptor';
import {RouterTestingModule} from "@angular/router/testing";

describe('RoutingInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [RouterTestingModule],
    providers: [
      RoutingInterceptor
    ]
  }));

  it('should be created', () => {
    const interceptor: RoutingInterceptor = TestBed.inject(RoutingInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
