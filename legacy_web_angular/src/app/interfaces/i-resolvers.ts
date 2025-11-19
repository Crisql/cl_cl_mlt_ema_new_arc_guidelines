import {IUser, IUserAssign} from "./i-user";
import {IPermission, IPermissionbyUser, IRole} from "./i-roles";
import {ICompany} from "./i-company";
import {ILicense} from "./i-license";
import {ISettings, IBusinessPartnersFields, IMargin, IValidateAttachmentsSetting} from "./i-settings";
import {ISalesPerson} from "./i-sales-person";
import {
  IAddressType, IAttachments2Line, IBPAddresses,
  IBusinessPartner,
  IBusinessPartnerGroup,
  ISocioComercial
} from "./i-business-partner";
import {
  IItemMasterData,
  ItemsTransfer,
  IValidateAttachmentsTable,
  IValidateAutomaticPrintingTable,
  IValidateInventoryTable
} from "./i-items";
import {IDBResource, IDBResourceType} from "./i-db-resource";
import {ISerialType, ISerie} from "./i-serie";
import {IConection} from "./i-conection";
import {IPriceList} from "./i-price-list";
import {IPayTerms} from "./i-pay-terms";
import {IExchangeRate} from "./i-exchange-rate";
import {ITaxe} from "./i-taxe";
import {ICurrencies} from "./i-currencies";
import {IWarehouse} from "./i-warehouse";
import {ITypeDocE} from "./i-document-type";
import {IStructures} from "./i-structures";
import {IPinpadTerminal, ITerminals} from "./i-terminals";
import {IDocument} from "./i-sale-document";
import {IUdf, IUdfContext, IUdfDevelopment, UdfSourceLine} from "./i-udf";
import {ItemSearchTypeAhead} from "./i-item-typeahead";
import {IPaydeskBalance} from "./i-PaydeskBalance";
import {IAccount} from "@clavisco/payment-modal";
import {IRoute, IRouteFrequency, IRouteLine} from "@app/interfaces/i-route";
import {IGeoRole} from "@app/interfaces/i-geo-role";
import {IGeoConfig} from "@app/interfaces/i-geo-config";
import {IDiscountHierarchy} from "@app/interfaces/i-discount-hierarchy";
import {IMenu} from "@app/interfaces/i-menu";
import {IStockTransferRequest} from "@app/interfaces/i-stockTransferRequest";
import {IBinLocation} from "@app/interfaces/i-serial-batch";
import {ILocalPrinter} from "@app/interfaces/i-local-printer";
import {IPrinter} from "@app/interfaces/i-printer-worker";
import {ICountry} from "@app/interfaces/i-country";
import {PinPad} from "@clavisco/pinpad";
import ITerminal = PinPad.Interfaces.ITerminal;
import {
  IActivities, IActivityStates, IContactPersonActivities, ICountriesActivity,
  IDayOfWeekActivities,
  ILocationActivities, IMonthActivities, IObjectSAPActivities, IOptionActivities,
  IPriority,
  IRecurrenceActivities, IStatesCountriesActivity,
  ISubjectActivities,
  ITypeActivities, IWeekActivities
} from "@app/interfaces/i-activities";
import {ISAPUsers} from "@app/interfaces/i-SAP-Users";
import {IChart} from "@app/interfaces/i-chart";
import {IStockTransfer} from "@app/interfaces/i-stockTransfer";
import {IWithholdingTax} from "@app/interfaces/i-withholding-tax";

export interface IPrincipalComponentResolvedData {
  MenuOptions: IMenu[];
  Setting: ISettings[];
  Permissions: IPermissionbyUser[]
  Currencies: ICurrencies[];
  LocalPrinter: ILocalPrinter;
}

export interface IUserComponentResolvedData {
  Users?: IUser[];
  UsersAssigns?: IUserAssign[];
  Companies?: ICompany[];
  Licenses?: ILicense[];
  SalesPersons?: ISalesPerson[];
  SchedulingSetting?: ISettings;
}

export interface IRoleComponentResolvedData {
  Roles: IRole[];
  Permissions: IPermission[];
}

