import { TestBed } from '@angular/core/testing';

import { PreClosingCardsResolver } from './pre-closing-cards.resolver';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertsModule} from "@clavisco/alerts";

describe('PreClosingCardsResolver', () => {
  let resolver: PreClosingCardsResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AlertsModule]
    });
    resolver = TestBed.inject(PreClosingCardsResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
