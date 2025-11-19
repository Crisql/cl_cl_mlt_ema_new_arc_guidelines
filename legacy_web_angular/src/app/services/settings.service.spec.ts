import { TestBed } from '@angular/core/testing';

import { SettingsService } from './settings.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('SettingsService', () => {
  let service: SettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(SettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
