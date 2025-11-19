import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RouteDestinationsPage } from './route-destinations.page';

describe('RouteDestinationsPage', () => {
  let component: RouteDestinationsPage;
  let fixture: ComponentFixture<RouteDestinationsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RouteDestinationsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RouteDestinationsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