export interface IRoleUserComponentResolvedData {
  Users: IUser[];
  Companys: ICompany[];
}

export interface IPermissionsResolveData {
  Permissions: IPermission[];
}

export interface ICompanyComponentResolvedData {
  Companys: ICompany[];
  Settings: ISettings[];
}

/**
 * Represents the resolved data for the company configuration component.
 * Extends the `ICompanyComponentResolvedData` interface.
 */
export interface ICompanyConfigurationComponentResolvedData extends ICompanyComponentResolvedData {
  /**
   * List of tables used to validate inventory.
   */
  ValidateInventoryTables: IValidateInventoryTable[];

  /**
   * List of margin configurations.
   */
  MarginTables: IMargin[];

  /**
   * List of tables used to validate attachments.
   */
  ValidateAttachmentsTables: IValidateAttachmentsTable[];

  /**
   * List of tables used to validate automatic printing.
   */
  ValidateAutomaticPrintingTables: IValidateAutomaticPrintingTable[];
}

export interface ICompanyConectionComponentResolvedData extends ICompanyComponentResolvedData {
  Conections: IConection[];
}

export interface ILicensesComponentResolvedData {
  Licenses: ILicense[];
  Companies: ICompany[];
}

/**
 * Represents resolved data for the business partners component.
 */
export interface IBusinessPartnersComponentResolvedData {
  /**
   * Configuration settings for SAP fields.
   */
  FieldsConfiguredSAP: ISettings;

  /**
   * Array of structures representing different types of identification.
   */
  TypeIdentification: IStructures[];

  /**
   * Array of structures representing different types of business partners.
   */
  TypeBusinessPartner: IStructures[];

  /**
   * Array of address types.
   */
  AddressType: IAddressType[];

  /**
   * Array of price lists.
   */
  PriceList: IPriceList[];

  /**
   * Array of payment terms.
   */
  PayTerms: IPayTerms[];

  /**
   * Array of business partner currencies.
   */
  BpCurrencies: ICurrencies[];

  /**
   * Array of business partner groups.
   */
  BpsGroup: IBusinessPartnerGroup[];

  /**
   * Array of commercial partners.
   */
  SocioComercial: ISocioComercial[];

  /**
   * Array of consolidated business partners.
   */
  ConsolidationBP: IBusinessPartner[];

  /**
   * Array of countries.
   */
  Countrys: ICountry[];

  /**
   * Udfs to development
   */
  UdfsDevelopment: IUdfDevelopment[];

  /**
   *Serial type to create business partner
   */
  Serial: ISerialType;

  /**
   * Represents or sets the list of permissions assigned to the current user
   * */
  PermissionsUser: IPermissionbyUser[];
}

export interface IBusinessPartnersCreateComponentResolvedData {
  FieldsConfiguredSAP: ISettings;
}

export interface IItemsComponentResolvedData {
  Items: IItemMasterData[];
  PriceList: IPriceList[];
  Taxes: ITaxe[];
  UdfsDevelopment: IUdfDevelopment[];
  Serial: ISerialType;
}

export interface IDBResourceResolvedData {
  DBResources: IDBResource[];
  DBResourceTypes: IDBResourceType[];
}

export interface ISeriesResolvedData {
  Series: ISerie[];
}

export interface IConectionsResolvedData {
  Conections: IConection[];
}

/**
 * Model represents list of requests requested in supplier invoice
 */
export interface ISaleDocumentComponentResolvedData {
  Items: ItemSearchTypeAhead[];
  BusinessPartner: IBusinessPartner;
  SalesPersons: ISalesPerson[];
  PriceList: IPriceList[];
  PayTerms: IPayTerms[];
  ExchangeRate: IExchangeRate;
  Taxes: ITaxe[];
  Currency: ICurrencies[];
  Warehouse: IWarehouse[];
  TypeDocE: ITypeDocE[];
  Settings: ISettings[];
  UserAssign: IUserAssign;
  PreloadedDocument?: IDocument;
  Permissions: IPermissionbyUser[];
  Accounts: IAccount[];
  Terminals: ITerminal[];
  UdfsLines: IUdfContext[];
  UdfsDevelopment: IUdfDevelopment[];
  UdfsData?: UdfSourceLine[];
  UdfsDataHeader?: IUdf[];
  /**
   * Lines of the document attachment
   */
  AttachmentLines: IAttachments2Line[];
  /**
   * Model repreent udfs to development
   */
  UdfsPaymentDevelopment: IUdfDevelopment[];
  ValidateAttachmentsTables: IValidateAttachmentsSetting;

