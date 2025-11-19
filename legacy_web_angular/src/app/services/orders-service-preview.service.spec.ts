import { TestBed } from '@angular/core/testing';

import { OrdersServicePreviewService } from './orders-service-preview.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('OrdersServicePreviewService', () => {
  let service: OrdersServicePreviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(OrdersServicePreviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
