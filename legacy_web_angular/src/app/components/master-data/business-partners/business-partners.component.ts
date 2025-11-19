
import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {
  AlertsService,
  CLModalType,
  CLToastType,
  ModalService,
} from '@clavisco/alerts';
import {CLPrint, DownloadBase64File, GetError, PrintBase64File, Repository, Structures} from '@clavisco/core';
import {CL_CHANNEL, ICLCallbacksInterface, ICLEvent, LinkerService, Register, Run, StepDown} from '@clavisco/linker';
import {OverlayService} from '@clavisco/overlay';
import {
  catchError, concatMap,
  filter,
  finalize,
  forkJoin,
  map,
  Observable,
  of,
  startWith,
  Subscription,
  switchMap,
} from 'rxjs';
import {LinkerEvent} from 'src/app/enums/e-linker-events';
import {IActionButton} from 'src/app/interfaces/i-action-button';
import {
  IAddressType,
  IAttachments2,
  IAttachments2Line,
  IBPAddresses,
  IBPProperties,
  IBPProperty,
  IBusinessPartner,
  IBusinessPartnerGroup,
  IPatchProperties,
  ISocioComercial
} from 'src/app/interfaces/i-business-partner';
import {IBusinessPartnersComponentResolvedData,} from 'src/app/interfaces/i-resolvers';
import {BusinessPartnersService} from 'src/app/services/business-partners.service';
import {AddValidatorAutoComplete, SharedService} from 'src/app/shared/shared.service';
import {MasterDataBusinessPartnersService} from "@app/services/master-data-business-partners.service";
import {ICompany} from "@app/interfaces/i-company";
import {IConfiguredFieldsSetting, IBusinessPartnersFields} from "../../../interfaces/i-settings";
import {StorageKey} from "@app/enums/e-storage-keys";
import {JsonDataServiceService} from "@app/services/json-data-service.service";
import {IDirection, IProvince} from "@app/interfaces/i-direction";
import {IStructures} from "@app/interfaces/i-structures";
import {IFilterKeyUdf, IUdf, IUdfContext, IUdfDevelopment} from "@app/interfaces/i-udf";
import {environment} from "@Environment/environment";
import {UdfsService} from "@app/services/udfs.service";
import {DynamicsUdfPresentation} from "@clavisco/dynamics-udfs-presentation";
import {DropdownList, ICLTableButton, MapDisplayColumns, MappedColumns, RowColors} from "@clavisco/table";
import {DropdownElement, IRowByEvent} from "@clavisco/table/lib/table.space";
import {IPayTerms} from "@app/interfaces/i-pay-terms";
import {IPriceList} from "@app/interfaces/i-price-list";
import {GetIndexOnPagedTable, MappingUdfsDevelopment} from "@app/shared/common-functions";
import {AttachmentsService} from "@app/services/Attachments.service";
import {MatTabGroup} from "@angular/material/tabs";
import {Address, ObjectType, TypeDevice} from "@app/enums/enums";
import CL_DISPLAY = Structures.Enums.CL_DISPLAY;
import CL_ACTIONS = Structures.Enums.CL_ACTIONS;
import {BusinessPartnerGroupService} from "@app/services/business-partner-group.service";
import {ICurrencies} from "@app/interfaces/i-currencies";
import {ConsolidationBusinessPartnerService} from "@app/services/consolidation-business-partner.service";
import {ICountry, IStates} from "@app/interfaces/i-country";
import {CountrysService} from "@app/services/countrys.service";
import {ISearchModalComponentDialogData, SearchModalComponent} from "@clavisco/search-modal";
import {MatDialog} from "@angular/material/dialog";
import {IDevice, ISalesDocument, IUniqueId} from "@app/interfaces/i-document-type";
import {SeriesService} from "@app/services/series.service";
import {IUserAssign} from "@app/interfaces/i-user";
import {IPermissionbyUser} from "@app/interfaces/i-roles";

@Component({
  selector: 'app-business-partners',
  templateUrl: './business-partners.component.html',
  styleUrls: ['./business-partners.component.scss']
})
export class BusinessPartnersComponent implements OnInit {

  /*FORMULARIOS*/
  businessPartnersForm!: FormGroup;
  addressBusinessPartnerForm!: FormGroup;
  opcionesMenuForm!: FormGroup;
  searchAddressForm = new FormControl('');
  businessPartnerFormControl = new FormControl('');

  /*LISTAS*/
  anexosFiles: IAttachments2Line[] = [];
  anexosFilesUpload: File[] = [];
  properties: IBPProperties[] = [];
  propertiesAux: IBPProperties[] = [];
  fieldBusinessPartnerCompany: IConfiguredFieldsSetting[] = [];
  FieldsBusinessPartner: IBusinessPartnersFields[] = [];
  TypeIdentification: IStructures[] = [];
  cardType: IStructures[] = [];
  actionButtons: IActionButton[] = [];
  businessPartner: IBusinessPartner[] = [];
  addressList: IBPAddresses[] = [];
  addressTypeList: IAddressType[] = [];
  provinceList: IProvince[] = [];
  directionsList: IDirection[] = [];
  cantonList: IDirection[] = [];
  districtList: IDirection[] = [];
  neighborhoodList: IDirection[] = [];
  udfsDataHeader: IUdf[] = [];
  udfsValue: IUdf[] = [];
  tableButtons: ICLTableButton[] = [];
  tableButtonsAnexos: ICLTableButton[] = [];
  fieldsConfiguredDirection: IBusinessPartnersFields[] = [];
  bpsGroup: IBusinessPartnerGroup[] = [];
  payTerms: IPayTerms[] = [];
  priceList: IPriceList[] = [];
  bpCurrencies: ICurrencies[] = [];
  socioComercial: ISocioComercial[] = [];
  actionButtonsAddress: IActionButton[] = [];
  paises: ICountry[] = [];
  states: IStates[] = [];
  udfsDevelopment: IUdfDevelopment[] = [];
  permissionsUser: IPermissionbyUser[] = [];
  permissionsUserMap: Record<string, boolean> = {}

  /*OBSERVABLES*/
  allSubscriptions: Subscription;

