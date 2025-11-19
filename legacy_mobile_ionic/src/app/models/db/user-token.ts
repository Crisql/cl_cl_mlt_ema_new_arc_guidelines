export interface UserToken {
    id: number;
    access_token: string;
    ExpireTime: Date;
    UserName: string
    userMappId: string;
    HasMixedMode: boolean;
    HasFreight: boolean;
    HasHeaderDiscount: boolean;
    ReportManagerURL: string;
    UrlPadron: string;
}

export interface IUserToken
{
    ['.expires']: Date;
    access_token: string;
    UserId: string;
    UserEmail: string;
}