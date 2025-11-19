import { TestBed } from '@angular/core/testing';

import { ItemsService } from './items.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('ItemsService', () => {
  let service: ItemsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(ItemsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
