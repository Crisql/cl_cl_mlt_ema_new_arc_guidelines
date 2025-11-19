import { TestBed } from '@angular/core/testing';

import { ItemPriceService } from './item-price.service';

describe('ItemPriceService', () => {
  let service: ItemPriceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ItemPriceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
