import { TestBed } from '@angular/core/testing';

import { ItemsResolver } from './items.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule} from "@clavisco/alerts";

describe('ItemsResolver', () => {
  let resolver: ItemsResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule]
    });
    resolver = TestBed.inject(ItemsResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
