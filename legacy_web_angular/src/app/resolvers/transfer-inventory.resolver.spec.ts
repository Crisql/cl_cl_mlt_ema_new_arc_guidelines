import { TestBed } from '@angular/core/testing';

import { TransferInventoryResolver } from './transfer-inventory.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule} from "@clavisco/alerts";

describe('TransferInventoryResolver', () => {
  let resolver: TransferInventoryResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule]
    });
    resolver = TestBed.inject(TransferInventoryResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});

