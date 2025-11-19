import { TestBed } from '@angular/core/testing';

import { ItemMasterDataService } from './item-master-data.service';

describe('ItemMasterDataService', () => {
  let service: ItemMasterDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ItemMasterDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
