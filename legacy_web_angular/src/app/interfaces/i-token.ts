export interface IUserToken
{
    ['.expires']: Date;
    access_token: string;
    UserId: string;
    UserEmail: string;
}