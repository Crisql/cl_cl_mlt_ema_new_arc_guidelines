import { TestBed } from '@angular/core/testing';

import { GoogleService } from './google.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule} from "@clavisco/alerts";

describe('GoogleService', () => {
  let service: GoogleService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AlertsModule, HttpClientTestingModule]
    });
    service = TestBed.inject(GoogleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
