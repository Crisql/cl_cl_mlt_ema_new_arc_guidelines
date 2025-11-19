import { TestBed } from '@angular/core/testing';

import { ActionCenterPushInterceptor } from './action-center-push.interceptor';
import {LinkerService} from "@clavisco/linker";

describe('ActionCenterPushInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      ActionCenterPushInterceptor,
      {
        provide: 'LinkerService',
        useExisting: LinkerService
      }
      ]
  }));

  it('should be created', () => {
    const interceptor: ActionCenterPushInterceptor = TestBed.inject(ActionCenterPushInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
