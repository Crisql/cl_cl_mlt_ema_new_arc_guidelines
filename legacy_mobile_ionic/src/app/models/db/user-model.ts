export interface UserInterface {
    userName: string,
    userId: string,
    userEmail: string,
    password: string,
    Active: boolean,
    slpName: string,
    userMappId: string,
    WhCode: string,
    dbName: string,
    id: number
}

export class UserModel {
    constructor(
        public id: number,
        public userName: string,
        public userId: string,
        public userEmail: string,
        public password: string,
        public Active: boolean,
        public SlpName: string,
        public userMappId: string,
        public WhCode: string,
        public dbName: string
    ) {
    }
}

/**
 * The interface represents a user's data model with its mappings
 */
export interface IUserAssign
{
    SlpCode: string;
    CenterCost: string;
    WhsCode: string;
    Discount: number;
    Id:number;
    CompanyId: number;
    /**
     * Set or update the sales business partner code.
     * */
    SellerCode: string;
    /**
     * Set or update the purchasing business partner code.
     * */
    BuyerCode: string;
}

