import { IDocumentLine } from "src/app/interfaces/i-item";
import { AccountModel } from "../db/account-api-model";
import { BusinessPartnersModel } from "../db/business-partners-model";
import { ICard } from "../db/card-api-model";
import { CompanyUDF } from "../db/company-udf";
import { CompanyModel, ICompanyInformation } from "../db/companys";
import { BusinessPartnerLocations } from "../db/customer-crud-model";
import { IDiscountGroup } from "../db/discount-group";
import { IDiscountHierarchy } from "../db/discount-hierarchy";
import {
  DocumentFilterMobileModel,
  DocumentLineFilterMobileModel,
} from "../db/Doc-model";
import { IGeoConfig } from "../db/geo-config.model";
import { IItemToFreight } from "../db/i-item-to-freight";
import { IMeasurementUnit } from "../db/measurement-unit";
import { PermissionsSelectedModel } from "../db/permissions";
import { FocusItemModel } from "../db/product-api-model";
import { IItemWarehouseInventory } from "../db/product-stock";
import { PromotionsModel } from "../db/promotions";
import { DailyRoute } from "../db/route-model";
import { ISerie } from "../db/series";
import { ITax } from "../db/tax";
import { UDFModel2 } from "../db/udf-select-option";
import { UserModel } from "../db/user-model";
import { IWarehouse } from "../db/wareHouse";

export interface IBaseReponse {
  result: boolean;
  errorInfo: ErrorInfo;
}

export interface ErrorInfo {
  Code: number;
  Message: string;
}

export interface ApiResponse<T> extends IBaseReponse {
  Data: T;
}

// Respuesta con los valores de los impuestos
export interface TaxesResponse extends IBaseReponse {
  TaxesList: ITax[];
}

// Respuesta con los usuarios de la aplicacion
export interface UsersResponse extends IBaseReponse {
  userList: UserModel[];
}

// Respuesta con el tiempo de check de la compañia
export interface CheckInTimeResponse extends IBaseReponse {
  checkInTime: number;
}

// Respuesta con la ruta diaria
export interface DailyRouteResponse extends IBaseReponse {
  // route: RoutesMobileModel;
  routeList: DailyRoute[];
}

// modelo de respuesta con los permisos
export interface PermissionsSelectedResponse extends IBaseReponse {
  PermissionsList: PermissionsSelectedModel[];
}

export interface CompanyResponse extends IBaseReponse {
  Company: CompanyModel;
}

// modelo de respuesta con la informacion para impresion de la compañia especifica.
export interface CompanyPrintResponse extends IBaseReponse {
  Company: ICompanyInformation;
}

// Respuesta con la informacion de los items focus
export interface ItemFocusResponse extends IBaseReponse {
  ItemFocusList: FocusItemModel[];
}

// Respuesta con la lista de promociones por compañia
export interface PromotionsResponse extends IBaseReponse {
  promotionsList: PromotionsModel[];
}

// Respuesta con la lista de almacenes
export interface WareHouseResponse extends IBaseReponse {
  wareHouseList: IWarehouse[];
}

// Respuesta con la informacion del documento consultado
export interface DocumentFilterMobileResponse extends IBaseReponse {
  DocumentFilterMobileList: DocumentFilterMobileModel[];
}

export interface DocumentLineFilterMobileResponse extends IBaseReponse {
  DocumentLineFilterMobileList: DocumentLineFilterMobileModel[];
}

export interface AccountResponse extends IBaseReponse {
  accountList: AccountModel[];
}

export interface CardsResponse extends IBaseReponse {
  cardsList: ICard[];
}

export interface ExchangeRateResponse extends IBaseReponse {
  Rate: number;
  value: number;
  date: Date;
}

export interface LocationsResponse extends IBaseReponse {
  Locations: Array<Location>;
}

export interface DocumentSAPResponse extends IBaseReponse {
  DocEntry: number;
  DocNum: number;
  UserSign?: number;
  NumeroConsecutivo: string;
  Clave: string;
}

export interface InvoiceWithPaymentResponse extends IBaseReponse {
  InvResp: DocumentSAPResponse;
  PayResp: DocumentSAPResponse;
}

export interface DocumentResponse extends DocumentSAPResponse {
  Id: number;
  DocumentType: number;
}

export interface GeoConfigsResponse extends IBaseReponse {
  GeoConfigs: IGeoConfig[];
}

export interface URLResponse extends IBaseReponse {
  URL: string;
}

export interface ProductsStockResponse extends IBaseReponse {
  inventoryInfo: IItemWarehouseInventory[];
}

export interface ItemsFreightedResponse extends IBaseReponse {
  ItemsFreighted: IItemToFreight[];
}

export interface SeriesRespose extends IBaseReponse {
  Series: ISerie[];
}

export interface CompanyUDFsResponse extends IBaseReponse {
  UDFs: CompanyUDF[];
}

export interface MeasurementUnitsResponse extends IBaseReponse {
  MeasurementUnits: IMeasurementUnit[];
}

export interface CustomerLocationsResponse extends IBaseReponse {
  CustomerWithLocations: BusinessPartnerLocations;
}

export interface DiscountHierarchiesResponse extends IBaseReponse {
  DiscountHierarchies: IDiscountHierarchy[];
}

export interface DiscountGroupsResponse extends IBaseReponse {
  DisocuntGroups: IDiscountGroup[];
}

export interface FreightResponse extends IBaseReponse {
  Price: number;
}

export interface UDFsResponse extends IBaseReponse {
  UDFs: UDFModel2[];
}

export interface PaymentResponse extends IBaseReponse {
  PayResp: DocumentSAPResponse;
}

export interface IGetBPResponse extends IBaseReponse {
  customersList: BusinessPartnersModel[],
  CardCodes: string[];
  CardNames: string[];
}


export interface ICLResponse<T>
{
  Data: T,
  Message: string;
}