import { TestBed } from '@angular/core/testing';

import { TappService } from './tapp.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('TappService', () => {
  let service: TappService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(TappService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
