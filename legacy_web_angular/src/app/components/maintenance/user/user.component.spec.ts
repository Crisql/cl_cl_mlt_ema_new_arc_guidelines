import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserComponent } from './user.component';
import {ICLEvent, LinkerService} from "@clavisco/linker";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {RouterTestingModule} from "@angular/router/testing";
import {MatDialog, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {AlertsModule, AlertsService, ModalModule} from "@clavisco/alerts";
import {OverlayModule} from "@clavisco/overlay";
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from "@angular/core";
import { ActivatedRoute, Router } from '@angular/router';
import { IUser } from '@app/interfaces/i-user';
import { Structures } from '@clavisco/core';
import { IActionButton } from '@app/interfaces/i-action-button';
import { UserPageTabIndexes } from '@app/enums/enums';
import { SeriesEditComponent } from './series-edit/series-edit.component';
import { IUserDialogData } from '@app/interfaces/i-dialog-data';
import { UserAssignEditComponent } from './user-assign-edit/user-assign-edit.component';
import { UserEditComponent } from './user-edit/user-edit.component';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedService } from '@app/shared/shared.service';

describe('UserComponent', () => {

  let router: jasmine.SpyObj<Router>;
  let sharedService: { GetCurrentRouteSegment: jasmine.Spy };
  let activatedRoute: any//ActivatedRoute;
  let matDialog: jasmine.SpyObj<MatDialog>;
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;

  beforeEach(async () => {
    router = jasmine.createSpyObj('Router', ['navigate']);
    sharedService = jasmine.createSpyObj('SharedService', ['GetCurrentRouteSegment', 'EmitActionButtonClickEvent', 'OnActionButtonClicked', 'MapTableColumns']);//jasmine.createSpyObj('SharedService', ['GetCurrentRouteSegment']);
    activatedRoute = {
      data: of({ resolvedData: {} }),
      queryParams: of({})
    };
    matDialog = jasmine.createSpyObj('MatDialog', ['open']);
    const alertsServiceSpy = jasmine.createSpyObj('AlertsService', ['Toast']);

    await TestBed.configureTestingModule({
      declarations: [ UserComponent ],
      imports: [CommonModule, BrowserAnimationsModule, OverlayModule, AlertsModule, ModalModule, MatDialogModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        {
          provide: 'LinkerService',
          useExisting: LinkerService
        },
        { provide: Router, useValue: router },
        { provide: SharedService, useValue: sharedService },
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: MatDialog, useValue: matDialog },
        { provide: AlertsService, useValue: alertsServiceSpy },
        {
          provide: 'LinkerService',
          useValue: jasmine.createSpyObj('LinkerService', ['Flow', 'Publish'])
        }
        
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    sharedService = TestBed.inject(SharedService) as jasmine.SpyObj<SharedService>;
    activatedRoute = TestBed.inject(ActivatedRoute);
    matDialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
  
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to update dialog when action is UPDATE', () => {
    const mockEvent: ICLEvent = {
      Target: "", 
      CallBack:"",
      Data: JSON.stringify({
        Action: Structures.Enums.CL_ACTIONS.UPDATE,
        Data: JSON.stringify({ Id: 123,  
          Name: "Juan",
          LastName: "Mora",
          Email: "juan@gmail.com",
          Password: "123",
          IsActive: true,
          EmailType: "G",
          SchedulingEmail: "juan@gmail.com" } as IUser)
      })
    };

    sharedService.GetCurrentRouteSegment.and.returnValue('current-route');
    
    component.OnUserTableActionActivated(mockEvent);

    expect(router.navigate).toHaveBeenCalledWith(['current-route'], {
      relativeTo: jasmine.any(Object),//activatedRoute,
      queryParams: { dialog: 'update', recordId: 123 }
    });
  });

  it('should navigate to updateSerie dialog when action is OPTION_1', () => {
    const mockEvent: ICLEvent = {
      Target: "", 
      CallBack:"",
      Data: JSON.stringify({
        Action: Structures.Enums.CL_ACTIONS.OPTION_1,
        Data: JSON.stringify({ Id: 456,  
          Name: "Juan",
          LastName: "Mora",
          Email: "juan@gmail.com",
          Password: "123",
          IsActive: true,
          EmailType: "G",
          SchedulingEmail: "juan@gmail.com" } as IUser)
      })
    };

    sharedService.GetCurrentRouteSegment.and.returnValue('current-route');

    component.OnUserTableActionActivated(mockEvent);

    expect(router.navigate).toHaveBeenCalledWith(['current-route'], {
      relativeTo: jasmine.any(Object),//activatedRoute,
      queryParams: { dialog: 'updateSerie', recordId: 456 }
    });
  }); 

  it('should navigate to localPrint dialog when action is OPTION_2', () => {
    const mockEvent: ICLEvent = {
      Target: "", 
      CallBack:"",
      Data: JSON.stringify({
        Action: Structures.Enums.CL_ACTIONS.OPTION_2,
        Data: JSON.stringify({ Id: 789,  
          Name: "Juan",
          LastName: "Mora",
          Email: "juan@gmail.com",
          Password: "123",
          IsActive: true,
          EmailType: "G",
          SchedulingEmail: "juan@gmail.com" } as IUser)
      })
    };

    sharedService.GetCurrentRouteSegment.and.returnValue('current-route');

    component.OnUserTableActionActivated(mockEvent);

    expect(router.navigate).toHaveBeenCalledWith(['current-route'], {
      relativeTo: jasmine.any(Object),//activatedRoute,
      queryParams: { dialog: 'localPrint', recordId: 789 }
    });
  });

  it('should not navigate if event data is missing', () => {
    const mockEvent: ICLEvent = { 
      Target: "", 
      CallBack:"", 
      Data: "" };

    component.OnUserTableActionActivated(mockEvent);

    expect(router.navigate).not.toHaveBeenCalled();
  });


  it('should navigate to create dialog when action button key is ADD', () => {
    const mockActionButton: IActionButton = { Key: 'ADD' };

    sharedService.GetCurrentRouteSegment.and.returnValue('current-route');

    component.OnActionButtonClicked(mockActionButton);

    expect(router.navigate).toHaveBeenCalledWith(['current-route'], {
      relativeTo: activatedRoute,
      queryParams: { dialog: 'create' }
    });
  });

  it('should not navigate for other action button keys', () => {
    const mockActionButton: IActionButton = { Key: 'OTHER' };

    component.OnActionButtonClicked(mockActionButton);

    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should open UserAssignEditComponent with correct configuration when selectedTabIndex is UserAssign and _editSerie is true', () => {
    component.selectedTabIndex = UserPageTabIndexes.UserAssign;
    const mockDialogRef = { afterClosed: () => of({}) } as jasmine.SpyObj<MatDialogRef<any>>;
    matDialog.open.and.returnValue(mockDialogRef);

    component.OpenEditDialog(1, true);

    expect(matDialog.open).toHaveBeenCalledWith(SeriesEditComponent, {
      id: 'serie-modal',
      maxWidth: '90vw',
      minWidth: '75vw',
      maxHeight: 'calc(100vh - 20px)',
      disableClose: true,
      autoFocus: false,
      data: {
        UserId: 1,
        SchedulingSetting: component.schedulingSetting
      } as IUserDialogData
    });
  });

  it('should open UserAssignEditComponent with correct configuration when selectedTabIndex is UserAssign and _editSerie is false', () => {
    component.selectedTabIndex = UserPageTabIndexes.UserAssign;
    const mockDialogRef = { afterClosed: () => of({}) } /*as jasmine.SpyObj<MatDialogRef<any>>*/;
    matDialog.open.and.returnValue(mockDialogRef as any);

    component.OpenEditDialog(2, false);

    expect(matDialog.open).toHaveBeenCalledWith(UserAssignEditComponent, {
      id: 'assing-modal',
      maxWidth: '90vw',
      minWidth: '75vw',
      maxHeight: 'calc(100vh - 20px)',
      disableClose: true,
      autoFocus: true,
      data:jasmine.objectContaining({
        UserId: 2,
        SchedulingSetting: component.schedulingSetting
      }) 
    });
  });

  it('should open UserEditComponent with correct configuration when selectedTabIndex is not UserAssign', () => {
    component.selectedTabIndex = UserPageTabIndexes.User; // Cambia este valor según tus índices
    const mockDialogRef = { afterClosed: () => of({}) } as jasmine.SpyObj<MatDialogRef<any>>;
    matDialog.open.and.returnValue(mockDialogRef);

    component.OpenEditDialog(3, false);

    expect(matDialog.open).toHaveBeenCalledWith(UserEditComponent, {
      id: 'user-modal',
      maxWidth: '90vw',
      minWidth: '40vw',
      maxHeight: 'calc(100vh - 20px)',
      disableClose: true,
      autoFocus: true,
      data: {
        UserId: 3,
        SchedulingSetting: component.schedulingSetting
      } as IUserDialogData
    });
  });

  it('should navigate to the current route segment after dialog is closed', () => {
    component.selectedTabIndex = UserPageTabIndexes.UserAssign;
    const mockDialogRef = { afterClosed: () => of({}) }; //as jasmine.SpyObj<MatDialogRef<any>>;
    matDialog.open.and.returnValue(mockDialogRef as any);
    sharedService.GetCurrentRouteSegment.and.returnValue('current-route');

    component.OpenEditDialog(4, false);

    expect(router.navigate).toHaveBeenCalledWith(['current-route'], { relativeTo: jasmine.any(Object)/*activatedRoute*/ });
  });

  it('should navigate to /maintenance/users when UserPageTabIndexes.User is selected', () => {
    // Ejecutar el método OnTabIndexChange con el índice de usuario
    component.OnTabIndexChange(UserPageTabIndexes.User);

    // Verificar que se navega a la ruta correcta
    expect(router.navigate).toHaveBeenCalledWith(['/maintenance', 'users']);
  });

  it('should navigate to /maintenance/users/assigns when UserPageTabIndexes.UserAssign is selected', () => {
    // Ejecutar el método OnTabIndexChange con el índice de asignación de usuario
    component.OnTabIndexChange(UserPageTabIndexes.UserAssign);

    // Verificar que se navega a la ruta correcta
    expect(router.navigate).toHaveBeenCalledWith(['/maintenance', 'users', 'assigns']);
  });

  it('should not navigate for unknown tab index', () => {

    const tabIndexMappings = [
      { index: UserPageTabIndexes.User, expectedUrl: ['/maintenance', 'users'] },
      { index: UserPageTabIndexes.UserAssign, expectedUrl: ['/maintenance', 'users', 'assigns'] },
    ];
  
    tabIndexMappings.forEach(({ index, expectedUrl }) => {
      component.OnTabIndexChange(index);
      expect(router.navigate).toHaveBeenCalledWith(expectedUrl);
      (router.navigate as jasmine.Spy).calls.reset();
    });
  });

  it('should handle resolved data', () => {
    const mockResolvedData = {
      UsersAssigns: [{ Id: 1, CompanyId: 1, UserId: 1, LicenseId: 1 }],
      Companies: [{ Id: 1, Name: 'Company 1' }],
      Users: [{ Id: 1, Email: 'user@example.com' }],
      Licenses: [{ Id: 1, User: 'License 1' }]
    };
    (activatedRoute.data as any) = of({ resolvedData: mockResolvedData });
  
    component.ngOnInit();
  
    expect(component.usersAssigns.length).toBe(1);
    expect(component.companies.length).toBe(1);
    expect(component.users.length).toBe(1);
    expect(component.licenses.length).toBe(1);
  });
  
});
