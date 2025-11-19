import {ITransactionType} from '../i-transaction';
import {Location} from './location';
import {UDFModel2} from './udf-select-option';
import {IFieldsBusinesPartner} from "../../interfaces/i-company-fields-configured";
import {IUdf} from "../../interfaces/i-udfs";

export interface CustomerCRUDModel {
    CardCode: string,
    CardName: string,
    GroupCode: number,
    Currency: string,
    LicTradNum: string,
    Phone1?: string,
    Cellular?: string,
    E_Mail?: string,
    IntrntSite?: string,
    Notes?: string,
    U_MaxDiscBP?: number,
    U_TipoIdentificacion: string,
    U_provincia?: string,
    U_canton?: string,
    U_distrito?: string,
    U_barrio?: string,
    U_direccion?: string,
    U_lat?: string,
    U_lng?: string,
    device: number,
    UDFs?: UDFModel2[];
};

export interface BusinessPartnerLocations extends CustomerCRUDModel, ITransactionType {
    Locations: Array<Location>;
}

