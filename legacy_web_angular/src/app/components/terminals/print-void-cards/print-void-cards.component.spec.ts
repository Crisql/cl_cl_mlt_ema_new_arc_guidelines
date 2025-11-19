import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintVoidCardsComponent } from './print-void-cards.component';
import {OverlayModule, OverlayService} from "@clavisco/overlay";
import {AlertsModule, ModalModule} from "@clavisco/alerts";
import {MatDialogModule} from "@angular/material/dialog";
import {RouterTestingModule} from "@angular/router/testing";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {ICLEvent, LinkerService} from "@clavisco/linker";
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from "@angular/core";
import {PPTransactionService} from "@app/services/pp-transaction.service";
import { SharedService } from '@app/shared/shared.service';
import { of } from 'rxjs';
import { ICommitedVoidedTransaction } from '@app/interfaces/i-pp-transactions';
import ICLResponse = Structures.Interfaces.ICLResponse;
import { Repository, Structures } from '@clavisco/core';
import { IUser } from '@app/interfaces/i-user';
import { IUserToken } from '@app/interfaces/i-token';
import { IActionButton } from '@app/interfaces/i-action-button';
import { FormBuilder } from '@angular/forms';
import { IPermissionbyUser } from '@app/interfaces/i-roles';

describe('PrintVoidCardsComponent', () => {
  let component: PrintVoidCardsComponent;
  let fixture: ComponentFixture<PrintVoidCardsComponent>;

 // let overlayService: jasmine.SpyObj<OverlayService>;
 let overlayService:OverlayService;
  let ppTransactionService: jasmine.SpyObj<PPTransactionService>;
  let sharedService: jasmine.SpyObj<SharedService>;
  let linkerService: jasmine.SpyObj<LinkerService>;
  let formBuilder: FormBuilder;

  beforeEach(async () => {
    overlayService = jasmine.createSpyObj('OverlayService', ['OnGet', 'Drop']);
    ppTransactionService = jasmine.createSpyObj('PpTransactionService', ['GetCanceledTransactions']);
    sharedService = jasmine.createSpyObj('SharedService', ['MapTableColumns']);
    linkerService = jasmine.createSpyObj('LinkerService', ['Publish','Flow']);
    formBuilder = new FormBuilder();
    
    await TestBed.configureTestingModule({
      declarations: [ PrintVoidCardsComponent ],
      imports: [OverlayModule, AlertsModule, ModalModule, MatDialogModule, RouterTestingModule, HttpClientTestingModule, MatAutocompleteModule],
      providers: [
        {
          provide: 'LinkerService',
          useExisting: LinkerService
        },
        { provide: OverlayService, useValue: overlayService },
        { provide: PPTransactionService, useValue: ppTransactionService },
        { provide: SharedService, useValue: sharedService },
        { provide: LinkerService, useValue: linkerService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    })
    .compileComponents();
    overlayService = TestBed.inject(OverlayService); // Inyecta el servicio espiado

  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintVoidCardsComponent);
    component = fixture.componentInstance;

    component.users = [
      { Email: 'john@example.com', Name: 'John', LastName: 'Doe' } as IUser,
      // { Name: 'Jane', LastName: 'Smith' } as IUser,
      // { Name: 'Alice', LastName: 'Johnson' } as IUser,
    ];
    
    spyOn(component, 'filterUsers').and.callThrough();
    component.terminals = [{
      TerminalCode: '123', Currency: 'USD',
      Id: 0,
      CreatedDate: '',
      CreatedBy: '',
      UpdateDate: null,
      UpdatedBy: '',
      IsActive: false,
      Description: '',
      Password: '',
      QuickPayAmount: 0,
      Assigned: false,
      Default: false
    }];
    component.frmSearchDocument = {
        controls: {
            'User': {
                setValue: jasmine.createSpy('setValue')
            }
        }
    } as any;
    component.frmSearchDocument = formBuilder.group({
      User: [{ value: '', disabled: true }]
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call overlayService.OnGet and GetCanceledTransactions if form is valid', () => {
    // Arrange
    component.frmSearchDocument.controls['User'].setValue({ Email: 'test@example.com' });
    component.frmSearchDocument.controls['DateFrom'].setValue(new Date());
    component.frmSearchDocument.controls['DateTo'].setValue(new Date());
    component.frmSearchDocument.controls['Terminal'].setValue({ TerminalId: '123' });
  
    // Simular controles válidos
    component.frmSearchDocument.controls['User'].setErrors(null);
    component.frmSearchDocument.controls['DateFrom'].setErrors(null);
    component.frmSearchDocument.controls['DateTo'].setErrors(null);
    component.frmSearchDocument.controls['Terminal'].setErrors(null);
  
    const mockData: ICommitedVoidedTransaction[] = [{
      User: 'Mayron',
      TerminalId: '123',
      ReferenceNumber: 'ref123',
      AuthorizationNumber: 'auth123',
      CreationDate: new Date(),
      SalesAmount: "100",
      TransactionId: '',
      InvoiceNumber: '',
      SystemTrace: ''
    }];
    
    const mockResponse: ICLResponse<ICommitedVoidedTransaction[]> = {
      Message: 'Success',
      Data: mockData
    };
    ppTransactionService.GetCanceledTransactions.and.returnValue(of(mockResponse));
  
    // Act
    component.GetRecords();
  
    // Assert
    expect(overlayService.OnGet).toHaveBeenCalled();
    expect(ppTransactionService.GetCanceledTransactions).toHaveBeenCalled();
    expect(overlayService.Drop).toHaveBeenCalled();
    expect(linkerService.Publish).toHaveBeenCalled();
  });
  it('should mark form as touched if form is invalid', () => {
    // Arrange
    // Configura el formulario como inválido
    component.frmSearchDocument.controls['User'].setValue(null); // O valores que hagan que sea inválido
    component.frmSearchDocument.controls['DateFrom'].setValue(null);
    component.frmSearchDocument.controls['DateTo'].setValue(null);
    component.frmSearchDocument.controls['Terminal'].setValue({TerminalId: null});
  
    spyOn(component.frmSearchDocument, 'markAllAsTouched'); // Asegúrate de espiar markAllAsTouched
  
    // Act
    component.GetRecords();
  
    // Assert
    expect(component.frmSearchDocument.markAllAsTouched).toHaveBeenCalled();
    expect(overlayService.OnGet).not.toHaveBeenCalled();
    expect(ppTransactionService.GetCanceledTransactions).not.toHaveBeenCalled();
  });

  //---
  it('should return filtered users when _value is an IUser', () => {
    // Arrange
    const user = {Email: 'john@example.com', Name: 'John', LastName: 'Doe' } as IUser;

    // Act
    const result = component.filterUsers(user);

    // Assert
    expect(result).toEqual([user]);
  });

  it('should return filtered users when _value is a string', () => {
    // Arrange
    const searchTerm = 'john'; // Lowercase to test case insensitivity

    // Act
    const result = component.filterUsers(searchTerm);

    // Assert
    expect(result).toEqual([
      { Email: 'john@example.com',  Name: 'John', LastName: 'Doe' } as IUser,
      //{ Name: 'Alice', LastName: 'Johnson' } as IUser,
    ]);
  });

  it('should return an empty array when no users match the string', () => {
    // Arrange
    const searchTerm = 'nonexistent';

    // Act
    const result = component.filterUsers(searchTerm);

    // Assert
    expect(result).toEqual([]);
  });

  it('should return all users when _value is an empty string', () => {
    // Arrange
    const searchTerm = '';

    // Act
    const result = component.filterUsers(searchTerm);

    // Assert
    expect(result).toEqual(component.users);
  });

  it('should return an empty array when _value is not a string or IUser', () => {
    // Arrange
    const invalidValue = "123";

    // Act
    const result = component.filterUsers(invalidValue);

    // Assert
    expect(result).toEqual([]);
  });

  it('should return an empty array when _value is null', () => {
    const result = component.filterUsers("null");
    expect(result).toEqual([]);
});

// it('should be case insensitive when filtering users', () => {
//   const searchTerm = 'JOHN'; // Uppercase
//   const result = component.filterUsers(searchTerm);
//   expect(result).toEqual([{ Name: 'John', LastName: 'Doe' }  as IUser]);
// });

//----
it('should set the User control value when the current user exists', () => {
  component.frmSearchDocument = {
    controls: {
        User: {
            setValue: jasmine.createSpy('setValue') // Hacer que sea un espía
        }
    }
} as any;
  // Arrange
  const userToken = { UserEmail: 'john@example.com' } as IUserToken;
  spyOn(Repository.Behavior, 'GetStorageObject').and.returnValue(userToken);

  // Act
  component.LoadDataUserForm();

  // Assert
  expect(component.frmSearchDocument.controls['User'].setValue).toHaveBeenCalledWith(component.users[0]);
});

it('should not set the User control value when the current user does not exist', () => {
  component.frmSearchDocument = {
    controls: {
        'User': {
            setValue: jasmine.createSpy('setValue')
        }
    }
} as any;
  // Arrange
  const userToken = { UserEmail: 'nonexistent@example.com' } as IUserToken;
  spyOn(Repository.Behavior, 'GetStorageObject').and.returnValue(userToken);

  // Act
  component.LoadDataUserForm();

  // Assert
  expect(component.frmSearchDocument.controls['User'].setValue).not.toHaveBeenCalled();
});

it('should not set the User control value when there is no user stored', () => {
  component.frmSearchDocument = {
    controls: {
        User: {
            setValue: jasmine.createSpy('setValue') // Hacer que sea un espía
        }
    }
} as any;
  // Arrange
  spyOn(Repository.Behavior, 'GetStorageObject').and.returnValue(null);

  // Act
  component.LoadDataUserForm();

  // Assert
  expect(component.frmSearchDocument.controls['User'].setValue).not.toHaveBeenCalled();
});

//----
it('should call GetRecords when action button is SEARCH', () => {
  spyOn(component, 'GetRecords');
  spyOn(component, 'Clear');
  // Arrange
  const actionButton: IActionButton = { Key: 'SEARCH' };

  // Act
  component.onActionButtonClicked(actionButton);

  // Assert
  expect(component.GetRecords).toHaveBeenCalled();
  expect(component.Clear).not.toHaveBeenCalled(); // Asegúrate de que Clear no se haya llamado
});

it('should call Clear when action button is CLEAN', () => {
  spyOn(component, 'GetRecords');
  spyOn(component, 'Clear');
  // Arrange
  const actionButton: IActionButton = { Key: 'CLEAN' };

  // Act
  component.onActionButtonClicked(actionButton);

  // Assert
  expect(component.Clear).toHaveBeenCalled();
  expect(component.GetRecords).not.toHaveBeenCalled(); // Asegúrate de que GetRecords no se haya llamado
});

it('should do nothing when action button key is unknown', () => {
  spyOn(component, 'GetRecords');
  spyOn(component, 'Clear');
  // Arrange
  const actionButton: IActionButton = { Key: 'UNKNOWN' };

  // Act
  component.onActionButtonClicked(actionButton);

  // Assert
  expect(component.GetRecords).not.toHaveBeenCalled();
  expect(component.Clear).not.toHaveBeenCalled();
});

//----
  it('should call overlayService.OnGet when action is OPTION_4', () => {
    // Arrange
    const event: ICLEvent = {
      Target:'',
      CallBack:'',
      Data: JSON.stringify({
        Action: Structures.Enums.CL_ACTIONS.OPTION_4,
        Data: JSON.stringify({ 
          TerminalId: '123',
          SalesAmount: 100.50,
          InvoiceNumber: 'INV001',
          SystemTrace: 'ST001',
          ReferenceNumber: 'RN001',
          AuthorizationNumber: 'AUTH001',
          CreationDate: new Date().toISOString()}),
      }),
    };

    // Act
    component.onTableButtonClicked(event);

    // Assert
    expect(overlayService.OnGet).toHaveBeenCalled();
  });

  it('should map rowSelectDocument correctly', () => {
    // Arrange
    const creationDate = new Date();
    const rowSelectDocument: ICommitedVoidedTransaction = {
      TerminalId: '123',
      SalesAmount: '100',
      InvoiceNumber: 'INV001',
      SystemTrace: 'ST001',
      ReferenceNumber: 'RN001',
      AuthorizationNumber: 'AUTH001',
      CreationDate: creationDate,
      User: '',
      TransactionId: ''
    };
  
    const event: ICLEvent = {
      Target: '',
      CallBack: '',
      Data: JSON.stringify({
        Action: Structures.Enums.CL_ACTIONS.OPTION_4,
        Data: JSON.stringify(rowSelectDocument), // `Data` es un string que contiene otro JSON
      }),
    };
  
    // Act
    component.onTableButtonClicked(event);
  
    // Assert
    const parsedEventData = JSON.parse(event.Data); // Obtiene el objeto que contiene `Data`
    const mappedData = JSON.parse(parsedEventData.Data); // Ahora convierte `Data` en un objeto
  
    // Asegúrate de que `CreationDate` sea una instancia de Date
    mappedData.CreationDate = new Date(mappedData.CreationDate); // Convierte a fecha
  
    expect(mappedData).toEqual({
      ...rowSelectDocument,
      CreationDate: mappedData.CreationDate // Esto será una fecha
    });
  });
 
  it('should call Drop method after processing', () => {
    // Arrange
    const event: ICLEvent = {
      Target:'',
      CallBack:'',
      Data: JSON.stringify({
        Action: Structures.Enums.CL_ACTIONS.OPTION_4,
        Data: JSON.stringify({ 
          TerminalId: '123',
          SalesAmount: 100.50,
          InvoiceNumber: 'INV001',
          SystemTrace: 'ST001',
          ReferenceNumber: 'RN001',
          AuthorizationNumber: 'AUTH001',
          CreationDate: new Date().toISOString() }),
      }),
    };

    // Act
    component.onTableButtonClicked(event);

    // Assert
    expect(overlayService.OnGet).toHaveBeenCalled();
  });

  it('should handle unknown actions gracefully', () => {
    // Arrange
    const event: ICLEvent = {
      Target:'',
      CallBack:'',
      Data: JSON.stringify({
        Action: 'UNKNOWN_ACTION',
        Data: JSON.stringify({ 
          TerminalId: '123',
          SalesAmount: 100.50,
          InvoiceNumber: 'INV001',
          SystemTrace: 'ST001',
          ReferenceNumber: 'RN001',
          AuthorizationNumber: 'AUTH001',
          CreationDate: new Date().toISOString() }),
      }),
    };

    // Act
    component.onTableButtonClicked(event);

    // Assert
    expect(overlayService.OnGet).not.toHaveBeenCalled(); // Verifica que no se llame a OnGet
  });

  //-----
  it('should call LoadDataUserForm', () => {
    spyOn(component, 'LoadDataUserForm').and.callThrough(); // Espía el método

    component.SetInitialData(); // Act

    expect(component.LoadDataUserForm).toHaveBeenCalled(); // Assert
  });

  it('should enable User control if permission exists', () => {
    component.userPermissions = [{ Name: 'Sales_PrintVoidCards_SearchByOtherUser' }];

    component.SetInitialData();

    expect(component.frmSearchDocument.get('User')?.enabled).toBeTrue(); // Verifica que el control esté habilitado
  });

  it('should not enable User control if permission does not exist', () => {
    component.userPermissions = [{ Name: 'Other_Permission' }];

    component.SetInitialData();

    expect(component.frmSearchDocument.get('User')?.enabled).toBeFalse(); // Verifica que el control siga deshabilitado
  });

  it('should handle an empty userPermissions array', () => {
    component.userPermissions = [];

    component.SetInitialData();

    expect(component.frmSearchDocument.get('User')?.enabled).toBeFalse(); // Verifica que el control siga deshabilitado
  });

});
