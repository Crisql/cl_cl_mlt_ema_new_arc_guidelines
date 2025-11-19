import { TestBed } from '@angular/core/testing';

import { SuppliersService } from './suppliers.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('SuppliersService', () => {
  let service: SuppliersService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(SuppliersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
