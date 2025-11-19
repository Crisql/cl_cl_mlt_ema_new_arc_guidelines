import { TestBed } from '@angular/core/testing';

import { InventoryTrasferRequestService } from './inventory-trasfer-request.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('InventoryTrasferRequestService', () => {
  let service: InventoryTrasferRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(InventoryTrasferRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

