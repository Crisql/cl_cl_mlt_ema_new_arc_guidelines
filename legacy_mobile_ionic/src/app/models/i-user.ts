import {IBaseEntity} from "./db/companys";

// That was simplify from UserInterface, UserModel and IUserAssign
// Keep this comment only if you didn't delete user-model.ts
export interface IUser extends IBaseEntity {
    UserAssignId: number;
    CompanyId: string;
    Name: string;
    LastName: string;
    Email: string;
    EmailType: number;
    EmailPassword: string;
    Password: string;
    SlpCode: string
    SlpName: string;
    CenterCost: string;
    WhsCode: string;
    UseScheduling: boolean;
    Discount: number;
    /**
     * Set or update the sales business partner code.
     * */
    SellerCode: string;
    /**
     * Set or update the purchasing business partner code.
     * */
    BuyerCode: string;
}
