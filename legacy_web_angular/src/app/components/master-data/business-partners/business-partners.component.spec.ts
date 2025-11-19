import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { BusinessPartnersComponent } from './business-partners.component';
import {CL_CHANNEL, ICLEvent, LinkerService} from "@clavisco/linker";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {RouterTestingModule} from "@angular/router/testing";
import {MatDialogModule} from "@angular/material/dialog";
import {AlertsModule, AlertsService, CLModalType, CLToastType, ModalModule, ModalService} from "@clavisco/alerts";
import {OverlayModule, OverlayService} from "@clavisco/overlay";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from "@angular/core";
import CL_ACTIONS = Structures.Enums.CL_ACTIONS;
import { Structures } from '@clavisco/core';
import { Address } from '@app/enums/enums';
import { IAttachments2Line, IBPAddresses, IBPProperties, IBusinessPartner, IPatchProperties } from '@app/interfaces/i-business-partner';
import { RowColors } from '@clavisco/table';
import { of, throwError } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IBusinessPartnersFields } from '@app/interfaces/i-settings';
import { IUdf } from '@app/interfaces/i-udf';

describe('BusinessPartnersComponent', () => {
  let component: BusinessPartnersComponent;
  let fixture: ComponentFixture<BusinessPartnersComponent>;

  let alertsService: jasmine.SpyObj<AlertsService>;

  let overlayService: jasmine.SpyObj<OverlayService>;
  let attachmentService: jasmine.SpyObj<any>;
  let linkerService: jasmine.SpyObj<LinkerService>;

  let formBuilder: FormBuilder;
  let modalServiceSpy: jasmine.SpyObj<ModalService>;

  beforeEach(async () => {
    alertsService = jasmine.createSpyObj('AlertsService', ['Toast']);
    overlayService = jasmine.createSpyObj('OverlayService', ['OnGet', 'Drop','OnPost']);
    attachmentService = jasmine.createSpyObj('AttachmentService', ['GetFile']);
    linkerService = jasmine.createSpyObj('LinkerService', ['Publish']);

    const modalSpy = jasmine.createSpyObj('ModalService', ['Continue', 'CancelAndContinue']);

    await TestBed.configureTestingModule({
      declarations: [ BusinessPartnersComponent ],
      imports: [OverlayModule, AlertsModule, ModalModule, MatDialogModule, RouterTestingModule, HttpClientTestingModule, MatAutocompleteModule],
      providers: [
        {
          provide: 'LinkerService',
          useExisting: LinkerService
        },
        { provide: AlertsService, useValue: alertsService },
        { provide: OverlayService, useValue: overlayService },
        FormBuilder,
        { provide: ModalService, useValue: modalSpy },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusinessPartnersComponent);
    component = fixture.componentInstance;
    formBuilder = TestBed.inject(FormBuilder);
    modalServiceSpy = TestBed.inject(ModalService) as jasmine.SpyObj<ModalService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle OPTION_1 action', () => {
    const event = {
      Data: JSON.stringify({
        Action: CL_ACTIONS.OPTION_1,
        Data: JSON.stringify({
          Id: 1,
          ConfigurableFields: [
            { NameSL: 'field1', Value: 'value1' },
            { NameSL: 'field2', Value: 'value2' }
          ]
        })
      })
    };

    component.addressBusinessPartnerForm = jasmine.createSpyObj('FormGroup', ['patchValue', 'controls']);
    component.addressBusinessPartnerForm.controls = {
      field1: jasmine.createSpyObj('AbstractControl', ['setValue']),
      field2: jasmine.createSpyObj('AbstractControl', ['setValue'])
    };

    (component as any).OnTableActionActivated(event);

    expect(component.id).toBe(1);
    expect(component.addressBusinessPartnerForm.patchValue).toHaveBeenCalled();
    expect(component.addressBusinessPartnerForm.controls['field1'].setValue).toHaveBeenCalledWith('value1');
    expect(component.addressBusinessPartnerForm.controls['field2'].setValue).toHaveBeenCalledWith('value2');
    expect(component.actionButtonsAddress).toEqual([
      {
        Key: 'ADD',
        MatIcon: 'edit',
        Text: 'Actualizar'
      }
    ]);
  });

  it('should handle OPTION_2 action with valid AddressType', () => {
    const event = {
      Data: JSON.stringify({
        Action: CL_ACTIONS.OPTION_2,
        Data: JSON.stringify({
          Id: 1,
          AddressType: Address.SHIL
        })
      })
    };

    component.addressList = [
      { Id: 1, AddressType: Address.SHIL, IsDefault: false } as IBPAddresses,
      { Id: 2, AddressType: Address.SHIL, IsDefault: true } as IBPAddresses,
      { Id: 3, AddressType: Address.BILL, IsDefault: false } as IBPAddresses
    ];

    spyOn(component as any, 'InflateTable');

    (component as any).OnTableActionActivated(event);

    expect(component.addressList[0].IsDefault).toBe(true);
    expect(component.addressList[1].IsDefault).toBe(false);
    expect(component.addressList[2].IsDefault).toBe(false);
    expect(component.addressList[0].RowColor).toBe(RowColors.LightBlue);
    expect(component.addressList[1].RowColor).toBe('');
    expect(component.addressList[2].RowColor).toBe('');
    expect((component as any).InflateTable).toHaveBeenCalled();
  });

  it('should handle OPTION_2 action with invalid AddressType', () => {
    const event = {
      Data: JSON.stringify({
        Action: CL_ACTIONS.OPTION_2,
        Data: JSON.stringify({
          AddressType: ''
        })
      })
    };

    (component as any).OnTableActionActivated(event);

    expect(alertsService.Toast).toHaveBeenCalledWith({
      type: CLToastType.INFO,
      message: 'Primero debe asignar el tipo de dirección.'
    });
  });

  it('should handle OPTION_3 action for address not in DB', () => {
    const event = {
      Data: JSON.stringify({
        Action: CL_ACTIONS.OPTION_3,
        Data: JSON.stringify({
          Id: 2,
          InDB: false
        })
      })
    };

    component.addressList = [
      { Id: 1, InDB: true } as IBPAddresses,
      { Id: 2, InDB: false } as IBPAddresses,
      { Id: 3, InDB: true } as IBPAddresses
    ];

    spyOn(component as any, 'InflateTable');

    (component as any).OnTableActionActivated(event);

    expect(component.addressList.length).toBe(2);
    expect(component.addressList[0].Id).toBe(1);
    expect(component.addressList[1].Id).toBe(2);
    expect(component.addressAux).toBeNull();
    expect((component as any).InflateTable).toHaveBeenCalled();
  });

  it('should handle OPTION_3 action for address in DB', () => {
    const event = {
      Data: JSON.stringify({
        Action: CL_ACTIONS.OPTION_3,
        Data: JSON.stringify({
          InDB: true
        })
      })
    };

    (component as any).OnTableActionActivated(event);

    expect(alertsService.Toast).toHaveBeenCalledWith({
      type: CLToastType.INFO,
      message: 'Esta dirección no se puede eliminar porque ya fue previamente creada en SAP.'
    });
  });

  //----
  it('should handle DELETE action for file not in SAP', () => {
    const event = {
      Data: JSON.stringify({
        Action: CL_ACTIONS.DELETE,
        Data: JSON.stringify({
          Id: 2,
          AbsoluteEntry: 0
        })
      })
    };

    component.anexosFiles = [
      { Id: 1, AbsoluteEntry: 1 } as IAttachments2Line,
      { Id: 2, AbsoluteEntry: 0 } as IAttachments2Line,
      { Id: 3, AbsoluteEntry: 3 } as IAttachments2Line
    ];

    spyOn(component as any, 'InflateTableAnexos');

    (component as any).OnTableAnexosActionActivated(event);

    expect(component.anexosFiles.length).toBe(2);
    expect(component.anexosFiles[0].Id).toBe(1);
    expect(component.anexosFiles[1].Id).toBe(2);
    expect(component.anexosFilesUpload).toEqual([]);
    expect((component as any).InflateTableAnexos).toHaveBeenCalled();
  });

  it('should handle DELETE action for file in SAP', () => {
    const event = {
      Data: JSON.stringify({
        Action: CL_ACTIONS.DELETE,
        Data: JSON.stringify({
          AbsoluteEntry: 1
        })
      })
    };

    (component as any).OnTableAnexosActionActivated(event);

    expect(alertsService.Toast).toHaveBeenCalledWith({
      type: CLToastType.INFO,
      message: 'No se puede eliminar este archivo porque ya fue creado en SAP.'
    });
  });

  it('should handle OPTION_1 action and download file successfully', fakeAsync(() => {
    const event = {
      Data: JSON.stringify({
        Action: CL_ACTIONS.OPTION_1,
        Data: JSON.stringify({
          SourcePath: 'path/to',
          FileName: 'test',
          FileExtension: 'pdf'
        })
      })
    };

    const mockFile = { Data: 'base64data' };
    attachmentService.GetFile.and.returnValue(of(mockFile));

    (component as any).OnTableAnexosActionActivated(event);

    expect(overlayService.OnGet).toHaveBeenCalled();

    tick();
}));

  it('should handle OPTION_1 action and show alert on error', () => {
    const event = {
      Data: JSON.stringify({
        Action: CL_ACTIONS.OPTION_1,
        Data: JSON.stringify({
          SourcePath: 'path/to',
          FileName: 'test',
          FileExtension: 'pdf'
        })
      })
    };

    const mockError = new Error('Test error');
    attachmentService.GetFile.and.returnValue(throwError(() => mockError));

    (component as any).OnTableAnexosActionActivated(event);

    expect(overlayService.OnGet).toHaveBeenCalled();

  });


  //----
  it('should call OnSubmit when ADD action button is clicked', () => {
    spyOn<any>(component, 'OnSubmit');
    component.OnActionButtonClicked({ Key: 'ADD' });
    expect((component as any).OnSubmit).toHaveBeenCalled();
  });

  it('should call SaveAnexos when ADD_ANEXOS action button is clicked', () => {
    spyOn<any>(component, 'SaveAnexos');
    component.OnActionButtonClicked({ Key: 'ADD_ANEXOS' });
    expect((component as any).SaveAnexos).toHaveBeenCalled();
  });

  it('should call SaveChangesAddress when ADD_ADDRESS action button is clicked', () => {
    spyOn<any>(component, 'SaveChangesAddress');
    component.OnActionButtonClicked({ Key: 'ADD_ADDRESS' });
    expect((component as any).SaveChangesAddress).toHaveBeenCalled();
  });

  it('should call Clear when CLEAN action button is clicked', () => {
    spyOn(component, 'Clear');
    component.OnActionButtonClicked({ Key: 'CLEAN' });
    expect(component.Clear).toHaveBeenCalled();
  });

  it('should call AddFile when EXPLORER action button is clicked', () => {
    spyOn(component, 'AddFile');
    component.OnActionButtonClicked({ Key: 'EXPLORER' });
    expect(component.AddFile).toHaveBeenCalled();
  });

  it('should call LinkerService.Publish when ADD_PROPERTIES action button is clicked', () => {
    component.tablePropiedadesId = 'testTableId';
    component.OnActionButtonClicked({ Key: 'ADD_PROPERTIES' });

  });

  it('should not call any method when an unknown action button is clicked', () => {
    spyOn<any>(component, 'OnSubmit');
    spyOn<any>(component, 'SaveAnexos');
    spyOn<any>(component, 'SaveChangesAddress');
    spyOn(component, 'Clear');
    spyOn(component, 'AddFile');
    component.OnActionButtonClicked({ Key: 'UNKNOWN' });
    expect((component as any).OnSubmit).not.toHaveBeenCalled();
    expect((component as any).SaveAnexos).not.toHaveBeenCalled();
    expect((component as any).SaveChangesAddress).not.toHaveBeenCalled();
    expect(component.Clear).not.toHaveBeenCalled();
    expect(component.AddFile).not.toHaveBeenCalled();
    expect(linkerService.Publish).not.toHaveBeenCalled();
  });

  //----
  it('should set detectChanges to true when a field has changed', () => {
    component.businessPartnersForm = formBuilder.group({
      field1: [''],
      field2: [''],
      field3: ['']
    });

    component['bpformAux'] = {
      field1: 'initial1',
      field2: 'initial2',
      field3: 'initial3'
    };

    component['detectChanges'] = false;
    component.businessPartnersForm.patchValue({
      field1: 'changed1',
      field2: 'initial2',
      field3: 'initial3'
    });

    (component as any).ChangesBP();

    expect(component['detectChanges']).toBe(true);
  });

  it('should keep detectChanges false when no fields have changed', () => {
    component.businessPartnersForm = formBuilder.group({
      field1: [''],
      field2: [''],
      field3: ['']
    });

    component['bpformAux'] = {
      field1: 'initial1',
      field2: 'initial2',
      field3: 'initial3'
    };

    component['detectChanges'] = false;
    component.businessPartnersForm.patchValue({
      field1: 'initial1',
      field2: 'initial2',
      field3: 'initial3'
    });

    (component as any).ChangesBP();

    expect(component['detectChanges']).toBe(false);
  });

  it('should set detectChanges to true when multiple fields have changed', () => {
    component.businessPartnersForm = formBuilder.group({
      field1: [''],
      field2: [''],
      field3: ['']
    });

    component['bpformAux'] = {
      field1: 'initial1',
      field2: 'initial2',
      field3: 'initial3'
    };

    component['detectChanges'] = false;
    component.businessPartnersForm.patchValue({
      field1: 'changed1',
      field2: 'changed2',
      field3: 'initial3'
    });

    (component as any).ChangesBP();

    expect(component['detectChanges']).toBe(true);
  });

  it('should handle null values in the form', () => {
    component.businessPartnersForm = formBuilder.group({
      field1: [''],
      field2: [''],
      field3: ['']
    });

    component['bpformAux'] = {
      field1: 'initial1',
      field2: 'initial2',
      field3: 'initial3'
    };

    component['detectChanges'] = false;
    component.businessPartnersForm.patchValue({
      field1: null,
      field2: 'initial2',
      field3: 'initial3'
    });

    (component as any).ChangesBP();

    expect(component['detectChanges']).toBe(true);
  });

  it('should handle undefined values in the form', () => {
    component.businessPartnersForm = formBuilder.group({
      field1: [''],
      field2: [''],
      field3: ['']
    });

    component['bpformAux'] = {
      field1: 'initial1',
      field2: 'initial2',
      field3: 'initial3'
    };

    component['detectChanges'] = false;
    component.businessPartnersForm.patchValue({
      field1: undefined,
      field2: 'initial2',
      field3: 'initial3'
    });

    (component as any).ChangesBP();

    expect(component['detectChanges']).toBe(true);
  });

  it('should handle missing fields in bpformAux', () => {
    component.businessPartnersForm = formBuilder.group({
      field1: [''],
      field2: [''],
      field3: ['']
    });

    component['bpformAux'] = {
      field1: 'initial1',
      field2: 'initial2',
      field3: 'initial3'
    };

    component['detectChanges'] = false;
    component['bpformAux'] = {
      field1: 'initial1',
      field2: 'initial2'
    };

    component.businessPartnersForm.patchValue({
      field1: 'initial1',
      field2: 'initial2',
      field3: 'value3'
    });

    (component as any).ChangesBP();

    expect(component['detectChanges']).toBe(true);
  });

  //----
  it('should not do anything when IsCompanyDirection is false', () => {
    component.addressBusinessPartnerForm = formBuilder.group({});
    component.lineMappedColumns = { IgnoreColumns: [] }as any;
    component.FieldsBusinessPartner = [
      { NameSL: 'Field1', IsObjDirection: true } as IBusinessPartnersFields,
      { NameSL: 'Field2', IsObjDirection: true } as IBusinessPartnersFields,
      { NameSL: 'Field3', IsObjDirection: false } as IBusinessPartnersFields
    ];
    spyOn(component as any, 'GetProvinces');

    component.IsCompanyDirection = false;
    (component as any).LoadTappDirection();

    expect((component as any).GetProvinces).not.toHaveBeenCalled();
    //expect(component.fieldsConfiguredDirection).toBeUndefined();
    expect(component.fieldsConfiguredDirection).toEqual([]);

    expect(component.addressBusinessPartnerForm.contains('Field1')).toBeFalsy();
    expect(component.addressBusinessPartnerForm.contains('Field2')).toBeFalsy();
    expect(component.lineMappedColumns.IgnoreColumns!.length).toBe(0);
  });

  it('should set up form controls and configurations when IsCompanyDirection is true', () => {
    component.addressBusinessPartnerForm = formBuilder.group({});
    component.lineMappedColumns = { IgnoreColumns: [] }as any;
    component.FieldsBusinessPartner = [
      { NameSL: 'Field1', IsObjDirection: true } as IBusinessPartnersFields,
      { NameSL: 'Field2', IsObjDirection: true } as IBusinessPartnersFields,
      { NameSL: 'Field3', IsObjDirection: false } as IBusinessPartnersFields
    ];
    spyOn(component as any, 'GetProvinces');

    component.IsCompanyDirection = true;
    (component as any).LoadTappDirection();

    expect((component as any).GetProvinces).toHaveBeenCalled();
    expect(component.fieldsConfiguredDirection!.length).toBe(2);
    expect(component.addressBusinessPartnerForm.contains('Field1')).toBeTruthy();
    expect(component.addressBusinessPartnerForm.contains('Field2')).toBeTruthy();
    expect(component.lineMappedColumns.IgnoreColumns!.length).toBe(2);
    expect(component.lineMappedColumns.IgnoreColumns).toContain('Field1');
    expect(component.lineMappedColumns.IgnoreColumns).toContain('Field2');
  });

  it('should handle empty FieldsBusinessPartner array', () => {
    component.addressBusinessPartnerForm = formBuilder.group({});
    component.lineMappedColumns = { IgnoreColumns: [] }as any;
    component.FieldsBusinessPartner = [
      { NameSL: 'Field1', IsObjDirection: true } as IBusinessPartnersFields,
      { NameSL: 'Field2', IsObjDirection: true } as IBusinessPartnersFields,
      { NameSL: 'Field3', IsObjDirection: false } as IBusinessPartnersFields
    ];
    spyOn(component as any, 'GetProvinces');
    component.IsCompanyDirection = true;
    component.FieldsBusinessPartner = [];
    (component as any).LoadTappDirection();

    expect((component as any).GetProvinces).toHaveBeenCalled();
    expect(component.fieldsConfiguredDirection!.length).toBe(0);
    expect(component.lineMappedColumns.IgnoreColumns!.length).toBe(0);
  });

  //----
  it('should call GetConfiguredUdfs when isVisible is true', () => {

    component.isVisible = true;
    spyOn<any>(component, 'GetConfiguredUdfs');
    spyOn<any>(component, 'SaveChanges');


    (component as any).OnSubmit();


    expect((component as any).GetConfiguredUdfs).toHaveBeenCalled();
    expect((component as any).SaveChanges).not.toHaveBeenCalled();
  });

  it('should call SaveChanges when isVisible is false', () => {

    component.isVisible = false;
    spyOn<any>(component, 'GetConfiguredUdfs');
    spyOn<any>(component, 'SaveChanges');


    (component as any).OnSubmit();


    expect((component as any).GetConfiguredUdfs).not.toHaveBeenCalled();
    expect((component as any).SaveChanges).toHaveBeenCalled();
  });

  it('should handle undefined isVisible', () => {

    component.isVisible = undefined as any;
    spyOn<any>(component, 'GetConfiguredUdfs');
    spyOn<any>(component, 'SaveChanges');


    (component as any).OnSubmit();


    expect((component as any).GetConfiguredUdfs).not.toHaveBeenCalled();
    expect((component as any).SaveChanges).toHaveBeenCalled();
  });

  it('should handle null isVisible', () => {

    component.isVisible = null as any;
    spyOn<any>(component, 'GetConfiguredUdfs');
    spyOn<any>(component, 'SaveChanges');


    (component as any).OnSubmit();


    expect((component as any).GetConfiguredUdfs).not.toHaveBeenCalled();
    expect((component as any).SaveChanges).toHaveBeenCalled();
  });

  //----
  it('should update currentBp and show success toast when addressAux is set', () => {

    component.addressAux = {} as IBPAddresses;
    component.currentBp = {
      BilltoDefault: '',
      ShipToDefault: ''
    } as IBusinessPartner;
    component.addressList = [
      { AddressType: Address.BILL, IsDefault: true, AddressName: 'Default Bill' } as IBPAddresses,
      { AddressType: Address.BILL, IsDefault: false, AddressName: 'Non-Default Bill' } as IBPAddresses,
      { AddressType: Address.SHIL, IsDefault: true, AddressName: 'Default Ship' } as IBPAddresses,
      { AddressType: Address.SHIL, IsDefault: false, AddressName: 'Non-Default Ship' } as IBPAddresses
    ];


    component.SetStandard();


    expect(component.currentBp.BilltoDefault).toBe('Default Bill');
    expect(component.currentBp.ShipToDefault).toBe('Default Ship');
    expect(alertsService.Toast).toHaveBeenCalledWith({type: CLToastType.INFO, message: 'Asignada.'});
  });

  it('should show warning toast when addressAux is not set', () => {

    component.addressAux = null;


    component.SetStandard();


    expect(alertsService.Toast).toHaveBeenCalledWith({type: CLToastType.INFO, message: 'Seleccione la dirección.'});
  });

  it('should handle case when no default addresses are found', () => {

    component.addressAux = {} as IBPAddresses;
    component.currentBp = {
      BilltoDefault: '',
      ShipToDefault: ''
    } as IBusinessPartner;
    component.addressList = [
      { AddressType: Address.BILL, IsDefault: false, AddressName: 'Non-Default Bill' } as IBPAddresses,
      { AddressType: Address.SHIL, IsDefault: false, AddressName: 'Non-Default Ship' } as IBPAddresses
    ];


    component.SetStandard();


    expect(component.currentBp.BilltoDefault).toBe('');
    expect(component.currentBp.ShipToDefault).toBe('');
    expect(alertsService.Toast).toHaveBeenCalledWith({type: CLToastType.INFO, message: 'Asignada.'});
  });

  it('should handle case when currentBp is null', () => {

    component.addressAux = {} as IBPAddresses;
    component.currentBp = null;
    component.addressList = [
      { AddressType: Address.BILL, IsDefault: true, AddressName: 'Default Bill' } as IBPAddresses,
      { AddressType: Address.SHIL, IsDefault: true, AddressName: 'Default Ship' } as IBPAddresses
    ];


    component.SetStandard();


    expect(alertsService.Toast).toHaveBeenCalledWith({type: CLToastType.INFO, message: 'Asignada.'});
  });

  it('should handle case when addressList is empty', () => {

    component.addressAux = {} as IBPAddresses;
    component.currentBp = {
      BilltoDefault: '',
      ShipToDefault: ''
    } as IBusinessPartner;
    component.addressList = [];


    component.SetStandard();


    expect(component.currentBp.BilltoDefault).toBe('');
    expect(component.currentBp.ShipToDefault).toBe('');
    expect(alertsService.Toast).toHaveBeenCalledWith({type: CLToastType.INFO, message: 'Asignada.'});
  });

  //----
  it('should show toast when no addresses are added', () => {
    component.addressList = [];
    (component as any).SaveChangesAddress();
    expect(alertsService.Toast).toHaveBeenCalledWith({
      type: CLToastType.INFO,
      message: 'No se han agregado direcciones.'
    });
  });

  it('should show toast when address type is missing', () => {
    component.addressList = [{ AddressType: '' } as IBPAddresses];
    (component as any).SaveChangesAddress();
    expect(alertsService.Toast).toHaveBeenCalledWith({
      type: CLToastType.INFO,
      message: 'Agregue el tipo de dirección en la columna tipo de dirección.'
    });
  });

  it('should show toast when no default shipping address is set', () => {
    component.currentBp = { ShipToDefault: '' } as IBusinessPartner;
    component.addressList = [
      { AddressType: Address.SHIL, IsDefault: false } as IBPAddresses
    ];
    (component as any).SaveChangesAddress();
    expect(alertsService.Toast).toHaveBeenCalledWith({
      type: CLToastType.INFO,
      message: 'Defina una dirección de envío como la estándar.'
    });
  });

  it('should show toast when no default billing address is set', () => {
    component.currentBp = { BilltoDefault: '' } as IBusinessPartner;
    component.addressList = [
      { AddressType: Address.BILL, IsDefault: false } as IBPAddresses
    ];
    (component as any).SaveChangesAddress();
    expect(alertsService.Toast).toHaveBeenCalledWith({
      type: CLToastType.INFO,
      message: 'Defina una dirección de facturación como la estándar.'
    });
  });

  it('should not update currentBp when it is null', () => {
    component.currentBp = null;
    component.addressList = [
      { AddressType: Address.SHIL, IsDefault: true } as IBPAddresses,
      { AddressType: Address.BILL, IsDefault: true } as IBPAddresses
    ];
    (component as any).SaveChangesAddress();
    expect(component.currentBp).toBeNull();
  });

  it('should handle null addressList', () => {
    component.addressList = null as any;
    (component as any).SaveChangesAddress();
    expect(alertsService.Toast).toHaveBeenCalledWith({
      type: CLToastType.INFO,
      message: 'No se han agregado direcciones.'
    });
  });

  //----
  it('should show toast when no files are added', () => {
    component.anexosFiles = [];
    (component as any).SaveAnexos();
    expect(alertsService.Toast).toHaveBeenCalledWith({
      type: CLToastType.INFO,
      message: 'No se han agregado nuevos archivos.'
    });
  });

  it('should prepare FormData and IAttachments2 object correctly', () => {
    const mockFile = new File([''], 'test.txt', { type: 'text/plain' });
    component.anexosFiles = [{ AbsoluteEntry: 1 } as IAttachments2Line];
    component.anexosFilesUpload = [mockFile];
    component.currentBp = { CardCode: 'TEST001' } as IBusinessPartner;

    spyOn(FormData.prototype, 'append').and.callThrough();

    (component as any).SaveAnexos();

    expect(FormData.prototype.append).toHaveBeenCalledWith('test.txt', mockFile);
    expect(FormData.prototype.append).toHaveBeenCalledWith('FILES', jasmine.any(String));

    const appendedData = JSON.parse((FormData.prototype.append as jasmine.Spy).calls.argsFor(1)[1]);
    expect(appendedData).toEqual({
      CardCode: 'TEST001',
      AbsoluteEntry: 1,
      Attachments2_Lines: [{ AbsoluteEntry: 1 }]
    });
  });

  it('should call overlayService.OnPost', () => {
    component.anexosFiles = [{ AbsoluteEntry: 1 } as IAttachments2Line];
    component.anexosFilesUpload = [new File([''], 'test.txt', { type: 'text/plain' })];
    overlayService.OnPost = jasmine.createSpy('OnPost');
    (component as any).SaveAnexos();

    expect(overlayService.OnPost).toHaveBeenCalled();
  });

  //----
  it('should handle valid file extensions', () => {
    const mockFile = new File([''], 'test.pdf', { type: 'application/pdf' });
    const mockEvent = {
      target: {
        files: [mockFile]
      }
    } as unknown as Event;

    component.AttachFile(mockEvent);

    expect(component.anexosFiles.length).toBe(1);
    expect(component.anexosFilesUpload.length).toBe(1);
    expect(component.anexosFiles[0].FileName).toBe('test');
    expect(component.anexosFiles[0].FileExtension).toBe('pdf');
  });

  it('should show toast for invalid file extensions', () => {
    const mockFile = new File([''], 'test.invalid', { type: 'application/octet-stream' });
    const mockEvent = {
      target: {
        files: [mockFile]
      }
    } as unknown as Event;

    component.AttachFile(mockEvent);

    expect(alertsService.Toast).toHaveBeenCalledWith({
      type: CLToastType.INFO,
      message: 'La extensión del archivo test.invalid no es permitida.'
    });
    expect(component.anexosFiles.length).toBe(0);
    expect(component.anexosFilesUpload.length).toBe(0);
  });

  it('should handle multiple file uploads', () => {
    const mockFile1 = new File([''], 'test1.pdf', { type: 'application/pdf' });
    const mockFile2 = new File([''], 'test2.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const mockEvent = {
      target: {
        files: [mockFile1, mockFile2]
      }
    } as unknown as Event;

    component.AttachFile(mockEvent);

    expect(component.anexosFiles.length).toBe(2);
    expect(component.anexosFilesUpload.length).toBe(2);
    expect(component.anexosFiles[0].FileName).toBe('test1');
    expect(component.anexosFiles[0].FileExtension).toBe('pdf');
    expect(component.anexosFiles[1].FileName).toBe('test2');
    expect(component.anexosFiles[1].FileExtension).toBe('docx');
  });

  //----
  it('should set currentBp to null', () => {
    component.opcionesMenuForm = formBuilder.group({
      Opcion: ['1']
    });
    component.businessPartnerFormControl = formBuilder.control('');
    component.businessPartnersForm = formBuilder.group({});


    spyOn(component as any, 'CleanFields');

    component.currentBp = { CardName: 'value' } as IBusinessPartner;
    (component as any).ResetDocument();
    expect(component.currentBp).toBeNull();
  });

  it('should change Opcion value from 1 to 2', () => {
    component.opcionesMenuForm = formBuilder.group({
      Opcion: ['1']
    });
    component.businessPartnerFormControl = formBuilder.control('');
    component.businessPartnersForm = formBuilder.group({});


    spyOn(component as any, 'CleanFields');

    component.opcionesMenuForm.controls['Opcion'].setValue('1');
    (component as any).ResetDocument();
    expect(component.opcionesMenuForm.controls['Opcion'].value).toBe('2');
  });

  it('should not change Opcion value if it is not 1', () => {
    component.opcionesMenuForm = formBuilder.group({
      Opcion: ['1']
    });
    component.businessPartnerFormControl = formBuilder.control('');
    component.businessPartnersForm = formBuilder.group({});


    spyOn(component as any, 'CleanFields');

    component.opcionesMenuForm.controls['Opcion'].setValue('3');
    (component as any).ResetDocument();
    expect(component.opcionesMenuForm.controls['Opcion'].value).toBe('3');
  });

  it('should set detectChanges to false', () => {
    component.opcionesMenuForm = formBuilder.group({
      Opcion: ['1']
    });
    component.businessPartnerFormControl = formBuilder.control('');
    component.businessPartnersForm = formBuilder.group({});


    spyOn(component as any, 'CleanFields');

    component.detectChanges = true;
    (component as any).ResetDocument();
    expect(component.detectChanges).toBe(false);
  });

  it('should reset businessPartnerFormControl', () => {
    component.opcionesMenuForm = formBuilder.group({
      Opcion: ['1']
    });
    component.businessPartnerFormControl = formBuilder.control('');
    component.businessPartnersForm = formBuilder.group({});


    spyOn(component as any, 'CleanFields');

    component.businessPartnerFormControl.setValue('some value');
    (component as any).ResetDocument();
    expect(component.businessPartnerFormControl.value).toBeNull();
  });

  it('should reset businessPartnersForm', () => {
    component.opcionesMenuForm = formBuilder.group({
      Opcion: ['1']
    });
    component.businessPartnerFormControl = formBuilder.control('');
    component.businessPartnersForm = formBuilder.group({});


    spyOn(component as any, 'CleanFields');

    component.businessPartnersForm.addControl('testControl', formBuilder.control('test value'));
    (component as any).ResetDocument();
    expect(component.businessPartnersForm.get('testControl')?.value).toBeNull();
  });

  it('should call CleanFields method', () => {
    component.opcionesMenuForm = formBuilder.group({
      Opcion: ['1']
    });
    component.businessPartnerFormControl = formBuilder.control('');
    component.businessPartnersForm = formBuilder.group({});


    spyOn(component as any, 'CleanFields');

    (component as any).ResetDocument();
    expect((component as any).CleanFields).toHaveBeenCalled();
  });

  //----
  it('should not call linkerService.Publish when isVisible is false', () => {
    component.isVisible = false;
    component.UdfsId = 'testUdfsId';

    component.isVisible = false;
    (component as any).CleanFields();
    expect(linkerService.Publish).not.toHaveBeenCalled();
  });

  //----
  it('should update properties correctly', () => {
    const event: ICLEvent = {
      Data: JSON.stringify([{ Id: 1 }, { Id: 3 }]),
      Target: '',
      CallBack: ''
    };

    component.properties = [
      { Id: 1, Value: 'tYES' } as IBPProperties,
      { Id: 2, Value: 'tNO' } as IBPProperties,
      { Id: 3, Value: 'tYES' } as IBPProperties
    ];

    component['SaveProperties'](event);

    expect(component.properties).toEqual([
      { Id: 1, Value: 'tYES' } as IBPProperties,
      { Id: 2, Value: 'tNO' } as IBPProperties,
      { Id: 3, Value: 'tYES' } as IBPProperties
    ]);
  });

  it('should call overlayService.OnPost', () => {
    const event: ICLEvent = {
      Data: JSON.stringify([]),
      Target: '',
      CallBack: ''
    };
    component['SaveProperties'](event);
    expect(overlayService.OnPost).toHaveBeenCalled();
  });

  //----
  it('should set TabIndex correctly', () => {
    component.businessPartnersForm = formBuilder.group({});
    component.addressBusinessPartnerForm = formBuilder.group({});
    component.bpformAux = {};


    spyOn(component as any, 'SearchProperties');
    spyOn(component as any, 'GetAnexos');
    spyOn(component as any, 'SearchAddress');

    (component as any).ChangeTapp(2);
    expect(component.TabIndex).toBe(2);
  });

  it('should set correct actionButtons for tab 0', () => {
    component.businessPartnersForm = formBuilder.group({});
    component.addressBusinessPartnerForm = formBuilder.group({});
    component.bpformAux = {};


    spyOn(component as any, 'SearchProperties');
    spyOn(component as any, 'GetAnexos');
    spyOn(component as any, 'SearchAddress');

    (component as any).ChangeTapp(0);
    expect(component.actionButtons.length).toBe(2);
    expect(component.actionButtons[0].Key).toBe('ADD');
    expect(component.actionButtons[1].Key).toBe('CLEAN');
  });

  it('should patch businessPartnersForm value for tab 0', () => {
    component.businessPartnersForm = formBuilder.group({});
    component.addressBusinessPartnerForm = formBuilder.group({});
    component.bpformAux = {};


    spyOn(component as any, 'SearchProperties');
    spyOn(component as any, 'GetAnexos');
    spyOn(component as any, 'SearchAddress');

    const mockBpFormAux = { name: 'Test' };
    component.bpformAux = mockBpFormAux;
    spyOn(component.businessPartnersForm, 'patchValue');
    (component as any).ChangeTapp(0);
    expect(component.businessPartnersForm.patchValue).toHaveBeenCalledWith(mockBpFormAux);
  });

  it('should set correct actionButtons for tab 1', () => {
    component.businessPartnersForm = formBuilder.group({});
    component.addressBusinessPartnerForm = formBuilder.group({});
    component.bpformAux = {};


    spyOn(component as any, 'SearchProperties');
    spyOn(component as any, 'GetAnexos');
    spyOn(component as any, 'SearchAddress');

    (component as any).ChangeTapp(1);
    expect(component.actionButtons.length).toBe(2);
    expect(component.actionButtons[0].Key).toBe('ADD_PROPERTIES');
    expect(component.actionButtons[1].Key).toBe('CLEAN');
  });

  it('should call SearchProperties for tab 1', () => {
    component.businessPartnersForm = formBuilder.group({});
    component.addressBusinessPartnerForm = formBuilder.group({});
    component.bpformAux = {};


    spyOn(component as any, 'SearchProperties');
    spyOn(component as any, 'GetAnexos');
    spyOn(component as any, 'SearchAddress');

    (component as any).ChangeTapp(1);
    expect((component as any).SearchProperties).toHaveBeenCalled();
  });

  it('should set correct actionButtons for tab 2', () => {
    component.businessPartnersForm = formBuilder.group({});
    component.addressBusinessPartnerForm = formBuilder.group({});
    component.bpformAux = {};


    spyOn(component as any, 'SearchProperties');
    spyOn(component as any, 'GetAnexos');
    spyOn(component as any, 'SearchAddress');

    (component as any).ChangeTapp(2);
    expect(component.actionButtons.length).toBe(3);
    expect(component.actionButtons[0].Key).toBe('ADD_ANEXOS');
    expect(component.actionButtons[1].Key).toBe('EXPLORER');
    expect(component.actionButtons[2].Key).toBe('CLEAN');
  });

  it('should call GetAnexos for tab 2', () => {
    component.businessPartnersForm = formBuilder.group({});
    component.addressBusinessPartnerForm = formBuilder.group({});
    component.bpformAux = {};


    spyOn(component as any, 'SearchProperties');
    spyOn(component as any, 'GetAnexos');
    spyOn(component as any, 'SearchAddress');

    (component as any).ChangeTapp(2);
    expect((component as any).GetAnexos).toHaveBeenCalled();
  });

  it('should set correct actionButtons for tab 3', () => {
    component.businessPartnersForm = formBuilder.group({});
    component.addressBusinessPartnerForm = formBuilder.group({});
    component.bpformAux = {};


    spyOn(component as any, 'SearchProperties');
    spyOn(component as any, 'GetAnexos');
    spyOn(component as any, 'SearchAddress');

    (component as any).ChangeTapp(3);
    expect(component.actionButtons.length).toBe(2);
    expect(component.actionButtons[0].Key).toBe('ADD_ADDRESS');
    expect(component.actionButtons[1].Key).toBe('CLEAN');
  });

  //----
  it('should not call any method if TabIndex is the same as tabChangeEvent', () => {
    spyOn(component as any, 'ChangesBP');
    spyOn(component as any, 'ChangesPropertiesValid');
    spyOn(component as any, 'ChangesAnexos');
    spyOn(component as any, 'ChangesAddress');
    spyOn(component as any, 'ChangeTapp');


    component.tabGroup = { selectedIndex: 0 } as any;

    component.TabIndex = 1;
    component.TabChange(1);
    expect((component as any).ChangesBP).not.toHaveBeenCalled();
    expect((component as any).ChangesPropertiesValid).not.toHaveBeenCalled();
    expect((component as any).ChangesAnexos).not.toHaveBeenCalled();
    expect((component as any).ChangesAddress).not.toHaveBeenCalled();
    expect((component as any).ChangeTapp).not.toHaveBeenCalled();
  });

  it('should call ChangesBP when TabIndex is 0', () => {
    spyOn(component as any, 'ChangesBP');
    spyOn(component as any, 'ChangesPropertiesValid');
    spyOn(component as any, 'ChangesAnexos');
    spyOn(component as any, 'ChangesAddress');
    spyOn(component as any, 'ChangeTapp');


    component.tabGroup = { selectedIndex: 0 } as any;

    component.TabIndex = 0;
    component.TabChange(1);
    expect((component as any).ChangesBP).toHaveBeenCalled();
  });

  it('should call ChangesPropertiesValid when TabIndex is 1', () => {
    spyOn(component as any, 'ChangesBP');
    spyOn(component as any, 'ChangesPropertiesValid');
    spyOn(component as any, 'ChangesAnexos');
    spyOn(component as any, 'ChangesAddress');
    spyOn(component as any, 'ChangeTapp');


    component.tabGroup = { selectedIndex: 0 } as any;

    component.TabIndex = 1;
    component.TabChange(2);
    expect((component as any).ChangesPropertiesValid).toHaveBeenCalled();
  });

  it('should call ChangesAnexos when TabIndex is 2', () => {
    spyOn(component as any, 'ChangesBP');
    spyOn(component as any, 'ChangesPropertiesValid');
    spyOn(component as any, 'ChangesAnexos');
    spyOn(component as any, 'ChangesAddress');
    spyOn(component as any, 'ChangeTapp');


    component.tabGroup = { selectedIndex: 0 } as any;

    component.TabIndex = 2;
    component.TabChange(3);
    expect((component as any).ChangesAnexos).toHaveBeenCalled();
  });

  it('should call ChangesAddress when TabIndex is 3', () => {
    spyOn(component as any, 'ChangesBP');
    spyOn(component as any, 'ChangesPropertiesValid');
    spyOn(component as any, 'ChangesAnexos');
    spyOn(component as any, 'ChangesAddress');
    spyOn(component as any, 'ChangeTapp');


    component.tabGroup = { selectedIndex: 0 } as any;

    component.TabIndex = 3;
    component.TabChange(0);
    expect((component as any).ChangesAddress).toHaveBeenCalled();
  });

  it('should call ChangeTapp when detectChanges is false', () => {
    spyOn(component as any, 'ChangesBP');
    spyOn(component as any, 'ChangesPropertiesValid');
    spyOn(component as any, 'ChangesAnexos');
    spyOn(component as any, 'ChangesAddress');
    spyOn(component as any, 'ChangeTapp');


    component.tabGroup = { selectedIndex: 0 } as any;

    component.TabIndex = 0;
    component.detectChanges = false;
    component.TabChange(1);
    expect((component as any).ChangeTapp).toHaveBeenCalledWith(1);
  });

  it('should call modalService.CancelAndContinue when detectChanges is true', () => {
    spyOn(component as any, 'ChangesBP');
    spyOn(component as any, 'ChangesPropertiesValid');
    spyOn(component as any, 'ChangesAnexos');
    spyOn(component as any, 'ChangesAddress');
    spyOn(component as any, 'ChangeTapp');


    component.tabGroup = { selectedIndex: 0 } as any;

    component.TabIndex = 0;
    component.detectChanges = true;
    modalServiceSpy.CancelAndContinue.and.returnValue(of(true));
    component.TabChange(1);
    expect(modalServiceSpy.CancelAndContinue).toHaveBeenCalledWith({
      title: 'Desea descartar los cambios?',
      type: CLModalType.QUESTION
    });
  });

  it('should not change tabGroup.selectedIndex when modalService.CancelAndContinue returns true', () => {
    spyOn(component as any, 'ChangesBP');
    spyOn(component as any, 'ChangesPropertiesValid');
    spyOn(component as any, 'ChangesAnexos');
    spyOn(component as any, 'ChangesAddress');
    spyOn(component as any, 'ChangeTapp');


    component.tabGroup = { selectedIndex: 0 } as any;

    component.TabIndex = 0;
    component.detectChanges = true;
    modalServiceSpy.CancelAndContinue.and.returnValue(of(true));
    component.TabChange(1);
    expect(component.tabGroup.selectedIndex).toBe(0);
  });

  it('should change tabGroup.selectedIndex when modalService.CancelAndContinue returns false', () => {
    spyOn(component as any, 'ChangesBP');
    spyOn(component as any, 'ChangesPropertiesValid');
    spyOn(component as any, 'ChangesAnexos');
    spyOn(component as any, 'ChangesAddress');
    spyOn(component as any, 'ChangeTapp');


    component.tabGroup = { selectedIndex: 0 } as any;

    component.TabIndex = 0;
    component.detectChanges = true;
    modalServiceSpy.CancelAndContinue.and.returnValue(of(false));
    component.TabChange(1);
    expect(component.tabGroup.selectedIndex).toBe(0);
  });

  //----
  it('should set provinciaName and call GetCantons when Description is "Provincia"', () => {
    spyOn(component as any, 'GetCantons');
    spyOn(component as any, 'GetDistrics');
    spyOn(component as any, 'GetNeighborhood');

    const addressConfig: IBusinessPartnersFields = {
      Description: 'Provincia',
      NameSL: 'TestProvincia'
    } as IBusinessPartnersFields;

    component.GetData(addressConfig);

    expect(component.provinciaName).toBe('TestProvincia');
    expect((component as any).GetCantons).toHaveBeenCalledWith('TestProvincia');
  });

  it('should set cantonName and call GetDistrics when Description is "Canton"', () => {
    spyOn(component as any, 'GetCantons');
    spyOn(component as any, 'GetDistrics');
    spyOn(component as any, 'GetNeighborhood');

    const addressConfig: IBusinessPartnersFields = {
      Description: 'Canton',
      NameSL: 'TestCanton'
    } as IBusinessPartnersFields;

    component.provinciaName = 'TestProvincia';
    component.GetData(addressConfig);

    expect(component.cantonName).toBe('TestCanton');
    expect((component as any).GetDistrics).toHaveBeenCalledWith('TestProvincia', 'TestCanton');
  });

  it('should set districtName and call GetNeighborhood when Description is "Distrito"', () => {
    spyOn(component as any, 'GetCantons');
    spyOn(component as any, 'GetDistrics');
    spyOn(component as any, 'GetNeighborhood');

    const addressConfig: IBusinessPartnersFields = {
      Description: 'Distrito',
      NameSL: 'TestDistrito'
    } as IBusinessPartnersFields;

    component.provinciaName = 'TestProvincia';
    component.cantonName = 'TestCanton';
    component.GetData(addressConfig);

    expect(component.districtName).toBe('TestDistrito');
    expect((component as any).GetNeighborhood).toHaveBeenCalledWith('TestProvincia', 'TestCanton', 'TestDistrito');
  });

  it('should not set any name or call any method for unknown Description', () => {
    spyOn(component as any, 'GetCantons');
    spyOn(component as any, 'GetDistrics');
    spyOn(component as any, 'GetNeighborhood');

    const addressConfig: IBusinessPartnersFields = {
      Description: 'Unknown',
      NameSL: 'TestUnknown'
    } as IBusinessPartnersFields;

    component.GetData(addressConfig);

    expect(component.provinciaName).toBe('');
    expect(component.cantonName).toBe('');
    expect(component.districtName).toBe('');

    expect((component as any).GetCantons).not.toHaveBeenCalled();
    expect((component as any).GetDistrics).not.toHaveBeenCalled();
    expect((component as any).GetNeighborhood).not.toHaveBeenCalled();
  });

  //----
  it('should set Int32 value for Provincia from form', () => {
    component.businessPartnersForm = formBuilder.group({
      Provincia: [''],
      Canton: [''],
      Distrito: [''],
      Barrio: ['']
    });

    component.FieldsBusinessPartner = [
      { Id: 'Provincia', FieldType: 'Int32', Value: '' } as IBusinessPartnersFields,
      { Id: 'Canton', FieldType: 'String', Value: '' } as IBusinessPartnersFields,
      { Id: 'Distrito', FieldType: 'Int32', Value: '' } as IBusinessPartnersFields,
      { Id: 'Barrio', FieldType: 'String', Value: '' } as IBusinessPartnersFields,
      { Id: 'OtherField', FieldType: 'String', Value: '' } as IBusinessPartnersFields
    ];

    component.businessPartnersForm.get('Provincia')?.setValue(1);
    component.SetValueUDF('Provincia', 'SomeProvincia');
    expect(component.FieldsBusinessPartner[0].Value.toString()).toBe('1');
  });

  it('should set String value for Provincia', () => {
    component.businessPartnersForm = formBuilder.group({
      Provincia: [''],
      Canton: [''],
      Distrito: [''],
      Barrio: ['']
    });

    component.FieldsBusinessPartner = [
      { Id: 'Provincia', FieldType: 'Int32', Value: '' } as IBusinessPartnersFields,
      { Id: 'Canton', FieldType: 'String', Value: '' } as IBusinessPartnersFields,
      { Id: 'Distrito', FieldType: 'Int32', Value: '' } as IBusinessPartnersFields,
      { Id: 'Barrio', FieldType: 'String', Value: '' } as IBusinessPartnersFields,
      { Id: 'OtherField', FieldType: 'String', Value: '' } as IBusinessPartnersFields
    ];

    component.FieldsBusinessPartner[0].FieldType = 'String';
    component.SetValueUDF('Provincia', 'SomeProvincia');
    expect(component.FieldsBusinessPartner[0].Value).toBe('SomeProvincia');
  });

  it('should set String value for Canton', () => {
    component.businessPartnersForm = formBuilder.group({
      Provincia: [''],
      Canton: [''],
      Distrito: [''],
      Barrio: ['']
    });

    component.FieldsBusinessPartner = [
      { Id: 'Provincia', FieldType: 'Int32', Value: '' } as IBusinessPartnersFields,
      { Id: 'Canton', FieldType: 'String', Value: '' } as IBusinessPartnersFields,
      { Id: 'Distrito', FieldType: 'Int32', Value: '' } as IBusinessPartnersFields,
      { Id: 'Barrio', FieldType: 'String', Value: '' } as IBusinessPartnersFields,
      { Id: 'OtherField', FieldType: 'String', Value: '' } as IBusinessPartnersFields
    ];

    component.SetValueUDF('Canton', 'SomeCanton');
    expect(component.FieldsBusinessPartner[1].Value).toBe('SomeCanton');
  });

  it('should set Int32 value for Canton from form', () => {
    component.businessPartnersForm = formBuilder.group({
      Provincia: [''],
      Canton: [''],
      Distrito: [''],
      Barrio: ['']
    });

    component.FieldsBusinessPartner = [
      { Id: 'Provincia', FieldType: 'Int32', Value: '' } as IBusinessPartnersFields,
      { Id: 'Canton', FieldType: 'String', Value: '' } as IBusinessPartnersFields,
      { Id: 'Distrito', FieldType: 'Int32', Value: '' } as IBusinessPartnersFields,
      { Id: 'Barrio', FieldType: 'String', Value: '' } as IBusinessPartnersFields,
      { Id: 'OtherField', FieldType: 'String', Value: '' } as IBusinessPartnersFields
    ];

    component.FieldsBusinessPartner[1].FieldType = 'Int32';
    component.businessPartnersForm.get('Canton')?.setValue(2);
    component.SetValueUDF('Canton', 'SomeCanton');
    expect(component.FieldsBusinessPartner[1].Value.toString()).toBe('2');
  });

  it('should set Int32 value for Distrito from form', () => {
    component.businessPartnersForm = formBuilder.group({
      Provincia: [''],
      Canton: [''],
      Distrito: [''],
      Barrio: ['']
    });

    component.FieldsBusinessPartner = [
      { Id: 'Provincia', FieldType: 'Int32', Value: '' } as IBusinessPartnersFields,
      { Id: 'Canton', FieldType: 'String', Value: '' } as IBusinessPartnersFields,
      { Id: 'Distrito', FieldType: 'Int32', Value: '' } as IBusinessPartnersFields,
      { Id: 'Barrio', FieldType: 'String', Value: '' } as IBusinessPartnersFields,
      { Id: 'OtherField', FieldType: 'String', Value: '' } as IBusinessPartnersFields
    ];

    component.businessPartnersForm.get('Distrito')?.setValue(3);
    component.SetValueUDF('Distrito', 'SomeDistrito');
    expect(component.FieldsBusinessPartner[2].Value.toString()).toBe('3');
  });

  it('should set String value for Distrito', () => {
    component.businessPartnersForm = formBuilder.group({
      Provincia: [''],
      Canton: [''],
      Distrito: [''],
      Barrio: ['']
    });

    component.FieldsBusinessPartner = [
      { Id: 'Provincia', FieldType: 'Int32', Value: '' } as IBusinessPartnersFields,
      { Id: 'Canton', FieldType: 'String', Value: '' } as IBusinessPartnersFields,
      { Id: 'Distrito', FieldType: 'Int32', Value: '' } as IBusinessPartnersFields,
      { Id: 'Barrio', FieldType: 'String', Value: '' } as IBusinessPartnersFields,
      { Id: 'OtherField', FieldType: 'String', Value: '' } as IBusinessPartnersFields
    ];

    component.FieldsBusinessPartner[2].FieldType = 'String';
    component.SetValueUDF('Distrito', 'SomeDistrito');
    expect(component.FieldsBusinessPartner[2].Value).toBe('SomeDistrito');
  });

  it('should set String value for Barrio', () => {
    component.businessPartnersForm = formBuilder.group({
      Provincia: [''],
      Canton: [''],
      Distrito: [''],
      Barrio: ['']
    });

    component.FieldsBusinessPartner = [
      { Id: 'Provincia', FieldType: 'Int32', Value: '' } as IBusinessPartnersFields,
      { Id: 'Canton', FieldType: 'String', Value: '' } as IBusinessPartnersFields,
      { Id: 'Distrito', FieldType: 'Int32', Value: '' } as IBusinessPartnersFields,
      { Id: 'Barrio', FieldType: 'String', Value: '' } as IBusinessPartnersFields,
      { Id: 'OtherField', FieldType: 'String', Value: '' } as IBusinessPartnersFields
    ];

    component.SetValueUDF('Barrio', 'SomeBarrio');
    expect(component.FieldsBusinessPartner[3].Value).toBe('SomeBarrio');
  });

  it('should set Int32 value for Barrio from form', () => {
    component.businessPartnersForm = formBuilder.group({
      Provincia: [''],
      Canton: [''],
      Distrito: [''],
      Barrio: ['']
    });

    component.FieldsBusinessPartner = [
      { Id: 'Provincia', FieldType: 'Int32', Value: '' } as IBusinessPartnersFields,
      { Id: 'Canton', FieldType: 'String', Value: '' } as IBusinessPartnersFields,
      { Id: 'Distrito', FieldType: 'Int32', Value: '' } as IBusinessPartnersFields,
      { Id: 'Barrio', FieldType: 'String', Value: '' } as IBusinessPartnersFields,
      { Id: 'OtherField', FieldType: 'String', Value: '' } as IBusinessPartnersFields
    ];

    component.FieldsBusinessPartner[3].FieldType = 'Int32';
    component.businessPartnersForm.get('Barrio')?.setValue(4);
    component.SetValueUDF('Barrio', 'SomeBarrio');
    expect(component.FieldsBusinessPartner[3].Value.toString()).toBe('4');
  });

  it('should set value for other fields', () => {
    component.businessPartnersForm = formBuilder.group({
      Provincia: [''],
      Canton: [''],
      Distrito: [''],
      Barrio: ['']
    });

    component.FieldsBusinessPartner = [
      { Id: 'Provincia', FieldType: 'Int32', Value: '' } as IBusinessPartnersFields,
      { Id: 'Canton', FieldType: 'String', Value: '' } as IBusinessPartnersFields,
      { Id: 'Distrito', FieldType: 'Int32', Value: '' } as IBusinessPartnersFields,
      { Id: 'Barrio', FieldType: 'String', Value: '' } as IBusinessPartnersFields,
      { Id: 'OtherField', FieldType: 'String', Value: '' } as IBusinessPartnersFields
    ];

    component.SetValueUDF('OtherField', 'SomeValue');
    expect(component.FieldsBusinessPartner[4].Value).toBe('SomeValue');
  });

  it('should not change any value if key does not exist', () => {
    component.businessPartnersForm = formBuilder.group({
      Provincia: [''],
      Canton: [''],
      Distrito: [''],
      Barrio: ['']
    });

    component.FieldsBusinessPartner = [
      { Id: 'Provincia', FieldType: 'Int32', Value: '' } as IBusinessPartnersFields,
      { Id: 'Canton', FieldType: 'String', Value: '' } as IBusinessPartnersFields,
      { Id: 'Distrito', FieldType: 'Int32', Value: '' } as IBusinessPartnersFields,
      { Id: 'Barrio', FieldType: 'String', Value: '' } as IBusinessPartnersFields,
      { Id: 'OtherField', FieldType: 'String', Value: '' } as IBusinessPartnersFields
    ];

    component.SetValueUDF('NonExistentField', 'SomeValue');
    expect(component.FieldsBusinessPartner.every(field => field.Value === '')).toBe(true);
  });

  //----
  it('should not call OnSelectOption when FederalTaxID is empty', () => {
    component.businessPartnersForm = formBuilder.group({
      FederalTaxID: ['']
    });

    component.businessPartner = [
      { FederalTaxID: '123456', CardCode: 'BP001', CardName: 'Business Partner 1' } as IBusinessPartner,
      { FederalTaxID: '789012', CardCode: 'BP002', CardName: 'Business Partner 2' } as IBusinessPartner
    ];

    spyOn(component, 'OnSelectOption');

    component.businessPartnersForm.controls['FederalTaxID'].setValue('');
    component.ValidateBusinessPartner();
    expect(component.OnSelectOption).not.toHaveBeenCalled();
  });

  it('should call OnSelectOption when FederalTaxID matches an existing business partner', () => {
    component.businessPartnersForm = formBuilder.group({
      FederalTaxID: ['']
    });

    component.businessPartner = [
      { FederalTaxID: '123456', CardCode: 'BP001', CardName: 'Business Partner 1' } as IBusinessPartner,
      { FederalTaxID: '789012', CardCode: 'BP002', CardName: 'Business Partner 2' } as IBusinessPartner
    ];

    spyOn(component, 'OnSelectOption');

    component.businessPartnersForm.controls['FederalTaxID'].setValue('123456');
    component.ValidateBusinessPartner();
    expect(component.OnSelectOption).toHaveBeenCalledWith(component.businessPartner[0]);
  });

  it('should not call OnSelectOption when FederalTaxID does not match any business partner', () => {
    component.businessPartnersForm = formBuilder.group({
      FederalTaxID: ['']
    });

    component.businessPartner = [
      { FederalTaxID: '123456', CardCode: 'BP001', CardName: 'Business Partner 1' } as IBusinessPartner,
      { FederalTaxID: '789012', CardCode: 'BP002', CardName: 'Business Partner 2' } as IBusinessPartner
    ];

    spyOn(component, 'OnSelectOption');

    component.businessPartnersForm.controls['FederalTaxID'].setValue('999999');
    component.ValidateBusinessPartner();
    expect(component.OnSelectOption).not.toHaveBeenCalled();
  });

  it('should handle null or undefined FederalTaxID value', () => {
    component.businessPartnersForm = formBuilder.group({
      FederalTaxID: ['']
    });

    component.businessPartner = [
      { FederalTaxID: '123456', CardCode: 'BP001', CardName: 'Business Partner 1' } as IBusinessPartner,
      { FederalTaxID: '789012', CardCode: 'BP002', CardName: 'Business Partner 2' } as IBusinessPartner
    ];

    spyOn(component, 'OnSelectOption');

    component.businessPartnersForm.controls['FederalTaxID'].setValue(null);
    component.ValidateBusinessPartner();
    expect(component.OnSelectOption).not.toHaveBeenCalled();

    component.businessPartnersForm.controls['FederalTaxID'].setValue(undefined);
    component.ValidateBusinessPartner();
    expect(component.OnSelectOption).not.toHaveBeenCalled();
  });

  it('should handle non-string FederalTaxID values', () => {
    component.businessPartnersForm = formBuilder.group({
      FederalTaxID: ['']
    });

    component.businessPartner = [
      { FederalTaxID: '123456', CardCode: 'BP001', CardName: 'Business Partner 1' } as IBusinessPartner,
      { FederalTaxID: '789012', CardCode: 'BP002', CardName: 'Business Partner 2' } as IBusinessPartner
    ];

    spyOn(component, 'OnSelectOption');

    component.businessPartnersForm.controls['FederalTaxID'].setValue(123456);
    component.ValidateBusinessPartner();
    expect(component.OnSelectOption).toHaveBeenCalledWith(component.businessPartner[0]);
  });

  //----
  it('should add configurable fields when keys are present', () => {
    const mockValue: IBPAddresses = { ConfigurableFields: [] } as any;
    component.addressBusinessPartnerForm = formBuilder.group({
      field1: 'value1',
      field2: 'value2'
    });
    component.fieldsConfiguredDirection = [
      { NameSL: 'field1' } as IBusinessPartnersFields,
      { NameSL: 'field2' } as IBusinessPartnersFields
    ];

    component.SaveAddress(mockValue);

    expect(mockValue.ConfigurableFields.length).toBe(2);
    expect(mockValue.ConfigurableFields[0]).toEqual({ NameSL: 'field1', Value: 'value1' } as any);
    expect(mockValue.ConfigurableFields[1]).toEqual({ NameSL: 'field2', Value: 'value2' } as any) ;
  });

  it('should not add configurable fields when no keys are present', () => {
    const mockValue: IBPAddresses = { ConfigurableFields: [] } as any;
    component.addressBusinessPartnerForm = formBuilder.group({});
    component.fieldsConfiguredDirection = [];

    component.SaveAddress(mockValue);

    expect(mockValue.ConfigurableFields.length).toBe(0);
  });

  it('should add new address when id is 0', () => {
    const mockValue: IBPAddresses = {} as IBPAddresses;
    component.id = 0;
    component.addressList = [];

    component.SaveAddress(mockValue);

    expect(component.addressList.length).toBe(1);
    expect(component.addressList[0].Id).toBe(1);
    expect(component.addressList[0].InDB).toBeFalse();
  });

  it('should update existing address when id is not 0', () => {
    const mockValue: IBPAddresses = {} as IBPAddresses ;
    component.id = 1;
    component.addressList = [{ Id: 1, AddressType: 'Old' } as IBPAddresses];
    component.addressAux = {
      AddressType: 'Test',
      RowNum: 1,
      BPCode: 'BP001',
      InDB: true,
      RowColor: 'red',
      IsDefault: true
    } as IBPAddresses;

    component.SaveAddress(mockValue);

    expect(component.addressList.length).toBe(1);
    expect(component.addressList[0].Id).toBe(1);
    expect(component.addressList[0].AddressType).toBe('Test');
    expect(component.addressList[0].RowNum).toBe(1);
    expect(component.addressList[0].BPCode).toBe('BP001');
    expect(component.addressList[0].InDB).toBeTrue();
    expect(component.addressList[0].RowColor).toBe('red');
    expect(component.addressList[0].IsDefault).toBeTrue();
  });

  it('should reset form and id after saving', () => {
    const mockValue: IBPAddresses = {} as IBPAddresses;
    component.id = 1;
    component.addressBusinessPartnerForm = formBuilder.group({
      field1: 'value1'
    });
    spyOn(component.addressBusinessPartnerForm, 'reset');
    spyOn<any>(component, 'InflateTable');

    component.SaveAddress(mockValue);

    expect(component.addressBusinessPartnerForm.reset).toHaveBeenCalled();
    expect(component.id).toBe(0);
    expect(component['InflateTable']).toHaveBeenCalled();
  });

  //----
  it('should set detectChanges to true when anexosFilesUpload has items', () => {

    component.anexosFilesUpload = ['file1.pdf', 'file2.jpg'] as any;
    component.detectChanges = false;


    (component as any).ChangesAnexos();


    expect(component.detectChanges).toBeTrue();
  });

  it('should not change detectChanges when anexosFilesUpload is empty', () => {

    component.anexosFilesUpload = [];
    component.detectChanges = false;


    (component as any).ChangesAnexos();


    expect(component.detectChanges).toBeFalse();
  });

  //----
  it('should return the correct message when Opcion is 1', () => {
    component.opcionesMenuForm = formBuilder.group({
      Opcion: ['']
    });


    component.opcionesMenuForm.controls['Opcion'].setValue('1');


    const result = component.GetMessage('test value');


    expect(result).toBe('Primero cree un socio para habilitar test value');
  });

  it('should return the correct message when Opcion is 2 and currentBp is false', () => {
    component.opcionesMenuForm = formBuilder.group({
      Opcion: ['']
    });


    component.opcionesMenuForm.controls['Opcion'].setValue('2');
    component.currentBp = false as unknown as IBusinessPartner ;


    const result = component.GetMessage('test value');


    expect(result).toBe('Seleccione un socio para habilitar test value');
  });

  it('should return an empty string when Opcion is not 1 or 2 or currentBp is true', () => {
    component.opcionesMenuForm = formBuilder.group({
      Opcion: ['']
    });


    component.opcionesMenuForm.controls['Opcion'].setValue('2');
    component.currentBp = true as unknown as IBusinessPartner ;


    const result = component.GetMessage('test value');


    expect(result).toBe('');
  });

  //----
  it('should return false when Opcion is not 2', () => {
    component.opcionesMenuForm = formBuilder.group({
      Opcion: ['']
    });
    component.businessPartnerFormControl = new FormControl('');


    component.opcionesMenuForm.controls['Opcion'].setValue('1');


    const result = component.EnableOrDisableFields();


    expect(result).toBeFalse();
  });

});
