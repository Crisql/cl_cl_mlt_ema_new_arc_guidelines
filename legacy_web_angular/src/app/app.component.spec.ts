import { TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment';
import { AppComponent } from './app.component';
import {LinkerService} from "@clavisco/linker";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {RouterTestingModule} from "@angular/router/testing";
import {MatDialogModule} from "@angular/material/dialog";
import {AlertsModule, ModalModule} from "@clavisco/alerts";
import {OverlayModule} from "@clavisco/overlay";
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from "@angular/core";

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      imports: [OverlayModule, AlertsModule, ModalModule, MatDialogModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        {
          provide: 'LinkerService',
          useExisting: LinkerService
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]

    }).compileComponents();
  });

  it('should create the app', () => {

    const fixture = TestBed.createComponent(AppComponent);

    const app = fixture.componentInstance;

    expect(app).toBeTruthy();

  });



  it(`check API url`, () => {

    const fixture = TestBed.createComponent(AppComponent);

    const app = fixture.componentInstance;

    var a = ["test", "dev"];

    if (environment.env == "Production") {

      expect(a.some(cond => environment.apiUrl.includes(cond))).toBe(false);

    }

    else if (environment.env == "Testing") {

      expect(environment.apiUrl).toContain('test')

    }

    else {

      expect(environment.apiUrl).toContain('dev')

    }

  });

  if(environment.production) {
    it('should have LogRocketId defined', () => {
      expect(environment.LogRocketId).toBeDefined();
    });

    it('should have the correct LogRocketId value', () => {
      expect(environment.LogRocketId).toBeTruthy();
      expect(environment.LogRocketId).not.toBe('');
    });
  }
});
