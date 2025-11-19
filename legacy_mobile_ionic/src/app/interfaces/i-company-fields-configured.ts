export interface ICompanyFieldsConfigured {
    CompanyId: number;
    IsCompanyDirection: boolean;
    Fields: IFieldsBusinesPartner[]
}

export interface IFieldsBusinesPartner {
    Id: string;
    Description: string;
    NameSL: string;
    FieldType: string;
    Value: string;
    IsObjDirection: boolean;
}