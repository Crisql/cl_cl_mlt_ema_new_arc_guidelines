import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RouteMapPage } from './route-map.page';

describe('RouteMapPage', () => {
  let component: RouteMapPage;
  let fixture: ComponentFixture<RouteMapPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RouteMapPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RouteMapPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
