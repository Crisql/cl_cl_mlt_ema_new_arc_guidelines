import { TestBed } from '@angular/core/testing';

import { ItemPriceService } from './item-price.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('ItemPriceService', () => {
  let service: ItemPriceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(ItemPriceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
