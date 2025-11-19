import { ComponentType } from '@angular/cdk/portal';
import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertsService, CLModalType, CLToastType, ModalService } from '@clavisco/alerts';
import { CLPrint, DownloadBase64File, GetError, Structures } from '@clavisco/core';
import { CL_CHANNEL, ICLCallbacksInterface, ICLEvent, LinkerService, Register, Run, StepDown } from '@clavisco/linker';
import { OverlayService } from '@clavisco/overlay';
import { DropdownList, ICLTableButton, MapDisplayColumns, MappedColumns } from '@clavisco/table';
import { finalize, Observable, Subscription } from 'rxjs';
import { LinkerEvent } from '@app/enums/e-linker-events';
import { PrintFormat, SettingCode } from 'src/app/enums/enums';
import { IActionButton } from '@app/interfaces/i-action-button';
import { ICompany, IPrintFormatFile } from '@app/interfaces/i-company';
import {
  IAccountSetting,
  IAdjustmentInventorySetting,
  IDecimalSetting,
  IDefaultBusinessPartnerSetting, IConfiguredFieldsSetting,
  IMarginSetting,
  IMemoryInvoiceSetting,
  IPaymentSetting,
  IReportManagerSetting,
  IRouteSetting,
  ITypeaheadPatternSetting,
  IValidateInventorySetting,
  ILineModeSetting, IBusinessPartnersFields,
  IMargin,
  IPrintFormatSetting,
  IValidateInventory,
  IValidateLine,
  IFieldsPurchaseInvoiceSetting,
  IValidateAttachmentsSetting,
  IValidateAttachmnet,
  INotificationsDraftsSetting, IValidateAutomaticPrinting, IValidateAutomaticPrintingsSetting
} from "../../../interfaces/i-settings";
import { IConection } from '@app/interfaces/i-conection';
import { IDBResource, IDBResourceType } from '@app/interfaces/i-db-resource';
import { ICompanyDialogData } from '@app/interfaces/i-dialog-data';
import {
  ICompanyComponentResolvedData,
  ICompanyConectionComponentResolvedData,
  ICompanyConfigurationComponentResolvedData,
  IConectionsResolvedData,
  IDBResourceResolvedData,
  IDiscountHierarchiesResolvedData,
  IFieldsConfiguredResolveData,
  ILoyaltyPlanResolveData
} from '@app/interfaces/i-resolvers';
import {
  IValidateAttachmentsTable,
  IValidateInventoryTable
} from '@app/interfaces/i-items';
import {
  IEventViewerSetting,
  IFieldsInvoiceSetting,
  IMobileAppSetting,
  ISchedulingSetting,
  ISettings,
  IShareFolderSetting,
  ITypeaheadTag,
} from '@app/interfaces/i-settings';
import { CompanyService } from '@app/services/company.service';
import { SettingsService } from '@app/services/settings.service';
import { SharedService } from '@app/shared/shared.service';
import { DbResourcesEditComponent } from '@Component/maintenance/companies/db-resources-edit/db-resources-edit.component';
import { formatDate } from '@angular/common';
import Validation from "@app/custom-validation/custom-validators";
import { PrintFormatsService } from "@app/services/print-formats.service";
import { IDownloadBase64 } from "@app/interfaces/i-files";
import {
  ILealtoConfig,
  ILealtoConfigBase,
  ILoyaltyPlan,
  IPlanCard,
  ITappConfig,
  ITappConfigBase
} from "@app/interfaces/i-loyalty-plan";
import { DropdownElement } from "@clavisco/table/lib/table.space";
import { IDiscountHierarchy } from "@app/interfaces/i-discount-hierarchy";
import { DiscountHierarchiesService } from "@app/services/discount-hierarchies.service";
import { MatDatepicker } from "@angular/material/datepicker";
import { DbResourcesAddComponent } from './db-resources-add/db-resources-add.component';

@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.scss']
})
export class CompaniesComponent implements OnInit, OnDestroy, AfterViewInit {

  // #region General variables

  companiesTabIndex: number = 0;
  compInEditionTabIndex: number = 0;
  companies!: ICompany[];
  allSubscriptions: Subscription;
  formTap!: FormGroup;
  companyForm!: FormGroup;
  recaptchaFrom!: FormGroup;
  companyReportForm!: FormGroup;
  rutaForm = new FormControl('');
  companyPrintFormat: IPrintFormatSetting[] = [];
  printFormatFiles: IPrintFormatFile = {} as IPrintFormatFile;
  companyId: number = 0;
  settings!: ISettings[];

  // #endregion

  // #region Loyalty Plans

  loyaltyPlan!: ILoyaltyPlan;
  settingPoints!: ISettings;
  activePlan: boolean = false;
  lealtoSelect: boolean = false;
  tappSelect: boolean = false;
  lealtoForm!: FormGroup;
  tappForm!: FormGroup;
  loyaltyPlanForm!: FormGroup;
  loyaltyPlanActiveForm!: FormControl;

  // #endregion

  // #region Forms and settings

  companyAccount: IAccountSetting[] = [];
  accountForm!: FormGroup;
  connections!: IConection[];

  reportManagerForm!: FormGroup;
  companyReportManager: IReportManagerSetting[] = [];

  routeForm!: FormGroup;
  companyRoute: IRouteSetting[] = [];

  defaultBusinessPartnerForm!: FormGroup;
  companyDefaultBusinessPartner: IDefaultBusinessPartnerSetting[] = [];

  decimalForm!: FormGroup;
  companyDecimal: IDecimalSetting[] = [];

  paymentForm!: FormGroup;
  companyPayment: IPaymentSetting[] = [];

  adjustmentInventoryForm!: FormGroup;
  companyAdjustmentInventory: IAdjustmentInventorySetting[] = [];

  memoryInvoiceForm!: FormGroup;
  companyMemoryInvoice: IMemoryInvoiceSetting[] = [];

  // #endregion

  // #region @clavisco/table Companies

  companyTableId: string = 'COMPANY-TABLE';
  shouldPaginateRequestAddress: boolean = false;
  shouldPaginateRequestResource: boolean = false;
  hasStandardHeaders: boolean = true;
  shouldSplitPascal: boolean = false;
  mappedColumnsCompany: MappedColumns;
  hasItemsSelection: boolean = false;
  isEdit: boolean = false;
  buttons: ICLTableButton[] = [
    {
      Title: `Editar`,
      Action: Structures.Enums.CL_ACTIONS.UPDATE,
      Icon: `edit`,
      Color: `primary`,
      Data: ''
    }
  ]

  // #endregion

  // #region @clavisco/table DBResources

  dbResourceTableId: string = "DBRESOURCES-TABLE";
  dbResources!: IDBResource[];
  dbResourceTypes!: IDBResourceType[];
  
  dbResourceTableMappedColumns!: MappedColumns;
  dbResourceTableColumns: { [key: string]: string } = {
    Id: 'ID',
    Code: 'Código',
    Description: 'Descripción',
    DBObject: 'Objeto',
    TypeDescription: 'Tipo',
    Active: 'Activo'
  };
  dbResourcesFormFilters!: FormGroup;
  filteredDbResources!: IDBResource[];

  // #endregion

  actionButtonsResource!: IActionButton[];
  actionButtonsAddResource!: IActionButton[];
  actionButtons!: IActionButton[];
  vldInventoryCompany: IValidateInventorySetting[] = [];
  vldAttachmentsCompany: IValidateAttachmentsSetting[] = [];
  vldAutomaticPrintingCompany: IValidateAutomaticPrintingsSetting[] = [];
  validateInventoryTables!: IValidateInventory[];
  validateAttachmentsTables!: IValidateAttachmnet[];
  validateAutomaticPrintingTables!: IValidateAutomaticPrinting[];

  validateInventoryTableId: string = "VALIDATE-INVENTORY-TABLE-ID";
  validateAttachmentsTableId: string = "VALIDATE-ATTACHMENTS-TABLE-ID";
  validateAutomaticPrintingTableId: string = "VALIDATE-AUTOMATIC-PRINTING-TABLE-ID";

  validateInventoryTableColumns: { [key: string]: string } = {
    Table: 'Code',
    Description: 'Descripción',
    ValidateInventory: 'Válida inventario',
    ValidateBatchesInventory: 'Válida inventario lotes'
  };
  validateAttachmentsTableColumns: { [key: string]: string } = {
    Table: 'Code',
    Description: 'Descripción',
    Active: 'Activo'
  };
  validateAutomaticPrintingColumns: { [key: string]: string } = {
    Table: 'Code',
    Description: 'Description',
    Active: 'Activo'
  };

  vldInventoryTableCheckboxColumns: string[] = ['ValidateInventory', 'ValidateBatchesInventory'];
  vldAttachmentsTableCheckboxColumns: string[] = ['Active'];
  vlAutomaticPrintingTableCheckboxColumns: string[] = ['Active'];

  vldInventoryTableMappedColumns!: MappedColumns;
  vldAttachmentTableMappedColumns!: MappedColumns;
  vldAutomaticPrintingTableMappedColumns!: MappedColumns;

  vldLineModeCompany: ILineModeSetting[] = [];
  vldLineTables!: IValidateLine[];
  vldLineTableId: string = "VALIDATE-LINE-TABLE-ID";
  vldLineTableColumns: { [key: string]: string } = {
    Table: 'Code',
    Description: 'Descripción',
    LineGroup: 'Agrupación línea',
    LineMode: 'Orden línea'
  };
  vldLineTableCheckboxColumns: string[] = ['LineGroup', 'LineMode'];
  vldLineTableMappedColumns!: MappedColumns;


  marginCompany: IMarginSetting[] = [];
  margin: IMargin[] = [];
  marginTableId: string = "MARGIN-TABLE-ID";
  marginTableColumns: { [key: string]: string } = { Table: 'Code', Description: 'Descripción', Margin: 'Margen %' };
  marginTableMappedColumns!: MappedColumns;

  typeAheadItemTag: ITypeaheadTag[] = [];
  typeAheadBusinessPartnersTag: ITypeaheadTag[] = [];

  typeaheadForm!: FormGroup;
  companyTypeahead: ITypeaheadPatternSetting[] = [];
  companyLogoFieldText: string = 'Arrastre el logotipo en esta sección o de click para adjuntarlo';

  // #region Table fields configured Business Partner

  settingsFieldsConfiguredSAP!: ISettings;
  fieldBusinessPartnerCompany: IConfiguredFieldsSetting[] = [];
  fieldBusinessPartner: IBusinessPartnersFields[] = [];
  fielsBusinessPartnerTableId: string = "FIELDBP-TABLE";
  fieldBusinessPartnerMappedColumns: MappedColumns;
  dropdownColumns: string[] = ['FieldType'];
  IsCompanyDirection = new FormControl(false);
  fieldBusinessPartnerTableCheckboxColumns: string[] = ['IsObjDirection'];
  FieldTypeBusinessPartner = [
    { key: '', value: '', by: '' },
    { key: 'String', value: 'String', by: '' },
    { key: 'Int32', value: 'Int32', by: '' },
    { key: 'Double', value: 'Double', by: '' },
    { key: 'DateTime', value: 'DateTime', by: '' },
  ] as DropdownElement[];

  dropdownList: DropdownList = {
    FieldType: this.FieldTypeBusinessPartner
  };

  // #endregion

  passwordBtnVisibilityIcon: string = 'visibility_off';
  passwordInputType: string = 'password';
  mobileAppConfigurationsForm!: FormGroup;
  schedulingConfigurationForm!: FormGroup;
  eventViewerConfigurationForm!: FormGroup;
  fieldsInvoiceConfigurationForm!: FormGroup;
  fieldsPurchaseInvoiceConfigurationForm!: FormGroup;
  discountHierarchies: IDiscountHierarchy[] = [];

  tappExpirationDateYearAndMonth: string = '';
  lealtoExpirationDateYearAndMonth: string = '';
  fieldsNotificationsForm!: FormGroup;

  @ViewChild('datepicker') public monthAndYearPicker?: MatDatepicker<Date>;

