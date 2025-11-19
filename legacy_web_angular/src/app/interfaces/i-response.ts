export interface IResponse<T> {
    Data: T;
    Message: string;
}

export interface IContext<T>
{
    Code: number;
    Response: IResponse<T>;
}