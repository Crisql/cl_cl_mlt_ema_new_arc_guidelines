
import { TestBed } from '@angular/core/testing';

import { InventoryOuputResolver } from './inventory-ouput.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule, ModalModule, ModalService} from "@clavisco/alerts";

describe('InventoryOuputResolver', () => {
  let resolver: InventoryOuputResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule, ModalModule]
    });
    resolver = TestBed.inject(InventoryOuputResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});

