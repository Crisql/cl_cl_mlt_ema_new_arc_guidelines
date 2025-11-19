import { IIdentificationType, IInvoiceType } from "../models/db/iinvoice-type";
import { IMenu } from "../interfaces/i-menu";
import { HttpErrorResponse } from "@angular/common/http";

export class AppConstants {
  /**
  * Tries to map an error object into a string
  * @param _error Any type is required to explore all posibles properties combination
  * @returns Especific error found in the object. In case of failing it returns the initial object serialized into a string
  */
  public static GetError(_error: HttpErrorResponse | string): string {

    let joined_error;

    if (typeof _error === 'string') return _error;

    if(_error.error?.Message){
      joined_error = _error.error.Message;
    }else if(_error.error?.error_description){
      joined_error = _error.error.error_description;
    }else if(_error.error?.error){
      joined_error = _error.error.error;
    }else{
      joined_error = `status: ${_error.status}, Message: ${_error.message}`;
    }
    
    if (typeof joined_error === 'string') return joined_error;
    
    return JSON.stringify(_error);
  }
}

export const FEIdentificationType: IIdentificationType[] = [
  {
    Id: "01",
    DescriptionES: "Cedula Física",
    DescriptionEN: "Identification Card"

  },
  {
    Id: "02",
    DescriptionES: "Cedula Jurídica",
    DescriptionEN: "Business Card"
  },
  {
    Id: "03",
    DescriptionES: "DIMEX",
    DescriptionEN: "DIMEX"
  },
  {
    Id: "04",
    DescriptionES: "NITE",
    DescriptionEN: "NITE"
  },
  {
    Id: "05",
    DescriptionES: "Extranjero No Domiciliado",
    DescriptionEN: "Non-Domiciled Foreigner"
  },
  {
    Id: "06",
    DescriptionES: "No Contribuyente",
    DescriptionEN: "Non-Contributor"
  }
];

export const InvoiceTypes: IInvoiceType[] = [
  {
    Id: 0,
    Key: 'TE',
    DescriptionES: 'Tiquete electrónico',
    DescriptionEN: 'Electronic ticket',
    IsDefault: false
  },
  {
    Id: 1,
    Key: 'FE',
    DescriptionES: 'Factura electrónica',
    DescriptionEN: 'Electronic bill',
    IsDefault: false
  }
];

export const PATHS_TO_INTERCEPT = [
  'Items/GetMinifiedItems', 
  'Items/GetItemDetail', 
  'Items/GetProducPrices',
  'Tax/GetTaxes', 
  'Company/GetExchangeRate', 
  'WareHouse/GetWareHouses', 
  'Cards/GetCards',
  'Company/GetCompanyPrintInfo', 
  'Users/GetSeriesByUser', 
  'Items/GetMeasurementUnits',
  'Items/GetDiscountHierarchies', 
  'Cards/GetAccounts', 
  'Company/GetCurrencies', 
  'Items/GetPriceListInfo', 
  'Tax/GetTaxCodesDetermination', 
  'Charts/GetCharts',
  'BusinessPartners/GetBlanketAgreement', 
  'Items/GetPriceListsInfo', 
  'BusinessPartners/GetMinifiedCustomers',
  'BusinessPartners/GetCustomer',
  'Documents/GetDocumentTypesLabels'
];

export const SQLITE_BD_NAME = 'EMA.db';

export namespace Structures.Clases {

  class _GuardValidation extends Error {
      constructor(_message: string) {
          super(_message);
          if (!(this instanceof GuardValidation)) return new GuardValidation(_message);
      }
  }

  class _GuardWarning extends Error {

      constructor(_message: string) {
          super(_message);
          if (!(this instanceof GuardWarning)) {
              return new GuardWarning(_message);
          }

      }
  }


  export type GuardWarning = _GuardWarning;
  export type GuardValidation = _GuardValidation;


  /**
   * This type is used to throw an exception with a warning state. Just set your message in the constructor
   */
  export const GuardWarning = _GuardWarning as typeof _GuardWarning & ((_message: string) => GuardWarning)
  /**
   * This type is used to throw an exception with information status. Just set your message in the constructor
   */
  export const GuardValidation = _GuardValidation as typeof _GuardValidation & ((_message: string) => GuardValidation)

}

  export const IsSerial = {
    /**
     * Indicates that the series is generated automatically
     */
    Automatic: true,
    /**
     * Indicates that the series is generated manually
     */
    Manual: false
  }
