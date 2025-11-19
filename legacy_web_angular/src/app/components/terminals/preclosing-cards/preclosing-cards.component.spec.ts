import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreclosingCardsComponent } from './preclosing-cards.component';
import {OverlayModule, OverlayService} from "@clavisco/overlay";
import {AlertsModule, AlertsService, CLModalType, CLToastType, ModalModule, ModalService} from "@clavisco/alerts";
import {MatDialogModule} from "@angular/material/dialog";
import {RouterTestingModule} from "@angular/router/testing";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {LinkerService} from "@clavisco/linker";
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from "@angular/core";
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ICommittedTransaction } from '@app/interfaces/i-pp-transactions';
import { RowColors } from '@clavisco/table';
import { CommonModule, formatDate } from '@angular/common';
import { FormatSalesAmount } from '@app/shared/common-functions';

describe('PreclosingCardsComponent', () => {
  let component: PreclosingCardsComponent;
  let fixture: ComponentFixture<PreclosingCardsComponent>;
  let searchForm: FormGroup;
  let inflateTableSpy: jasmine.Spy;

  let overlayService: jasmine.SpyObj<OverlayService>;
  let alertsService: jasmine.SpyObj<AlertsService>;
  beforeEach(async () => {
    overlayService = jasmine.createSpyObj('OverlayService', ['OnPost']);
    alertsService = jasmine.createSpyObj('AlertsService', ['Toast']);

    await TestBed.configureTestingModule({
      declarations: [ PreclosingCardsComponent ],
      imports: [CommonModule, OverlayModule, AlertsModule, ModalModule, MatDialogModule, RouterTestingModule, HttpClientTestingModule, MatAutocompleteModule],
      providers: [
        {
          provide: 'LinkerService',
          useExisting: LinkerService
        },
        FormBuilder 
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreclosingCardsComponent);
    component = fixture.componentInstance;
//    component = fixture.componentInstance;
     component.documents = []; // Asegúrate de que esté vacío antes de cada prueba
     component.searchForm = new FormGroup({
      Terminal: new FormControl(null), // Inicializa como null
      TransactionType: new FormControl(''), // Inicializa otros campos
      DateFrom: new FormControl(new Date()), // Inicializa con fecha actual
      DateTo: new FormControl(new Date()), // Inicializa con fecha actual
    });
    fixture.detectChanges();
    inflateTableSpy = spyOn(component, 'InflateTable').and.callFake(() => {});
    spyOn(component, 'GetDocuments').and.callFake(() => {});
    spyOn(component, 'Clear').and.callFake(() => {});
    spyOn(component, 'SaveBalance').and.callFake(() => {});
    spyOn(component, 'SavePreBalance').and.callFake(() => {});
    
    

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle SEARCH action', () => {
    const actionButton = { Key: 'SEARCH' };
    component.OnActionButtonClicked(actionButton);

    expect(component.documents).toEqual([]);
    expect(component.InflateTable).toHaveBeenCalled();
    expect(component.GetDocuments).toHaveBeenCalled();
  });

  it('should handle CLEAN action', () => {
    const actionButton = { Key: 'CLEAN' };
    component.OnActionButtonClicked(actionButton);

    expect(component.Clear).toHaveBeenCalled();
  });

  it('should handle ADD action with BALANCE transaction type', () => {
    const actionButton = { Key: 'ADD' };
    component.searchForm = new FormBuilder().group({
      TransactionType: 'BALANCE'
    });

    component.OnActionButtonClicked(actionButton);

    expect(component.documents).toEqual([]);
    expect(component.InflateTable).toHaveBeenCalled();
    expect(component.SaveBalance).toHaveBeenCalled();
    expect(component.SavePreBalance).not.toHaveBeenCalled();
  });

  it('should handle ADD action with non-BALANCE transaction type', () => {
    const actionButton = { Key: 'ADD' };
    component.searchForm = new FormBuilder().group({
      TransactionType: 'OTHER'
    });

    component.OnActionButtonClicked(actionButton);

    expect(component.documents).toEqual([]);
    expect(component.InflateTable).toHaveBeenCalled();
    expect(component.SavePreBalance).toHaveBeenCalled();
    expect(component.SaveBalance).not.toHaveBeenCalled();
  });

  it('should not call any method for unknown action', () => {
    const actionButton = { Key: 'UNKNOWN' };
    component.OnActionButtonClicked(actionButton);

    expect(component.InflateTable).not.toHaveBeenCalled();
    expect(component.GetDocuments).not.toHaveBeenCalled();
    expect(component.Clear).not.toHaveBeenCalled();
    expect(component.SaveBalance).not.toHaveBeenCalled();
    expect(component.SavePreBalance).not.toHaveBeenCalled();
  });

 //------------

 //----------
 it('should group transactions by ACQ and add total rows', () => {
  component.documents = [
    { ACQ: 1, SalesAmount: '100', BlurredBackground: 'N', CreationDate: '2023-05-01T10:00:00', TransactionType: 'BA' } as ICommittedTransaction,
    { ACQ: 1, SalesAmount: '200', BlurredBackground: 'N', CreationDate: '2023-05-01T11:00:00', TransactionType: 'BA' } as ICommittedTransaction,
    { ACQ: 2, SalesAmount: '150', BlurredBackground: 'N', CreationDate: '2023-05-01T12:00:00', TransactionType: 'PRE' } as ICommittedTransaction,
    { ACQ: 2, SalesAmount: '250', BlurredBackground: 'N', CreationDate: '2023-05-01T13:00:00', TransactionType: 'PRE' } as ICommittedTransaction,
  ];

  component.MapTotalTransacion();

  expect(component.documents.length).toBe(6); // Original 4 + 2 total rows
  expect(component.documents[5].InvoiceNumber).toBe('TOTAL');
  expect(component.documents[5].SalesAmount).toBe(FormatSalesAmount(300)); // Total for ACQ 1
  expect(component.documents[2].InvoiceNumber).toBe('TOTAL');
  expect(component.documents[2].SalesAmount).toBe(FormatSalesAmount(400)); // Total for ACQ 2
});

it('should alternate BlurredBackground between Y and N for different ACQs', () => {
  component.documents = [
    { ACQ: 1, SalesAmount: '100', BlurredBackground: 'N' } as ICommittedTransaction,
    { ACQ: 2, SalesAmount: '200', BlurredBackground: 'N' } as ICommittedTransaction,
    { ACQ: 3, SalesAmount: '300', BlurredBackground: 'N' } as ICommittedTransaction,
  ];

  component.MapTotalTransacion();

  expect(component.documents.filter(d => d.ACQ === 1)[0].BlurredBackground).toBe('Y');
  expect(component.documents.filter(d => d.ACQ === 2)[0].BlurredBackground).toBe('N');
  expect(component.documents.filter(d => d.ACQ === 3)[0].BlurredBackground).toBe('Y');
});

it('should format CreationDate correctly', () => {
  //const testDate = new Date('05-01-2023 10:00:00 a');
  const testDate = new Date('2023-01-05T10:00:00'); // Formato correcto

  component.documents = [
    { ACQ: 1, SalesAmount: '100', CreationDate: testDate.toISOString() } as ICommittedTransaction,
  ];

  component.MapTotalTransacion();

  const expectedFormattedDate = formatDate(testDate, 'dd-MM-yyyy hh:mm:ss a', 'en');
  expect(component.documents[0].CreationDate).toBe(expectedFormattedDate);
});

it('should set correct TransactionType', () => {
  component.documents = [
    { ACQ: 1, SalesAmount: '100', TransactionType: 'BA' } as ICommittedTransaction,
    { ACQ: 2, SalesAmount: '200', TransactionType: 'PRE' } as ICommittedTransaction,
    { ACQ: 3, SalesAmount: '300', TransactionType: '' } as ICommittedTransaction,
  ];

  component.MapTotalTransacion();

  expect(component.documents.find(d => d.TransactionType === 'BALANCE')).toBeTruthy();
  expect(component.documents.find(d => d.TransactionType === 'PRE_BALANCE')).toBeTruthy();
  expect(component.documents.find(d => d.TransactionType === '')).toBeTruthy();
});

it('should set RowColor based on BlurredBackground', () => {
  component.documents = [
    { ACQ: 1, SalesAmount: '100', BlurredBackground: 'Y' } as ICommittedTransaction,
    { ACQ: 2, SalesAmount: '200', BlurredBackground: 'N' } as ICommittedTransaction,
  ];

  component.MapTotalTransacion();

  expect(component.documents.find(d => d.RowColor === RowColors.SkyBlue)).toBeTruthy();
  expect(component.documents.find(d => d.RowColor === '')).toBeTruthy();
});

// it('should reverse the order of documents', () => {
//   component.documents = [
//     { ACQ: 1, SalesAmount: '100' } as ICommittedTransaction,
//     { ACQ: 2, SalesAmount: '200' } as ICommittedTransaction,
//     { ACQ: 3, SalesAmount: '300' } as ICommittedTransaction,
//   ];

//   component.MapTotalTransacion();

//   expect(component.documents.length).toBe(6); // Asegúrate de que haya un total de 4 documentos

//   expect(component.documents[0].ACQ).toBe(3); // Primero debe ser 3
//   expect(component.documents[1].ACQ).toBe(2); // Segundo debe ser 2
//   expect(component.documents[2].ACQ).toBe(1); // Último debe ser 1

//   // Verifica que el objeto "TOTAL" se ha añadido
//   expect(component.documents[3].InvoiceNumber).toBe('TOTAL');
//   expect(component.documents[3].ACQ).toBe(''); // Asegúrate de que ACQ del objeto "TOTAL" sea vacío
  
//   // expect(component.documents[0].ACQ).toBe(3); // Debería ser 3 después de invertir
//   // expect(component.documents[1].ACQ).toBe(2); // Debería ser 2
//   // expect(component.documents[2].ACQ).toBe(1); // Debería ser 1

//   // expect(component.documents[1].ACQ).toBe(3);
//   // expect(component.documents[component.documents.length - 1].ACQ).toBe(1);

//   // expect(component.documents[0].ACQ).toBe('');
//   // expect(component.documents[component.documents.length - 1].ACQ).toBe('');
//   // expect(component.documents[1].ACQ).toBe(3);
//   // expect(component.documents[component.documents.length - 2].ACQ).toBe(1);
// });

it('should call InflateTable after processing', () => {
  //const inflateTableSpy = spyOn(component, 'InflateTable');
  component.documents = [
    { ACQ: 1, SalesAmount: '100' } as ICommittedTransaction,
  ];

  component.MapTotalTransacion();

  expect(inflateTableSpy).toHaveBeenCalled();
});
});
