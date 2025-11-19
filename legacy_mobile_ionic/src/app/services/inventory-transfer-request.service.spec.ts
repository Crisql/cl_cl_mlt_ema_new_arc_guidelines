import { TestBed } from '@angular/core/testing';

import { InventoryTransferRequestService } from './inventory-transfer-request.service';

describe('InventoryTransferRequestService', () => {
  let service: InventoryTransferRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InventoryTransferRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
