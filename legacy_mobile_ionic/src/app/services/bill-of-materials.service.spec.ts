import { TestBed } from '@angular/core/testing';

import { BillOfMaterialsService } from './bill-of-materials.service';

describe('BillOfMaterialsService', () => {
  let service: BillOfMaterialsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BillOfMaterialsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
