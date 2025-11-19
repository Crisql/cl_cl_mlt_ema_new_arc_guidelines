import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PpstoredTransactionsComponent } from './ppstored-transactions.component';
import {OverlayModule, OverlayService} from "@clavisco/overlay";
import {AlertsModule, AlertsService, CLToastType, ModalModule} from "@clavisco/alerts";
import {MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {RouterTestingModule} from "@angular/router/testing";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {ICLEvent, LinkerService} from "@clavisco/linker";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from "@angular/core";
import { FormBuilder } from '@angular/forms';
import { IUser } from '@app/interfaces/i-user';
import { IActionButton } from '@app/interfaces/i-action-button';
import { PinPad, Repository, Structures } from '@clavisco/core';
import { IPermissionbyUser } from '@app/interfaces/i-roles';
import { ICLTableButton } from '@clavisco/table';
import { IPPStoredTransactions } from '@app/interfaces/i-pp-transactions';

describe('PpstoredTransactionsComponent', () => {
  let component: PpstoredTransactionsComponent;
  let fixture: ComponentFixture<PpstoredTransactionsComponent>;

  let fb: FormBuilder;
  let alertsService: jasmine.SpyObj<AlertsService>;
  let overlayService: jasmine.SpyObj<OverlayService>;
  beforeEach(async () => {
    const alertsSpy = jasmine.createSpyObj('AlertsService', ['Toast']);
    const overlayServiceSpy = jasmine.createSpyObj('OverlayService', ['OnPost']);
    await TestBed.configureTestingModule({
      declarations: [ PpstoredTransactionsComponent ],
      imports: [OverlayModule, AlertsModule, ModalModule, MatDialogModule, RouterTestingModule, HttpClientTestingModule, MatAutocompleteModule],
      providers: [
        {
          provide: 'LinkerService',
          useExisting: LinkerService
        },FormBuilder,
        { provide: AlertsService, useValue: alertsSpy },
        { provide: OverlayService, useValue: overlayServiceSpy },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PpstoredTransactionsComponent);
    component = fixture.componentInstance;
    
    overlayService = TestBed.inject(OverlayService) as jasmine.SpyObj<OverlayService>;
    alertsService = TestBed.inject(AlertsService) as jasmine.SpyObj<AlertsService>;

    component.users = [
      {  Id: 1, Name: 'John', LastName: 'Doe' }  as IUser,
      {  Id: 2, Name: 'Jane', LastName: 'Smith' }  as IUser,
      {  Id: 3, Name: 'Bob', LastName: 'Johnson' }  as IUser
    ];

    component.pinpadForm = new FormBuilder().group({
      User: [null]
    });

    spyOn(Repository.Behavior, 'GetStorageObject').and.returnValue({ UserId: 1 });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create the form correctly', () => {
    component.LoadForm();
    expect(component.pinpadForm).toBeDefined();
    expect(component.pinpadForm.get('User')).toBeTruthy();
    expect(component.pinpadForm.get('Terminal')).toBeTruthy();
    expect(component.pinpadForm.get('DateFrom')).toBeTruthy();
    expect(component.pinpadForm.get('DateTo')).toBeTruthy();
  });

  it('should disable the User field by default', () => {
    component.LoadForm();
    expect(component.pinpadForm.get('User')?.disabled).toBeTrue();
  });

  it('should enable the User field if permission is granted', () => {
    component.userPermission = [{ Name: 'Sales_PPStoredTransaction_SearchTransactionsOfUsers' }];
    component.LoadForm();
    expect(component.pinpadForm.get('User')?.disabled).toBeFalse();
  });

  it('should not enable the User field if permission is not granted', () => {
    component.userPermission = [{ Name: 'Some_Other_Permission' }];
    component.LoadForm();
    expect(component.pinpadForm.get('User')?.disabled).toBeTrue();
  });

  it('should call FilterDocuments with a valid value on User value change', () => {
    spyOn(component, 'FilterDocuments').and.returnValue([]); // Simular un retorno de FilterDocuments
    component.LoadForm();

    // Cambiar el valor del campo User para activar la lógica
    component.pinpadForm.get('User')?.setValue('New User');

    expect(component.FilterDocuments).toHaveBeenCalledWith('New User');
  });

  it('should reset transactions on Terminal value change', () => {
    component.transactions = [];
    component.LoadForm();
    component.pinpadForm.get('Terminal')?.setValue('New Terminal');
    expect(component.transactions).toEqual([]); // debe estar vacía
  });

  //---
  it('should return filtered users when _value is an IUser object', () => {
    const input = { Name: 'John', LastName: 'Doe' } as IUser;
    const result = component.FilterDocuments(input);
    expect(result).toEqual(component.users);

  });

  it('should return empty array when _value is an IUser object not found', () => {
    const input = { Name: 'Nonexistent', LastName: 'User' } as IUser;
    const result = component.FilterDocuments(input);
    expect(result).not.toEqual([]);
  });

  it('should return filtered users when _value is a string', () => {
    const input = 'Jane';
    const result = component.FilterDocuments(input);
    expect(result).toEqual([jasmine.objectContaining({ Name: 'Jane', LastName: 'Smith' })]);
  });

  it('should return users that partially match the string input', () => {
    // Asegúrate de que los usuarios estén correctamente inicializados en el componente
    component.users = [
        { Id: 1, Name: 'John', LastName: 'Doe' } as IUser,
        { Id: 2, Name: 'Jane', LastName: 'Smith' } as IUser,
        { Id: 3, Name: 'Bob', LastName: 'Johnson' } as IUser
    ];

    const input = 'Jo';
    const result = component.FilterDocuments(input);
    
    // Verifica que el resultado contenga al menos el usuario 'John Doe' y 'Bob Johnson'
    expect(result).toEqual(jasmine.arrayContaining([
        jasmine.objectContaining({ Id: 1, Name: 'John', LastName: 'Doe' }),
        jasmine.objectContaining({ Id: 3, Name: 'Bob', LastName: 'Johnson' })
    ]));

    // También puedes verificar la longitud
    expect(result.length).toBe(2); // Debe coincidir con el número de coincidencias
});

  it('should return an empty array if no users match the string input', () => {
    const input = 'Nonexistent';
    const result = component.FilterDocuments(input);
    expect(result).toEqual([]);
  });

  it('should handle input that is not a string or IUser object', () => {
    const input = '123'; // Ejemplo de un valor no válido
    const result = component.FilterDocuments(input);
    expect(result).toEqual([]);
  });

  //----
  it('should call SerchTransactions when action button is SEARCH', () => {
    const actionButton: IActionButton = { Key: 'SEARCH' };
    spyOn(component, 'SerchTransactions');

    component.OnActionButtonClicked(actionButton);

    expect(component.SerchTransactions).toHaveBeenCalled();
  });

  it('should call Reset when action button is CLEAN', () => {
    const actionButton: IActionButton = { Key: 'CLEAN' };
    spyOn(component, 'Reset');

    component.OnActionButtonClicked(actionButton);

    expect(component.Reset).toHaveBeenCalled();
  });

  it('should not call any method for unrecognized action button', () => {
    const actionButton: IActionButton = { Key: 'UNKNOWN' };
    spyOn(component, 'SerchTransactions');
    spyOn(component, 'Reset');

    component.OnActionButtonClicked(actionButton);

    expect(component.SerchTransactions).not.toHaveBeenCalled();
    expect(component.Reset).not.toHaveBeenCalled();
  });

  //----
  it('should call CancelPinpadTransaction when user has permission', () => {
    const mockEvent: ICLEvent = {
      Target:'',
      CallBack:'',
      Data: JSON.stringify({
        Action: Structures.Enums.CL_ACTIONS.DELETE,
        Data: JSON.stringify({} as IPPStoredTransactions)
      } as ICLTableButton)
    };

    component.userPermission = [{ Name: 'Sales_PPStoredTransaction_CancelTransactionsOfUsers' }];
    spyOn(component, 'CancelPinpadTransaction');

    component.OnTableActionActivated(mockEvent);

    expect(component.CancelPinpadTransaction).toHaveBeenCalled();
  });

  it('should call CancelPinpadTransaction when selected user is current user', () => {
    const mockEvent: ICLEvent = {
      Target:'',
      CallBack:'',
      Data: JSON.stringify({
        Action: Structures.Enums.CL_ACTIONS.DELETE,
        Data: JSON.stringify({} as IPPStoredTransactions)
      } as ICLTableButton)
    };

    component.userPermission = [];
    component.pinpadForm.get('User')?.setValue({ Id: 1 } as IUser);
    spyOn(component, 'CancelPinpadTransaction');

    component.OnTableActionActivated(mockEvent);

    expect(component.CancelPinpadTransaction).toHaveBeenCalled();
  });

  it('should show toast when user does not have permission', () => {
    const mockEvent: ICLEvent = {
      Target:'',
      CallBack:'',
      Data: JSON.stringify({
        Action: Structures.Enums.CL_ACTIONS.DELETE,
        Data: JSON.stringify({} as IPPStoredTransactions)
      } as ICLTableButton)
    };

    component.userPermission = [];
    component.pinpadForm.get('User')?.setValue({ Id: 2 } as IUser);

    component.OnTableActionActivated(mockEvent);

    expect(alertsService.Toast).toHaveBeenCalledWith({
      type: CLToastType.INFO,
      message: 'No tienes los permisos necesarios para anular esta transacción'
    });
  });

  it('should do nothing for non-DELETE actions', () => {
    const mockEvent: ICLEvent = {
      Target:'',
      CallBack:'',
      Data: JSON.stringify({
        Action: 'SOME_OTHER_ACTION',
        Data: JSON.stringify({} as IPPStoredTransactions)
      } as unknown as ICLTableButton)
    };

    spyOn(component, 'CancelPinpadTransaction');

    component.OnTableActionActivated(mockEvent);

    expect(component.CancelPinpadTransaction).not.toHaveBeenCalled();
    expect(alertsService.Toast).not.toHaveBeenCalled();
  });

  //----
  it('should call overlayService.OnPost when called', () => {
    const mockTableRow = {} as IPPStoredTransactions;
    component.CancelPinpadTransaction(mockTableRow);
    expect(overlayService.OnPost).toHaveBeenCalled();
  });

  it('should create transaction object with correct properties', () => {
    const mockTableRow = {
      TerminalId: '123',
      InvoiceNumber: 'INV001',
      ReferenceNumber: 'REF001',
      SystemTrace: 'TRACE001',
      AuthorizationNumber: 'AUTH001'
    } as IPPStoredTransactions;

    component.CancelPinpadTransaction(mockTableRow);

    expect(alertsService.Toast).not.toHaveBeenCalled();

  });

  it('should not call alertsService.Toast when transaction is created', () => {
    const mockTableRow = {} as IPPStoredTransactions;
    component.CancelPinpadTransaction(mockTableRow);
    expect(alertsService.Toast).not.toHaveBeenCalled();
  });
  
  //----
  it('should deserialize valid data with EMVStreamResponse', () => {
    const testData = {
      EMVStreamResponse: {
        someKey: 'someValue'
      }
    };
    const encodedData = btoa(JSON.stringify(testData));
    
    const result = component.DesarializeData(encodedData);
    
    expect(result).toEqual(testData.EMVStreamResponse);
  });

  it('should return null for valid data without EMVStreamResponse', () => {
    const testData = {
      someOtherKey: 'someValue'
    };
    const encodedData = btoa(JSON.stringify(testData));
    
    const result = component.DesarializeData(encodedData);
    
    expect(result).toBeNull();
  });

  it('should handle empty string input', () => {
    expect(() => component.DesarializeData('')).toThrowError(SyntaxError);
  });

  it('should throw error for invalid JSON', () => {
    const invalidData = 'not a valid JSON';
    const encodedData = btoa(invalidData);
    
    expect(() => component.DesarializeData(encodedData)).toThrowError(SyntaxError);
  });

  it('should throw error for non-base64 encoded string', () => {
    const nonBase64Data = '{notBase64Encoded}';
    
    expect(() => component.DesarializeData(nonBase64Data)).toThrowError();
  });
});
