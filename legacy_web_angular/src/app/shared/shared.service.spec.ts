import { TestBed } from '@angular/core/testing';

import { SharedService } from './shared.service';
import {RouterTestingModule} from "@angular/router/testing";

describe('SharedService', () => {
  let service: SharedService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule]
    });
    service = TestBed.inject(SharedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