  /*OBJECTS*/
  addressAux!: IBPAddresses | null;
  bpformAux!: any;
  bpProperty!: IBPProperty | null;
  currentBp!: IBusinessPartner | null;
  selectedCompany!: ICompany | null;
  userAssingId! : number;
  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };

  /*VARIABLES*/
  TabIndex: number = 0;
  IsCompanyDirection: boolean = false;
  UdfsId: string = 'Udf';
  Title: string = 'Udfs';
  isVisible: boolean = true;
  ApiUrl: string = environment.apiUrl;
  DBODataEndPoint: string = 'OCRD';
  provinciaName: string = '';
  cantonName: string = '';
  districtName: string = '';
  id: number = 0;
  detectChanges: boolean = false;
  disabledConsolidationField: boolean = false;
  disabled: boolean = false;
  IsSerial: boolean = false;

  /*CONFIGURACION DE LA TABLA*/
  //Tabla direcciones
  shouldPaginateRequestAddress: boolean = true;
  dropdownColumns: string[] = ['AddressType'];
  dropdownList!: DropdownList;
  tableAddressId: string = 'TABLE-ADDRESS';
  lineMappedColumns!: MappedColumns;
  headerTableColumns: { [key: string]: string } = {
    Id: 'ID',
    AddressName: 'Nombre de dirección',
    AddressType: 'Tipo de dirección'
  }
  //Tabla anexos
  shouldPaginateRequestAnexos: boolean = false;
  tableAnexosId: string = 'TABLE-ANEXOS';
  lineMappedColumnsAnexos!: MappedColumns;
  headerTableColumnsAnexos: { [key: string]: string } = {
    Id: 'ID',
    FileName: 'Nombre archivo',
    AttachmentDate: 'Fecha del anexo',
    FreeText: 'Texto libre'
  }
  //Tabla Propiedades
  shouldPaginateRequestPropiedades: boolean = true;
  tablePropiedadesId: string = 'TABLE-PROPIEDADES';
  lineMappedColumnsPropiedades!: MappedColumns;
  headerTableColumnsPropiedades: { [key: string]: string } = {
    Id: 'Código',
    GroupName: 'Nombre'
  }

  /*VIEW CHILDS*/
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild(MatTabGroup) tabGroup!: MatTabGroup;

  searchModalId = "searchModalId";

  //#endregion
  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    @Inject('LinkerService') private linkerService: LinkerService,
    private activatedRoute: ActivatedRoute,
    private businessPartnersService: BusinessPartnersService,
    private masterDataBusinessPartnersService: MasterDataBusinessPartnersService,
    private overlayService: OverlayService,
    private alertsService: AlertsService,
    private jsonDataService: JsonDataServiceService,
    private modalService: ModalService,
    private udfsService: UdfsService,
    private attachmentService: AttachmentsService,
    private bpGroupService: BusinessPartnerGroupService,
    private ConsolidationBP: ConsolidationBusinessPartnerService,
    private CountryService: CountrysService,
    private matDialog: MatDialog,
    private seriesService: SeriesService
  ) {
    this.allSubscriptions = new Subscription();
    this.ConfigTable();
  }

  ngOnInit(): void {
    this.OnLoad();
  }

  private OnLoad(): void {
    this.selectedCompany = Repository.Behavior.GetStorageObject<ICompany>(StorageKey.CurrentCompany);
    this.userAssingId = Repository.Behavior.GetStorageObject<IUserAssign>(StorageKey.CurrentUserAssign)?.Id ?? 0;

    Register<CL_CHANNEL>(this.tableAnexosId, CL_CHANNEL.OUTPUT, this.OnTableAnexosActionActivated, this.callbacks);
    Register<CL_CHANNEL>(this.tableAnexosId, CL_CHANNEL.OUTPUT_3, this.EventColumnAnexos, this.callbacks);

    Register<CL_CHANNEL>(this.tableAddressId, CL_CHANNEL.REQUEST_RECORDS, this.GetBPAddress, this.callbacks);
    Register<CL_CHANNEL>(this.tableAddressId, CL_CHANNEL.OUTPUT, this.OnTableActionActivated, this.callbacks);
    Register<CL_CHANNEL>(this.tableAddressId, CL_CHANNEL.OUTPUT_3, this.EventColumn, this.callbacks);

    Register<CL_CHANNEL>(this.tablePropiedadesId, CL_CHANNEL.DATA_LINE_1, this.SaveProperties, this.callbacks);
    Register<CL_CHANNEL>(this.tablePropiedadesId, CL_CHANNEL.REQUEST_RECORDS, this.GetProperties, this.callbacks);

    Register<CL_CHANNEL>(this.searchModalId, CL_CHANNEL.REQUEST_RECORDS, this.OnModalRequestRecords, this.callbacks);

    this.allSubscriptions.add(
      this.linkerService.Flow()?.pipe(
        StepDown<CL_CHANNEL>(this.callbacks),
      ).subscribe({
        next: callback => Run(callback.Target, callback, this.callbacks.Callbacks),
        error: error => CLPrint(error, Structures.Enums.CL_DISPLAY.ERROR)
      })
    );

    this.allSubscriptions.add(this.sharedService.OnActionButtonClicked(this.OnActionButtonClicked));

    this.LoadForm();
    this.HandleResolvedData();
    this.LoadTappDirection();
    this.LoadActionButton();
    this.RegisterActionButtonsEvents();
    this.ConfigSelectInRows();
    this.GetConfiguredUdfs();
  }

  /**
   * Listening event of component search-modal
   * @param _event - Event gets data from modal
   * @constructor
   */
  OnModalRequestRecords = (_event: ICLEvent): void => {
    const VALUE = JSON.parse(_event.Data);

    this.overlayService.OnGet();
    this.masterDataBusinessPartnersService.GetbyFilter<IBusinessPartner[]>(VALUE?.SearchValue)
      .pipe(finalize(() => this.overlayService.Drop())
        ).subscribe({
        next: (callback) => {
          this.businessPartner = callback.Data;

          this.InflateTableBusinnesPartner();

          this.alertsService.Toast({
            type: CLToastType.SUCCESS,
            message: 'Componentes requeridos obtenidos'
          });
        },
        error: (err) => {
          this.alertsService.ShowAlert({HttpErrorResponse: err});
        }
      })

  }

  /**
   * Method to edit a address table
   * @param _event - Event emitted in the table button when selecting a address
   * @constructor
   */
  private OnTableActionActivated = (_event: ICLEvent): void => {

    const BUTTON_EVENT = JSON.parse(_event.Data);
    const ACTION = JSON.parse(BUTTON_EVENT.Data) as IBPAddresses;
    this.addressAux = ACTION;

    try {

      if (BUTTON_EVENT.Action === CL_ACTIONS.OPTION_1) {
        this.id = ACTION.Id;
        this.addressBusinessPartnerForm.patchValue(ACTION);

        if (ACTION.ConfigurableFields) {
          ACTION.ConfigurableFields.forEach(element => {
            this.addressBusinessPartnerForm.controls[element.NameSL].setValue(element.Value)
          });
        }


        this.actionButtonsAddress = [
          {
            Key: 'ADD',
            MatIcon: 'edit',
            Text: 'Actualizar'
          }
        ];
      }

      if (BUTTON_EVENT.Action === CL_ACTIONS.OPTION_2) {
        if (ACTION.AddressType && ACTION.AddressType !== '') {
          //Juego de colores
          this.addressList.filter(n => n.AddressType === ACTION.AddressType)
            .forEach(element => {
              if (ACTION.AddressType === Address.SHIL) {
                element.IsDefault = element.Id === ACTION.Id;
              }
              if (ACTION.AddressType === Address.BILL) {
                element.IsDefault = element.Id === ACTION.Id;
              }
            });

          this.addressList = this.addressList.map(element => {
            return {
              ...element,
              RowColor: element.IsDefault ? RowColors.LightBlue : ''
            }
          });

          //Se infla la tabla
          this.InflateTable();
        } else {
          this.alertsService.Toast({
            type: CLToastType.INFO,
            message: 'Primero debe asignar el tipo de dirección.'
          });
        }
      }

      if (BUTTON_EVENT.Action === CL_ACTIONS.OPTION_3) {

        if (!ACTION.InDB) {
          this.addressList.splice(ACTION.Id - 1, 1);
          this.addressList = this.addressList.map((element, index) => {
            return {
              ...element,
              Id: index + 1
            }
          })
          this.addressAux = null;
          //Se infla la tabla
          this.InflateTable();
        } else {
          this.alertsService.Toast({
            type: CLToastType.INFO,
            message: 'Esta dirección no se puede eliminar porque ya fue previamente creada en SAP.'
          });
        }

      }


    } catch (e) {
      CLPrint(e, CL_DISPLAY.ERROR);
    }

  }

  /**
   * Method to edit a anexos table
   * @param _event - Event emitted in the table button when selecting a anexos
   * @constructor
   */
  private OnTableAnexosActionActivated = (_event: ICLEvent): void => {

    const BUTTON_EVENT = JSON.parse(_event.Data);
    const ACTION = JSON.parse(BUTTON_EVENT.Data) as IAttachments2Line;

    if (BUTTON_EVENT.Action === CL_ACTIONS.DELETE) {
      if (!ACTION.AbsoluteEntry || ACTION.AbsoluteEntry <= 0) {
        this.anexosFiles.splice(ACTION.Id - 1, 1);
        this.anexosFiles = this.anexosFiles.map((element, index) => {
          return {
            ...element,
            Id: index + 1
          }
        });
        this.anexosFilesUpload = [];
        this.InflateTableAnexos();
      } else {
        this.alertsService.Toast({
          type: CLToastType.INFO,
          message: 'No se puede eliminar este archivo porque ya fue creado en SAP.'
        })
      }
    }

    if(BUTTON_EVENT.Action === CL_ACTIONS.OPTION_1){

      let path = `${ACTION.SourcePath}\\${ACTION.FileName}.${ACTION.FileExtension}`;

      this.overlayService.OnGet();
      this.attachmentService.GetFile(path).pipe(
        finalize(() => this.overlayService.Drop())
      ).subscribe({
        next: (callback) => {
          if(callback.Data){
            DownloadBase64File(callback.Data, ACTION.FileName, 'application/octet-stream', ACTION.FileExtension);
          }
        },
        error: (error) => {
          this.alertsService.ShowAlert({HttpErrorResponse: error});
        }
      });
    }


  }

  /**
   * Get partner address
   * @constructor
   */
  private GetBPAddress = (): void => {

    this.overlayService.OnGet();
    this.businessPartnersService.GetBPAddress((this.currentBp?.CardCode ?? ''), (this.searchAddressForm.value ?? '')).pipe(
      finalize(() => this.overlayService.Drop())
    ).subscribe({
      next: (callback) => {
        this.addressList = callback.Data.map((x, index) => {
          return {
            ...x,
            InDB: true,
            Id: index + 1
          }
        });
        let index = this.addressList.findIndex(x => x.AddressName?.toLowerCase() === this.currentBp?.ShipToDefault?.toLowerCase() && x.AddressType === Address.SHIL);
        if (index >= 0) {
          this.addressList[index].IsDefault = true;
          this.addressList[index].RowColor = RowColors.LightBlue;
        }
        index = this.addressList.findIndex(x => x.AddressName?.toLowerCase() === this.currentBp?.BilltoDefault?.toLowerCase() && x.AddressType === Address.BILL);
        if (index >= 0) {
          this.addressList[index].IsDefault = true;
          this.addressList[index].RowColor = RowColors.LightBlue;
        }
        this.InflateTable();
      },
      error: (err) => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
      }
    })
  }

  /**
   * Get attachments from a partner
   * @constructor
   */
  private GetAnexos = (): void => {
    this.anexosFiles=[];
    this.InflateTableAnexos();
    if(!this.currentBp?.AttachmentEntry) return;

    this.overlayService.OnGet();

    this.attachmentService.Get(this.currentBp?.AttachmentEntry)
      .pipe(
        finalize(() => this.overlayService.Drop())
      ).subscribe({
        next: (callback) => {
          this.anexosFiles = callback.Data.map((element, index) => {
            return {
              ...element,
              Id: index + 1
            }
          });
          this.InflateTableAnexos();
        },
        error: (err) => {
          this.alertsService.ShowAlert({HttpErrorResponse: err});
        }
      })
  }

  /**
   * Get properties from a partner
   * @constructor
   */
  private GetProperties = (): void => {

    let request$: Observable<any>[] = [this.businessPartnersService.GetBPProperties()];
    request$.push(this.businessPartnersService.GetBPProperty(this.currentBp?.CardCode ?? ''));

    this.overlayService.OnGet();
    forkJoin(request$).pipe(
      finalize(() => this.overlayService.Drop())
    ).subscribe({
      next: (callback) => {
        if (callback[1]) {
          this.bpProperty = callback[1].Data;
        }

        let prop = Object.entries(this.bpProperty ?? {});

        this.properties = callback[0].Data;


        this.properties.forEach(element => {
          let result = prop.find(([key, value]) => element.GroupCode === key);
          if (result) {
            element.IsActive = result[1] === 'Y';
          }
        });

        this.propertiesAux = this.properties.map((element: IBPProperties) => ({...element}));

        this.InflateTableProperties();
      }
    })
  }

  /**
   * Method to update a table record of address
   * @param _event - Event emitted from the table to edit
   * @constructor
   */
  private EventColumn = (_event: ICLEvent): void => {
    let ALL_RECORDS = JSON.parse(_event.Data) as IRowByEvent<IBPAddresses>;
    let INDEX = GetIndexOnPagedTable(ALL_RECORDS.ItemsPeerPage, ALL_RECORDS.RowIndex, ALL_RECORDS.CurrentPage + 1, this.shouldPaginateRequestAddress);
    this.addressList[INDEX].AddressType = ALL_RECORDS.Row.AddressType;
  }
  /**
   * Method to update a table record of anexos
   * @param _event - Event emitted from the table to edit
   * @constructor
   */
  private EventColumnAnexos = (_event: ICLEvent): void => {
    let ALL_RECORDS = JSON.parse(_event.Data) as IRowByEvent<IAttachments2Line>;
    let INDEX = GetIndexOnPagedTable(ALL_RECORDS.ItemsPeerPage, ALL_RECORDS.RowIndex, ALL_RECORDS.CurrentPage + 1, this.shouldPaginateRequestAnexos);
    this.anexosFiles[INDEX].FreeText = ALL_RECORDS.Row.FreeText;
  }

  private ConfigTable(): void {

    //#region TABLA DIRECCIONES
    this.lineMappedColumns = MapDisplayColumns({
      dataSource: this.addressList,
      renameColumns: this.headerTableColumns,
      stickyColumns: [
        {Name: 'Options', FixOn: 'right'}
      ],
      ignoreColumns: [
        'AddressName2', 'AddressName3',
        'Street', 'Block', 'City',
        'ZipCode', 'County', 'State',
        'Country', 'StreetNo', 'BuildingFloorRoom',
        'GlobalLocationNumber', 'ConfigurableFields',
        'RowNum', 'BPCode', 'RowColor', 'InDB', 'IsDefault'
      ]
    });
    this.tableButtons = [
      {
        Title: `Editar`,
        Action: Structures.Enums.CL_ACTIONS.OPTION_1,
        Icon: `edit`,
        Color: `primary`,
        Data: ''
      },
      {
        Title: `Seleccionar como estándar`,
        Action: Structures.Enums.CL_ACTIONS.OPTION_2,
        Icon: `check_small`,
        Color: `primary`,
        Data: ''
      },
      {
        Title: `Eliminar`,
        Action: Structures.Enums.CL_ACTIONS.OPTION_3,
        Icon: `delete`,
        Color: `primary`,
        Data: ''
      }
    ];
    //#endregion

    //#region TABLA ANEXOS
    this.lineMappedColumnsAnexos = MapDisplayColumns({
      dataSource: this.anexosFiles,
      renameColumns: this.headerTableColumnsAnexos,
      stickyColumns: [
        {Name: 'Options', FixOn: 'right'}
      ],
      inputColumns: [{ColumnName: 'FreeText', FieldType: 'text'}],
      ignoreColumns: ['AbsoluteEntry', 'FileExtension', 'Override', 'SourcePath', 'LineNum']
    });
    this.tableButtonsAnexos = [
      {
        Title: `Eliminar`,
        Action: Structures.Enums.CL_ACTIONS.DELETE,
        Icon: `delete`,
        Color: `primary`,
        Data: ''
      },
      {
        Title: `Descargar`,
        Action: Structures.Enums.CL_ACTIONS.OPTION_1,
        Icon: `download`,
        Color: `primary`,
        Data: ''
      }
    ];
    //#endregion

    //#region TABLA PROPIEDADES
    this.lineMappedColumnsPropiedades = MapDisplayColumns({
      dataSource: this.properties,
      ignoreColumns: ['GroupCode', 'IsActive', 'Value'],
      propToLinkWithSelectColumn: 'IsActive',
      renameColumns: this.headerTableColumnsPropiedades,
    });
    //#endregion
  }

  public ActivatedBps(_value: boolean): void {
    this.businessPartnersForm.controls['Frozen'].setValue(_value);
  }

  public GetBpGroups(_key: string): void {
    this.overlayService.OnGet();
    forkJoin({
      BpGroupService: this.bpGroupService.Get(_key),
      Serial:  this.seriesService.GetIsSerial(this.userAssingId, _key === 'C' ? ObjectType.BusinessPartnerCustomer : ObjectType.BusinessPartnerVendor, this.selectedCompany?.Id || 0)
    }).pipe(
      finalize(() => this.overlayService.Drop())
    ).subscribe({next: (callback) => {
        this.bpsGroup = callback.BpGroupService.Data;
        this.IsSerial = callback.Serial.Data?.IsSerial ?? false;
        this.UpdateValidators();
    }});

  }

  private ConfigSelectInRows(): void {
    let dropAddress: DropdownElement[] = [];

    this.addressTypeList.forEach(x => {
      let value = {
        key: x.Code,
        value: x.Name,
        by: ''
      }
      dropAddress.push(value);
    });

    this.dropdownList = {
      AddressType: dropAddress as DropdownElement[]
    };
  }

  ngOnDestroy(): void {
    this.sharedService.SetActionButtons([]);
    this.allSubscriptions.unsubscribe();
  }

  public RegisterActionButtonsEvents(): void {
    Register<CL_CHANNEL>(LinkerEvent.ActionButton, CL_CHANNEL.OUTPUT, this.OnActionButtonClicked, this.callbacks);
    Register(this.UdfsId, CL_CHANNEL.OUTPUT, this.OnClickUdfEvent, this.callbacks);
    Register<CL_CHANNEL>(this.UdfsId, CL_CHANNEL.OUTPUT_2, this.ContentUdf, this.callbacks);
  }

  /**
   *
   * @param _actionButton
   */
  public OnActionButtonClicked = (_actionButton: IActionButton): void => {

    switch (_actionButton.Key) {
      case 'ADD':
        this.OnSubmit();
        break;
      case 'ADD_ANEXOS':
        this.SaveAnexos();
        break;
      case 'ADD_ADDRESS':
        this.SaveChangesAddress();
        break;
      case 'CLEAN':
        this.Clear();
        break;
      case 'EXPLORER':
        this.AddFile();
        break;
      case 'ADD_PROPERTIES':
        this.linkerService.Publish({
          CallBack: CL_CHANNEL.DATA_LINE_2,
          Data: '',
          Target: this.tablePropiedadesId
        });
        break;
    }
  }

  public OnActionButtonAddressClicked = (_actionButton: IActionButton): void => {
    this.SaveAddress(this.addressBusinessPartnerForm.value);
  }

  private resetForm(): void {
    this.businessPartnerFormControl.reset();
    this.LoadForm();
    this.LoadActionButton();
    this.businessPartnersForm.get('CardType')?.setValue(this.cardType.find(ds => ds.Default)?.Key || '');
    this.businessPartnersForm.get('TypeIdentification')?.setValue(this.TypeIdentification.find(ds => ds.Default)?.Key || '');
    this.TabIndex = 0;
    this.detectChanges = false;
    this.CleanFields();
  }

  /**
   * METODO PARA LIMPIAR DATOS
   * @constructor
   */
  public Clear(): void {
    this.disabled = false;
    this.disabledConsolidationField = false;
    this.modalService.CancelAndContinue({
      type: CLModalType.QUESTION,
      title: `Está seguro de que desea limpiar campos?`,
    }).pipe(
      filter(res => res),
    ).subscribe({
      next: () => {
        this.resetForm();
      },
      error: (error) => {
        this.alertsService.ShowAlert({HttpErrorResponse: error});
      }
    });
  }

  /**
   *
   * @constructor
   */
  public CleanMatTab(): void {
    this.resetForm();
  }

  public LoadForm(): void {

    this.opcionesMenuForm = this.fb.group({
      Opcion: ['2']
    });

    this.businessPartnersForm = this.fb.group({
      CardCode: ['', this.GetValidators()],
      CardName: ['', [Validators.required]],
      FederalTaxID: ['', [Validators.required]],
      CardType: ['', [Validators.required]],
      EmailAddress: [''],
      TypeIdentification: [''],
      Phone1: [''],
      DiscountPercent: [0],
      MaxCommitment: [0],
      Currency: [''],
      Frozen: [false],
      FatherType: ['', Validators.required],
      PriceListNum: ['', Validators.required],
      PayTermsGrpCode: [''],
      GroupCode: ['', Validators.required],
      ConsolidationBP: ['']
    });

    this.addressBusinessPartnerForm = this.fb.group({
      AddressName: [''],
      AddressName2: [''],
      AddressName3: [''],
      Street: [''],
      Block: [''],
      City: [''],
      ZipCode: [''],
      County: [''],
      State: [''],
      Country: [''],
      StreetNo: [''],
      BuildingFloorRoom: [''],
      GlobalLocationNumber: ['']
    })

    this.businessPartnersForm.get('CardCode')!.valueChanges.subscribe(next => {
    });
  }
  GetValidators() {
    return !this.IsSerial ? [Validators.required] : [];
  }

  UpdateValidators() {
    const control = this.businessPartnersForm.get('CardCode');
    if (control) {
      control.setValidators(this.GetValidators());
      control.updateValueAndValidity();
    }
  }

  private ChangesBP(): void {
    const formBp = this.businessPartnersForm.value;

    for (const key in formBp) {
      if (!this.Compare(this.bpformAux[key], formBp[key])) {
        this.detectChanges = true;
        break;
      }
    }
  }

  private Compare(_cadena1: string, _cadena2: string): boolean {

    _cadena1 = _cadena1 ? _cadena1 : '';
    _cadena2 = _cadena2 ? _cadena2 : '';

    const cadena1SinEspacios = _cadena1.toString().replace(/\s/g, '');
    const cadena2SinEspacios = _cadena2.toString().replace(/\s/g, '');

    return cadena1SinEspacios.toLowerCase() === cadena2SinEspacios.toLowerCase();


  }

  private LoadTappDirection(): void {

    if (this.IsCompanyDirection) {
      this.GetProvinces();
      this.fieldsConfiguredDirection = this.FieldsBusinessPartner.filter(x => x.IsObjDirection) ?? [];
      this.fieldsConfiguredDirection.forEach(element => {
        this.addressBusinessPartnerForm.addControl(element.NameSL, this.fb.control(''))
        this.lineMappedColumns.IgnoreColumns?.push(element.NameSL);
      });
    }

  }

  public LoadActionButton(): void {
    this.actionButtonsAddress = [
      {
        Key: 'ADD',
        MatIcon: 'add',
        Text: 'Agregar'
      }
    ];
    this.actionButtons = [
      {
        Key: 'ADD',
        MatIcon: 'edit',
        Text: 'Actualizar',
        MatColor: 'primary',
        DisabledIf: (_form?: FormGroup) => _form?.invalid || false
      },
      {
        Key: 'CLEAN',
        MatIcon: 'mop',
        Text: 'Limpiar'
      }
    ];
  }

  /**
   * Method to load initial data of component
   * @constructor
   * @private
   */
  private HandleResolvedData(): void {
    this.TabIndex = 0;
    this.activatedRoute.data.subscribe({
      next: (data) => {

        const resolvedData: IBusinessPartnersComponentResolvedData = data['resolvedData'];
        if (resolvedData) {

          this.IsSerial = resolvedData.Serial?.IsSerial ?? false;
          this.addressTypeList = resolvedData.AddressType;
          this.bpsGroup = resolvedData.BpsGroup;
          this.bpCurrencies = resolvedData.BpCurrencies;
          this.payTerms = resolvedData.PayTerms;
          this.priceList = resolvedData.PriceList ?? [];
          this.socioComercial = resolvedData.SocioComercial;
          this.paises = resolvedData.Countrys;
          this.udfsDevelopment =  resolvedData.UdfsDevelopment;
          this.permissionsUser = resolvedData.PermissionsUser;

          this.businessPartnersForm.controls['Currency'].setValue(this.bpCurrencies[0].Id);
          this.businessPartnersForm.controls['FatherType'].setValue(this.socioComercial.find(x => x.IsDefault)?.Code ?? '');
          this.businessPartnersForm.controls['PriceListNum'].setValue(this.priceList[0]?.ListNum);

          if (resolvedData.FieldsConfiguredSAP) {
            this.fieldBusinessPartnerCompany = JSON.parse(resolvedData.FieldsConfiguredSAP?.Json || '');
            let dataFieldBusinessPartnerCompany = this.fieldBusinessPartnerCompany.find(x => x.CompanyId === this.selectedCompany?.Id) as IConfiguredFieldsSetting;
            if (dataFieldBusinessPartnerCompany) {
              this.FieldsBusinessPartner = dataFieldBusinessPartnerCompany.Fields;
              this.FieldsBusinessPartner = this.FieldsBusinessPartner.filter(x => this.FilterFields(x));
              this.IsCompanyDirection = dataFieldBusinessPartnerCompany.IsCompanyDirection;

            }
          }

          this.TypeIdentification = resolvedData.TypeIdentification;
          this.cardType = resolvedData.TypeBusinessPartner;

          this.businessPartnersForm.get('CardType')?.setValue(this.cardType.find(ds => ds.Default)?.Key || '');
          this.businessPartnersForm.get('TypeIdentification')?.setValue(this.TypeIdentification.find(ds => ds.Default)?.Key || '');

          this.permissionsUserMap = this.permissionsUser.reduce((acc, perm) => {
            acc[perm.Name] = true;
            return acc;
          }, {} as Record<string, boolean>);
        }

      }
    })

  }

  private OnSubmit(): void {
    if (this.isVisible)
      this.GetConfiguredUdfs();
    else
      this.SaveChanges();
  }

  public SetStandard(): void {
    if (this.addressAux) {
      if (this.currentBp) {
        this.currentBp.BilltoDefault = this.addressList.filter(x => x.AddressType === Address.BILL).find(y => y.IsDefault)?.AddressName ?? '';
        this.currentBp.ShipToDefault = this.addressList.filter(x => x.AddressType === Address.SHIL).find(y => y.IsDefault)?.AddressName ?? '';
      }
      this.alertsService.Toast({type: CLToastType.INFO, message: 'Asignada.'});
    } else {
      this.alertsService.Toast({type: CLToastType.INFO, message: 'Seleccione la dirección.'});
    }
  }

  private SaveChangesAddress(): void {

    if (!this.addressList || this.addressList.length === 0) {
      this.alertsService.Toast({type: CLToastType.INFO, message: 'No se han agregado direcciones.'});
      return;
    }
    if (this.addressList.some(x => !x.AddressType || x.AddressType === '')) {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: 'Agregue el tipo de dirección en la columna tipo de dirección.'
      });
      return;
    }

    if (!this.currentBp?.ShipToDefault) {
      if (this.addressList.some(y => y.AddressType === Address.SHIL)
        && !this.addressList.filter(y => y.AddressType === Address.SHIL)
          .some(x => x.IsDefault)) {
        this.alertsService.Toast({
          type: CLToastType.INFO,
          message: 'Defina una dirección de envío como la estándar.'
        });
        return;
      }
    }

    if (!this.currentBp?.BilltoDefault) {
      if (this.addressList.some(y => y.AddressType === Address.BILL)
        && !this.addressList.filter(y => y.AddressType === Address.BILL)
          .some(x => x.IsDefault)) {
        this.alertsService.Toast({
          type: CLToastType.INFO,
          message: 'Defina una dirección de facturación como la estándar.'
        });
        return;
      }
    }

    if (this.currentBp) {
      this.currentBp.BPAddresses = this.addressList;
    } else {
      return;
    }

    this.overlayService.OnPost();
    this.businessPartnersService.SaveAddress(this.currentBp).pipe(
      switchMap(res => {
        this.overlayService.Drop();
        return this.modalService.Continue({
          title: 'Dirección guardada correctamente',
          type: CLModalType.SUCCESS
        })
      }),
      finalize(() => this.overlayService.Drop()),
    ).subscribe({
      next: (callback) => {
        this.addressList = this.addressList.map(element => {
          return {
            ...element,
            InDB: true
          }
        });

        if (this.currentBp) {
          this.currentBp.ShipToDefault = this.addressList.filter(y => y.AddressType === Address.SHIL)
            .find(x => x.IsDefault)?.AddressName ?? '';
          this.currentBp.BilltoDefault = this.addressList.filter(y => y.AddressType === Address.BILL)
            .find(x => x.IsDefault)?.AddressName ?? '';
        }
        this.InflateTable();
        this.detectChanges = false;
        this.addressAux = null;
      },
      error: (err) => {
        this.modalService.Continue({
          title: 'Se produjo un error guardando la dirección',
          subtitle: GetError(err),
          type: CLModalType.ERROR
        });
      }
    });
  }

  private SaveAnexos(): void {


    if (!this.anexosFiles || this.anexosFiles.length === 0) {
      this.alertsService.Toast({type: CLToastType.INFO, message: 'No se han agregado nuevos archivos.'});
      return;
    }

    let files: FormData = new FormData();

    this.anexosFilesUpload.forEach(file => {
      files.append(file.name, file);
    });

    let data: IAttachments2 = {
      CardCode: this.currentBp?.CardCode ?? '',
      AbsoluteEntry: this.anexosFiles[0].AbsoluteEntry,
      Attachments2_Lines: this.anexosFiles
    };

    files.append('FILES', JSON.stringify(data));

    this.overlayService.OnPost();
    this.attachmentService.Post(files).pipe(
      switchMap(res => {
        this.overlayService.Drop();
        if( this.currentBp){
          if(res.Data){
            this.currentBp.AttachmentEntry=res.Data?.AbsoluteEntry;
          }
        }
        return this.modalService.Continue({
          title: 'Anexo guardado correctamente',
          type: CLModalType.SUCCESS
        })
      }),
      finalize(() => {
        this.overlayService.Drop()
      })
    ).subscribe({
      next: () => {
        this.anexosFilesUpload = [];
        this.detectChanges = false;
        this.GetAnexos();
      },
      error: (err) => {
        this.modalService.Continue({
          title: 'Se produjo un error guardando el anexo',
          subtitle: GetError(err),
          type: CLModalType.ERROR
        });
      }
    });

  }

  /**
   * Method to save business partner in sap
   * @constructor
   * @private
   */
  private SaveChanges(): void {

    this.overlayService.OnPost();
    this.SetValueUDF('TipoIdentificacion', this.businessPartnersForm.controls['TypeIdentification'].value);
    this.SetValueUDF('Cedula', this.businessPartnersForm.controls['FederalTaxID'].value);
    this.SetValueUDF('Email', this.businessPartnersForm.controls['EmailAddress'].value);

    if (!this.businessPartnersForm.get('CardCode')?.value) {

      MappingUdfsDevelopment<IDevice>({Device: TypeDevice.WEB} as IDevice, this.udfsValue, this.udfsDevelopment);

    }

    let businesspartner = {

      CardType: this.businessPartnersForm.get('CardType')?.value === 'C' ? 'cCustomer' : 'cSupplier',
      CardCode: this.businessPartnersForm.get('CardCode')?.value,
      CardName: this.businessPartnersForm.get('CardName')?.value,
      Phone1: this.businessPartnersForm.get('Phone1')?.value,
      ConfigurableFields: this.FieldsBusinessPartner,
      IsCompanyDirection: this.IsCompanyDirection,
      GroupCode: this.businessPartnersForm.controls['GroupCode'].value,
      Frozen: this.businessPartnersForm.controls['Frozen'].value ? 'tNO' : 'tYES',
      Currency: this.businessPartnersForm.controls['Currency'].value,
      PayTermsGrpCode: this.businessPartnersForm.controls['PayTermsGrpCode'].value,
      PriceListNum: this.businessPartnersForm.controls['PriceListNum'].value,
      DiscountPercent: this.businessPartnersForm.controls['DiscountPercent'].value,
      MaxCommitment: this.businessPartnersForm.controls['MaxCommitment'].value,
      FatherType: this.businessPartnersForm.controls['FatherType'].value,
      FatherCard: this.businessPartnersForm.controls['ConsolidationBP'].value,
      FederalTaxID: this.businessPartnersForm.controls['FederalTaxID'].value,
      EmailAddress: this.businessPartnersForm.controls['EmailAddress'].value,
      Udfs: this.udfsValue
    } as IBusinessPartner;


    let updateOrCreate$: Observable<Structures.Interfaces.ICLResponse<IBusinessPartner>> | null = null;

    if (this.opcionesMenuForm.controls['Opcion'].value === '1') {
      updateOrCreate$ = this.businessPartnersService.Post(businesspartner);
    } else {
      updateOrCreate$ = this.businessPartnersService.Patch(businesspartner);
    }

    updateOrCreate$
      .pipe(
        switchMap(res => {
          this.overlayService.Drop();
          return this.modalService.Continue({
            title: !this.currentBp ? 'Cliente creado correctamente' : 'Cliente actualizado correctamente',
            type: CLModalType.SUCCESS
          })
        }),
        finalize(() => {
          this.detectChanges = false;
          this.disabled = false;
          this.overlayService.Drop()
        })
      ).subscribe({
      next: (callback) => {
        this.ResetDocument();
        this.bpformAux = this.businessPartnersForm.value;
      },
      error: (err) => {
        this.modalService.Continue({
          title: !this.currentBp ? 'Se produjo un error creando el cliente' : 'Se produjo un error actualizando el cliente',
          subtitle: GetError(err),
          type: CLModalType.ERROR
        });
      }
    });
  }

  public AddFile(): void {
    const fileInput: HTMLInputElement = this.fileInput.nativeElement;
    fileInput.click();
  }

  /**
   * This method is used to add file of window explorer
   * @param _event
   * @constructor
   */
  public AttachFile(_event: Event): void {

    try {
      const inputElement = _event.target as HTMLInputElement;


      if (inputElement.files) {
        const files = Array.from(inputElement.files);

        let extensions: string[] = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'txt', 'xls', 'ppt', 'xlsx', 'pptx'];

        let file = files.find(element => !extensions.includes(element.name.split('.')[1]))

        if (file) {
          this.alertsService.Toast({
            type: CLToastType.INFO,
            message: `La extensión del archivo ${file.name} no es permitida.`
          });
          return;
        }

        files.forEach((file, index) => {

          const lastModifiedDate = new Date(file.lastModified);
          let formattedDate = `${lastModifiedDate.getFullYear()}-${lastModifiedDate.getMonth() + 1}-${lastModifiedDate.getDate()}`;

          let fileName = file.name.split('.');

          this.anexosFiles.push({
            Id: this.anexosFiles.length === 0 ? index + 1 : this.anexosFiles.length + 1,
            FileName: fileName[0],
            FreeText: '',
            AttachmentDate: formattedDate,
            FileExtension: fileName.length === 2 ? fileName[1] : ''
          } as IAttachments2Line)
        });

        this.anexosFilesUpload = this.anexosFilesUpload.concat(files);
        inputElement.value = '';

        this.InflateTableAnexos();
      }
    }catch (e) {

    }

  }

  private ResetDocument(): void {
    try {
      this.udfsValue = [];
      this.TabIndex = 0;
      this.currentBp = null;
      if (this.opcionesMenuForm.controls['Opcion'].value === '1') {
        this.opcionesMenuForm.controls['Opcion'].setValue('2');
      }
      this.detectChanges = false;
      this.businessPartnerFormControl.reset();
      this.businessPartnersForm.reset();
      this.CleanFields();
    } catch (Exception) {
      CLPrint(Exception, CL_DISPLAY.ERROR);
    }
  }

  private CleanFields(): void {
    if (this.isVisible) {
      this.linkerService.Publish({
        Target: this.UdfsId,
        Data: '',
        CallBack: CL_CHANNEL.RESET
      });
    }
  }

  /**
   * Method to obtain the selected elements from the properties table.
   * @param _event -Elements selected in the table
   * @constructor
   */
  private SaveProperties = (_event: ICLEvent): void => {
    let properties = JSON.parse(_event.Data) as IBPProperties[];

    this.properties.forEach(element => {
      if (properties.some(x => x.Id === element.Id)) {
        element.Value = 'tYES';
      } else {
        element.Value = 'tNO';
      }
    });

    let data = {
      CardCode: this.currentBp?.CardCode,
      PropertiesList: this.properties
    } as IPatchProperties

    this.overlayService.OnPost();
    this.businessPartnersService.PostProperties(data).pipe(
      switchMap(res => {
        this.overlayService.Drop();
        return this.modalService.Continue({
          title: 'Propiedades actualizadas correctamente',
          type: CLModalType.SUCCESS
        })
      }),
      finalize(() => this.overlayService.Drop())
    ).subscribe({
      next: (callback) => {
        this.bpProperty = null;
        this.detectChanges = false;
        this.propertiesAux = this.properties.map(element => ({...element}));
      },
      error: (err) => {
        this.modalService.Continue({
          title: 'Se produjo un error actualizando las propiedades',
          subtitle: GetError(err),
          type: CLModalType.ERROR
        })
      }
    })

  }

  /**
   * Show business partner search modal
   * @constructor
   */
  ShowModalSearchBusinnesPartner(): void
  {
    this.matDialog.open(SearchModalComponent, {
      width: '65%',
      height: "80%",
      data: {
        Id: this.searchModalId,
        ModalTitle: 'Lista de socios de negocios',
        MinInputCharacters: 2,
        InputDebounceTime: 200,
        ShouldPaginateRequest : true,
        TableMappedColumns: {
          IgnoreColumns: ['Id','Vendedor','GroupCode','CardType','Phone1','PayTermsGrpCode','DiscountPercent','MaxCommitment','FederalTaxID','PriceListNum','SalesPersonCode','Currency','EmailAddress','Series','CashCustomer',
            'TypeAheadFormat','TypeIdentification','Provincia','Canton','Distrito','Barrio','Direccion','Frozen','Valid','FatherType','FatherCard','ConfigurableFields','BPAddresses','Udfs','IsCompanyDirection','ShipToDefault','BilltoDefault','AttachmentEntry','CreateDate','Device'],
          RenameColumns: {
            CardName: 'Nombre',
            CardCode: 'Codigo',
          }
        }
      } as ISearchModalComponentDialogData<IBusinessPartner>
    }).afterClosed()
      .subscribe({
        next: (value) => {
          if(value){
            this.OnSelectOption(value);

          }
        }
      });
  }

  /**
   * Show consolidation business partner search modal
   */
  ShowModalConsolidationBusinnesPartner(): void
  {
    this.matDialog.open(SearchModalComponent, {
      width: '65%',
      height: "80%",
      data: {
        Id: this.searchModalId,
        ModalTitle: 'Lista de socios de negocios',
        MinInputCharacters: 2,
        InputDebounceTime: 200,
        ShouldPaginateRequest : true,
        TableMappedColumns: {
          IgnoreColumns: ['Id','Vendedor','GroupCode','CardType','Phone1','PayTermsGrpCode','DiscountPercent','MaxCommitment','FederalTaxID','PriceListNum','SalesPersonCode','Currency','EmailAddress','Series','CashCustomer',
            'TypeAheadFormat','TypeIdentification','Provincia','Canton','Distrito','Barrio','Direccion','Frozen','Valid','FatherType','FatherCard','ConfigurableFields','BPAddresses','Udfs','IsCompanyDirection','ShipToDefault','BilltoDefault','AttachmentEntry','CreateDate','Device'],
          RenameColumns: {
            CardName: 'Nombre',
            CardCode: 'Codigo',
          }
        }
      } as ISearchModalComponentDialogData<IBusinessPartner>
    }).afterClosed()
      .subscribe({
        next: (value) => {
          if(value){
            this.businessPartnersForm.controls['ConsolidationBP'].setValue(value?.CardCode);
          }
        }
      });
  }

  public OnSelectOption = (_businessP: IBusinessPartner): void => {

    this.overlayService.OnGet();
    this.masterDataBusinessPartnersService.Get<IBusinessPartner>(_businessP.CardCode).pipe(
      concatMap(callback => {
        if (callback?.Data) {
          this.businessPartnerFormControl.setValue(`${_businessP.CardCode} - ${_businessP.CardName}`);

          this.actionButtons = [];
          this.actionButtons = [
            {
              Key: 'ADD',
              MatIcon: 'edit',
              Text: 'Actualizar',
              MatColor: 'primary',
              DisabledIf: (_form?: FormGroup) => _form?.invalid || false
            },
            {
              Key: 'CLEAN',
              MatIcon: 'mop',
              Text: 'Limpiar'
            }
          ];

          this.currentBp = callback.Data;
          this.businessPartnersForm.patchValue(callback.Data);
          this.businessPartnersForm.controls['Frozen'].setValue(this.currentBp.Frozen === 'tNO');
          this.businessPartnersForm.controls['ConsolidationBP'].setValue(this.currentBp?.FatherCard);
          this.bpformAux = this.businessPartnersForm.value;
        }

        return of([]);

      }),
      switchMap(callback => {
        if (callback) {

          let udfKey = {
            CardCode: this.businessPartnersForm.controls['CardCode'].value,
            TypeDocument: this.DBODataEndPoint
          } as IFilterKeyUdf;

          return this.udfsService.GetUdfsData(udfKey).pipe(
            map(res => res.Data),
            catchError(err => {
              return of({} as IUdf[]);
            }));
        } else {
          return of(null)
        }
      }),
      finalize(() => this.overlayService.Drop())
    ).subscribe({
      next: (callback) => {
        this.udfsDataHeader = callback || [];
        if (this.udfsDataHeader && this.udfsDataHeader.length > 0) {
          this.SetUDFsValues();
        }
      },
      error: (err) => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
      }
    });
  }

  private ChangeTapp(tabChangeEvent: number): void {
    this.TabIndex = tabChangeEvent;
    switch (this.TabIndex) {

      case 0:

        this.actionButtons = [
          {
            Key: 'ADD',
            MatIcon: 'edit',
            Text: 'Actualizar',
            MatColor: 'primary',
            DisabledIf: (_form?: FormGroup) => _form?.invalid || false
          },
          {
            Key: 'CLEAN',
            MatIcon: 'mop',
            Text: 'Limpiar'
          }
        ];
        this.businessPartnersForm.patchValue(this.bpformAux);
        break;

      case 1:
        this.actionButtons = [
          {
            Key: 'ADD_PROPERTIES',
            MatIcon: 'edit',
            Text: 'Actualizar',
            MatColor: 'primary',
          },
          {
            Key: 'CLEAN',
            MatIcon: 'mop',
            Text: 'Limpiar'
          }
        ];
        this.SearchProperties();
        break;

      case 2:

        this.actionButtons = [
          {
            Key: 'ADD_ANEXOS',
            MatIcon: 'edit',
            Text: 'Actualizar',
            MatColor: 'primary'
          },
          {
            Key: 'EXPLORER',
            MatIcon: 'attach_file',
            Text: 'Adjuntar',
            MatColor: 'primary'
          }, {
            Key: 'CLEAN',
            MatIcon: 'mop',
            Text: 'Limpiar'
          }
        ];
        this.GetAnexos()

        break;

      case 3:

        this.actionButtons = [
          {
            Key: 'ADD_ADDRESS',
            MatIcon: 'edit',
            Text: 'Actualizar',
            MatColor: 'primary',
            DisabledIf: (_form?: FormGroup) => _form?.invalid || false
          }, {
            Key: 'CLEAN',
            MatIcon: 'mop',
            Text: 'Limpiar'
          }];
        this.actionButtonsAddress = [
          {
            Key: 'ADD',
            MatIcon: 'add',
            Text: 'Agregar'
          }
        ];
        this.addressBusinessPartnerForm.reset();
        this.addressAux = null;
        this.SearchAddress();

        break;
    }
  }

  private ChangesPropertiesValid(): void {
    this.detectChanges = this.properties.some(x => x.IsActive !== this.propertiesAux.find(y => y.Id === x.Id)?.IsActive);
  }

  public TabChange(tabChangeEvent: number): void {

    if (this.TabIndex !== tabChangeEvent) {

      if (this.TabIndex === 0) {
        this.ChangesBP();
      }

      if (this.TabIndex === 1) {
        this.ChangesPropertiesValid();
      }

      if (this.TabIndex === 2) {
        this.ChangesAnexos();
      }

      if (this.TabIndex === 3) {
        this.ChangesAddress();
      }

      if (this.detectChanges) {
        this.modalService.CancelAndContinue({
          title: 'Desea descartar los cambios?',
          type: CLModalType.QUESTION
        }).pipe(
          filter(res => {
            if (res) {
              return true;
            } else {
              this.tabGroup.selectedIndex = this.TabIndex;
              return false;
            }
          }),
        ).subscribe({
          next: () => {
            this.detectChanges = false;
            this.ChangeTapp(tabChangeEvent);
          },
          error: (err) => {
            this.alertsService.ShowAlert({HttpErrorResponse: err});
          }
        });
      } else {
        this.ChangeTapp(tabChangeEvent);
      }
    }
  }

  private SearchProperties(): void {
    this.linkerService.Publish({
      CallBack: CL_CHANNEL.PRE_REQ_RECORDS,
      Target: this.tablePropiedadesId,
      Data: ''
    });
  }

  public SearchAddress(): void {
    this.linkerService.Publish({
      CallBack: CL_CHANNEL.PRE_REQ_RECORDS,
      Target: this.tableAddressId,
      Data: ''
    });
  }

  public GetData(_addressConfiguration: IBusinessPartnersFields): void {

    switch (_addressConfiguration.Description) {
      case 'Provincia':
        this.provinciaName = _addressConfiguration.NameSL;
        break;
      case 'Canton':
        this.cantonName = _addressConfiguration.NameSL;
        break;
      case 'Distrito':
        this.districtName = _addressConfiguration.NameSL;
        break;
    }

    switch (_addressConfiguration.Description) {
      case 'Provincia':
        this.GetCantons(this.provinciaName);
        break;
      case 'Canton':
        this.GetDistrics(this.provinciaName, this.cantonName);
        break;
      case 'Distrito':
        this.GetNeighborhood(this.provinciaName, this.cantonName, this.districtName);
        break;
    }
  }

  private InflateTable(): void {
    const NEXT_TABLE_STATE = {
      CurrentPage: 0,
      ItemsPeerPage: 5,
      Records: this.addressList,
      RecordsCount: this.addressList.length,
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(NEXT_TABLE_STATE),
      Target: this.tableAddressId
    });
  }

  private InflateTableAnexos(): void {

    const NEXT_TABLE_STATE = {
      CurrentPage: 0,
      ItemsPeerPage: 10,
      Records: this.anexosFiles,
      RecordsCount: this.anexosFiles.length,
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(NEXT_TABLE_STATE),
      Target: this.tableAnexosId
    });
  }

  private InflateTableProperties(): void {
    const NEXT_TABLE_STATE = {
      CurrentPage: 0,
      ItemsPeerPage: 5,
      Records: this.properties,
      RecordsCount: this.properties.length,
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(NEXT_TABLE_STATE),
      Target: this.tablePropiedadesId
    });
  }
  //Send information to search-modal component
  private InflateTableBusinnesPartner(): void {
    const NEXT_TABLE_STATE = {
      CurrentPage: 0,
      ItemsPeerPage: 5,
      Records: this.businessPartner,
      RecordsCount: this.businessPartner.length,
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(NEXT_TABLE_STATE),
      Target: this.searchModalId
    });
  }

  public SetValueUDF(_key: string, _value: string): void {

    for (let i = 0; i < this.FieldsBusinessPartner.length; i++) {
      if (this.FieldsBusinessPartner[i].Id === _key) {
        switch (_key) {
          case 'Provincia':
            if (this.FieldsBusinessPartner[i].FieldType === "Int32") {
              this.FieldsBusinessPartner[i].Value = this.businessPartnersForm.get('Provincia')?.value;
            } else {
              this.FieldsBusinessPartner[i].Value = _value;
            }
            break;
          case 'Canton':
            if (this.FieldsBusinessPartner[i].FieldType === "Int32") {
              this.FieldsBusinessPartner[i].Value = this.businessPartnersForm.get('Canton')?.value;
            } else {
              this.FieldsBusinessPartner[i].Value = _value;
            }
            break;
          case 'Distrito':
            if (this.FieldsBusinessPartner[i].FieldType === "Int32") {
              this.FieldsBusinessPartner[i].Value = this.businessPartnersForm.get('Distrito')?.value;
            } else {
              this.FieldsBusinessPartner[i].Value = _value;
            }
            break;
          case 'Barrio':
            if (this.FieldsBusinessPartner[i].FieldType === "Int32") {
              this.FieldsBusinessPartner[i].Value = this.businessPartnersForm.get('Barrio')?.value;
            } else {
              this.FieldsBusinessPartner[i].Value = _value;
            }
            break;
          default:
            this.FieldsBusinessPartner[i].Value = _value;

        }
      }
    }
  }

  public ValidateBusinessPartner(): void {

    if (+(this.businessPartnersForm.controls['FederalTaxID'].value !== '')) {
      const BP = this.businessPartner.find(x => x.FederalTaxID == this.businessPartnersForm.controls['FederalTaxID']?.value);
      if (BP) {
        this.OnSelectOption(BP);
      }
    }
  }

  public SaveAddress(_value: IBPAddresses): void {

    const keys = Object.entries(this.addressBusinessPartnerForm.value)
      .filter(([key, value]) => this.fieldsConfiguredDirection.some(x => x.NameSL === key));

    if (keys && keys.length > 0) {
      _value.ConfigurableFields = [];
      keys.forEach(([key, value], index) => {
        _value.ConfigurableFields.push({
          NameSL: key,
          Value: value
        } as IBusinessPartnersFields)
      });
    }

    if (this.id === 0) {

      _value.InDB = false;
      _value.Id = this.addressList.length + 1;
      this.addressList.push(_value);

    } else {

      this.actionButtonsAddress = [
        {
          Key: 'ADD',
          MatIcon: 'add',
          Text: 'Agregar'
        }
      ];

      let index = this.addressList.findIndex(x => x.Id === this.id);
      _value.Id = this.id;

      if (this.addressAux) {
        _value.AddressType = this.addressAux.AddressType;
        _value.RowNum = this.addressAux.RowNum
        _value.BPCode = this.addressAux.BPCode;
        _value.InDB = this.addressAux.InDB;
        _value.RowColor = this.addressAux.RowColor;
        _value.IsDefault = this.addressAux.IsDefault;
      }

      if (index >= 0) {
        this.addressList[index] = _value;
      }

    }

    this.addressBusinessPartnerForm.reset();
    this.id = 0;

    this.InflateTable();

  }

  //#region Provicia, Canton, Distrito, Barrio
  public GetProvinces(): void {

    forkJoin({
      Province: this.jsonDataService.GetJsonProvinces(),
      Locations: this.jsonDataService.GetJsonLocations()
    }).pipe(
      map(callback => {

        this.provinceList = callback.Province.Provinces;
        this.directionsList = callback.Locations.Country;

      })
    ).subscribe({});

  }

  public GetCantons(_provinciaName: string): void {
    if (!this.addressBusinessPartnerForm.get(_provinciaName)?.value) return;

    this.cantonList = [];
    this.cantonList = this.directionsList;
    this.cantonList = this.cantonList.filter(x => x.ProvinceId === this.addressBusinessPartnerForm.get(_provinciaName)?.value);
    this.cantonList = this.cantonList.filter(
      (e, i) => this.cantonList.findIndex((a) => a.CantonId === e.CantonId) === i);
  }

  public GetDistrics(_provinciaName: string, _cantonName: string): void {

    this.districtList = [];
    this.districtList = this.directionsList;
    this.districtList = this.districtList.filter(x => x.ProvinceId === this.addressBusinessPartnerForm.get(_provinciaName)?.value && x.CantonId === this.addressBusinessPartnerForm.get(_cantonName)?.value);
    this.districtList = this.districtList.filter(
      (e, i) => this.districtList.findIndex((a) => a.DistrictId === e.DistrictId) === i);
  }


  /**
   * Method that is executed when changing menu selection
   * @param _value - Value selected in the menu
   * @constructor
   */
  public OpcionMenu(_value: string): void {
    if (_value === '1') {
      this.disabled = true;
      this.businessPartner = [];
      this.currentBp = null;
      this.businessPartnersForm.reset();
      this.businessPartnersForm.patchValue({
        Frozen: true,
        PriceListNum: this.priceList[0]?.ListNum,
        PayTermsGrpCode: this.payTerms[0].GroupNum,
        GroupCode: this.bpsGroup[0].Code,
        FatherType: this.socioComercial.find(x => x.IsDefault)?.Code,
        Currency: this.bpCurrencies[0].Id,
        MaxCommitment: 0,
        DisCountPercent: 0
      });

      this.disabledConsolidationField = true;

      this.CleanFields();
      this.actionButtons = [
        {
          Key: 'ADD',
          MatIcon: 'save',
          Text: 'Crear',
          MatColor: 'primary',
          DisabledIf: (_form?: FormGroup) => _form?.invalid || false
        },
        {
          Key: 'CLEAN',
          MatIcon: 'mop',
          Text: 'Limpiar'
        }
      ];
    } else {
      this.actionButtons = [
        {
          Key: 'ADD',
          MatIcon: 'edit',
          Text: 'Actualizar',
          MatColor: 'primary',
          DisabledIf: (_form?: FormGroup) => _form?.invalid || false
        },
        {
          Key: 'CLEAN',
          MatIcon: 'mop',
          Text: 'Limpiar'
        }
      ];
      this.disabled = false;
      this.disabledConsolidationField = false;
      this.CleanMatTab();

      this.overlayService.OnGet();
      this.seriesService.GetIsSerial(this.userAssingId, this.businessPartnersForm.controls['CardType'].value === 'C' ? ObjectType.BusinessPartnerCustomer : ObjectType.BusinessPartnerVendor, this.selectedCompany?.Id || 0)
        .pipe(
          finalize(() => this.overlayService.Drop())
        ).subscribe({
        next: (callback) => {
          this.IsSerial = callback.Data?.IsSerial ?? false;
          this.UpdateValidators();
        }
      });

    }
  }

  private ChangesAnexos(): void {
    if (this.anexosFilesUpload && this.anexosFilesUpload.length > 0) {
      this.detectChanges = true;
    }
  }

  private ChangesAddress(): void {
    for (const key in this.addressBusinessPartnerForm.value) {
      if (this.addressBusinessPartnerForm.value[key]) {
        this.detectChanges = true;
        return;
      }

    }

    if (this.addressAux) {
      this.detectChanges = true;
      return;
    }

    this.detectChanges = this.addressList.some(x => !x.InDB);

  }

  public GetMessage(_valueTap: string): string {
    if (this.opcionesMenuForm.controls['Opcion'].value === '1') {
      return `Primero cree un socio para habilitar ${_valueTap}`;
    } else if (!this.currentBp && this.opcionesMenuForm.controls['Opcion'].value === '2') {
      return `Seleccione un socio para habilitar ${_valueTap}`;
    } else {
      return '';
    }
  }

  public GetNeighborhood(_provinciaName: string, _cantonName: string, _districtName: string): void {

    this.neighborhoodList = [];
    this.neighborhoodList = this.directionsList;
    this.neighborhoodList = this.neighborhoodList.filter(x => +(x.ProvinceId) === +(this.addressBusinessPartnerForm.get(_provinciaName)?.value)
      && x.CantonId === this.addressBusinessPartnerForm.get(_cantonName)?.value
      && x.DistrictId === this.addressBusinessPartnerForm.get(_districtName)?.value);
    this.neighborhoodList = this.neighborhoodList.filter(
      (e, i) => this.neighborhoodList.findIndex((a) => a.NeighborhoodId === e.NeighborhoodId) === i);


  }

  /**
   * Filtrar campos no configurados desde companias
   * @param _fieldType
   */
  public FilterFields(_fieldType: any): boolean {
    let list = Object.keys(_fieldType);
    return list.some(x => x === 'FieldType');
  }

  //#endregion


  //#region Udfs
  SetUDFsValues(): void {
    this.linkerService.Publish({
      Target: this.UdfsId,
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(this.udfsDataHeader)
    });
  }

  public ContentUdf = (_event: ICLEvent): void => {
    let udfs: DynamicsUdfPresentation.Structures.Interfaces.IUdf[] = JSON.parse(_event.Data);
    this.isVisible = udfs.length > 0;
  }

  OnClickUdfEvent = (_event: ICLEvent): void => {
    this.udfsValue = JSON.parse(_event.Data) as IUdfContext[];
    this.SaveChanges();
  }

  GetConfiguredUdfs(): void {
    this.linkerService.Publish({
      CallBack: CL_CHANNEL.DATA_LINE_1,
      Data: '',
      Target: this.UdfsId
    });
  }

  public GetStates(_code: string): void {

    this.overlayService.OnGet();
    this.CountryService.GetStates(_code).pipe(
      finalize(() => this.overlayService.Drop())
    ).subscribe({
      next: (data) => {
        this.states = data.Data;
      },
      error: (error) => {
        this.alertsService.ShowAlert({HttpErrorResponse: error});
      }
    });

  }

  //#endregion

  /**
   * METODO PARA VALIDAR QUE NO SE PERMITAN AGREGAR ITEMS DESDE EL TAB DE EBUSQUEDA Y EDICION
   * @constructor
   * @private
   */
  public EnableOrDisableFields(): boolean {
    if (this.opcionesMenuForm.controls['Opcion'].value === '2') {
      if (this.businessPartnerFormControl.value) {
        return false
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  /**
   * Checks if the user has a specific permission.
   * @param permission - The name of the permission to validate.
   * @returns boolean if the user has the permission.
   */
  CheckUserHasPermission(permission: string): boolean {
    const hasPermission: boolean = this.permissionsUserMap[permission];

    if(!hasPermission){
      return true // If you do not have permission, return TRUE to disable the field.
    }

    // You have the permission and continue the logic of the following method
    return this.EnableOrDisableFields();
  };

}
