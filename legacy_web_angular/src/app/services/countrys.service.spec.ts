import { TestBed } from '@angular/core/testing';

import { CountrysService } from './countrys.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('CountrysService', () => {
  let service: CountrysService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(CountrysService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