  // #region @clavisco/linker

  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };

  // #endregion

  constructor(
    @Inject('LinkerService') private linkerService: LinkerService,
    private activatedRoute: ActivatedRoute,
    private sharedService: SharedService,
    private router: Router,
    private alertsService: AlertsService,
    private fb: FormBuilder,
    private overlayService: OverlayService,
    private companyService: CompanyService,
    private settingsService: SettingsService,
    private printFormatsService: PrintFormatsService,
    private discountHierarchiesService: DiscountHierarchiesService,
    private matDialog: MatDialog,
    private modalService: ModalService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.allSubscriptions = new Subscription();

    this.mappedColumnsCompany = MapDisplayColumns(
      {
        dataSource: [] as ICompany[],
        stickyColumns: [
          { Name: 'Options', FixOn: 'right' }
        ],
        renameColumns: { Id: 'ID', DatabaseCode: 'Código', Name: 'Nombre', Active: 'Activo' },
      }
    );

    this.dbResourceTableMappedColumns = MapDisplayColumns({
      dataSource: [] as IDBResource[],
      stickyColumns: [
        { Name: 'Options', FixOn: 'right' }
      ],
      renameColumns: this.dbResourceTableColumns
    });

    this.vldInventoryTableMappedColumns = MapDisplayColumns({
      dataSource: [] as IValidateInventoryTable[],
      stickyColumns: [
        { Name: 'Options', FixOn: 'right' }
      ],
      renameColumns: this.validateInventoryTableColumns
    });

    this.vldAttachmentTableMappedColumns= MapDisplayColumns({
      dataSource: [] as IValidateAttachmentsTable[],
      stickyColumns: [
        {Name: 'Options', FixOn: 'right'}
      ],
      renameColumns: this.validateAttachmentsTableColumns
    });

    this.vldAutomaticPrintingTableMappedColumns = MapDisplayColumns({
      dataSource: [] as IValidateAttachmentsTable[],
      stickyColumns: [
        { Name: 'Options', FixOn: 'right' }
      ],
      renameColumns: this.validateAutomaticPrintingColumns
    });

    this.vldLineTableMappedColumns = MapDisplayColumns({
      dataSource: [] as ILineModeSetting[],
      renameColumns: this.vldLineTableColumns,
      ignoreColumns: ['ValidateInventory', 'ValidateBatchesInventory']
    });

    this.marginTableMappedColumns = MapDisplayColumns({
      dataSource: [] as IMarginSetting[],
      renameColumns: this.marginTableColumns,
      stickyColumns: [
        { Name: 'Options', FixOn: 'right' }
      ],
      inputColumns: [{ ColumnName: 'Margin', FieldType: 'number' }],
    });

    this.fieldBusinessPartnerMappedColumns = MapDisplayColumns({
      dataSource: [] as IBusinessPartnersFields[],
      inputColumns: [{ ColumnName: 'NameSL', FieldType: 'text' }],
      stickyColumns: [
        { Name: 'Options', FixOn: 'right' }
      ],
      renameColumns: {
        Description: 'Descripción',
        NameSL: 'Nombre service layer',
        FieldType: 'Tipo',
        IsObjDirection: ' Campo dirección'
      },
      ignoreColumns: ['Id']
    });
  }

  ngAfterViewInit(): void {
    if (this.loyaltyPlan) {
      setTimeout(() => {
        this.SetExpirationDateInputValue();
      })
    }

    this.sharedService.PageInit();
  }

  ngOnInit(): void {
    this.OnLoad();
    this.dbResourceTypes = [];
  }

  ngOnDestroy(): void {
    this.allSubscriptions.unsubscribe();
  }
  
  /**
   * Method that obtains required requests from the component
   * @constructor
   * @private
   */
  private OnLoad(): void {
    this.validateInventoryTables = [];
    this.validateAttachmentsTables = [];
    this.validateAutomaticPrintingTables = [];
    this.vldLineTables = [];
    this.settings = [];
    this.companies = [];
    this.dbResources = [];
    this.filteredDbResources = [];
    this.dbResourceTypes = [];
    this.margin = [];
    this.LoadTypeAheadTag();
    this.LoadForm();

    this.actionButtons = [
      {
        Key: 'ADD-UPDATE',
        MatIcon: 'save',
        Text: 'Crear',
        MatColor: 'primary',
        DisabledIf: (_form?: FormGroup) => _form?.invalid || false
      },
      {
        Key: 'CANCEL',
        MatIcon: 'cancel',
        Text: 'Cancelar',
        MatColor: 'primary'
      }
    ];

    switch (this.sharedService.GetCurrentRouteSegment()) {
      case '/maintenance/companies':
        this.actionButtons = [
          {
            Key: 'ADD',
            MatIcon: 'add',
            Text: 'Agregar',
            MatColor: 'primary',
          }
        ];
        break;
      case '/maintenance/companies/create':
        this.isEdit = true;
        break;
    }

    this.RegisterTableEvents();

    this.allSubscriptions.add(
      this.linkerService.Flow()?.pipe(
        StepDown<CL_CHANNEL>(this.callbacks),
      ).subscribe({
        next: callback => Run(callback.Target, callback, this.callbacks.Callbacks),
        error: error => CLPrint(error, Structures.Enums.CL_DISPLAY.ERROR)
      })
    );

    let Id: number = +(this.activatedRoute.snapshot.paramMap.get("Id") || 0);

    if (Id > 0) {
      this.isEdit = true;
      this.companyId = Id;
    }

    this.HandleResolvedData();
    this.ReadQueryParameters();
  }

  HandleResolvedData(): void {
    this.activatedRoute.data.subscribe({
      next: (data) => {

        //#region datos compania
        const resolvedData: ICompanyComponentResolvedData = data['resolvedData'];

        if (resolvedData) {
          this.companiesTabIndex = 0;


          this.companies = resolvedData.Companys;

          this.companies.forEach(x => {
            x.Active = x.IsActive ? 'Si' : 'No'
          });

          const COMPANIES_STATE = {
            RecordsCount: this.companies.length,
            Records: this.companies
          };

          this.linkerService.Publish({
            CallBack: CL_CHANNEL.INFLATE,
            Data: JSON.stringify(COMPANIES_STATE),
            Target: this.companyTableId
          });
        }
        //#endregion

        //#region Print formats
        const resolvedDataPrintFormat: ICompanyComponentResolvedData = data['resolvedDataPrintFormat'];

        if (resolvedDataPrintFormat) {

          this.companyReportForm.patchValue({ CompanyId: this.companyId});

          this.compInEditionTabIndex = 1;


          this.settings = resolvedDataPrintFormat.Settings;

          let printFormatsSetting = this.settings.find((element) => element.Code == SettingCode.PrintFormat);

          if (printFormatsSetting) {

            this.companyPrintFormat = JSON.parse(printFormatsSetting.Json || '');
          }

          if (this.companyPrintFormat && this.companyPrintFormat.length > 0) {

            let dataCompany = this.companyPrintFormat.find(x => x.CompanyId === this.companyId) as IPrintFormatSetting;

            if (dataCompany) {
              this.companyReportForm.patchValue(dataCompany);
            }
          }

        }
        //#endregion

        //#region Accounts
        const resolvedDataAccount: ICompanyComponentResolvedData = data['resolvedDataAccount'];

        if (resolvedDataAccount) {
          this.accountForm.patchValue({ CompanyId: this.companyId });

          this.settings = resolvedDataAccount.Settings;

          this.compInEditionTabIndex = 2;

          this.formTap = this.accountForm;

          if (this.settings.find((element) => element.Code == SettingCode.Account)) {
            this.companyAccount = JSON.parse(this.settings.find((element) => element.Code == SettingCode.Account)?.Json || '');
          }

          if (this.companyAccount && this.companyAccount.length > 0) {
            let dataCompany = this.companyAccount.find(x => x.CompanyId === this.companyId) as IAccountSetting;

            if (dataCompany) {
              this.accountForm.get('Password')?.clearValidators();
              this.accountForm.updateValueAndValidity();
              this.accountForm.patchValue(dataCompany);
            }
          }


        }
        //#endregion

        //#region Configurations

        const configurationsResolvedData = data['Configurations'] as ICompanyConfigurationComponentResolvedData;

        if (configurationsResolvedData) {
          this.compInEditionTabIndex = 3;

          this.reportManagerForm.patchValue({ CompanyId: this.companyId });
          this.routeForm.patchValue({ CompanyId: this.companyId });
          this.defaultBusinessPartnerForm.patchValue({ CompanyId: this.companyId });
          this.decimalForm.patchValue({ CompanyId: this.companyId });
          this.paymentForm.patchValue({ CompanyId: this.companyId });
          this.adjustmentInventoryForm.patchValue({ CompanyId: this.companyId });
          this.memoryInvoiceForm.patchValue({ CompanyId: this.companyId });
          this.typeaheadForm.patchValue({ CompanyId: this.companyId });

          this.validateInventoryTables = configurationsResolvedData.ValidateInventoryTables as IValidateInventory[];
          this.validateAttachmentsTables = configurationsResolvedData.ValidateAttachmentsTables as IValidateAttachmnet[];
          this.validateAutomaticPrintingTables = configurationsResolvedData.ValidateAutomaticPrintingTables as IValidateAutomaticPrinting[];
          this.vldLineTables = configurationsResolvedData.ValidateInventoryTables as IValidateLine[];
          this.settings = configurationsResolvedData.Settings;
          this.margin = configurationsResolvedData.MarginTables;

          if (this.settings.some(s => s.Code === SettingCode.FieldsInvoice)) {
            let fieldsInvoiceConfiguration = JSON.parse(this.settings.find(s => s.Code === SettingCode.FieldsInvoice)?.Json || '[]') as IFieldsInvoiceSetting[];

            let fieldsInvoiceCompanyConfiguration = fieldsInvoiceConfiguration.find(s => s.CompanyId === this.companyId);

            if (fieldsInvoiceCompanyConfiguration) this.fieldsInvoiceConfigurationForm.patchValue(fieldsInvoiceCompanyConfiguration);
          }

          if (this.settings.some(s => s.Code === SettingCode.FieldsPurchaseInvoice)) {
            let fieldsPurchaseInvoiceConfiguration = JSON.parse(this.settings.find(s => s.Code === SettingCode.FieldsPurchaseInvoice)?.Json || '[]') as IFieldsPurchaseInvoiceSetting[];

            let fieldsPurchaseInvoiceCompanyConfiguration = fieldsPurchaseInvoiceConfiguration.find(s => s.CompanyId === this.companyId);

            if (fieldsPurchaseInvoiceCompanyConfiguration) this.fieldsPurchaseInvoiceConfigurationForm.patchValue(fieldsPurchaseInvoiceCompanyConfiguration);
          }

          if (this.settings.some(s => s.Code === SettingCode.MobileAppConfiguration)) {
            let mobileAppConfigurations = JSON.parse(this.settings.find(s => s.Code === SettingCode.MobileAppConfiguration)?.Json || '[]') as IMobileAppSetting[];

            let mobileAppConfiguration = mobileAppConfigurations.find(s => s.CompanyId === this.companyId);

            if (mobileAppConfiguration) this.mobileAppConfigurationsForm.patchValue(mobileAppConfiguration);
          }

          if (this.settings.some(s => s.Code === SettingCode.SchedulingConfiguration)) {
            let schedulingConfigurations = JSON.parse(this.settings.find(s => s.Code === SettingCode.SchedulingConfiguration)?.Json || '[]') as ISchedulingSetting[];

            let schedulingConfiguration = schedulingConfigurations.find(s => s.CompanyId === this.companyId);

            if (schedulingConfiguration) this.schedulingConfigurationForm.patchValue(schedulingConfiguration);
          }

          if (this.settings.some(s => s.Code === SettingCode.EventViewer)) {
            let evSettings = JSON.parse(this.settings.find(s => s.Code === SettingCode.EventViewer)?.Json || '[]') as IEventViewerSetting[];

            let evSetting = evSettings.find(s => s.CompanyId === this.companyId);

            if (evSetting) this.eventViewerConfigurationForm.patchValue(evSetting);
          }

          if (this.settings.some(s => s.Code === SettingCode.AuthorizationNotifications)) {
            let fieldsNotificationsConfiguration = JSON.parse(this.settings.find(s => s.Code === SettingCode.AuthorizationNotifications)?.Json || '[]') as INotificationsDraftsSetting[];

            let fieldsNotificationsCompanyConfiguration = fieldsNotificationsConfiguration.find(s => s.CompanyId === this.companyId);

            if (fieldsNotificationsCompanyConfiguration) this.fieldsNotificationsForm.patchValue(fieldsNotificationsCompanyConfiguration);
          }

          //#region settings inventory
          const settingInventory = this.settings.find((element) => element.Code == SettingCode.ValidateInventory);
          if (settingInventory) {
            this.vldInventoryCompany = settingInventory && settingInventory.Json ? JSON.parse(settingInventory.Json) : [];
          }
          if (this.vldInventoryCompany && this.vldInventoryCompany.length > 0) {

            let dataInventoryCompany = this.vldInventoryCompany.find(x => x.CompanyId === this.companyId) as IValidateInventorySetting;

            if (dataInventoryCompany && dataInventoryCompany.Validate.length > 0) {

              this.validateInventoryTables
                .forEach(element => {
                  let validate = dataInventoryCompany.Validate.find((x) => x.Table == element.Table);
                  if (validate) {
                    element.ValidateInventory = validate.ValidateInventory || false;
                    element.ValidateBatchesInventory = validate.ValidateBatchesInventory || false;
                  }
                });

              const NEW_TABLE_STATE = {
                RecordsCount: this.validateInventoryTables.length,
                Records: this.validateInventoryTables
              };

              this.linkerService.Publish({
                CallBack: CL_CHANNEL.INFLATE,
                Data: JSON.stringify(NEW_TABLE_STATE),
                Target: this.validateInventoryTableId
              });

            }

          }
          //#endregion

          //#region Settings report manager

          if (this.settings.find((element) => element.Code == SettingCode.ReportManager)) {
            this.companyReportManager = JSON.parse(this.settings.find((element) => element.Code == SettingCode.ReportManager)?.Json || '');
          }

          if (this.companyReportManager && this.companyReportManager.length > 0) {

            let dataCompanyReportManager = this.companyReportManager.find(x => x.CompanyId === this.companyId) as IReportManagerSetting;

            if (dataCompanyReportManager) {
              this.reportManagerForm.patchValue(dataCompanyReportManager);
            }
          }

          //#endregion

          //#region settings directions

          if (this.settings.find((element) => element.Code == SettingCode.Route)) {
            this.companyRoute = JSON.parse(this.settings.find((element) => element.Code == SettingCode.Route)?.Json || '');
          }

          if (this.companyRoute && this.companyRoute.length > 0) {

            let dataCompanyRoute = this.companyRoute.find(x => x.CompanyId === this.companyId) as IRouteSetting;

            if (dataCompanyRoute) {
              this.routeForm.patchValue(dataCompanyRoute);
            }
          }

          //#endregion

          //#region Default business partner

          if (this.settings.find((element) => element.Code == SettingCode.DefaultBusinessPartner)) {
            this.companyDefaultBusinessPartner = JSON.parse(this.settings.find((element) => element.Code == SettingCode.DefaultBusinessPartner)?.Json || '');
          }

          if (this.companyDefaultBusinessPartner && this.companyDefaultBusinessPartner.length > 0) {

            let dataCompany = this.companyDefaultBusinessPartner.find(x => x.CompanyId === this.companyId) as IDefaultBusinessPartnerSetting;

            if (dataCompany) {
              this.defaultBusinessPartnerForm.patchValue(dataCompany);
            }
          }

          //#endregion

          //#region decimales
          if (this.settings.find((element) => element.Code == SettingCode.Decimal)) {
            this.companyDecimal = JSON.parse(this.settings.find((element) => element.Code == SettingCode.Decimal)?.Json || '');
          }

          if (this.companyDecimal && this.companyDecimal.length > 0) {

            let dataCompany = this.companyDecimal.find(x => x.CompanyId === this.companyId) as IDecimalSetting;

            if (dataCompany) {
              this.decimalForm.patchValue(dataCompany);
            }
          }
          //#endregion

          //#region payment
          if (this.settings.find((element) => element.Code == SettingCode.Payment)) {
            this.companyPayment = JSON.parse(this.settings.find((element) => element.Code == SettingCode.Payment)?.Json || '');
          }

          if (this.companyPayment && this.companyPayment.length > 0) {

            let dataCompany = this.companyPayment.find(x => x.CompanyId === this.companyId) as IPaymentSetting;

            if (dataCompany) {
              dataCompany.OrderLine = !dataCompany.OrderLine;
              this.paymentForm.patchValue(dataCompany);
            }
          }
          //#endregion

          //#region settings lines

          if (this.settings.find((element) => element.Code == SettingCode.LineMode)) {
            this.vldLineModeCompany = JSON.parse(this.settings.find((element) => element.Code == SettingCode.LineMode)?.Json || '');
          }

          if (this.vldLineModeCompany && this.vldLineModeCompany.length > 0) {

            let dataLineCompany = this.vldLineModeCompany.find(x => x.CompanyId === this.companyId) as ILineModeSetting;

            if (dataLineCompany && dataLineCompany.Validate.length > 0) {

              this.vldLineTables
                .forEach(element => {
                  let validate = dataLineCompany.Validate.find((x) => x.Table == element.Table);
                  if (validate) {
                    element.LineGroup = validate.LineGroup;
                    element.LineMode = validate.LineMode;
                  }
                });

              const NEW_TABLE_STATE = {
                RecordsCount: this.vldLineTables.length,
                Records: this.vldLineTables
              };

              this.linkerService.Publish({
                CallBack: CL_CHANNEL.INFLATE,
                Data: JSON.stringify(NEW_TABLE_STATE),
                Target: this.vldLineTableId
              });

            }

          }
          //#endregion

          //#region settings ajuste inventario

          if (this.settings.find((element) => element.Code == SettingCode.AdjustmentInventory)) {
            this.companyAdjustmentInventory = JSON.parse(this.settings.find((element) => element.Code == SettingCode.AdjustmentInventory)?.Json || '');
          }

          if (this.companyAdjustmentInventory && this.companyAdjustmentInventory.length > 0) {

            let dataCompany = this.companyAdjustmentInventory.find(x => x.CompanyId === this.companyId) as IAdjustmentInventorySetting;

            if (dataCompany) {
              this.adjustmentInventoryForm.patchValue(dataCompany);
            }
          }

          //#endregion

          //#region settings multifactura

          if (this.settings.find((element) => element.Code == SettingCode.MemoryInvoice)) {
            this.companyMemoryInvoice = JSON.parse(this.settings.find((element) => element.Code == SettingCode.MemoryInvoice)?.Json || '');
          }

          if (this.companyMemoryInvoice && this.companyMemoryInvoice.length > 0) {

            let dataCompany = this.companyMemoryInvoice.find(x => x.CompanyId === this.companyId) as IMemoryInvoiceSetting;

            if (dataCompany) {
              this.memoryInvoiceForm.patchValue(dataCompany);
            }
          }

          //#endregion

          //#region settings margen
          if (this.settings.find((element) => element.Code == SettingCode.Margin)) {
            this.marginCompany = JSON.parse(this.settings.find((element) => element.Code == SettingCode.Margin)?.Json || '');
          }

          if (this.marginCompany && this.marginCompany.length > 0) {

            let dataCompany = this.marginCompany.find(x => x.CompanyId === this.companyId) as IMarginSetting;

            if (dataCompany && dataCompany.Margin.length > 0) {

              dataCompany.Margin.forEach((x) => {
                let index = this.margin.findIndex((i) => i.Table === x.Table);
                if (index !== -1) {
                  this.margin[index] = x;
                }
              });

              const NEW_TABLE_STATE = {
                RecordsCount: this.margin.length,
                Records: this.margin
              };

              this.linkerService.Publish({
                CallBack: CL_CHANNEL.INFLATE,
                Data: JSON.stringify(NEW_TABLE_STATE),
                Target: this.marginTableId
              });

            }

          }
          //#endregion

          //#region typeahead

          if (this.settings.find((element) => element.Code == SettingCode.PatternTypeahead)) {
            this.companyTypeahead = JSON.parse(this.settings.find((element) => element.Code == SettingCode.PatternTypeahead)?.Json || '');
          }

          if (this.companyTypeahead && this.companyTypeahead.length > 0) {

            let dataCompany = this.companyTypeahead.find(x => x.CompanyId === this.companyId) as ITypeaheadPatternSetting;

            if (dataCompany) {
              this.typeaheadForm.patchValue(dataCompany);
            }
          }
          //#endregion

          //#region Share folder

          let data = this.settings.find(x => x.Code === SettingCode.ShareFolder);
          if (data) {
            let comp = JSON.parse(data.Json) as IShareFolderSetting[];
            if (comp) {
              let share = comp.find(x => x.CompanyId === this.companyId)?.Ruta ?? '';
              this.rutaForm.setValue(share);
            }
          }

          //#endregion
        }
        //#endregion

        //#region Conections
        const resolvedDataConection: IConectionsResolvedData = data['resolvedDataConection'];

        if (resolvedDataConection) {
          this.connections = resolvedDataConection.Conections;
          this.formTap = this.companyForm;

        }

        //#endregion

        //#region General
        const resolvedDataGeneral: ICompanyConectionComponentResolvedData = data['resolvedDataGeneral'];

        if (resolvedDataGeneral) {

          this.companyForm.patchValue(resolvedDataGeneral.Companys);
          this.connections = resolvedDataGeneral.Conections;
          this.formTap = this.companyForm;

        }
        //#endregion

        //#region Objetos BD
        const dbResourcesResolvedData: IDBResourceResolvedData = data['dbResourcesResolvedData'];

        if (dbResourcesResolvedData) {

          this.dbResourcesFormFilters = this.fb.group({
            Criteria: [null],
            Type: ['*']
          });

          this.companiesTabIndex = 1;
          this.compInEditionTabIndex = 5;

          this.dbResourceTypes = dbResourcesResolvedData.DBResourceTypes || [];

          //Add default type for filters
          this.dbResourceTypes.push({ Type: '*', Description: 'Todo' });

          this.dbResources = dbResourcesResolvedData.DBResources || [];

          this.filteredDbResources = this.dbResources.map(x => this.sharedService.MapTableColumns(
            {
              ...x,
              TypeDescription: this.dbResourceTypes.find(t => t.Type === x.Type)?.Description || x.Type,
              Active: x.IsActive ? 'Sí' : 'No'
            },
            Object.keys(this.dbResourceTableColumns)
          ));

          const DB_RESOURCE_STATE = {
            RecordsCount: this.filteredDbResources.length,
            Records: this.filteredDbResources
          };

          this.linkerService.Publish({
            CallBack: CL_CHANNEL.INFLATE,
            Data: JSON.stringify(DB_RESOURCE_STATE),
            Target: this.dbResourceTableId
          });

        }
        //#endregion

        //#region Validations
        if (resolvedDataGeneral || resolvedDataPrintFormat || resolvedDataAccount || configurationsResolvedData) {
          this.actionButtons = [
            {
              Key: 'ADD-UPDATE',
              MatIcon: 'edit',
              Text: 'Actualizar',
              MatColor: 'primary',
              DisabledIf: (_form?: FormGroup) => _form?.invalid || false
            },
            {
              Key: 'CANCEL',
              MatIcon: 'cancel',
              Text: 'Cancelar',
              MatColor: 'primary'
            }
          ];
          //this.sharedService.SetActionButtons(this.actionButtons);

        }

        if (dbResourcesResolvedData) {

          this.actionButtonsResource = [
            {
              Key: 'SEARCH-DB-RESOURCES',
              MatIcon: 'search',
              Text: 'Buscar',
              MatColor: 'primary'
            },
          ];
          this.actionButtons = [
            {
              Key: 'CANCEL',
              MatIcon: 'cancel',
              Text: 'Cancelar',
              MatColor: 'primary'
            }
          ];
          this.actionButtonsAddResource = [
            {
              Key: 'ADD-DB-RESOURCE',
              MatIcon: 'add',
              Text: 'Agregar',
              MatColor: 'primary'
            }
          ];
        }

        //#endregion

        //#region Para el tapp de planes de lealtad
        const loyaltyPlanResolverData: ILoyaltyPlanResolveData = data['loyaltyPlanResolveData'];

        if (loyaltyPlanResolverData) {
          this.compInEditionTabIndex = 6;

          this.settingPoints = loyaltyPlanResolverData.Points;
          this.activePlan = this.settingPoints?.IsActive || false;
          this.loyaltyPlanActiveForm.setValue(this.activePlan);
          if (!this.activePlan) {
            this.lealtoForm.disable();
            this.loyaltyPlanForm.disable();
            this.tappForm.disable();
          } else {
            this.lealtoForm.enable();
            this.loyaltyPlanForm.enable();
            this.tappForm.enable();
          }
          if (this.settingPoints && this.settingPoints.Json && this.settingPoints.Json !== '') {
            this.loyaltyPlan = JSON.parse(this.settingPoints.Json);
            this.SetInitialPlan();
          }

          this.actionButtons = [
            {
              Key: 'ADD-LOYALTY-PLAN',
              MatIcon: 'edit',
              Text: 'Actualizar',
              MatColor: 'primary',
              DisabledIf: (_form?: FormGroup) => _form?.invalid || false
            },
            {
              Key: 'CANCEL',
              MatIcon: 'cancel',
              Text: 'Cancelar',
              MatColor: 'primary'
            }
          ];
        }
        //#endregion


        //#region Fields configured sap
        const ConfigurationsFields: IFieldsConfiguredResolveData = data['ConfigurationsFields'];

        if (ConfigurationsFields) {

          this.actionButtons = [
            {
              Key: 'ADD-UPDATE',
              MatIcon: 'edit',
              Text: 'Actualizar',
              MatColor: 'primary',
              DisabledIf: (_form?: FormGroup) => _form?.invalid || this.fieldBusinessPartner.every(x => x.NameSL === '') || false
            },
            {
              Key: 'CANCEL',
              MatIcon: 'cancel',
              Text: 'Cancelar',
              MatColor: 'primary'
            }
          ];

          this.compInEditionTabIndex = 4;

          this.fieldBusinessPartner = ConfigurationsFields.Fields as IBusinessPartnersFields[];


          this.fieldBusinessPartner
            .forEach(element => {
              element.FieldType = '';
              element.NameSL = '';
              element.IsObjDirection = false;
            });

          this.settingsFieldsConfiguredSAP = ConfigurationsFields.FieldsConfiguredSAP;
          this.fieldBusinessPartnerCompany = this.settingsFieldsConfiguredSAP ? JSON.parse(this.settingsFieldsConfiguredSAP?.Json || '') : [];

          if (this.fieldBusinessPartnerCompany && this.fieldBusinessPartnerCompany.length > 0) {

            let dataFieldBusinessPartnerCompany = this.fieldBusinessPartnerCompany.find(x => x.CompanyId === this.companyId) as IConfiguredFieldsSetting;

            if (dataFieldBusinessPartnerCompany && dataFieldBusinessPartnerCompany.Fields.length > 0) {

              this.IsCompanyDirection.setValue(dataFieldBusinessPartnerCompany.IsCompanyDirection);

              this.fieldBusinessPartner
                .forEach(element => {
                  let validate = dataFieldBusinessPartnerCompany.Fields.find((x) => x.Id == element.Id);
                  if (validate) {
                    element.FieldType = validate.FieldType;
                    element.NameSL = validate.NameSL;
                    element.IsObjDirection = validate.IsObjDirection;
                  }
                });
            }

          }

          const NEW_TABLE_STATE = {
            RecordsCount: this.fieldBusinessPartner.length,
            Records: this.fieldBusinessPartner
          };

          this.linkerService.Publish({
            CallBack: CL_CHANNEL.INFLATE,
            Data: JSON.stringify(NEW_TABLE_STATE),
            Target: this.fielsBusinessPartnerTableId
          });

        }
        //#endregion

        const discountHierarchiesResolvedData = data['discountHierarchiesResolvedData'] as IDiscountHierarchiesResolvedData;

        if (discountHierarchiesResolvedData) {
          this.discountHierarchies = discountHierarchiesResolvedData.DiscountHierarchies;
          this.actionButtons = [{
            Key: 'UPDATE_DISC_HIERARCHY',
            MatIcon: 'edit',
            Text: 'Actualizar',
            MatColor: 'primary'
          },
          {
            Key: 'CANCEL',
            MatIcon: 'cancel',
            Text: 'Cancelar',
            MatColor: 'primary'
          }];
          this.compInEditionTabIndex = 7;
        }

        //#region settings attachmnets
        if (this.settings.find((element) => element.Code == SettingCode.ValidateAttachments)) {
          this.vldAttachmentsCompany = JSON.parse(this.settings.find((element) => element.Code == SettingCode.ValidateAttachments)?.Json || '');
        }
        if (this.vldAttachmentsCompany && this.vldAttachmentsCompany.length > 0) {

          let dataAttachmentsCompany = this.vldAttachmentsCompany.find(x => x.CompanyId === this.companyId) as IValidateAttachmentsSetting;

          if (dataAttachmentsCompany && dataAttachmentsCompany.Validate.length > 0) {

            this.validateAttachmentsTables
              .forEach(element => {
                let validate = dataAttachmentsCompany.Validate.find((x) => x.Table == element.Table);
                if (validate) {
                  element.Active = validate.Active;
                }
              });

            const NEW_TABLE_STATE = {
              RecordsCount: this.validateAttachmentsTables.length,
              Records: this.validateAttachmentsTables
            };

            this.linkerService.Publish({
              CallBack: CL_CHANNEL.INFLATE,
              Data: JSON.stringify(NEW_TABLE_STATE),
              Target: this.validateAttachmentsTableId
            });

          }

        }
        //#endregion

        //#region Automatic Printing
        const settingAutomaticPrinting = this.settings.find((element: ISettings) => element.Code === SettingCode.ValidateAutomaticPrinting);
        if(settingAutomaticPrinting){
          this.vldAutomaticPrintingCompany = settingAutomaticPrinting.Json ? JSON.parse(settingAutomaticPrinting.Json) : [];
        }
        if (this.vldAutomaticPrintingCompany && this.vldAutomaticPrintingCompany.length > 0){
          let dataAutomaticPrintingCompany = this.vldAutomaticPrintingCompany.find(x => x.CompanyId === this.companyId) as IValidateAutomaticPrintingsSetting;
          if (dataAutomaticPrintingCompany && dataAutomaticPrintingCompany.Validate.length > 0) {
            this.validateAutomaticPrintingTables
              .forEach((element: IValidateAutomaticPrinting) => {
                let validate = dataAutomaticPrintingCompany.Validate.find((x) => x.Table == element.Table);
                if (validate) {
                  element.Active = validate.Active || false;
                }
              });

            const NEW_TABLE_STATE = {
              RecordsCount: this.validateAutomaticPrintingTables.length,
              Records: this.validateAutomaticPrintingTables
            };

            this.linkerService.Publish({
              CallBack: CL_CHANNEL.INFLATE,
              Data: JSON.stringify(NEW_TABLE_STATE),
              Target: this.validateAutomaticPrintingTableId
            });
          }
        }
        //#endregion
      }
    })

  }

  /**
   * Read query parameters to show dialog
   */
  ReadQueryParameters(): void {

    this.allSubscriptions.add(this.activatedRoute.queryParams.subscribe(params => {

      if (params['dialog']) {

        let recordId: number = params['recordId'] ? +(params['recordId']) : 0;

        if (params['dialog'] === 'update' && !recordId) {
          this.alertsService.Toast({ type: CLToastType.ERROR, message: 'Debe enviar el parametro "recordId"' });
        }

        if (params['dialog'] === 'update' && recordId) {
          this.OpenEditDialog(recordId);
        }

        if(params['dialog'] === 'create-dbresource') {
          this.OpenAddDialog();
        }
      }

    }));
  }

  RegisterTableEvents(): void {
    Register<CL_CHANNEL>(this.companyTableId, CL_CHANNEL.OUTPUT, this.OnTableActionActivated, this.callbacks);
    Register<CL_CHANNEL>(this.dbResourceTableId, CL_CHANNEL.OUTPUT, this.OnTableActionActivated, this.callbacks);
  }

  RegisterActionButtonsEvents(): void {
    Register<CL_CHANNEL>(LinkerEvent.ActionButton, CL_CHANNEL.OUTPUT, this.OnActionButtonClicked, this.callbacks);
  }

  EmitActionButtonClickEvent(_actionButton: IActionButton): void {
    this.sharedService.EmitActionButtonClickEvent(_actionButton);
  }


  /**
   * Method to define the resulting events for the table buttons
   * @param _event - Event emitted in the table button when selecting a line
   * @constructor
   */
  OnTableActionActivated = (_event: ICLEvent): void => {
    if (_event.Data) {
      const BUTTON_EVENT = JSON.parse(_event.Data);

      const ACTION_OBJECT = JSON.parse(BUTTON_EVENT.Data);

      switch (BUTTON_EVENT.Action) {
        case Structures.Enums.CL_ACTIONS.UPDATE:

          if (_event.Target === this.dbResourceTableId) // DB Resource table action
          {
            this.router.navigate([this.sharedService.GetCurrentRouteSegment()], {
              relativeTo: this.activatedRoute,
              queryParams: {
                dialog: 'update',
                recordId: ACTION_OBJECT.Id
              }
            });

          } else {
            this.router.navigate(['general', ACTION_OBJECT.Id], {
              relativeTo: this.activatedRoute,
            });
          }
          break;

      }
    }
  }

  /**
   *
   * @param _actionButton
   */
  OnActionButtonClicked(_actionButton: IActionButton): void {

    switch (_actionButton.Key) {
      case 'ADD':
        this.router.navigate(['create'], { relativeTo: this.activatedRoute });
        break;
      case 'SEARCH-DB-RESOURCES':
        this.FilterDBResources();
        break;
      case 'CANCEL':
        this.router.navigate(['/maintenance', 'companies']);
        break;
      case 'ADD-UPDATE':
        this.Save();
        break;
      case 'ADD-LOYALTY-PLAN':
        this.SaveLoyaltyPlan();
        break;
      case 'UPDATE_DISC_HIERARCHY':
        this.SaveDiscountHierarchies();
        break;
      case 'ADD-DB-RESOURCE':
        this.router.navigate([this.sharedService.GetCurrentRouteSegment()], {
          relativeTo: this.activatedRoute,
          queryParams: {
            dialog: 'create-dbresource'
          }
        });
        break;
    }
  }

  SaveDiscountHierarchies(): void {
    this.overlayService.OnPost();

    this.discountHierarchiesService.Patch(this.discountHierarchies)
      .pipe(finalize(() => this.overlayService.Drop()))
      .subscribe({
        next: (response) => {
          this.modalService.Continue({
            title: 'Jerarquías de descuento guardadas correctamente',
            type: CLModalType.SUCCESS
          });
        },
        error: (err) => {
          this.modalService.Continue({
            title: 'Se produjo un error guardando las jerarquías de descuento',
            subtitle: GetError(err),
            type: CLModalType.ERROR
          });
        }
      });
  }

  /**
   * Load form to companies
   * @constructor
   */
  LoadForm(): void {
    this.companyForm = this.fb.group({
      Id: [null],
      DatabaseCode: [null, [Validators.required]],
      Name: [null, [Validators.required]],
      IsActive: [false, [Validators.required]],
      ConnectionId: [null, [Validators.required]],

    });

    this.companyReportForm = this.fb.group({
      CompanyId: [null],
      Active: [false],
      RemoteServer: [null],
      Path: [null],
      SaleOffer: [null],
      SaleOrder: [null],
      VoucherCancellation: [null],
      Invoices: [null],
      PinPadInvoices: [null],
      CreditNote: [null],
      ReceivedPayment: [null],
      CashClosing: [null],
      ReprintSaleOffers: [null],
      ReprintInvoices: [null],
      ReprintSaleOrders: [null],
      GoodsReceipt: [null],
      GoodsIssue: [null],
      GoodsReceiptPO: [null],
      GoodsReturn: [null],
      PurchaseOrder: [null],
      APInvoice: [null],
      InventoryTransferRequest: [null],
      InventoryTransfer: [null],
      OutgoingPayment: [null],
      CancelPayment: [null],
      ArDownPayment: [null],
      PinpadDownPayment: [null],
      ReprintArDownPayment: [null],
      ReprintReserveInvoice: [null],
      ReserveInvoice: [null],
      DeliveryNotes: [null],
      Preliminary: [null],
      ReprintPreliminary: [null],
      ReprintDeliveryNotes: [null],
      ApDownPayment: [null],
      PinpadApDownPayment: [null],
      ReprintApDownPayment: [null],
      PinpadAPInvoice: [null],
      ReprintCreditNotes: [null],
      ReprintTransferRequest: [null],
      ReprintPurchaseOrder: [null]
    });
    
    this.companyReportForm.get('RemoteServer')?.disable();
    this.companyReportForm.get('Path')?.disable();
    this.companyReportForm.get('Active')?.valueChanges.subscribe({
      next: (value) => {
        if (!value) {
          this.companyReportForm.get('RemoteServer')?.disable();
          this.companyReportForm.get('Path')?.disable();
        } else {
          this.companyReportForm.get('RemoteServer')?.enable();
          this.companyReportForm.get('Path')?.enable();
        }
      }
    });

    this.accountForm = this.fb.group({
      CompanyId: [null, [Validators.required]],
      Subject: [null, [Validators.required]],
      Account: [null, [Validators.required]],
      User: [null, [Validators.required]],
      Host: [null, [Validators.required]],
      Password: [null, [Validators.required]],
      Port: [null, [Validators.required]],
      Ssl: [false, [Validators.required]],
    });

    this.dbResourcesFormFilters = this.fb.group({
      Criteria: [null],
      Type: ['*']
    });

    this.reportManagerForm = this.fb.group({
      CompanyId: [null],
      AppKey: [null, [Validators.required]],
      CompanyKey: [null, [Validators.required]],
    });

    this.routeForm = this.fb.group({
      CompanyId: [null],
      PortServiceLocal: [null],
      PortServicePinpad: [null],
      PortServiceHacienda: [null],
      MessageServiceLayer: [null],
    });

    this.defaultBusinessPartnerForm = this.fb.group({
      CompanyId: [null],
      BusinessPartnerCustomer: [null],
      BusinessPartnerSupplier: [null],
    });

    this.decimalForm = this.fb.group({
      CompanyId: [null],
      Price: [null, [Validators.required, Validators.min(1), Validators.max(6)]],
      TotalLine: [null, [Validators.required, Validators.min(1), Validators.max(6)]],
      TotalDocument: [null, [Validators.required, Validators.min(1), Validators.max(6)]]
    });

    this.paymentForm = this.fb.group({
      CompanyId: [null],
      CardValid: [null],
      Pinpad: [null],
      ConsultFE: [null],
      CardNumber: [null],
      RequiredCashAccount: [null],
      RequiredTransferAccount: [null],
      RequiredCardAccount: [null],
      OrderLine: [true],
      RetentionProcess: [false],
      ModalProcess: [false],
    });

    this.adjustmentInventoryForm = this.fb.group({
      CompanyId: [null],
      GoodsReceiptAccount: [null],
      Comments: [null]
    });

    this.memoryInvoiceForm = this.fb.group({
      CompanyId: [null],
      Name: [null],
      Quantity: [null]
    });

    this.typeaheadForm = this.fb.group({
      CompanyId: [null],
      ItemPattern: [null],
      BusinessPattern: [null]
    }, {
      validators: [Validation.pattern('BusinessPattern', this.typeAheadBusinessPartnersTag),
      Validation.patternItem('ItemPattern', this.typeAheadItemTag)]
    });

    this.loyaltyPlanForm = this.fb.group({
      plan: [false]
    });

    this.loyaltyPlanForm.disable();
    this.tappSelect = false;

    this.tappForm = this.fb.group({
      Id: ['', [Validators.required]],
      CardNumber: [9999, [Validators.required]],
      Valid: ['', [Validators.required]],
      Account: ['', [Validators.required]],
      Voucher: ['0'],
      Owner: ['0'],
      Register: ['', [Validators.required]],
      Store: ['', [Validators.required]],
      Url: ['', [Validators.required]],
      Token: [''],
    });

    this.lealtoForm = this.fb.group({
      Id: ['0', [Validators.required]],
      CardNumber: [8888, [Validators.required]],
      Valid: ['', [Validators.required]],
      Account: ['', [Validators.required]],
      Voucher: ['0'],
      Owner: ['0'],
      ApiKey: ['', [Validators.required]],
      User: ['', [Validators.required]],
      Password: ['', [Validators.required]],
      UrlBase: ['', [Validators.required]],
      Ambiente: ['', [Validators.required]]
    });

    this.loyaltyPlanActiveForm = new FormControl(false);

    this.mobileAppConfigurationsForm = this.fb.group({
      OnlineOnly: [false],
      UseHeaderDiscount: [false],
      UseFreight: [false],
      CheckInTime: [null],
      UseBillingRange: [false],
      BillingRange: [null],
      CheckSynchronizationInterval: [null]
    });

    this.mobileAppConfigurationsForm.get('BillingRange')?.disable();
    this.mobileAppConfigurationsForm.get('UseBillingRange')?.valueChanges.subscribe({
      next: (value) => {
        if (!value) {
          this.mobileAppConfigurationsForm.get('BillingRange')?.disable();
        } else {
          this.mobileAppConfigurationsForm.get('BillingRange')?.enable();
        }
      }
    });

    this.schedulingConfigurationForm = this.fb.group({
      UseScheduling: [false],
      GmailServiceAccount: [''],
      GmailServiceAccountPassword: [''],
      OutlookServiceURL: ['']
    });


    this.schedulingConfigurationForm.get('GmailServiceAccount')?.disable();
    this.schedulingConfigurationForm.get('GmailServiceAccountPassword')?.disable();
    this.schedulingConfigurationForm.get('OutlookServiceURL')?.disable();
    this.schedulingConfigurationForm.get('UseScheduling')?.valueChanges.subscribe({
      next: (value) => {
        if (!value) {
          this.schedulingConfigurationForm.get('GmailServiceAccount')?.disable();
          this.schedulingConfigurationForm.get('GmailServiceAccountPassword')?.disable();
          this.schedulingConfigurationForm.get('OutlookServiceURL')?.disable();
        } else {
          this.schedulingConfigurationForm.get('GmailServiceAccount')?.enable();
          this.schedulingConfigurationForm.get('GmailServiceAccountPassword')?.enable();
          this.schedulingConfigurationForm.get('OutlookServiceURL')?.enable();
        }
      }
    });

    this.eventViewerConfigurationForm = this.fb.group({
      Error: [false],
      Information: [false],
      Success: [false],
      Warning: [false]
    });

    this.fieldsInvoiceConfigurationForm = this.fb.group({
      DisplayTypeInvoice: [false],
      NumFactura: [false],
      SetAddressBusinessPartner: [false],
      ChangeCurrencyLine: [false]
    });

    this.recaptchaFrom = this.fb.group({
      Url: [''],
      SecretKey: ['']
    });

    this.fieldsPurchaseInvoiceConfigurationForm = this.fb.group({
      DisplayTypeInvoice: [false]
    });
    this.fieldsNotificationsForm = this.fb.group({
      ActiveNotifications: [false]
    });
  }

  CompanyInEditionTabChange(tabChangeEvent: any): void {
    this.compInEditionTabIndex = tabChangeEvent;

    let baseSegment = '/maintenance/companies';

    switch (this.compInEditionTabIndex) {
      case 0:
        this.router.navigate([baseSegment, 'general', this.companyId]);
        break;
      case 1:
        this.router.navigate([baseSegment, 'print-format', this.companyId]);
        break;
      case 2:
        this.router.navigate([baseSegment, 'account', this.companyId]);
        break;
      case 3:
        this.router.navigate([baseSegment, 'configurations', this.companyId]);
        break;
      case 4:
        this.router.navigate([baseSegment, 'configurations-fields', this.companyId]);
        break;
      case 5:
        this.router.navigate([baseSegment, 'db-resources', this.companyId]);
        break;
      case 6:
        this.router.navigate([baseSegment, 'loyaltyPlan', this.companyId]);
        break;
      case 7:
        this.router.navigate([baseSegment, 'discount-hierarchies', this.companyId], { relativeTo: this.activatedRoute });
        break;
    }

  }

  CompaniesTabChange(tabChangeEvent: any): void {
    this.companiesTabIndex = tabChangeEvent;

    let baseSegment = '/maintenance/companies';

    switch (this.companiesTabIndex) {
      case 0:
        this.router.navigate([baseSegment]);
        break;
      case 1:
        this.router.navigate([baseSegment, 'db-resources', -1]);
        break;
    }

  }


  Save(): void {

    switch (this.compInEditionTabIndex) {
      case 0:
        if (this.companyForm.invalid) {
          this.companyForm.markAllAsTouched();
          return;
        }
        this.SaveCompany();
        break;
      case 1:
        if (this.companyReportForm.invalid) {
          this.companyReportForm.markAllAsTouched();
          return;
        }
        this.SaveSettingsPrintFormat();
        break;
      case 2:
        if (this.accountForm.invalid) {
          this.accountForm.markAllAsTouched();
          return;
        }
        this.SaveSettingsAccount();
        break;
      case 3:
        this.SaveSettingsOptions();
        break;
      case 4:
        this.SaveFieldsConfigured();
        break;
    }
  }


  SaveCompany(): void {
    this.overlayService.OnPost();

    let company = this.companyForm.getRawValue() as ICompany;

    let updateOrCreate$: Observable<Structures.Interfaces.ICLResponse<ICompany>> | null = null;
    if (!this.companyId) {
      updateOrCreate$ = this.companyService.Post(company);
    } else {
      updateOrCreate$ = this.companyService.Patch(this.companyId, company);
    }

    updateOrCreate$
      .pipe(
        finalize(() => this.overlayService.Drop())
      )
      .subscribe({
        next: (callback) => {

          this.modalService.Continue({
            title: `Compañía ${!this.companyId ? 'creada' : 'actualizada'} correctamente`,
            type: CLModalType.SUCCESS
          });

          let baseSegment = '/maintenance/companies';
          if (callback && callback.Data) {
            this.router.navigate([baseSegment, 'general', callback.Data.Id]);
          }
        },
        error: (err) => {
          this.modalService.Continue({
            title: `Se produjo un error ${!this.companyId ? 'creando' : 'actualizando'} la compañía`,
            subtitle: GetError(err),
            type: CLModalType.ERROR
          });
        }
      });

  }

  SaveSettingsAccount(): void {

    this.overlayService.OnPost();

    let updateOrCreateSetting$: Observable<Structures.Interfaces.ICLResponse<ISettings>> | null = null;


    let settingExistCode = this.settings.find((element) => element.Code == SettingCode.Account) as ISettings;

    let companyCount = this.accountForm.getRawValue() as IAccountSetting;

    if (settingExistCode) {

      let settings = this.companyAccount.find(x => x.CompanyId === this.companyId);

      if (settings) {

        this.companyAccount.forEach(x => {
          if (x.CompanyId === this.companyId) {
            x.Subject = companyCount.Subject;
            x.Account = companyCount.Account;
            x.User = companyCount.User;
            x.Host = companyCount.Host;
            x.Password = companyCount.Password;
            x.Port = companyCount.Port;
            x.Ssl = companyCount.Ssl;
          }
        });

        settingExistCode.Json = JSON.stringify(this.companyAccount);

        updateOrCreateSetting$ = this.settingsService.Patch(settingExistCode, SettingCode.Account);
      } else {

        this.companyAccount.push(companyCount);
        settingExistCode.Json = JSON.stringify(this.companyAccount);
        updateOrCreateSetting$ = this.settingsService.Patch(settingExistCode, SettingCode.Account);
      }

    } else {
      this.companyAccount.push(companyCount);
      settingExistCode = {
        Id: null,
        Code: SettingCode.Account,
        View: "N/A",
        Json: JSON.stringify(this.companyAccount),
        IsActive: true
      };

      updateOrCreateSetting$ = this.settingsService.Post(settingExistCode);

    }


    updateOrCreateSetting$
      .pipe(
        finalize(() => this.overlayService.Drop())
      )
      .subscribe({
        next: (callback) => {
          this.modalService.Continue({
            title: `Correo ${settingExistCode ? 'actualizado' : 'guardado'} correctamente`,
            type: CLModalType.SUCCESS
          });
        },
        error: (err) => {
          this.modalService.Continue({
            title: `Se produjo un error ${settingExistCode ? 'actualizando' : 'guardando'} el correo`,
            subtitle: GetError(err),
            type: CLModalType.ERROR
          });
        }
      });
  }

  SaveSettingsPrintFormat(): void {

    let printFormats: FormData = new FormData();

    for (const propName in this.printFormatFiles) {
      let file: File = this.printFormatFiles[propName as keyof object];

      if (file) {
        printFormats.append(propName, file);
      }
    }
    this.overlayService.OnPost();
    this.printFormatsService.Post(
      printFormats, 
      this.companyId, 
      this.companyReportForm.get('Active')?.value || false, 
      this.companyReportForm.get('RemoteServer')?.value || '',
      this.companyReportForm.get('Path')?.value || ''
    ).pipe(finalize(() => this.overlayService.Drop()))
      .subscribe({
        next: (callback) => {
          this.modalService.Continue({
            title: 'Formatos de impresión guardados correctamente',
            type: CLModalType.SUCCESS
          });
        },
        error: (err) => {
          this.modalService.Continue({
            title: 'Se produjo un error guardando los formatos de impresión',
            subtitle: GetError(err),
            type: CLModalType.ERROR
          });
        }
      });
  }

  SaveSettingsOptions(): void {

    if (this.decimalForm.invalid) {
      this.decimalForm.markAllAsTouched();
      return;
    }
    if (this.typeaheadForm.invalid) {
      this.typeaheadForm.markAllAsTouched();
      return;
    }


    this.overlayService.OnPost();

    let updateOrCreateSetting$: Observable<Structures.Interfaces.ICLResponse<ISettings[]>> | null = null;

    let SettingExistCode = this.settings.find((element) => element.Code == SettingCode.ValidateInventory ||
      element.Code == SettingCode.ReportManager || element.Code == SettingCode.Route
      || element.Code == SettingCode.DefaultBusinessPartner || element.Code == SettingCode.Decimal || element.Code == SettingCode.Payment
      || element.Code == SettingCode.LineMode || element.Code == SettingCode.AdjustmentInventory || element.Code == SettingCode.MemoryInvoice
      || element.Code == SettingCode.Margin || element.Code == SettingCode.PatternTypeahead) as ISettings;

    let settings = [] as ISettings[];
    settings.push(this.SettingsInventorySend());
    settings.push(this.SettingsReportManagerSend());
    settings.push(this.SettingsRouteSend());
    settings.push(this.SettingsBusinessPartnerSend());
    settings.push(this.SettingsDecimalSend());
    settings.push(this.SettingsPaymentSend());
    settings.push(this.SettingsLineSend());
    settings.push(this.SettingsAdjustmentInventorySend());
    settings.push(this.SettingsMemoryInvoiceSend());
    settings.push(this.SettingsMarginSend());
    settings.push(this.SettingsTypeaheadSend());
    settings.push(this.SettingMobileAppConfigurations());
    settings.push(this.SettingSchedulingConfigurations());
    settings.push(this.SettingEventViewerConfigurations());
    settings.push(this.SettingFieldsInvoiceConfigurations());
    settings.push(this.SettingAttacment());
    settings.push(this.SettingFieldsPurchaseInvoiceConfigurations());
    settings.push(this.SettingsAttachmentsSend());
    settings.push(this.SettingFieldsNotificationsConfigurations());
    settings.push(this.SettingsAutomaticPrintingSend());

    if (SettingExistCode) {

      updateOrCreateSetting$ = this.settingsService.PatchSettings(settings);

    } else {
      updateOrCreateSetting$ = this.settingsService.PostSettings(settings);

    }

    updateOrCreateSetting$
      .pipe(
        finalize(() => this.overlayService.Drop())
      )
      .subscribe({
        next: (callback) => {
          this.modalService.Continue({
            title: `Opciones adicionales ${SettingExistCode ? 'actualizadas' : 'guardadas'} correctamente`,
            type: CLModalType.SUCCESS
          });

          let baseSegment = '/maintenance/companies';
          this.router.onSameUrlNavigation = 'reload';
          this.router.navigate([baseSegment, 'configurations', this.companyId]);
        },
        error: (err) => {
          this.modalService.Continue({
            title: `Se produjo un error ${SettingExistCode ? 'actualizando' : 'guardando'} las opciones adicionales`,
            subtitle: GetError(err),
            type: CLModalType.ERROR
          });
        }
      });
  }

  SettingsReportManagerSend(): ISettings {

    let setting = this.settings.find((element) => element.Code == SettingCode.ReportManager) as ISettings;

    let formValues = this.reportManagerForm.getRawValue() as IReportManagerSetting;

    if (setting) {
      let companyHasSetting: boolean = this.companyReportManager.some(x => x.CompanyId === this.companyId);

      if (companyHasSetting) {
        this.companyReportManager.forEach(x => {
          if (x.CompanyId === this.companyId) {
            x.CompanyKey = formValues.CompanyKey,
              x.AppKey = formValues.AppKey
          }
        });

        setting.Json = JSON.stringify(this.companyReportManager);

      } else {
        this.companyReportManager.push(formValues);

        setting.Json = JSON.stringify(this.companyReportManager);
      }

    } else {
      this.companyReportManager.push(formValues);

      setting = {
        Id: null,
        Code: SettingCode.ReportManager,
        View: "N/A",
        Json: JSON.stringify(this.companyReportManager),
        IsActive: true
      };
    }

    return setting;

  }

  SettingsInventorySend(): ISettings {
    let validateInventorySettingExistCode = this.settings.find((element) => element.Code == SettingCode.ValidateInventory) as ISettings;

    let InventoryCompany: IValidateInventorySetting = {
      CompanyId: this.companyId,
      Validate: this.validateInventoryTables.map(element => ({
        Table: element.Table,
        Description: element.Description,
        ValidateInventory: element.ValidateInventory || false,
        ValidateBatchesInventory: element.ValidateBatchesInventory || false
      }))
    };

    if (validateInventorySettingExistCode) {
      let settings = this.vldInventoryCompany.some(x => x.CompanyId === this.companyId);

      if (settings) {
        this.vldInventoryCompany.forEach(x => {
          if (x.CompanyId === this.companyId) {
            x.Validate = InventoryCompany.Validate;
          }
        });
      } else {
        this.vldInventoryCompany.push(InventoryCompany);
      }

      validateInventorySettingExistCode.Json = JSON.stringify(this.vldInventoryCompany);

    } else {
      this.vldInventoryCompany = [InventoryCompany];
      validateInventorySettingExistCode = {
        Id: null,
        Code: SettingCode.ValidateInventory,
        View: "N/A",
        Json: JSON.stringify(this.vldInventoryCompany),
        IsActive: true
      };

    }

    return validateInventorySettingExistCode;

  }

  SettingsAttachmentsSend(): ISettings {

    let validateAttachmentSettingExistCode = this.settings.find((element) => element.Code == SettingCode.ValidateAttachments) as ISettings;

    let attachmentCompany: IValidateAttachmentsSetting = {
      CompanyId: this.companyId,
      Validate: this.validateAttachmentsTables
    };

    if (validateAttachmentSettingExistCode) {

      let settings = this.vldAttachmentsCompany.some(x => x.CompanyId === this.companyId);

      if (settings) {

        this.vldAttachmentsCompany.forEach(x => {
          if (x.CompanyId === this.companyId) {
            x.Validate = this.validateAttachmentsTables;
          }
        });

        validateAttachmentSettingExistCode.Json = JSON.stringify(this.vldAttachmentsCompany);

      } else {

        this.vldAttachmentsCompany.push(attachmentCompany);
        validateAttachmentSettingExistCode.Json = JSON.stringify(this.vldAttachmentsCompany);
      }

    } else {
      this.vldAttachmentsCompany.push(attachmentCompany);
      validateAttachmentSettingExistCode = {
        Id: null,
        Code: SettingCode.ValidateAttachments,
        View: "N/A",
        Json: JSON.stringify(this.vldAttachmentsCompany),
        IsActive: true
      };

    }

    return validateAttachmentSettingExistCode;

  }

  /**
   * Generates and updates the automatic printing validation settings for the company.
   *
   * @returns An `ISettings` object containing the updated configuration.
   */
  SettingsAutomaticPrintingSend(): ISettings {
    let validateAutomaticPrintingSettingExistCode: ISettings = this.settings.find((element: ISettings) => element.Code == SettingCode.ValidateAutomaticPrinting) as ISettings;

    let automaticPrintingCompany: IValidateAutomaticPrintingsSetting = {
      CompanyId: this.companyId,
      Validate: this.validateAutomaticPrintingTables.map((element: IValidateAutomaticPrinting) => ({
        Table: element.Table,
        Description: element.Description,
        Active: element.Active || false
      }))
    };

    if(validateAutomaticPrintingSettingExistCode){
      let settings = this.vldAutomaticPrintingCompany.some(x => x.CompanyId === this.companyId);

      if (settings) {
        this.vldAutomaticPrintingCompany.forEach(x => {
          if (x.CompanyId === this.companyId) {
            x.Validate = automaticPrintingCompany.Validate;
          }
        });
      } else {
        this.vldAutomaticPrintingCompany.push(automaticPrintingCompany);
      }
      validateAutomaticPrintingSettingExistCode.Json = JSON.stringify(this.vldAutomaticPrintingCompany);

    } else {
      this.vldAutomaticPrintingCompany.push(automaticPrintingCompany);
      validateAutomaticPrintingSettingExistCode = {
        Id: null,
        Code: SettingCode.ValidateAutomaticPrinting,
        View: "N/A",
        Json: JSON.stringify(this.vldAutomaticPrintingCompany),
        IsActive: true
      };
    }

    return validateAutomaticPrintingSettingExistCode;
  };

  SettingsRouteSend(): ISettings {

    let setting = this.settings.find((element) => element.Code == SettingCode.Route) as ISettings;

    let formValues = this.routeForm.getRawValue() as IRouteSetting;

    if (setting) {
      let companyHasSetting: boolean = this.companyRoute.some(x => x.CompanyId === this.companyId);

      if (companyHasSetting) {
        this.companyRoute.forEach(x => {
          if (x.CompanyId === this.companyId) {
            x.PortServiceLocal = formValues.PortServiceLocal,
              x.PortServicePinpad = formValues.PortServicePinpad,
              x.PortServiceHacienda = formValues.PortServiceHacienda,
              x.MessageServiceLayer = formValues.MessageServiceLayer
          }
        });

        setting.Json = JSON.stringify(this.companyRoute);

      } else {
        this.companyRoute.push(formValues);

        setting.Json = JSON.stringify(this.companyRoute);
      }

    } else {
      this.companyRoute.push(formValues);

      setting = {
        Id: null,
        Code: SettingCode.Route,
        View: "N/A",
        Json: JSON.stringify(this.companyRoute),
        IsActive: true
      };
    }

    return setting;

  }

  SettingsBusinessPartnerSend(): ISettings {

    let setting = this.settings.find((element) => element.Code == SettingCode.DefaultBusinessPartner) as ISettings;

    let formValues = this.defaultBusinessPartnerForm.getRawValue() as IDefaultBusinessPartnerSetting;


    if (setting) {
      let companyHasSetting: boolean = this.companyDefaultBusinessPartner.some(x => x.CompanyId === this.companyId);

      if (companyHasSetting) {
        this.companyDefaultBusinessPartner.forEach(x => {
          if (x.CompanyId === this.companyId) {
            x.BusinessPartnerCustomer = formValues.BusinessPartnerCustomer,
              x.BusinessPartnerSupplier = formValues.BusinessPartnerSupplier
          }
        });

        setting.Json = JSON.stringify(this.companyDefaultBusinessPartner);

      } else {
        this.companyDefaultBusinessPartner.push(formValues);
        setting.Json = JSON.stringify(this.companyDefaultBusinessPartner);
      }

    } else {
      this.companyDefaultBusinessPartner.push(formValues);

      setting = {
        Id: null,
        Code: SettingCode.DefaultBusinessPartner,
        View: "N/A",
        Json: JSON.stringify(this.companyDefaultBusinessPartner),
        IsActive: true
      };
    }

    return setting;

  }

  SettingsDecimalSend(): ISettings {

    let setting = this.settings.find((element) => element.Code == SettingCode.Decimal) as ISettings;

    let formValues = this.decimalForm.getRawValue() as IDecimalSetting;

    if (setting) {
      let companyHasSetting: boolean = this.companyDecimal.some(x => x.CompanyId === this.companyId);

      if (companyHasSetting) {
        this.companyDecimal.forEach(x => {
          if (x.CompanyId === this.companyId) {
            x.Price = formValues.Price,
              x.TotalLine = formValues.TotalLine,
              x.TotalDocument = formValues.TotalDocument
          }
        });

        setting.Json = JSON.stringify(this.companyDecimal);

      } else {
        this.companyDecimal.push(formValues);

        setting.Json = JSON.stringify(this.companyDecimal);
      }

    } else {
      this.companyDecimal.push(formValues);

      setting = {
        Id: null,
        Code: SettingCode.Decimal,
        View: "N/A",
        Json: JSON.stringify(this.companyDecimal),
        IsActive: true
      };
    }

    return setting;

  }

  SettingsPaymentSend(): ISettings {

    let setting = this.settings.find((element) => element.Code == SettingCode.Payment) as ISettings;

    let formValues = this.paymentForm.getRawValue() as IPaymentSetting;

    if (setting) {
      let companyHasSetting: boolean = this.companyPayment.some(x => x.CompanyId === this.companyId);

      if (companyHasSetting) {
        this.companyPayment.forEach(x => {
          if (x.CompanyId === this.companyId) {
            x.CardNumber = formValues.CardNumber;
            x.CardValid = formValues.CardValid;
            x.Pinpad = formValues.Pinpad;
            x.ConsultFE = formValues.ConsultFE;
            x.RequiredCardAccount = formValues.RequiredCardAccount;
            x.RequiredCashAccount = formValues.RequiredCashAccount;
            x.RequiredTransferAccount = formValues.RequiredTransferAccount;
            x.OrderLine = !formValues.OrderLine;
            x.RetentionProcess = formValues.RetentionProcess;
            x.ModalProcess = formValues.ModalProcess;
          }
        });

        setting.Json = JSON.stringify(this.companyPayment);

      } else {
        this.companyPayment.push(formValues);

        setting.Json = JSON.stringify(this.companyPayment);
      }

    } else {
      this.companyPayment.push(formValues);

      setting = {
        Id: null,
        Code: SettingCode.Payment,
        View: "N/A",
        Json: JSON.stringify(this.companyPayment),
        IsActive: true
      };
    }

    return setting;

  }

  SettingsLineSend(): ISettings {

    let setting = this.settings.find((element) => element.Code == SettingCode.LineMode) as ISettings;

    let ILineCompany: ILineModeSetting = {
      CompanyId: this.companyId,
      Validate: this.vldLineTables
    };

    if (setting) {

      let settings = this.vldLineModeCompany.some(x => x.CompanyId === this.companyId);

      if (settings) {

        this.vldLineModeCompany.forEach(x => {
          if (x.CompanyId === this.companyId) {
            x.Validate = this.vldLineTables;
          }
        });

        setting.Json = JSON.stringify(this.vldLineModeCompany);

      } else {

        this.vldLineModeCompany.push(ILineCompany);
        setting.Json = JSON.stringify(this.vldLineModeCompany);
      }

    } else {
      this.vldLineModeCompany.push(ILineCompany);
      setting = {
        Id: null,
        Code: SettingCode.LineMode,
        View: "N/A",
        Json: JSON.stringify(this.vldLineModeCompany),
        IsActive: true
      };

    }

    return setting;

  }

  SettingsAdjustmentInventorySend(): ISettings {

    let setting = this.settings.find((element) => element.Code == SettingCode.AdjustmentInventory) as ISettings;

    let formValues = this.adjustmentInventoryForm.getRawValue() as IAdjustmentInventorySetting;

    if (setting) {
      let companyHasSetting: boolean = this.companyAdjustmentInventory.some(x => x.CompanyId === this.companyId);

      if (companyHasSetting) {
        this.companyAdjustmentInventory.forEach(x => {
          if (x.CompanyId === this.companyId) {
            x.Comments = formValues.Comments,
              x.GoodsReceiptAccount = formValues.GoodsReceiptAccount
          }
        });

        setting.Json = JSON.stringify(this.companyAdjustmentInventory);

      } else {
        this.companyAdjustmentInventory.push(formValues);

        setting.Json = JSON.stringify(this.companyAdjustmentInventory);
      }

    } else {
      this.companyAdjustmentInventory.push(formValues);

      setting = {
        Id: null,
        Code: SettingCode.AdjustmentInventory,
        View: "N/A",
        Json: JSON.stringify(this.companyAdjustmentInventory),
        IsActive: true
      };
    }

    return setting;

  }

  SettingsMemoryInvoiceSend(): ISettings {

    let setting = this.settings.find((element) => element.Code == SettingCode.MemoryInvoice) as ISettings;

    let formValues = this.memoryInvoiceForm.getRawValue() as IMemoryInvoiceSetting;

    if (setting) {
      let companyHasSetting: boolean = this.companyMemoryInvoice.some(x => x.CompanyId === this.companyId);

      if (companyHasSetting) {
        this.companyMemoryInvoice.forEach(x => {
          if (x.CompanyId === this.companyId) {
            x.Name = formValues.Name,
              x.Quantity = formValues.Quantity
          }
        });

        setting.Json = JSON.stringify(this.companyMemoryInvoice);

      } else {
        this.companyMemoryInvoice.push(formValues);

        setting.Json = JSON.stringify(this.companyMemoryInvoice);
      }

    } else {
      this.companyMemoryInvoice.push(formValues);

      setting = {
        Id: null,
        Code: SettingCode.MemoryInvoice,
        View: "N/A",
        Json: JSON.stringify(this.companyMemoryInvoice),
        IsActive: true
      };
    }

    return setting;

  }


  SettingsMarginSend(): ISettings {

    let setting = this.settings.find((element) => element.Code == SettingCode.Margin) as ISettings;

    let MarginCompany: IMarginSetting = {
      CompanyId: this.companyId,
      Margin: this.margin
    };

    if (setting) {

      let settings = this.marginCompany.some(x => x.CompanyId === this.companyId);

      if (settings) {

        this.marginCompany.forEach(x => {
          if (x.CompanyId === this.companyId) {
            x.Margin = this.margin;
          }
        });

        setting.Json = JSON.stringify(this.marginCompany);

      } else {

        this.marginCompany.push(MarginCompany);
        setting.Json = JSON.stringify(this.marginCompany);
      }

    } else {
      this.marginCompany.push(MarginCompany);
      setting = {
        Id: null,
        Code: SettingCode.Margin,
        View: "N/A",
        Json: JSON.stringify(this.marginCompany),
        IsActive: true
      };

    }

    return setting;

  }

  SettingsTypeaheadSend(): ISettings {

    let setting = this.settings.find((element) => element.Code == SettingCode.PatternTypeahead) as ISettings;

    let formValues = this.typeaheadForm.getRawValue() as ITypeaheadPatternSetting;

    if (setting) {
      let companyHasSetting: boolean = this.companyTypeahead.some(x => x.CompanyId === this.companyId);

      if (companyHasSetting) {
        this.companyTypeahead.forEach(x => {
          if (x.CompanyId === this.companyId) {
            x.ItemPattern = formValues.ItemPattern,
              x.BusinessPattern = formValues.BusinessPattern
          }
        });

        setting.Json = JSON.stringify(this.companyTypeahead);

      } else {
        this.companyTypeahead.push(formValues);

        setting.Json = JSON.stringify(this.companyTypeahead);
      }

    } else {
      this.companyTypeahead.push(formValues);

      setting = {
        Id: null,
        Code: SettingCode.PatternTypeahead,
        View: "N/A",
        Json: JSON.stringify(this.companyTypeahead),
        IsActive: true
      };
    }

    return setting;

  }

  /**
   * Download report
   * @param _type - Type docuement to download reportt
   * @constructor
   */
  DownloadPrintFormat(_type: number): void {
    this.overlayService.OnGet();

    let downloadPrintFormat$: Observable<Structures.Interfaces.ICLResponse<IDownloadBase64>> | null = null;

    switch (_type) {
      case PrintFormat.SaleOffer:
        downloadPrintFormat$ = this.printFormatsService.Download(this.companyId, 'SaleOffer');
        break;

      case PrintFormat.SaleOrder:
        downloadPrintFormat$ = this.printFormatsService.Download(this.companyId, 'SaleOrder');
        break;

      case PrintFormat.Invoices:
        downloadPrintFormat$ = this.printFormatsService.Download(this.companyId, 'Invoices');
        break;

      case PrintFormat.ReprintSaleOrders:
        downloadPrintFormat$ = this.printFormatsService.Download(this.companyId, 'ReprintSaleOrders');
        break;

      case PrintFormat.ReceivedPayment:
        downloadPrintFormat$ = this.printFormatsService.Download(this.companyId, 'ReceivedPayment');
        break;

      case PrintFormat.CashClosing:
        downloadPrintFormat$ = this.printFormatsService.Download(this.companyId, 'CashClosing');
        break;

      case PrintFormat.ReprintInvoices:
        downloadPrintFormat$ = this.printFormatsService.Download(this.companyId, 'ReprintInvoices');
        break;

      case PrintFormat.ReprintSaleOffers:
        downloadPrintFormat$ = this.printFormatsService.Download(this.companyId, 'ReprintSaleOffers');
        break;

      case PrintFormat.VoucherCancellation:
        downloadPrintFormat$ = this.printFormatsService.Download(this.companyId, 'VoucherCancellation');
        break;

      case PrintFormat.PinPadInvoices:
        downloadPrintFormat$ = this.printFormatsService.Download(this.companyId, 'PinPadInvoices');
        break;

      case PrintFormat.CreditNote:
        downloadPrintFormat$ = this.printFormatsService.Download(this.companyId, 'CreditNote');
        break;

      case PrintFormat.GoodsReceipt:
        downloadPrintFormat$ = this.printFormatsService.Download(this.companyId, 'GoodsReceipt');
        break;

      case PrintFormat.GoodsIssue:
        downloadPrintFormat$ = this.printFormatsService.Download(this.companyId, 'GoodsIssue');
        break;

      case PrintFormat.InventoryTransferRequest:
        downloadPrintFormat$ = this.printFormatsService.Download(this.companyId, 'InventoryTransferRequest');
        break;

      case PrintFormat.InventoryTransfer:
        downloadPrintFormat$ = this.printFormatsService.Download(this.companyId, 'InventoryTransfer');
        break;

      case PrintFormat.GoodsReceiptPO:
        downloadPrintFormat$ = this.printFormatsService.Download(this.companyId, 'GoodsReceiptPO');
        break;

      case PrintFormat.GoodsReturn:
        downloadPrintFormat$ = this.printFormatsService.Download(this.companyId, 'GoodsReturn');
        break;

      case PrintFormat.CancelPayment:
        downloadPrintFormat$ = this.printFormatsService.Download(this.companyId, 'CancelPayment');
        break;

      case PrintFormat.APInvoice:
        downloadPrintFormat$ = this.printFormatsService.Download(this.companyId, 'APInvoice');
        break;

      case PrintFormat.OutgoingPayment:
        downloadPrintFormat$ = this.printFormatsService.Download(this.companyId, 'OutgoingPayment');
        break;
      case PrintFormat.ArDownPayment:
        downloadPrintFormat$ = this.printFormatsService.Download(this.companyId, 'ArDownPayment');
        break;
      case PrintFormat.PinpadDownPayment:
        downloadPrintFormat$ = this.printFormatsService.Download(this.companyId, 'PinpadDownPayment');
        break;
      case PrintFormat.ReprintArDownPayment:
        downloadPrintFormat$ = this.printFormatsService.Download(this.companyId, 'ReprintArDownPayment');
        break;

      case PrintFormat.ReprintReserveInvoice:
        downloadPrintFormat$ = this.printFormatsService.Download(this.companyId, 'ReprintReserveInvoice');
        break;

      case PrintFormat.ReserveInvoice:
        downloadPrintFormat$ = this.printFormatsService.Download(this.companyId, 'ReserveInvoice');
        break;

      case PrintFormat.DeliveryNotes:
        downloadPrintFormat$ = this.printFormatsService.Download(this.companyId, 'DeliveryNotes');
        break;
      case PrintFormat.Preliminary:
        downloadPrintFormat$ = this.printFormatsService.Download(this.companyId, 'Preliminary');
        break;
      case PrintFormat.ReprintPreliminary:
        downloadPrintFormat$ = this.printFormatsService.Download(this.companyId, 'ReprintPreliminary');
        break;
      case PrintFormat.PurchaseOrder:
        downloadPrintFormat$ = this.printFormatsService.Download(this.companyId, 'PurchaseOrder');
        break;
      case PrintFormat.ReprintDeliveryNotes:
        downloadPrintFormat$ = this.printFormatsService.Download(this.companyId, 'ReprintDeliveryNotes');
        break;
      case PrintFormat.ApDownPayment:
        downloadPrintFormat$ = this.printFormatsService.Download(this.companyId, 'ApDownPayment');
        break;
      case PrintFormat.ReprintApDownPayment:
        downloadPrintFormat$ = this.printFormatsService.Download(this.companyId, 'ReprintApDownPayment');
        break;
      case PrintFormat.PinpadApDownPayment:
        downloadPrintFormat$ = this.printFormatsService.Download(this.companyId, 'PinpadApDownPayment');
        break;
      case PrintFormat.PinpadAPInvoice:
        downloadPrintFormat$ = this.printFormatsService.Download(this.companyId, 'PinpadAPInvoice');
        break;
      case PrintFormat.ReprintCreditNotes:
        downloadPrintFormat$ = this.printFormatsService.Download(this.companyId, 'ReprintCreditNotes');
        break;
      case PrintFormat.ReprintTransferRequest:
        downloadPrintFormat$ = this.printFormatsService.Download(this.companyId, 'ReprintTransferRequest');
        break;
      case PrintFormat.ReprintPurchaseOrder:
        downloadPrintFormat$ = this.printFormatsService.Download(this.companyId, 'ReprintPurchaseOrder');
        break;


    }

    downloadPrintFormat$?.pipe(finalize(() => this.overlayService.Drop()))
      .subscribe({
        next: (callback) => {
          DownloadBase64File(callback.Data.Base64, callback.Data.FileName, callback.Data.BlobType, callback.Data.FileExtension);
        }
      });
  }

  /**
   * Method to attach a file
   * @param _event - Button event
   * @param _type - Indicates document belongs print format
   * @constructor
   */
  OnAttachPrintFormat(_event: any, _type: number): void {

    // Valido que el archivo sea de tipo .rpt
    if (!['RPT'].includes(_event.target.files[0].name.split('.').pop().toUpperCase())) {
      this.alertsService.Toast({ message: 'Solo se permiten archivos .rpt', type: CLToastType.INFO });
      return;
    }

    switch (_type) {
      case PrintFormat.SaleOffer:
        this.printFormatFiles.SaleOffer = _event.target.files[0];
        this.companyReportForm.controls['SaleOffer'].setValue(_event.target.files[0].name);
        break;

      case PrintFormat.SaleOrder:
        this.printFormatFiles.SaleOrder = _event.target.files[0];
        this.companyReportForm.controls['SaleOrder'].setValue(_event.target.files[0].name);
        break;

      case PrintFormat.Invoices:
        this.printFormatFiles.Invoices = _event.target.files[0];
        this.companyReportForm.controls['Invoices'].setValue(_event.target.files[0].name);
        break;

      case PrintFormat.CreditNote:
        this.printFormatFiles.CreditNote = _event.target.files[0];
        this.companyReportForm.controls['CreditNote'].setValue(_event.target.files[0].name);
        break;

      case PrintFormat.ReceivedPayment:
        this.printFormatFiles.ReceivedPayment = _event.target.files[0];
        this.companyReportForm.controls['ReceivedPayment'].setValue(_event.target.files[0].name);
        break;

      case PrintFormat.CashClosing:
        this.printFormatFiles.CashClosing = _event.target.files[0];
        this.companyReportForm.controls['CashClosing'].setValue(_event.target.files[0].name);
        break;

      case PrintFormat.ReprintInvoices:
        this.printFormatFiles.ReprintInvoices = _event.target.files[0];
        this.companyReportForm.controls['ReprintInvoices'].setValue(_event.target.files[0].name);
        break;

      case PrintFormat.ReprintSaleOffers:
        this.printFormatFiles.ReprintSaleOffers = _event.target.files[0];
        this.companyReportForm.controls['ReprintSaleOffers'].setValue(_event.target.files[0].name);
        break;

      case PrintFormat.ReprintSaleOrders:
        this.printFormatFiles.ReprintSaleOrders = _event.target.files[0];
        this.companyReportForm.controls['ReprintSaleOrders'].setValue(_event.target.files[0].name);
        break;

      case PrintFormat.PinPadInvoices:
        this.printFormatFiles.PinPadInvoices = _event.target.files[0];
        this.companyReportForm.controls['PinPadInvoices'].setValue(_event.target.files[0].name);
        break;

      case PrintFormat.VoucherCancellation:
        this.printFormatFiles.VoucherCancellation = _event.target.files[0];
        this.companyReportForm.controls['VoucherCancellation'].setValue(_event.target.files[0].name);
        break;

      case PrintFormat.GoodsReceipt:
        this.printFormatFiles.GoodsReceipt = _event.target.files[0];
        this.companyReportForm.controls['GoodsReceipt'].setValue(_event.target.files[0].name);
        break;

      case PrintFormat.GoodsIssue:
        this.printFormatFiles.GoodsIssue = _event.target.files[0];
        this.companyReportForm.controls['GoodsIssue'].setValue(_event.target.files[0].name);
        break;

      case PrintFormat.InventoryTransferRequest:
        this.printFormatFiles.InventoryTransferRequest = _event.target.files[0];
        this.companyReportForm.controls['InventoryTransferRequest'].setValue(_event.target.files[0].name);
        break;

      case PrintFormat.InventoryTransfer:
        this.printFormatFiles.InventoryTransfer = _event.target.files[0];
        this.companyReportForm.controls['InventoryTransfer'].setValue(_event.target.files[0].name);
        break;

      case PrintFormat.GoodsReceiptPO:
        this.printFormatFiles.GoodsReceiptPO = _event.target.files[0];
        this.companyReportForm.controls['GoodsReceiptPO'].setValue(_event.target.files[0].name);
        break;

      case PrintFormat.GoodsReturn:
        this.printFormatFiles.GoodsReturn = _event.target.files[0];
        this.companyReportForm.controls['GoodsReturn'].setValue(_event.target.files[0].name);
        break;

      case PrintFormat.APInvoice:
        this.printFormatFiles.APInvoice = _event.target.files[0];
        this.companyReportForm.controls['APInvoice'].setValue(_event.target.files[0].name);
        break;

      case PrintFormat.CancelPayment:
        this.printFormatFiles.CancelPayment = _event.target.files[0];
        this.companyReportForm.controls['CancelPayment'].setValue(_event.target.files[0].name);
        break;

      case PrintFormat.OutgoingPayment:
        this.printFormatFiles.OutgoingPayment = _event.target.files[0];
        this.companyReportForm.controls['OutgoingPayment'].setValue(_event.target.files[0].name);
        break;

      case PrintFormat.PurchaseOrder:
        this.printFormatFiles.PurchaseOrder = _event.target.files[0];
        this.companyReportForm.controls['PurchaseOrder'].setValue(_event.target.files[0].name);
        break;
      case PrintFormat.ArDownPayment:
        this.printFormatFiles.ArDownPayment = _event.target.files[0];
        this.companyReportForm.controls['ArDownPayment'].setValue(_event.target.files[0].name);
        break;
      case PrintFormat.PinpadDownPayment:
        this.printFormatFiles.PinpadDownPayment = _event.target.files[0];
        this.companyReportForm.controls['PinpadDownPayment'].setValue(_event.target.files[0].name);
        break;
      case PrintFormat.ReprintArDownPayment:
        this.printFormatFiles.ReprintArDownPayment = _event.target.files[0];
        this.companyReportForm.controls['ReprintArDownPayment'].setValue(_event.target.files[0].name);
        break;

      case PrintFormat.ReprintReserveInvoice:
        this.printFormatFiles.ReprintReserveInvoice = _event.target.files[0];
        this.companyReportForm.controls['ReprintReserveInvoice'].setValue(_event.target.files[0].name);
        break;

      case PrintFormat.ReserveInvoice:
        this.printFormatFiles.ReserveInvoice = _event.target.files[0];
        this.companyReportForm.controls['ReserveInvoice'].setValue(_event.target.files[0].name);
        break;

      case PrintFormat.DeliveryNotes:
        this.printFormatFiles.DeliveryNotes = _event.target.files[0];
        this.companyReportForm.controls['DeliveryNotes'].setValue(_event.target.files[0].name);
        break;
      case PrintFormat.Preliminary:
        this.printFormatFiles.Preliminary = _event.target.files[0];
        this.companyReportForm.controls['Preliminary'].setValue(_event.target.files[0].name);
        break;
      case PrintFormat.ReprintPreliminary:
        this.printFormatFiles.ReprintPreliminary = _event.target.files[0];
        this.companyReportForm.controls['ReprintPreliminary'].setValue(_event.target.files[0].name);
        break;
      case PrintFormat.ReprintDeliveryNotes:
        this.printFormatFiles.ReprintDeliveryNotes = _event.target.files[0];
        this.companyReportForm.controls['ReprintDeliveryNotes'].setValue(_event.target.files[0].name);
        break;
      case PrintFormat.ApDownPayment:
        this.printFormatFiles.ApDownPayment = _event.target.files[0];
        this.companyReportForm.controls['ApDownPayment'].setValue(_event.target.files[0].name);
        break;
      case PrintFormat.ReprintApDownPayment:
        this.printFormatFiles.ReprintApDownPayment = _event.target.files[0];
        this.companyReportForm.controls['ReprintApDownPayment'].setValue(_event.target.files[0].name);
        break;
      case PrintFormat.PinpadApDownPayment:
        this.printFormatFiles.PinpadApDownPayment = _event.target.files[0];
        this.companyReportForm.controls['PinpadApDownPayment'].setValue(_event.target.files[0].name);
        break;
      case PrintFormat.PinpadAPInvoice:
        this.printFormatFiles.PinpadAPInvoice = _event.target.files[0];
        this.companyReportForm.controls['PinpadAPInvoice'].setValue(_event.target.files[0].name);
        break;
      case PrintFormat.ReprintCreditNotes:
        this.printFormatFiles.ReprintCreditNotes = _event.target.files[0];
        this.companyReportForm.controls['ReprintCreditNotes'].setValue(_event.target.files[0].name);
        break;
      case PrintFormat.ReprintTransferRequest:
        this.printFormatFiles.ReprintTransferRequest = _event.target.files[0];
        this.companyReportForm.controls['ReprintTransferRequest'].setValue(_event.target.files[0].name);
        break;
      case PrintFormat.ReprintPurchaseOrder:
        this.printFormatFiles.ReprintPurchaseOrder = _event.target.files[0];
        this.companyReportForm.controls['ReprintPurchaseOrder'].setValue(_event.target.files[0].name);
        break;

    }

  }

  OpenEditDialog(_id?: number): void {

    let component: ComponentType<DbResourcesEditComponent | CompaniesComponent> = DbResourcesEditComponent;

    if (this.companiesTabIndex === 1) {
      component = DbResourcesEditComponent;
    }

    this.matDialog.open(component, {
      maxHeight: 'calc(100vh - 20px)',
      height: 'auto',
      maxWidth: '100vw',
      width: '60vw',
      disableClose: true,
      data: {
        RecordId: _id ?? '',
        CompanyId: this.companyId
      } as ICompanyDialogData
    })
      .afterClosed()
      .subscribe({
        next: (result) => {
          this.router.navigate([this.sharedService.GetCurrentRouteSegment()], { relativeTo: this.activatedRoute });
        }
      });
  }

  OpenAddDialog(): void {

    let component: ComponentType<DbResourcesAddComponent | CompaniesComponent> = DbResourcesAddComponent;

    if (this.companiesTabIndex === 1) {
      component = DbResourcesAddComponent;
    }

    this.matDialog.open(component as ComponentType<CompaniesComponent | DbResourcesAddComponent>, {
      maxHeight: 'calc(100vh - 20px)',
      height: 'auto',
      maxWidth: '100vw',
      width: '60vw',
      disableClose: true,
      data: {
        RecordId: 0,
        CompanyId: this.companyId
      } as ICompanyDialogData
    })
      .afterClosed()
      .subscribe({
        next: (result) => {
          this.router.navigate([this.sharedService.GetCurrentRouteSegment()], { relativeTo: this.activatedRoute });
        }
      });
  }

  FilterDBResources(): void {
    let filters = this.dbResourcesFormFilters.value as { Criteria: string, Type: string };

    let filterValidations = (_dbo: IDBResource, _filters: { Criteria: string, Type: string }): boolean => {
      return (_dbo.Type.includes(_filters.Type) || _filters.Type === '*')
        && `${_dbo.Code}${_dbo.Description}${_dbo.CreatedBy}${_dbo.UpdatedBy}${_dbo.DBObject}${_dbo.QueryString}`.toLowerCase().includes(_filters.Criteria?.toLowerCase() || '');
    }

    this.filteredDbResources = this.dbResources
      .filter(dbo => filterValidations(dbo, filters))
      .map(x => this.sharedService.MapTableColumns(
        {
          ...x,
          TypeDescription: this.dbResourceTypes.find(t => t.Type === x.Type)?.Description || x.Type,
          Active: x.IsActive ? 'Sí' : 'No'
        },
        Object.keys(this.dbResourceTableColumns)
      ));


    const NEW_TABLE_STATE = {
      CurrentPage: 0,
      ItemsPeerPage: 5,
      Records: this.filteredDbResources,
      RecordsCount: this.filteredDbResources.length
    }

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(NEW_TABLE_STATE),
      Target: this.dbResourceTableId
    });
  }

  LoadTypeAheadTag(): void {
    this.typeAheadItemTag.push(
      {
        Tag: "@CODE",
        Title: "Código del artículo.",
        IsRequired: true,
      },
      {
        Tag: "@NAME",
        Title: "Nombre del artículo.",
        IsRequired: true,
      },
      {
        Tag: "@BARCODE",
        Title: "Código de barras del artículo.",
        IsRequired: false,
      },
      {
        Tag: "@STOCK",
        Title: "Stock del artículo.",
        IsRequired: false,
      },
      {
        Tag: "@SERIE",
        Title: "Serie del artículo.",
        IsRequired: false,
      },
      {
        Tag: "@LOTE",
        Title: "Lote del artículo.",
        IsRequired: false,
      },
      {
        Tag: "@BINCODE",
        Title: "Ubicación del artículo.",
        IsRequired: false,
      },
    );

    this.typeAheadBusinessPartnersTag.push(
      {
        Tag: "@CODE",
        Title: "Código del socio.",
        IsRequired: true,
      },
      {
        Tag: "@NAME",
        Title: "Nombre del socio.",
        IsRequired: true,
      }
    );
  }

  AddTag(_tag: string, _control: string): void {

    let formControlValue: string = this.typeaheadForm.get(_control)?.value || '';

    if (formControlValue.includes(_tag)) {
      return;
    }

    formControlValue += _tag;

    this.typeaheadForm.controls[_control].setValue(formControlValue);

  }

  OnAttachLogo(_event: any) {
    let file = _event.target.files[0];
    this.companyLogoFieldText = file.name;
  }

  /**
   * This method is used to activate or deactivate the use of loyalty plans
   * @param value
   * @constructor
   */
  public ActiveLoyaltyPlan(value: boolean): void {
    this.activePlan = value;
    if (!this.activePlan) {
      this.loyaltyPlanForm.disable();
      this.tappForm.disable();
      this.lealtoForm.disable();
      this.tappSelect = true;
      this.lealtoSelect = false;
      this.loyaltyPlanForm.controls['plan'].setValue('tapp');
    } else {
      this.lealtoForm.enable();
      this.loyaltyPlanForm.enable();
      this.tappForm.enable();
    }
    this.changeDetectorRef.detectChanges();
    this.SetExpirationDateInputValue();
  }

  /**
   * This method is used when selecting a loyalty plan and setting the dates.
   * @param value parameter value of the checkked
   * @constructor
   */
  public SelectPlan(value: string): void {
    this.tappSelect = value === 'tapp';
    this.lealtoSelect = value === 'lealto';
    this.changeDetectorRef.detectChanges();

    this.SetExpirationDateInputValue();
  }

  private SaveLoyaltyPlan(): void {
    try {
      if (this.activePlan && !this.loyaltyPlanForm.controls['plan'].value) {
        return;
      }

      if (this.activePlan && this.loyaltyPlanForm.controls['plan'].value === 'tapp' && this.tappForm.invalid) {
        return;
      }

      if (this.activePlan && this.loyaltyPlanForm.controls['plan'].value === 'lealto' && this.lealtoForm.invalid) {
        return;
      }


      let valueLealto = this.lealtoForm.getRawValue();
      let valueTapp = this.tappForm.getRawValue();

      if (!this.loyaltyPlan) {
        this.loyaltyPlan = {
          Lealto: {
            UrlBase: valueLealto.UrlBase,
            UrlLogin: '',
            UrlConfigCompany: '',
            UrlPoints: '',
            UrlUser: '',
            UrlAccumulationPoints: '',
            UrlRedimirPoints: '',
            UrlCancelarTransaccion: '',
            LealtoConfigs: [
              {
                Ambiente: valueLealto.Ambiente,
                Active: this.lealtoSelect,
                ApiKey: valueLealto.ApiKey,
                User: valueLealto.User,
                Password: valueLealto.Password,
                Card: {
                  Id: valueLealto.Id,
                  CardNumber: valueLealto.CardNumber,
                  Valid: valueLealto.Valid ? formatDate(valueLealto.Valid, 'MM/yyyy', 'en') : '',
                  Account: valueLealto.Account,
                  Voucher: valueLealto.Voucher,
                  Owner: valueLealto.Owner
                } as IPlanCard
              } as ILealtoConfig
            ]
          } as ILealtoConfigBase,
          Tapp: {
            Url: valueTapp.Url,
            TappConfigs: [
              {
                CompanyId: this.companyId,
                Active: this.tappSelect,
                Token: valueTapp.Token,
                Register: valueTapp.Register,
                Store: valueTapp.Store,
                Card: {
                  Id: valueTapp.Id,
                  CardNumber: valueTapp.CardNumber,
                  Valid: valueTapp.Valid ? formatDate(valueTapp.Valid, 'MM/yyyy', 'en') : '',
                  Account: valueTapp.Account,
                  Voucher: valueTapp.Voucher,
                  Owner: valueTapp.Owner
                } as IPlanCard
              } as ITappConfig
            ]
          } as ITappConfigBase
        } as ILoyaltyPlan;

      }

      if (this.loyaltyPlan) {
        let dataTapp = this.loyaltyPlan.Tapp;
        let dataTappConfig = dataTapp?.TappConfigs.find(x => x.CompanyId === this.companyId);
        if (dataTappConfig) {
          dataTappConfig.Active = this.tappSelect;
          dataTappConfig.Token = valueTapp.Token || dataTappConfig.Token;
          dataTappConfig.Register = valueTapp.Register;
          dataTappConfig.Store = valueTapp.Store;
          dataTappConfig.Card.Id = valueTapp.Id;
          dataTappConfig.Card.CardNumber = valueTapp.CardNumber;
          dataTappConfig.Card.Valid = valueTapp.Valid ? formatDate(valueTapp.Valid, 'MM/yyyy', 'en') : '';
          dataTappConfig.Card.Account = valueTapp.Account;
          dataTappConfig.Card.Voucher = valueTapp.Voucher;
          dataTappConfig.Card.Owner = valueTapp.Owner;
        } else {
          let dataNewTappConfig = {
            CompanyId: this.companyId,
            Active: this.tappSelect,
            Token: valueTapp.Token,
            Register: valueTapp.Register,
            Store: valueTapp.Store,
            Card: {
              Id: valueTapp.Id,
              CardNumber: valueTapp.CardNumber,
              Valid: valueTapp.Valid ? formatDate(valueTapp.Valid, 'MM/yyyy', 'en') : '',
              Account: valueTapp.Account,
              Voucher: valueTapp.Voucher,
              Owner: valueTapp.Owner
            } as IPlanCard
          } as ITappConfig;

          this.loyaltyPlan.Tapp.TappConfigs.push(dataNewTappConfig);
        }

        let dataLealto = this.loyaltyPlan.Lealto;
        let dataLealtoConfig = dataLealto?.LealtoConfigs.find(x => x.CompanyId === this.companyId);
        if (dataLealtoConfig) {
          dataLealtoConfig.Ambiente = valueLealto.Ambiente;
          dataLealtoConfig.Active = this.lealtoSelect;
          dataLealtoConfig.ApiKey = valueLealto.ApiKey;
          dataLealtoConfig.User = valueLealto.User;
          dataLealtoConfig.Password = valueLealto.Password ? valueLealto.Password : dataLealtoConfig.Password;
          dataLealtoConfig.Card.Id = valueLealto.Id;
          dataLealtoConfig.Card.CardNumber = valueLealto.CardNumber;
          dataLealtoConfig.Card.Valid = valueLealto.Valid ? formatDate(valueLealto.Valid, 'MM/yyyy', 'en') : '';
          dataLealtoConfig.Card.Account = valueLealto.Account;
          dataLealtoConfig.Card.Voucher = valueLealto.Voucher;
          dataLealtoConfig.Card.Owner = valueLealto.Owner;
        } else {
          let dataNewLealtoConfig = {
            Ambiente: valueLealto.Ambiente,
            Active: this.lealtoSelect,
            ApiKey: valueLealto.ApiKey,
            User: valueLealto.User,
            Password: valueLealto.Password,
            Card: {
              Id: valueLealto.Id,
              CardNumber: valueLealto.CardNumber,
              Valid: valueLealto.Valid ? formatDate(valueLealto.Valid, 'MM/yyyy', 'en') : '',
              Account: valueLealto.Account,
              Voucher: valueLealto.Voucher,
              Owner: valueLealto.Owner
            } as IPlanCard
          } as ILealtoConfig;

          this.loyaltyPlan.Lealto.LealtoConfigs.push(dataNewLealtoConfig);
        }
      }

      const data = {
        Code: SettingCode.Points,
        View: SettingCode.Points,
        IsActive: this.activePlan,
        Json: JSON.stringify(this.loyaltyPlan)
      } as ISettings;

      let saveChange$;

      if (!this.settingPoints) {
        saveChange$ = this.settingsService.Post(data);
      } else {
        saveChange$ = this.settingsService.Patch(data, data.Code);
      }

      this.overlayService.OnPost();
      saveChange$.pipe(
        finalize(() => this.overlayService.Drop())
      ).subscribe({
        next: (callback) => {
          this.modalService.Continue({
            title: `Plan de lealtad ${!this.settingPoints ? 'creado' : 'actualizado'} correctamente`,
            type: CLModalType.SUCCESS
          });
        },
        error: (err) => {
          this.modalService.Continue({
            title: `Se produjo un error ${!this.settingPoints ? 'creando' : 'actualizando'} el plan de lealtad`,
            subtitle: GetError(err),
            type: CLModalType.ERROR
          });
        }
      })

    } catch (error) {
      this.alertsService.Toast({ type: CLToastType.ERROR, message: String(error) });
    }

  }

  public ChangePasswordInputType(): void {
    this.passwordInputType = this.passwordInputType === 'password' ? 'text' : 'password';
    this.passwordBtnVisibilityIcon = this.passwordBtnVisibilityIcon === 'visibility' ? 'visibility_off' : 'visibility';
  }

  /**
   * This method is used to set the data of the loyalty plans
   * @constructor
   * @private
   */
  private SetInitialPlan(): void {

    // If the setting exist
    if (this.loyaltyPlan) {
      // If the setting Tapp exist we search the configs for the current company
      if (this.loyaltyPlan.Tapp) {
        // Get the tapp config of the current company
        let dataTapp = this.loyaltyPlan.Tapp.TappConfigs.find(x => x.CompanyId === this.companyId);

        if (dataTapp) {
          // The Valid property is set in the ngAfterViewInit method
          this.tappForm.patchValue({
            Id: dataTapp.Card.Id,
            CardNumber: dataTapp.Card.CardNumber,
            Account: dataTapp.Card.Account,
            Voucher: dataTapp.Card.Voucher,
            Owner: dataTapp.Card.Owner,
            Register: dataTapp.Register,
            Store: dataTapp.Store,
            Url: this.loyaltyPlan.Tapp.Url,
            Token: dataTapp.Token
          });

          this.tappSelect = dataTapp.Active;
          this.tappExpirationDateYearAndMonth = dataTapp.Card.Valid;
          if (dataTapp.Active) {
            this.loyaltyPlanForm.controls['plan'].setValue('tapp');
          }
        }
      }

      // If the setting Lealto exist we search the configs for the current company
      if (this.loyaltyPlan.Lealto) {
        // Get the lealto configs of the current company
        let dataLealto = this.loyaltyPlan.Lealto.LealtoConfigs.find(x => x.CompanyId === this.companyId);

        if (dataLealto) {
          this.lealtoForm.get("Password")?.clearValidators();
          this.lealtoForm.updateValueAndValidity();

          // The Valid property is set in the ngAfterViewInit method
          this.lealtoForm.patchValue({
            Id: dataLealto.Card.Id,
            CardNumber: dataLealto.Card.CardNumber,
            Account: dataLealto.Card.Account,
            Voucher: dataLealto.Card.Voucher,
            Owner: dataLealto.Card.Owner,
            ApiKey: dataLealto.ApiKey,
            User: dataLealto.User,
            Password: dataLealto.Password,
            UrlBase: this.loyaltyPlan.Lealto.UrlBase,
            Ambiente: dataLealto.Ambiente
          });

          this.lealtoForm.get("Valid")?.markAsTouched();
          this.lealtoSelect = dataLealto.Active;
          this.lealtoExpirationDateYearAndMonth = dataLealto.Card.Valid;
          if (dataLealto.Active) {
            this.loyaltyPlanForm.controls['plan'].setValue('lealto');
          }
        }
      }

    }

  }

  public SaveFieldsConfigured(): void {

    const ValidateType = this.fieldBusinessPartner.find(x => (x.FieldType && !x.NameSL) || (!x.FieldType && x.NameSL));

    if (ValidateType) {

      this.alertsService.Toast({
        message: `Complete configuración para campo ${ValidateType.Description}`,
        type: CLToastType.INFO
      });

      return;
    }

    this.overlayService.OnPost();

    let updateOrCreateSetting$: Observable<Structures.Interfaces.ICLResponse<ISettings>> | null = null;

    let fieldBusinessPartnerCompany: IConfiguredFieldsSetting = {
      CompanyId: this.companyId,
      IsCompanyDirection: this.IsCompanyDirection.value,
      Fields: this.fieldBusinessPartner
    };

    if (this.settingsFieldsConfiguredSAP) {

      let settings = this.fieldBusinessPartnerCompany.some(x => x.CompanyId === this.companyId);

      if (settings) {

        this.fieldBusinessPartnerCompany.forEach(x => {
          if (x.CompanyId === this.companyId) {
            x.Fields = this.fieldBusinessPartner;
            x.IsCompanyDirection = this.IsCompanyDirection.value;
          }
        });

        this.settingsFieldsConfiguredSAP.Json = JSON.stringify(this.fieldBusinessPartnerCompany);

      } else {

        this.fieldBusinessPartnerCompany.push(fieldBusinessPartnerCompany);
        this.settingsFieldsConfiguredSAP.Json = JSON.stringify(this.fieldBusinessPartnerCompany);
      }
      updateOrCreateSetting$ = this.settingsService.Patch(this.settingsFieldsConfiguredSAP, SettingCode.FieldsConfiguredSAP);

    } else {
      this.fieldBusinessPartnerCompany.push(fieldBusinessPartnerCompany);
      let setting = {
        Id: null,
        Code: SettingCode.FieldsConfiguredSAP,
        View: "N/A",
        Json: JSON.stringify(this.fieldBusinessPartnerCompany),
        IsActive: true
      };

      updateOrCreateSetting$ = this.settingsService.Patch(setting, SettingCode.FieldsConfiguredSAP);

    }

    updateOrCreateSetting$
      .pipe(
        finalize(() => this.overlayService.Drop())
      )
      .subscribe({
        next: (callback) => {

          this.modalService.Continue({
            title: 'Configuración de objetos guardada correctamente',
            type: CLModalType.SUCCESS
          });

          let baseSegment = '/maintenance/companies';
          this.router.onSameUrlNavigation = 'reload';
          this.router.navigate([baseSegment, 'configurations-fields', this.companyId]);
        },
        error: (err) => {
          this.modalService.Continue({
            title: 'Se produjo un error guardando la configuración de objetos',
            subtitle: GetError(err),
            type: CLModalType.ERROR
          });
        }
      });
  }

  SettingMobileAppConfigurations(): ISettings {
    let mobileAppConfigurationSetting = this.settings.find(s => s.Code === SettingCode.MobileAppConfiguration);

    if (!mobileAppConfigurationSetting) {
      mobileAppConfigurationSetting = {
        Code: SettingCode.MobileAppConfiguration,
        View: 'Companies',
        IsActive: true,
        Json: JSON.stringify([{
          ...this.mobileAppConfigurationsForm.getRawValue(),
          CompanyId: this.companyId
        } as IMobileAppSetting])
      } as ISettings;
    } else {
      let mobilesConfigurations = JSON.parse(mobileAppConfigurationSetting.Json) as IMobileAppSetting[];

      let indexOfSetting = mobilesConfigurations.findIndex(s => s.CompanyId === this.companyId);

      if (indexOfSetting !== -1) {
        mobilesConfigurations.splice(indexOfSetting, 1, {
          ...this.mobileAppConfigurationsForm.value,
          CompanyId: this.companyId
        });
      } else {
        mobilesConfigurations.push({ ...this.mobileAppConfigurationsForm.value, CompanyId: this.companyId });
      }

      mobileAppConfigurationSetting.Json = JSON.stringify(mobilesConfigurations);
    }

    return mobileAppConfigurationSetting;
  }

  SettingSchedulingConfigurations(): ISettings {
    let schedulingSetting = this.settings.find(s => s.Code === SettingCode.SchedulingConfiguration);

    if (!schedulingSetting) {
      schedulingSetting = {
        Code: SettingCode.SchedulingConfiguration,
        View: 'Companies',
        IsActive: true,
        Json: JSON.stringify([{
          ...this.schedulingConfigurationForm.value,
          CompanyId: this.companyId
        } as ISchedulingSetting])
      } as ISettings;
    } else {
      let schedulingSettings = JSON.parse(schedulingSetting.Json) as ISchedulingSetting[];

      let indexOfSetting = schedulingSettings.findIndex(s => s.CompanyId === this.companyId);

      if (indexOfSetting !== -1) {
        schedulingSettings.splice(indexOfSetting, 1, {
          ...this.schedulingConfigurationForm.value,
          CompanyId: this.companyId
        });
      } else {
        schedulingSettings.push({ ...this.schedulingConfigurationForm.value, CompanyId: this.companyId });
      }

      schedulingSetting.Json = JSON.stringify(schedulingSettings);
    }

    return schedulingSetting;
  }


  SettingEventViewerConfigurations(): ISettings {
    let evSetting = this.settings.find(s => s.Code === SettingCode.EventViewer);

    if (!evSetting) {
      evSetting = {
        Code: SettingCode.EventViewer,
        View: 'Companies',
        IsActive: true,
        Json: JSON.stringify([{
          ...this.eventViewerConfigurationForm.value,
          CompanyId: this.companyId
        } as IEventViewerSetting])
      } as ISettings;
    } else {
      let eventViewerSettings = JSON.parse(evSetting.Json) as IEventViewerSetting[];

      let indexOfSetting = eventViewerSettings.findIndex(s => s.CompanyId === this.companyId);

      if (indexOfSetting !== -1) {
        eventViewerSettings.splice(indexOfSetting, 1, {
          ...this.eventViewerConfigurationForm.value,
          CompanyId: this.companyId
        });
      } else {
        eventViewerSettings.push({ ...this.eventViewerConfigurationForm.value, CompanyId: this.companyId });
      }

      evSetting.Json = JSON.stringify(eventViewerSettings);
    }

    return evSetting;
  }

  SettingFieldsInvoiceConfigurations(): ISettings {
    let setting = this.settings.find(s => s.Code === SettingCode.FieldsInvoice);

    if (!setting) {
      setting = {
        Code: SettingCode.FieldsInvoice,
        View: 'Campos factura',
        IsActive: true,
        Json: JSON.stringify([{
          ...this.fieldsInvoiceConfigurationForm.value,
          CompanyId: this.companyId
        } as IFieldsInvoiceSetting])
      } as ISettings;
    } else {
      let eventViewerSettings = JSON.parse(setting.Json) as IFieldsInvoiceSetting[];

      let indexOfSetting = eventViewerSettings.findIndex(s => s.CompanyId === this.companyId);

      if (indexOfSetting !== -1) {
        eventViewerSettings.splice(indexOfSetting, 1, {
          ...this.fieldsInvoiceConfigurationForm.value,
          CompanyId: this.companyId
        });
      } else {
        eventViewerSettings.push({ ...this.fieldsInvoiceConfigurationForm.value, CompanyId: this.companyId });
      }

      setting.Json = JSON.stringify(eventViewerSettings);
    }

    return setting;
  }

  SettingAttacment(): ISettings {
    let setting = this.settings.find(s => s.Code === SettingCode.ShareFolder);

    if (!setting) {
      setting = {
        Code: SettingCode.ShareFolder,
        View: 'Anexos',
        IsActive: true,
        Json: JSON.stringify([{
          Ruta: this.rutaForm.value,
          CompanyId: this.companyId
        } as IShareFolderSetting])
      } as ISettings;
    } else {
      let eventViewerSettings = JSON.parse(setting.Json) as IShareFolderSetting[];

      let indexOfSetting = eventViewerSettings.findIndex(s => s.CompanyId === this.companyId);

      if (indexOfSetting !== -1) {
        eventViewerSettings.splice(indexOfSetting, 1, {
          Ruta: this.rutaForm.value,
          CompanyId: this.companyId
        });
      } else {
        eventViewerSettings.push({ ...this.rutaForm.value, CompanyId: this.companyId });
      }

      setting.Json = JSON.stringify(eventViewerSettings);
    }

    return setting;
  }

  /**
   * Method to return configuration setting purchase invoice
   * @constructor
   */
  SettingFieldsPurchaseInvoiceConfigurations(): ISettings {
    let setting = this.settings.find(s => s.Code === SettingCode.FieldsPurchaseInvoice);

    if (!setting) {
      setting = {
        Code: SettingCode.FieldsPurchaseInvoice,
        View: 'Campos factura proveedor',
        IsActive: true,
        Json: JSON.stringify([{
          ...this.fieldsPurchaseInvoiceConfigurationForm.value,
          CompanyId: this.companyId
        } as IFieldsPurchaseInvoiceSetting])
      } as ISettings;
    } else {
      let eventViewerSettings = JSON.parse(setting.Json) as IFieldsPurchaseInvoiceSetting[];

      let indexOfSetting = eventViewerSettings.findIndex(s => s.CompanyId === this.companyId);

      if (indexOfSetting !== -1) {
        eventViewerSettings.splice(indexOfSetting, 1, {
          ...this.fieldsPurchaseInvoiceConfigurationForm.value,
          CompanyId: this.companyId
        });
      } else {
        eventViewerSettings.push({ ...this.fieldsPurchaseInvoiceConfigurationForm.value, CompanyId: this.companyId });
      }

      setting.Json = JSON.stringify(eventViewerSettings);
    }

    return setting;
  }

  /**
   * Sets the selected month and year in a datepicker associated with a specific form.
   * @param _normalizedMonthAndYear The normalized month and year to be set in the datepicker.
   * @param _datepicker The datepicker instance associated with the form.
   * @param _formName The name of the form ('tapp' or 'lealto') to which the datepicker belongs.
   */
  SetMonthAndYear(_normalizedMonthAndYear: any, _datepicker: any, _formName: 'tapp' | 'lealto'): void {
    if (_formName === 'tapp') {
      this.tappExpirationDateYearAndMonth = formatDate(_normalizedMonthAndYear, 'MM/yyyy', 'en');
      this.tappForm.get('Valid')?.setValue(_normalizedMonthAndYear);
    }
    else {
      this.lealtoExpirationDateYearAndMonth = formatDate(_normalizedMonthAndYear, 'MM/yyyy', 'en');
      this.lealtoForm.get('Valid')?.setValue(_normalizedMonthAndYear);
    }

    _datepicker.close();
  }

  /**
   * Used to set the visual value MM/yy to the loyalty plan expiration date datepicker
   * @constructor
   */
  SetExpirationDateInputValue(): void {
    if (this.loyaltyPlanForm.get('plan')?.value) {
      let splitYearAndMonth = [];

      if (this.loyaltyPlanForm.get('plan')!.value === 'tapp') {
        splitYearAndMonth = this.tappExpirationDateYearAndMonth.split('/');
      }
      else {
        splitYearAndMonth = this.lealtoExpirationDateYearAndMonth.split('/');
      }

      let date = new Date(+`${splitYearAndMonth[1]}`, +splitYearAndMonth[0] - 1);

      this.monthAndYearPicker?.select(date);
    }
  }

  SettingFieldsNotificationsConfigurations(): ISettings {
    let setting = this.settings.find(s => s.Code === SettingCode.AuthorizationNotifications);

    if (!setting) {
      setting = {
        Code: SettingCode.AuthorizationNotifications,
        View: 'N/A',
        IsActive: true,
        Json: JSON.stringify([{
          ...this.fieldsNotificationsForm.value,
          CompanyId: this.companyId
        } as INotificationsDraftsSetting])
      } as ISettings;
    } else {
      let eventViewerSettings = JSON.parse(setting.Json) as INotificationsDraftsSetting[];

      let indexOfSetting = eventViewerSettings.findIndex(s => s.CompanyId === this.companyId);

      if (indexOfSetting !== -1) {
        eventViewerSettings.splice(indexOfSetting, 1, {
          ...this.fieldsNotificationsForm.value,
          CompanyId: this.companyId
        });
      } else {
        eventViewerSettings.push({ ...this.fieldsNotificationsForm.value, CompanyId: this.companyId });
      }

      setting.Json = JSON.stringify(eventViewerSettings);
    }

    return setting;
  }
}
