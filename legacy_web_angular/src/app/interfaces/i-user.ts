import { IBaseEntity } from "./i-base-entity";

export interface IUser {
    Id: number;
    Name: string;
    LastName: string;
    Email: string;
    Password: string;
    IsActive: boolean;
    EmailType: string;
    SchedulingEmail: string;
}

export interface IUserAssign extends IBaseEntity
{
    Id: number;
    SlpCode: number;
    CenterCost: string;
    WhsCode: string;
    Discount: number;
    CompanyId: number;
    UserId: number;
    LicenseId: number;
    IsActive: boolean;

    /**
     * Set or update the sales business partner code.
     * */
    SellerCode: string;

    /**
     * Set or update the purchasing business partner code.
     * */
    BuyerCode: string;
}
