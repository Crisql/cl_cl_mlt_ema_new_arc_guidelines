import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrequenciesComponent } from './frequencies.component';
import {ICLEvent, LinkerService} from "@clavisco/linker";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {RouterTestingModule} from "@angular/router/testing";
import {MatDialogModule} from "@angular/material/dialog";
import {AlertsModule, ModalModule} from "@clavisco/alerts";
import {OverlayModule} from "@clavisco/overlay";
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from "@angular/core";
import { Structures } from '@clavisco/core';
import { SharedService } from '@app/shared/shared.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IActionButton } from '@app/interfaces/i-action-button';

describe('FrequenciesComponent', () => {
  let component: FrequenciesComponent;
  let fixture: ComponentFixture<FrequenciesComponent>;

  let router: Router;
  let activatedRoute: ActivatedRoute;
  let sharedService: SharedService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FrequenciesComponent ],
      imports: [OverlayModule, AlertsModule, ModalModule, MatDialogModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        {
          provide: 'LinkerService',
          useExisting: LinkerService
        },

      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]

    })
    .compileComponents();
    router = TestBed.inject(Router);
    activatedRoute = TestBed.inject(ActivatedRoute);
    sharedService = TestBed.inject(SharedService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FrequenciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to update dialog when update action is clicked', () => {
    const navigateSpy = spyOn(router, 'navigate');
    spyOn(sharedService, 'GetCurrentRouteSegment').and.returnValue('currentSegment');

    const mockEvent: ICLEvent = {
      Target:"",
      CallBack:"",
      Data: JSON.stringify({
        Action: Structures.Enums.CL_ACTIONS.UPDATE,
        Data: JSON.stringify({ Id: '123' })
      })
    };

    component.OnTableButtonClicked(mockEvent);

    expect(navigateSpy).toHaveBeenCalledWith(['currentSegment'], {
      relativeTo: activatedRoute,
      queryParams: {
        dialog: 'update',
        recordId: '123'
      }
    });
  });


  it('should not navigate when event is undefined', () => {
    const navigateSpy = spyOn(router, 'navigate');
    const consoleErrorSpy = spyOn(console, 'error');

    //component.OnTableButtonClicked(undefined);

    expect(navigateSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should not navigate when action is not UPDATE', () => {
    const navigateSpy = spyOn(router, 'navigate');

    const mockEvent: ICLEvent = {
      Target:"",
      CallBack:"",
      Data: JSON.stringify({
        Action: 'SOME_OTHER_ACTION',
        Data: JSON.stringify({ Id: '123' })
      })
    };

    component.OnTableButtonClicked(mockEvent);

    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('should handle malformed event data', () => {
    const navigateSpy = spyOn(router, 'navigate');

    const mockEvent: ICLEvent = {
      Target:"",
      CallBack:"",
      Data: ''
    };

    component.OnTableButtonClicked(mockEvent);    
    expect(navigateSpy).not.toHaveBeenCalled();
  });



  it('should navigate to create dialog when ADD action is clicked', () => {
    const navigateSpy = spyOn(router, 'navigate');
    spyOn(sharedService, 'GetCurrentRouteSegment').and.returnValue('currentSegment');

    const mockActionButton: IActionButton = {
      Key: 'ADD'
    };

    component.OnActionButtonClicked(mockActionButton);

    expect(navigateSpy).toHaveBeenCalledWith(['currentSegment'], {
      relativeTo: activatedRoute,
      queryParams: {
        dialog: 'create'
      }
    });
  });
  it('should not navigate when action is not ADD', () => {
    const navigateSpy = spyOn(router, 'navigate');

    const mockActionButton: IActionButton = {
      Key: 'SOME_OTHER_ACTION'
    };

    component.OnActionButtonClicked(mockActionButton);

    expect(navigateSpy).not.toHaveBeenCalled();
  });
  
});
