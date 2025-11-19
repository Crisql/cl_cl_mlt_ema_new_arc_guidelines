import { TestBed } from '@angular/core/testing';

import { WarehousesService } from './warehouses.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('StoresServiceService', () => {
  let service: WarehousesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(WarehousesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
