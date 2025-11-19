import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SearchTransfersPage } from './search-transfers.page';

describe('SearchTransfersPage', () => {
  let component: SearchTransfersPage;
  let fixture: ComponentFixture<SearchTransfersPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchTransfersPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchTransfersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