  /**
   * Represents a list of the tax withholdings configured in SAP
   * */
  WithholdingTax: IWithholdingTax[];
  
  /**
   * Represents a list of udfs configured in Withholding tax
   */
  UdfsWithholding: IUdfContext[];
}

export interface IPurchaseInvoiceComponentResolvedData {
  Items: ItemSearchTypeAhead[];
  Supplier: IBusinessPartner;
  SalesPersons: ISalesPerson[];
  PriceList: IPriceList[];
  PayTerms: IPayTerms[];
  Taxes: ITaxe[];
  Warehouse: IWarehouse[];
  TypeDocE: ITypeDocE[];
  Settings: ISettings[];
  Currencies: ICurrencies[];
  Permissions: IPermissionbyUser[];
  PreloadedDocument: IDocument
  Company: ICompany;
  UdfsLines: IUdfContext[];
  UdfsDevelopment: IUdfDevelopment[];
  UdfsData?: UdfSourceLine[];
  UdfsDataHeader?: IUdf[];
  ExchangeRate: IExchangeRate;
  Terminals: ITerminal[];
  UdfsPaymentDevelopment: IUdfDevelopment[];
  /**
   * Lines of the document attachment
   */
  AttachmentLines: IAttachments2Line[];
  ValidateAttachmentsTables: IValidateAttachmentsSetting;

  /**
   * Represents a list of the tax withholdings configured in SAP
   * */
  WithholdingTax: IWithholdingTax[];
}

export interface ISearchDocumentsResolvedData {
  SalesPersons: ISalesPerson[];
  DocTypes: IStructures[];
  DocStates: IStructures[];
  Terminals: ITerminals[];
  Permissions: IPermissionbyUser[];
  Settings: ISettings[];
}

export interface ITerminalsComponentsResoveData {
  Terminals: ITerminals[];
  Currencies: ICurrencies[];
}

export interface ITermsByUserResolveData {
  Terminals: ITerminals[];
  Users: IUser[];
  Company: ICompany[];
  Currencies: ICurrencies[];
}

export interface IPurchaseDocumentComponentResolvedData {
  Items: ItemSearchTypeAhead[];
  BusinessPartner: IBusinessPartner;
  SalesPersons: ISalesPerson[];
  PriceList: IPriceList[];
  Taxes: ITaxe[];
  Currency: ICurrencies[];
  Warehouse: IWarehouse[];
  Settings: ISettings[];
  Permissions: IPermissionbyUser[];
  PreloadedDocument: IDocument
  UdfsLines: IUdfContext[];
  UdfsDevelopment: IUdfDevelopment[];
  UdfsData?: UdfSourceLine[];
  UdfsDataHeader?: IUdf[];
  ExchangeRate: IExchangeRate;
  /**
   * Lines of the document attachment
   */
  AttachmentLines: IAttachments2Line[];
  ValidateAttachmentsTables: IValidateAttachmentsSetting;

  /**
   * Represents a list of the tax withholdings configured in SAP
   * */
  WithholdingTax: IWithholdingTax[];
}

export interface ISearchPurchaseDocumentsResolvedData {
  SalesPersons: ISalesPerson[];
  DocStates: IStructures[];
  DocTypes: IStructures[];
  Permissions: IPermissionbyUser[];
  Settings: ISettings[];
}

export interface ISearchTransfersRequestResolvedData {
  SalesPersons: ISalesPerson[];
  DocStates: IStructures[];
  DocTypes: IStructures[];
  Permissions: IPermissionbyUser[];
  Settings: ISettings[];
}

