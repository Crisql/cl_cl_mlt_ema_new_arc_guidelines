import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LicensesComponent } from './licenses.component';
import {ICLEvent, LinkerService} from "@clavisco/linker";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {RouterTestingModule} from "@angular/router/testing";
import {MatDialog, MatDialogModule} from "@angular/material/dialog";
import {AlertsModule, AlertsService, ModalModule} from "@clavisco/alerts";
import {OverlayModule} from "@clavisco/overlay";
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from "@angular/core";
import { ActivatedRoute, Router } from '@angular/router';
import { Structures } from '@clavisco/core';
import { SharedService } from '@app/shared/shared.service';
import { ILicense } from '@app/interfaces/i-license';
import { of, Subject } from 'rxjs';
import { IActionButton } from '@app/interfaces/i-action-button';

describe('LicensesComponent', () => {
  let component: LicensesComponent;
  let fixture: ComponentFixture<LicensesComponent>;

  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let sharedServiceSpy: jasmine.SpyObj<SharedService>;
  let linkerServiceSpy: jasmine.SpyObj<LinkerService>;
  let alertsServiceSpy: jasmine.SpyObj<AlertsService>;
  let matDialogSpy: jasmine.SpyObj<MatDialog>;
  
  beforeEach(async () => {
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
    const activatedRouteSpyObj = jasmine.createSpyObj('ActivatedRoute', [], {
      queryParams: of({}),
      data: of({ resolvedData: { Licenses: [], Companies: [] } })
    });
    const sharedServiceSpyObj = jasmine.createSpyObj('SharedService', ['GetCurrentRouteSegment', 'MapTableColumns', 'SetActionButtons']);
    const linkerServiceSpyObj = jasmine.createSpyObj('LinkerService', ['Flow', 'Publish']);
    const alertsServiceSpyObj = jasmine.createSpyObj('AlertsService', ['Toast']);
    const matDialogSpyObj = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      declarations: [ LicensesComponent ],
      imports: [OverlayModule, AlertsModule, ModalModule, MatDialogModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: Router, useValue: routerSpyObj },
        { provide: ActivatedRoute, useValue: activatedRouteSpyObj },
        { provide: SharedService, useValue: sharedServiceSpyObj },
        { provide: LinkerService, useValue: linkerServiceSpyObj },
        { provide: AlertsService, useValue: alertsServiceSpyObj },
        { provide: MatDialog, useValue: matDialogSpyObj },
        {
          provide: 'LinkerService',
          useExisting: LinkerService
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    activatedRouteSpy = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    sharedServiceSpy = TestBed.inject(SharedService) as jasmine.SpyObj<SharedService>;
    linkerServiceSpy = TestBed.inject(LinkerService) as jasmine.SpyObj<LinkerService>;
    alertsServiceSpy = TestBed.inject(AlertsService) as jasmine.SpyObj<AlertsService>;
    matDialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;

    //linkerServiceSpy.Flow.and.returnValue(of({}));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LicensesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not navigate when event.Data is falsy', () => {
    const event: ICLEvent = { Target: '', CallBack: '', Data: '' };
    component.OnUserTableActionActivated(event);
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should navigate when event.Data is valid and action is UPDATE', () => {
    const license: ILicense = { Id: 1, User: 'test', Password: 'pass', CompanyId: 1, IsActive: true };
    const buttonEvent = { Action: Structures.Enums.CL_ACTIONS.UPDATE, Data: JSON.stringify(license) };
    const event: ICLEvent = { Target: '', CallBack: '', Data: JSON.stringify(buttonEvent) };
    
    sharedServiceSpy.GetCurrentRouteSegment.and.returnValue('currentSegment');

    component.OnUserTableActionActivated(event);

    expect(sharedServiceSpy.GetCurrentRouteSegment).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(
      ['currentSegment'],
      {
        relativeTo: activatedRouteSpy,
        queryParams: { dialog: 'update', recordId: 1 }
      }
    );
  });

  it('should not navigate when action is not UPDATE', () => {
    const license: ILicense = { Id: 1, User: 'test', Password: 'pass', CompanyId: 1, IsActive: true };
    const buttonEvent = { Action: 'SOME_OTHER_ACTION', Data: JSON.stringify(license) };
    const event: ICLEvent = { Target: '', CallBack: '', Data: JSON.stringify(buttonEvent) };

    component.OnUserTableActionActivated(event);

    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should handle JSON parse errors gracefully', () => {
    const event: ICLEvent = { Target: '', CallBack: '', Data: '' };
    
    expect(() => {
      component.OnUserTableActionActivated(event);
    }).not.toThrow();

    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  //--
  it('should navigate to the create dialog when ADD action button is clicked', () => {
    const actionButton: IActionButton = { Key: 'ADD' };
    sharedServiceSpy.GetCurrentRouteSegment.and.returnValue('mockRoute'); // Asegúrate de que devuelva 'mockRoute'

    component.OnActionButtonClicked(actionButton);

    expect(sharedServiceSpy.GetCurrentRouteSegment).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['mockRoute'], {
      relativeTo: activatedRouteSpy,
      queryParams: { dialog: 'create' }
    });
  });

  it('should not navigate for other action button keys', () => {
    const actionButton: IActionButton = { Key: 'OTHER' }; // Cambia a una clave diferente

    component.OnActionButtonClicked(actionButton);

    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should not navigate for unknown action button keys', () => {
    const actionButton: IActionButton = { Key: 'UNKNOWN' }; // Caso desconocido
  
    component.OnActionButtonClicked(actionButton);
  
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should not navigate for an empty action button key', () => {
    const actionButton: IActionButton = { Key: '' }; // Caso con clave vacía

    component.OnActionButtonClicked(actionButton);

    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should handle error when GetCurrentRouteSegment fails', () => {
    sharedServiceSpy.GetCurrentRouteSegment.and.throwError('Error');

    const actionButton: IActionButton = { Key: 'ADD' };

    expect(() => component.OnActionButtonClicked(actionButton)).toThrowError('Error');
  });
});
