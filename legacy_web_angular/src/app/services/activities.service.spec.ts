import { TestBed } from '@angular/core/testing';

import { ActivitiesService } from './activities.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('ActivitiesService', () => {
  let service: ActivitiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(ActivitiesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