export interface ICreditMemoComponentResolvedData {
  Items: ItemSearchTypeAhead[];
  BusinessPartner: IBusinessPartner;
  SalesPersons: ISalesPerson[];
  PriceList: IPriceList[];
  PayTerms: IPayTerms[];
  Taxes: ITaxe[];
  Warehouse: IWarehouse[];
  Settings: ISettings[];
  Permissions: IPermissionbyUser[];
  Currency: ICurrencies[];
  Invoice: IDocument;
  TypeIdentification: IStructures[];
  UdfsLines: IUdfContext[];
  UdfsData?: UdfSourceLine[];
  UdfsDataHeader?: IUdf[];
  UdfsDevelopment: IUdfDevelopment[];
  ExchangeRate: IExchangeRate;
  AttachmentLines: IAttachments2Line[];
  ValidateAttachmentsTables: IValidateAttachmentsSetting;
}

export interface IInventoryOuputResolveData {
  Items: ItemSearchTypeAhead[];
  PriceList: IPriceList[];
  Warehouse: IWarehouse[];
  Permissions: IPermissionbyUser[];
  Setting: ISettings[];
  UdfsLines: IUdfContext[];
  UdfsDevelopment: IUdfDevelopment[];
  ExchangeRate: IExchangeRate;
  Currencies: ICurrencies[];
  ValidateAttachmentsTables: IValidateAttachmentsSetting;
}

export interface IUdfResolvedData {
  Setting: ISettings;
}

export interface ILoyaltyPlanResolveData {
  Points: ISettings;
}

export interface ICashClosingResolverData {
  Setting: ISettings;
  Currency: ICurrencies[];
  Terminals: ITerminal[]
  Permissions: IPermissionbyUser[];
}

export interface IPaymentReceivedResolveData {
  Currencies: ICurrencies[];
  Permissions: IPermissionbyUser[];
  Accounts: IAccount[];
  Settings: ISettings[];
  Terminals: ITerminal[];
  UdfsDevelopment: IUdfDevelopment[];
  ExchangeRate: IExchangeRate;
}

export interface ICancelPaymentResolvedData {
  Terminals: ITerminals[];
  Currencies: ICurrencies[];
  DocTypes: IStructures[];
}

export interface ICashClosingSearchResolverData {
  Permission: IPermissionbyUser[];
  Users: IUser[];
  Balances: IPaydeskBalance[];
}

export interface ICashFlowResolverData {
  TypesFlow: IStructures[];
  Reasons: IStructures[];
}

export interface IFieldsConfiguredResolveData {
  FieldsConfiguredSAP: ISettings;
  Fields: IBusinessPartnersFields[];
}

export interface ITransferInventoryResolveData {
  Warehouses: IWarehouse[];
  SalesPerson: ISalesPerson[];
  TransfersRequest: IStockTransferRequest;
  UdfsLines: IUdfContext[];
  UdfsDevelopment: IUdfDevelopment[];
  UdfsDataHeader?: IUdf[];
  UdfsData?: UdfSourceLine[];
  LocationsFrom: IBinLocation[];
  LocationsTo: IBinLocation[];
  Items: ItemsTransfer[];
  Setting: ISettings;
  Permissions: IPermissionbyUser[];
  StockTransfersRequest: IStockTransfer;
  Attachments:IAttachments2Line[];
  Settings: ISettings[];
  ValidateAttachmentsTables?: IValidateAttachmentsSetting;
}

export interface ITransferRequestResolveData {
  Warehouses: IWarehouse[];
  SalesPerson: ISalesPerson[];
  TransfersRequest: IStockTransferRequest;
  UdfsLines: IUdfContext[];
  UdfsData?: UdfSourceLine[];
  UdfsDataHeader?: IUdf[];
  UdfsDevelopment: IUdfDevelopment[];
  Items: ItemsTransfer[];
  Setting: ISettings;
  Permissions: IPermissionbyUser[];
  Attachments:IAttachments2Line[];
  Settings: ISettings[];
  ValidateAttachmentsTables?: IValidateAttachmentsSetting;
}

export interface IRouteListResolveData {
  Users: IUser[];
  States: IStructures[];
  RouteTypes: IStructures[];
  Frequencies: IRouteFrequency[];
  Permissions: IPermissionbyUser[];
}

