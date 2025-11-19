import { TestBed } from '@angular/core/testing';

import { ServiceLayerService } from './service-layer.service';
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe('ServiceLayerService', () => {
  let service: ServiceLayerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ]
    });
    service = TestBed.inject(ServiceLayerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