export interface INewRouteResolveData {
  Frequencies: IRouteFrequency[];
  Types: IStructures[];
  Route?: IRoute;
  RouteLines?: IRouteLine[];
  Permissions: IPermissionbyUser[];
}

export interface IGeoRoleUserComponentResolvedData {
  GeoRoles: IGeoRole[];
  Users: IUser[];
  Companys: ICompany[];
}

export interface IGeoRoleComponentResolvedData {
  GeoRoles: IGeoRole[];
  GeoConfigs: IGeoConfig[];
}

export interface IRouteAssignmentResolveData {
  UserAssigns: IUserAssign[];
  Users: IUser[];
}

export interface IClosingCardsResolvedData {
  ClosingCardType: IStructures[];
  Terminals: IPinpadTerminal[];
}

export interface IPrintVoidCardComponentsResoveData {
  Users: IUser[];
  TerminalsUser: ITerminals[];
  Permissions: IPermissionbyUser[];
}

export interface IRouteFrequenciesResolvedData {
  Frequencies: IRouteFrequency[];
  FrequenciesWeeks: IStructures[];
  Permissions: IPermissionbyUser[];
}

export interface IDiscountHierarchiesResolvedData {
  DiscountHierarchies: IDiscountHierarchy[];
}

export interface IInternalReconciliationResolveData {
  Currencies: ICurrencies[];
  Permissions: IPermissionbyUser[];
  Settings: ISettings[];
}

export interface ISearchApprovalDocumentsResolvedData {
  SalesPersons: ISalesPerson[];
  DocTypes: IStructures[];
  ApprovalStates: IStructures[];
  DecisionStates: IStructures[];
}

export interface IApprovalDocumentsResolvedData {
  SalesPersons: ISalesPerson[];
  DocTypes: IStructures[];
  ApprovalStates: IStructures[];
  DecisionStates: IStructures[];
  PayTerms: IPayTerms[];
}

export interface ILocalPrinterComponentResolvedData {
  LocalPriter: ILocalPrinter;
  Printers: IPrinter[];
}

/**
 * Interface representing resolved data from a route resolver for home.
 */
export interface IHomeResolvedData {
  /**
   * Lists of charts to representing in component
   */
  ChartData: IChart[]
}

/**
 * This interface is used to load data required in component activities
 */
export interface IActivitiesComponentResolvedData {
  /**
   * Type activities
   */
  TypeActivities: ITypeActivities[];
  /**
   * Subject activities
   */
  SubjectActivities: ISubjectActivities[];
  /**
   * Priority activities
   */
  PriorityActivities: IPriority[];
  /**
   * Location activities
   */
  LocationActivities: ILocationActivities[];
  /**
   * Recurrence activities
   */
  RecurrenceActivities: IRecurrenceActivities[];
  /**
   * Option activities
   */
  OptionActivities: IOptionActivities[];
  /**
   * Day of week
   */
  DayOfWeekActivities: IDayOfWeekActivities[];
  /**
   * Week
   */
  WeekActivities: IWeekActivities[];
  /**
   * Months
   */
  MonthActivities: IMonthActivities[];
  /**
   * Object of the SAP
   */
  ObjectSAPActivities: IObjectSAPActivities[];
  /**
   * SAP users
   */
  SAPUsers: ISAPUsers[];
  /**
   * Detail activity
   */
  DetailActivity: IActivities;

  /**
   * Types of activity reminders
   */
  TypeActivityReminders: IStructures[]

  /**
   * Activity contact person
   */
  ContactPerson: IContactPersonActivities[];

  /**
   * States of activity
   */
  ActivityStates: IActivityStates[];

  /**
   * Country assign of the activity
   */
  CountryActivity: ICountriesActivity;

  /**
   * States of the country
   */
  StatesCountryActivity: IStatesCountriesActivity[];
  /**
   * Address for BussinesPartners
   */
  BusinessPartnersAddress: IBPAddresses[];

  /**
   * Country assign of the activity
   */
  CountriesActivity: ICountriesActivity[];
}
